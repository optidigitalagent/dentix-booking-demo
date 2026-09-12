import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { build } from "vite";

// Compile the real patient entry with explicit local fixture configuration.
// write:false preserves the reviewed default dist artifacts. Every request is
// intercepted; fixtures expose only readiness/catalog GETs, never a submission.
export async function checkLeadSourceEntryPoints({ browser, output }) {
  const keys = ["DENTIX_BUILD_TARGET", "VITE_DENTIX_BOOKING_API_URL", "VITE_DENTIX_BOOKING_ENABLED", "VITE_DENTIX_LEADS_API_URL", "VITE_DENTIX_CONTENT_API_URL"];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  const results = [], requests = [];
  const origin = "http://127.0.0.1:49151";
  try {
    process.env.VITE_DENTIX_BOOKING_API_URL = origin + "/__qa/booking";
    process.env.VITE_DENTIX_BOOKING_ENABLED = "true";
    process.env.VITE_DENTIX_LEADS_API_URL = origin + "/__qa/leads";
    process.env.VITE_DENTIX_CONTENT_API_URL = origin + "/__qa/content";
    const sourceHtml = await fs.readFile("dist/production/likari/index.html", "utf8");
    const sourceGraph = JSON.parse(sourceHtml.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])["@graph"];
    const fixtureDoctors = sourceGraph.filter((node) => node["@type"] === "Person").reverse().map((person, index) => ({ id: person["@id"].split("#person-")[1], full_name: person.name, role: person.jobTitle, active: true, sort_order: index + 1 }));
    for (const target of ["preview", "production"]) {
      process.env.DENTIX_BUILD_TARGET = target;
      const base = target === "preview" ? "/dentix-booking-demo/" : "/";
      const expected = target === "preview" ? "PUBLIC_DEMO" : "CANONICAL_CANDIDATE";
      const bundle = await build({ mode: target, publicDir: false, build: { write: false, manifest: false, rollupOptions: { input: path.resolve("index.html") } } });
      const assets = new Map((Array.isArray(bundle) ? bundle : [bundle]).flatMap((result) => result.output).map((asset) => [base + asset.fileName, asset.type === "chunk" ? asset.code : asset.source]));
      assets.set(base, assets.get(base + "index.html"));
      for (const file of ["likari/", "kontakty/", "price.html"]) assets.set(base + file, assets.get(base + "index.html"));
      const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
      for (const file of ["", "likari/", "kontakty/", "price.html"]) for (const catalogReady of [false, true]) {
        const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 900 } });
        try {
          const violations = [];
          await context.route("**/*", async (route) => {
            const request = route.request(), url = new URL(request.url());
            if (!["GET", "HEAD"].includes(request.method())) { violations.push({ method: request.method(), url: url.href }); await route.abort(); return; }
            if (url.origin !== origin) { await route.fulfill({ status: 200, contentType: request.resourceType() === "stylesheet" ? "text/css" : "text/html", body: "" }); return; }
            if (url.pathname === "/__qa/content") {
              await route.fulfill({ json: { doctors: fixtureDoctors, price: [] } }); return;
            }
            if (url.pathname === "/__qa/booking/intake-status") {
              requests.push({ target, route: file || "home", catalogReady, method: request.method(), path: url.pathname });
              await route.fulfill({ json: { data: {
                lead: { enabled: false, mode: "UNAVAILABLE", policyUrl: null, consentVersion: "qa-only" },
                timed: { enabled: catalogReady, mode: catalogReady ? "LIVE" : "UNAVAILABLE", policyUrl: catalogReady ? origin + "/__qa/privacy" : null, consentVersion: "qa-only" },
              } } }); return;
            }
            if (url.pathname === "/__qa/booking/catalog") {
              requests.push({ target, route: file || "home", catalogReady, method: request.method(), path: url.pathname });
              await route.fulfill({ json: { data: { mode: "LIVE_REQUESTS_READY", testOnly: false, timezone: "Europe/Kyiv", minDate: "2026-09-09", maxDate: "2026-09-10", consentVersion: "qa-only", services: [{ id: "qa-service", name: "QA service fixture", category: "QA fixture" }], doctors: [], doctorServices: [] } } }); return;
            }
            const body = assets.get(url.pathname);
            if (body !== undefined) { await route.fulfill({ status: 200, contentType: types[path.extname(url.pathname)] ?? "text/html", body: typeof body === "string" ? body : Buffer.from(body) }); return; }
            // Public static icons/images are unchanged local source assets.
            const publicRoot = path.resolve("public");
            const local = path.resolve(publicRoot, url.pathname.slice(base.length));
            if (url.pathname.startsWith(base) && local.startsWith(publicRoot + path.sep)) {
              try { await route.fulfill({ status: 200, contentType: types[path.extname(local)] ?? "application/octet-stream", body: await fs.readFile(local) }); return; } catch {}
            }
            violations.push({ method: request.method(), unexpected_path: url.pathname }); await route.abort();
          });
          const page = await context.newPage(), errors = [], consoleErrors = [];
          page.on("pageerror", (e) => errors.push(e.message));
          page.on("console", (e) => { if (["error", "warning"].includes(e.type())) consoleErrors.push(e.text()); });
          await page.goto(origin + base + file, { waitUntil: "networkidle" });
          if (file === "likari/" || file === "") {
            await page.locator('#team[data-content-source="google-sheets"]').waitFor();
            assert.deepEqual(await page.locator("#team .doc h3").allTextContents(), fixtureDoctors.map((doctor) => doctor.full_name));
            if (target === "production") {
              const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())["@graph"];
              assert.deepEqual(graph.filter((node) => node["@type"] === "Person").map((person) => person.name), fixtureDoctors.map((doctor) => doctor.full_name));
            }
          }
          const contact = page.locator("#contact .lead-form");
          assert.equal(await contact.getAttribute("data-source-site"), expected);
          assert.ok(await contact.locator('button[type="submit"]').isDisabled());
          await page.getByRole("button", { name: "Записатися онлайн", exact: true }).first().click();
          const dialog = page.getByRole("dialog");
          if (catalogReady) await dialog.getByRole("button", { name: "Залишити окрему заявку без вибору часу", exact: true }).click();
          else await dialog.getByText("Заявка не резервує час прийому.").waitFor();
          const form = dialog.locator(".lead-form");
          // The drawer initially renders its fallback before its readiness effect
          // switches through loading. Wait for the form's completed readiness state.
          await form.getByText("Форма ще не активована. Скористайтеся телефоном або Instagram.", { exact: true }).waitFor();
          assert.equal(await form.count(), 1);
          assert.equal(await form.getAttribute("data-source-site"), expected);
          assert.ok(await form.locator('button[type="submit"]').isDisabled());
          assert.ok(await form.locator('input[type="checkbox"]').isDisabled());
          assert.deepEqual(violations, []);
          assert.deepEqual(errors, []);
          assert.deepEqual(consoleErrors, []);
          results.push({ target, route: file || "home", source_site: expected, contact: true, entry: catalogReady ? "BookingDrawer.callbackView" : "BookingDrawer.noCatalog", fail_closed: true, form_submissions: 0, errors, consoleErrors, pass: true });
          console.log(`${target} ${file || "home"} ${catalogReady ? "callback" : "no-catalog"} lead source ${expected}: PASS`);
        } finally { await context.close(); }
      }
    }
    assert.equal(results.length, 16);
  } finally {
    for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    await fs.writeFile(path.join(output, "lead_source_entry_points.json"), JSON.stringify({ observed_at: new Date().toISOString(), fixture_scope: "Real source; in-memory builds; all network intercepted; no request or personal data submitted", results, requests, pass: results.length === 16 }, null, 2) + "\n");
  }
}
