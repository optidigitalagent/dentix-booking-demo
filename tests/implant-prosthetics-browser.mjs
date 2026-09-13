import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { serveArtifact } from "../scripts/serve-artifact.mjs";
import { implantProstheticsPages, selectImplantProstheticsPrices } from "../src/data/implant-prosthetics-pages.ts";
import { priceBlocks } from "../src/data/prices.ts";

const output = process.env.DENTIX_QA_OUTPUT;
if (!output || !process.env.PLAYWRIGHT_MODULE_PATH) throw new Error("External DENTIX_QA_OUTPUT and PLAYWRIGHT_MODULE_PATH required");
const { chromium, webkit } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const results = [], violations = [];
// Compare every critical service region, not only the shared scope section.
const selectors = ["h1", "#service-answer", "#service-scope", "#service-prices", "#team", "#service-questions", "#related-services"];
for (const target of ["preview", "production"]) {
  const { server, origin, base } = await serveArtifact(target);
  try {
    for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
      const browser = await launcher.launch();
      try {
        for (const width of [360, 390, 768, 1024, 1440]) for (const [route, service] of Object.entries(implantProstheticsPages)) {
          let noJs;
          for (const javaScriptEnabled of [false, true]) {
            const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: "reduce" });
            try {
              await context.route("**/*", async (requestRoute) => {
                const request = requestRoute.request();
                if (!["GET", "HEAD"].includes(request.method())) { violations.push(request.method()); return requestRoute.abort(); }
                if (new URL(request.url()).origin === origin) return requestRoute.continue();
                return requestRoute.fulfill({ status: 200, contentType: request.resourceType() === "stylesheet" ? "text/css" : "text/html", body: "" });
              });
              const page = await context.newPage(), errors = [];
              page.on("pageerror", (error) => errors.push(error.message));
              page.on("console", (message) => { if (["error", "warning"].includes(message.type())) errors.push(message.text()); });
              page.on("response", (response) => { if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`HTTP ${response.status()}`); });
              assert.equal((await page.goto(origin + base + service.path, { waitUntil: "networkidle" })).status(), 200);
              const state = await page.evaluate((selectors) => Object.fromEntries(selectors.map((selector) => [selector, document.querySelector(selector).textContent.replace(/\s+/g, " ").trim()])), selectors);
              if (javaScriptEnabled) assert.deepEqual(state, noJs, "all critical no-JS/hydrated text must match");
              else noJs = state;
              assert.equal(state.h1, service.h1);
              assert.equal(state["#service-answer"], service.answer);
              assert.deepEqual(await page.locator("#service-prices .price-name").allTextContents(), selectImplantProstheticsPrices(route, priceBlocks).map((row) => row.name));
              assert.deepEqual(await page.locator("#service-prices .price-cost").allTextContents(), selectImplantProstheticsPrices(route, priceBlocks).map((row) => row.cost));
              assert.equal(await page.locator("#team .doc").count(), 0);
              assert.ok(state["#team"].includes("Уточніть лікаря цього напрямку у клініці телефоном."));
              assert.equal(await page.locator('script[type="application/ld+json"]').count(), target === "production" ? 1 : 0);
              const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
              assert.ok(overflow <= 1);
              if (javaScriptEnabled && engine === "chromium" && [390, 1440].includes(width)) {
                for (const [label, selector] of [["top", ".price-hero"], ["prices", "#service-prices"], ["team", "#team"]]) {
                  await page.locator(selector).screenshot({ path: path.join(output, `${target}-${route}-${label}-${width}.png`), animations: "disabled" });
                }
              }
              assert.deepEqual(errors, []); assert.deepEqual(violations, []);
              results.push({ target, engine, route, width, javaScriptEnabled, critical_regions: state, exact_prices: true, no_clinician: true, overflow, errors, pass: true });
            } finally { await context.close(); }
          }
          console.log(`${target} ${engine} ${route} ${width} no-JS/hydrated: PASS`);
        }
      } finally { await browser.close(); }
    }
  } finally { await new Promise((resolve) => server.close(resolve)); }
}
assert.equal(results.length, 80);
await fs.writeFile(path.join(output, "implant_prosthetics_browser.json"), JSON.stringify({ results, violations, pass: true, limitations: "Local Chromium/WebKit lab; no physical device or live account testing; all third-party requests intercepted; no submissions." }, null, 2) + "\n");
