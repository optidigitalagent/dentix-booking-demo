import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import { surgeryPages, selectSurgeryPrices } from "../src/data/surgery-pages.ts";
import { priceBlocks } from "../src/data/prices.ts";

// In-memory client plus an isolated real prerender with identical configuration.
// Every request is intercepted. Synthetic values never enter shipped artifacts.
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const output = process.env.DENTIX_QA_OUTPUT;
if (!output) throw new Error("An external DENTIX_QA_OUTPUT is required");
const origin = "http://127.0.0.1:49151";
const keys = ["DENTIX_BUILD_TARGET", "VITE_DENTIX_CONTENT_API_URL"];
const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
const results = [], violations = [];
const browser = await chromium.launch();
try {
  process.env.VITE_DENTIX_CONTENT_API_URL = origin + "/__qa/content";
  for (const target of ["preview", "production"]) {
    process.env.DENTIX_BUILD_TARGET = target;
    const base = target === "preview" ? "/dentix-booking-demo/" : "/";
    const bundle = await build({ mode: target, publicDir: false, build: { write: false, manifest: false, rollupOptions: { input: path.resolve("index.html") } } });
    const assets = new Map(bundle.output.map((asset) => [base + asset.fileName, asset.type === "chunk" ? asset.code : asset.source]));
    const manifest = JSON.parse(await fs.readFile(`dist/${target}/.vite/manifest.json`, "utf8"));
    const temp = await fs.mkdtemp(path.resolve("node_modules/.dentix-surgery-qa-"));
    try {
      await build({ mode: target, publicDir: false, plugins: [{ name: "qa-source-image-parity", enforce: "pre", load(id) {
        const relative = path.relative(process.cwd(), id).replaceAll("\\", "/");
        if (/\.(?:png|jpe?g|webp|svg|ico)$/.test(relative) && manifest[relative]) return `export default ${JSON.stringify(base + manifest[relative].file)};`;
      } }], build: { ssr: "src/entry-server.tsx", outDir: temp, manifest: false, rollupOptions: { input: "src/entry-server.tsx", output: { entryFileNames: "entry-server.mjs" } } } });
      const originalFetch = globalThis.fetch;
      let ssrFetches = 0;
      globalThis.fetch = () => { ssrFetches++; throw new Error("SSR fetch forbidden"); };
      const rendered = new Map();
      try {
        const { render } = await import(pathToFileURL(path.join(temp, "entry-server.mjs")));
        for (const [route, page] of Object.entries(surgeryPages)) {
          const body = render(route);
          rendered.set(base + page.path, assets.get(base + "index.html").replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${body}</div>`));
        }
        assert.equal(ssrFetches, 0);
      } finally { globalThis.fetch = originalFetch; }
      for (const [route, service] of Object.entries(surgeryPages)) for (const mode of ["valid", "empty", "invalid", "unmatched", "near-role"]) {
        const context = await browser.newContext({ viewport: { width: 390, height: 900 }, reducedMotion: "reduce" });
        try {
          const fixtureDoctor = { id: "albert-podolyansky", full_name: "QA managed clinician", role: mode === "unmatched" ? "Лікар-ортодонт" : mode === "near-role" ? "нейрохірург" : "Лікар-хірург" };
          const fixturePrices = selectSurgeryPrices(route, priceBlocks).map((row, index) => ({ id: "qa-" + index, category_id: "hirurgiya", category: "Хірургічна стоматологія", service_name: row.name, price: "QA price " + index, price_note: "QA current note", sort_order: index }));
          const payload = mode === "empty" ? { doctors: [], price: [] } : mode === "invalid" ? { doctors: [{ id: "invalid" }], price: [{ service_name: service.label }] } : { doctors: [fixtureDoctor], price: mode === "unmatched" ? [{ ...fixturePrices[0], service_name: "QA unrelated service" }] : fixturePrices };
          let contentGets = 0;
          await context.route("**/*", async (requestRoute) => {
            const request = requestRoute.request(), url = new URL(request.url());
            if (!["GET", "HEAD"].includes(request.method())) { violations.push(request.method()); return requestRoute.abort(); }
            if (url.origin !== origin) return requestRoute.fulfill({ status: 200, contentType: request.resourceType() === "stylesheet" ? "text/css" : "text/html", body: "" });
            if (url.pathname === "/__qa/content") { contentGets++; return requestRoute.fulfill({ json: payload }); }
            const body = rendered.get(url.pathname) ?? assets.get(url.pathname);
            const type = { ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".ico": "image/x-icon" }[path.extname(url.pathname)] ?? "text/html";
            if (body !== undefined) return requestRoute.fulfill({ status: 200, contentType: type, body: typeof body === "string" ? body : Buffer.from(body) });
            if (url.pathname === base + "favicon.ico") return requestRoute.fulfill({ contentType: type, body: await fs.readFile("public/favicon.ico") });
            violations.push(url.pathname); return requestRoute.abort();
          });
          const page = await context.newPage(), errors = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
          await page.goto(origin + base + service.path, { waitUntil: "networkidle" });
          assert.equal(contentGets, 1, "one shared runtime content request");
          const remote = ["valid", "unmatched", "near-role"].includes(mode);
          assert.equal(await page.locator("#service-prices").getAttribute("data-content-source"), remote ? "google-sheets" : "local-fallback");
          assert.equal(await page.locator("#team").getAttribute("data-content-source"), remote ? "google-sheets" : "local-fallback");
          if (mode === "valid") {
            assert.deepEqual(await page.locator("#service-prices .price-cost").allTextContents(), fixturePrices.map((row) => row.price));
            assert.deepEqual(await page.locator("#team h3").allTextContents(), [fixtureDoctor.full_name]);
          } else if (mode === "near-role") {
            assert.deepEqual(await page.locator("#service-prices .price-cost").allTextContents(), fixturePrices.map((row) => row.price));
            assert.equal(await page.locator("#team .doc").count(), 0);
            assert.ok(await page.getByText("Уточніть лікаря цього напрямку у клініці телефоном.").isVisible());
          } else if (mode === "unmatched") {
            assert.equal(await page.locator("#service-prices .price-row").count(), 0);
            assert.equal(await page.locator("#team .doc").count(), 0);
            assert.ok(await page.getByText("Уточніть лікаря цього напрямку у клініці телефоном.").isVisible());
          } else {
            assert.deepEqual(await page.locator("#service-prices .price-cost").allTextContents(), selectSurgeryPrices(route, priceBlocks).map((row) => row.cost));
            assert.equal(await page.locator("#team .doc").count(), 0);
          }
          const schema = page.locator('script[type="application/ld+json"]');
          if (target === "production") {
            const graph = JSON.parse(await schema.textContent())["@graph"];
            assert.deepEqual(graph.filter((node) => node["@type"] === "Person").map((node) => node.name), await page.locator("#team h3").allTextContents());
            assert.deepEqual(graph.filter((node) => node["@type"] === "Person").map((node) => node.jobTitle), await page.locator("#team .doc-role").allTextContents());
            const node = graph.find((node) => node["@type"] === "Service");
            assert.equal(node.description, await page.locator("#service-answer").textContent());
            assert.equal(node.name, await page.locator("h1").textContent());
            assert.doesNotMatch(JSON.stringify(graph), /QA price|Offer|Review|FAQPage|MedicalProcedure/);
          } else assert.equal(await schema.count(), 0);
          assert.deepEqual(errors, []);
          assert.deepEqual(violations, []);
          results.push({ target, route, mode, content_gets: contentGets, ssr_fetches: ssrFetches, hydrated: true, visible_schema_parity: true, errors, pass: true });
          console.log(`managed ${target} ${route} ${mode}: PASS`);
        } finally { await context.close(); }
      }
    } finally { await fs.rm(temp, { recursive: true, force: true }); }
  }
  assert.equal(results.length, 30);
} finally {
  for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
  await browser.close();
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(path.join(output, "surgery_managed_content.json"), JSON.stringify({ results, violations, synthetic: true, pass: results.length === 30 && violations.length === 0 }, null, 2));
}
