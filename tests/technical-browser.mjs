import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { serveArtifact } from "../scripts/serve-artifact.mjs";
import { getBuildProfile } from "../src/build-profile.ts";
import { checkLeadSourceEntryPoints } from "./lead-source-browser.mjs";

if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.DENTIX_QA_OUTPUT) throw new Error("Set PLAYWRIGHT_MODULE_PATH and external DENTIX_QA_OUTPUT");
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const output = path.resolve(process.env.DENTIX_QA_OUTPUT);
await fs.mkdir(output, { recursive: true });
const results = [], notFound = [], noJs = [], forbiddenRequests = [], thirdParty = new Set();
const semantics = [];
let leadSourceEntriesPassed = false;
async function checkSemantics(page, target, file, width, stage) {
  const state = await page.evaluate(() => {
    const normalized = (value) => value.replace(/\s+/g, " ").trim();
    const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
    return {
      h1: [...document.querySelectorAll("h1")].map((e) => normalized(e.textContent)),
      outline: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((e) => ({ level: Number(e.tagName[1]), text: normalized(e.textContent) })),
      duplicate_ids: ids.filter((id, i) => ids.indexOf(id) !== i),
      lead_sources: [...document.querySelectorAll(".lead-form")].map((e) => e.dataset.sourceSite),
    };
  });
  assert.equal(state.h1.length, 1);
  if (!file) {
    assert.deepEqual(state.h1, ["Стоматологія DENTIX"]);
    assert.deepEqual(state.outline[1], { level: 2, text: "Інформація для відвідувачів" });
    assert.equal(await page.locator(".trust").getAttribute("aria-labelledby"), "clinic-info-heading");
  }
  for (let i = 1; i < state.outline.length; i++) assert.ok(state.outline[i].level <= state.outline[i - 1].level + 1);
  assert.deepEqual(state.duplicate_ids, []);
  assert.deepEqual(state.lead_sources, [target === "preview" ? "PUBLIC_DEMO" : "CANONICAL_CANDIDATE"]);
  semantics.push({ target, route: file || "home", width, stage, ...state, pass: true });
}
const browser = await chromium.launch();
try {
  for (const target of ["preview", "production"]) {
    const { server, origin, base } = await serveArtifact(target);
    const profile = getBuildProfile(target);
    try {
      async function makeContext(javaScriptEnabled = true, width = 390) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: "reduce" });
        await context.route("**/*", async (route) => {
          const request = route.request();
          if (!["GET", "HEAD"].includes(request.method())) {
            forbiddenRequests.push({ method: request.method(), url: request.url() });
            await route.abort(); return;
          }
          if (new URL(request.url()).origin === origin) { await route.continue(); return; }
          // Only local artifacts are exercised. Maps/fonts are explicitly outside
          // this QA; no accounts, live content or booking endpoints are accessed.
          thirdParty.add(new URL(request.url()).origin);
          await route.fulfill({ status: 200, contentType: request.resourceType() === "stylesheet" ? "text/css" : "text/html", body: "" });
        });
        return context;
      }
      const parity = new Map();
      for (const width of [360, 390, 768, 1024, 1440]) for (const file of ["", "likari/", "kontakty/", "price.html"]) {
        const context = await makeContext(false, width);
        const page = await context.newPage();
        await page.goto(origin + base + file, { waitUntil: "networkidle" });
        assert.equal(await page.locator("h1").count(), 1);
        assert.ok(await page.locator("h1").isVisible());
        await checkSemantics(page, target, file, width, "no_javascript");
        const primary = await page.locator(file === "price.html" ? ".price-list" : file === "likari/" ? "#team" : file === "kontakty/" ? "#contact-info" : "#services").innerText();
        assert.ok(primary.length > 200);
        assert.ok(await page.locator('a[href="tel:+380679854050"]').count());
        parity.set(file, primary);
        noJs.push({ target, route: file || "home", width, visible_h1: true, primary_text_length: primary.length, pass: true });
        await context.close();
      }
      for (const width of [360, 390, 768, 1024, 1440]) {
        for (const file of ["", "likari/", "kontakty/", "price.html"]) {
          const context = await makeContext(true, width);
          const page = await context.newPage();
          const errors = [], consoleErrors = [], failedLocalResponses = [];
          page.on("pageerror", (error) => errors.push(error.message));
          page.on("console", (message) => { if (["error", "warning"].includes(message.type())) consoleErrors.push(message.text()); });
          page.on("response", (response) => { if (response.url().startsWith(origin) && response.status() >= 400) failedLocalResponses.push({ url: response.url(), status: response.status() }); });
          const response = await page.goto(origin + base + file, { waitUntil: "networkidle" });
          assert.equal(response.status(), 200);
          const primary = await page.locator(file === "price.html" ? ".price-list" : file === "likari/" ? "#team" : file === "kontakty/" ? "#contact-info" : "#services").innerText();
          assert.equal(primary, parity.get(file), `${target} ${file}: initial/rendered primary content drift`);
          await page.waitForFunction(() => [...document.querySelectorAll('.lead-form button[type="submit"]')].every((button) => button.disabled));
          const head = await page.evaluate(() => ({ title: document.title, h1: [...document.querySelectorAll("h1")].map((e) => e.textContent), canonical: [...document.querySelectorAll('link[rel="canonical"]')].map((e) => e.href), robots: [...document.querySelectorAll('meta[name="robots"]')].map((e) => e.content), lang: document.documentElement.lang }));
          assert.equal(head.h1.length, 1);
          await checkSemantics(page, target, file, width, "hydrated");
          assert.equal(head.lang, "uk");
          assert.equal(await page.locator('a[aria-current="page"]').count(), 1);
          assert.deepEqual(head.canonical, target === "production" ? ["https://dentix.ua/" + file] : []);
          assert.deepEqual(head.robots, [target === "production" ? "index,follow" : "noindex,nofollow,noarchive"]);
          const expectedTitle = (await response.text()).match(/<title>(.*?)<\/title>/)[1];
          assert.equal(head.title, expectedTitle);
          assert.deepEqual(errors, []);
          assert.deepEqual(consoleErrors, []);
          // Load lazy images with real scrolling; then verify all local images.
          await page.evaluate(async () => {
            // Hidden carousel slides also need an explicit resource check.
            for (const image of document.images) image.loading = "eager";
            for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 30)); }
          });
          await page.waitForFunction(() => [...document.images].every((image) => image.complete));
          await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode())));
          const brokenImages = await page.evaluate(() => [...document.images].filter((image) => !image.naturalWidth).map((image) => image.src));
          assert.deepEqual(brokenImages, []);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          assert.ok(overflow <= 1, `${target} ${width} ${file}: overflow ${overflow}`);
          const form = page.locator(".lead-form").first();
          assert.ok(await form.locator('button[type="submit"]').isDisabled());
          assert.ok(await form.locator('input[type="checkbox"]').isDisabled());
          await form.scrollIntoViewIfNeeded();
          for (const field of await form.locator('input:not([type="checkbox"]):not([tabindex="-1"]),select,textarea').all()) {
            if (!await field.isVisible()) continue;
            await field.focus();
            if (width <= 900) assert.ok(await field.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)) >= 16);
            await field.blur();
          }
          const trigger = page.getByRole("button", { name: "Записатися онлайн", exact: true }).first();
          await trigger.scrollIntoViewIfNeeded();
          await trigger.click();
          const dialog = page.getByRole("dialog");
          await dialog.getByText("Заявка не резервує час прийому.").waitFor();
          assert.equal(await dialog.locator(".lead-form").getAttribute("data-source-site"), target === "preview" ? "PUBLIC_DEMO" : "CANONICAL_CANDIDATE");
          assert.ok(await dialog.getByRole("button", { name: "Залишити заявку", exact: true }).isDisabled());
          const capturedY = await page.evaluate(() => -parseFloat(document.body.style.top));
          await page.keyboard.press("Escape");
          assert.equal(await dialog.count(), 0);
          assert.ok(Math.abs((await page.evaluate(() => scrollY)) - capturedY) < 2);
          assert.equal(await page.evaluate(() => document.body.style.position), "");
          if (width < 1024) {
            await page.getByRole("button", { name: "Відкрити меню", exact: true }).click();
            await page.locator("#nav-mobile").waitFor({ state: "visible" });
            assert.equal(await page.locator('#nav-mobile a[aria-current="page"]').count(), 1);
            await page.keyboard.press("Escape");
            await page.locator("#nav-mobile").waitFor({ state: "hidden" });
            assert.equal(await page.getByRole("button", { name: "Відкрити меню", exact: true }).getAttribute("aria-expanded"), "false");
          }
          await page.evaluate(() => window.scrollTo(0, 0));
          const screenshot = `${target}-${file ? file.replace(/\/$/, "").replace(".html", "") : "home"}-${width}.png`;
          if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, screenshot), fullPage: true, animations: "disabled" });
          const performance = await page.evaluate(() => ({ navigation: performance.getEntriesByType("navigation").map((e) => ({ duration_ms: e.duration, dom_content_loaded_ms: e.domContentLoadedEventEnd, transfer_size: e.transferSize })), local_resource_transfer_bytes: performance.getEntriesByType("resource").filter((e) => new URL(e.name).origin === location.origin).reduce((sum, e) => sum + e.transferSize, 0) }));
          // Check navigation through an actual visible anchor.
          if (file) await page.locator(".breadcrumbs a").click();
          else await page.locator('#services a[href*="price.html"]').first().click();
          await page.waitForLoadState("networkidle");
          assert.equal(new URL(page.url()).pathname, base + (file ? "" : "price.html"));
          assert.deepEqual(errors, []);
          assert.deepEqual(consoleErrors, []);
          assert.deepEqual(failedLocalResponses, []);
          results.push({ target, route: file || "home", width, height: 900, pass: true, head, overflow, brokenImages, hydration_errors: errors, console_errors: consoleErrors, source_render_parity: true, phone_cta: true, fail_closed_forms: true, keyboard_focus: true, reduced_motion: true, internal_navigation: true, screenshot: [390, 1440].includes(width) ? screenshot : null, lab: performance });
          console.log(`${target} ${file || "home"} ${width}: PASS`);
          await context.close();
        }
      }
      if (target === "preview") {
        const context = await makeContext();
        const page = await context.newPage();
        assert.equal((await page.goto(origin + base + "admin/", { waitUntil: "networkidle" })).status(), 200);
        assert.ok((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"));
        assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
        await context.close();
      }
      for (const suffix of ["missing-pr01", ...(target === "production" ? ["admin/", "admin/index.html"] : [])]) {
        const context = await makeContext();
        const page = await context.newPage();
        const response = await page.goto(origin + base + suffix, { waitUntil: "networkidle" });
        assert.equal(response.status(), 404);
        assert.equal(await page.locator("h1").innerText(), "Сторінку не знайдено");
        assert.equal(await page.locator("script").count(), 0);
        assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
        assert.ok((await page.locator('meta[name="robots"]').getAttribute("content")).includes("noindex"));
        await page.screenshot({ path: path.join(output, `${target}-404${suffix === "missing-pr01" ? "" : "-admin"}.png`) });
        await page.getByRole("link", { name: "На головну DENTIX" }).click();
        assert.equal(new URL(page.url()).pathname, base);
        notFound.push({ target, suffix, status: 404, standalone: true, return_home: true, pass: true });
        await context.close();
      }
    } finally { await new Promise((resolve) => server.close(resolve)); }
  }
  assert.deepEqual(forbiddenRequests, []);
  await checkLeadSourceEntryPoints({ browser, output });
  leadSourceEntriesPassed = true;
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, "browser_qa.json"), JSON.stringify({ observed_at: new Date().toISOString(), engine: "Chromium", physical_device: false, results, no_javascript: noJs, semantics, not_found: notFound, forbidden_requests: forbiddenRequests, third_party_requests_intercepted: [...thirdParty], lead_source_entry_points_passed: leadSourceEntriesPassed, limitations: "Local lab only; maps/fonts intercepted; no forms submitted; no field CWV, account access or external mutations. Additional in-memory fixture builds exercise both real drawer branches on all four routes with intercepted GET-only readiness/catalog responses.", pass: results.length === 40 && noJs.length === 40 && semantics.length === 80 && notFound.length === 4 && forbiddenRequests.length === 0 && leadSourceEntriesPassed }, null, 2) + "\n");
}
