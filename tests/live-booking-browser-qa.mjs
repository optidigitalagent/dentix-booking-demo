import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const modulePath = process.env.PLAYWRIGHT_MODULE_PATH;
if (!modulePath) throw new Error("PLAYWRIGHT_MODULE_PATH is required");

const importedPlaywright = await import(pathToFileURL(modulePath).href);
const playwright = importedPlaywright.default ?? importedPlaywright;
const origin = process.env.DENTIX_PATIENT_ORIGIN ?? "https://optidigitalagent.github.io/dentix-booking-demo/";
const engines = (process.env.DENTIX_BROWSER_ENGINES ?? "chromium,webkit")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const widths = [1440, 1024, 768, 390, 360];

for (const engineName of engines) {
  const browserType = playwright[engineName];
  assert.ok(browserType, `Unknown Playwright browser engine: ${engineName}`);
  const browser = await browserType.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];
  const modes = [];

  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width >= 768 ? 900 : 844 } });
      // This suite checks the live preview intake UI, not video delivery.
      await page.route("**/*.mp4", (route) => route.abort());
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(`${engineName}/${width}: ${message.text()}`);
      });
      page.on("pageerror", (error) => pageErrors.push(`${engineName}/${width}: ${error.message}`));

      await page.goto(origin, { waitUntil: "networkidle", timeout: 60_000 });
      await page.getByRole("button", { name: "Записатися онлайн" }).first().click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      const testReady = page.getByText("TEST_READY · тестові ресурси та графік, 60 хв · це не production онлайн-запис");
      const disabled = dialog.getByText("Форма ще не активована. Скористайтеся телефоном або Instagram.");
      await Promise.race([testReady.waitFor(), disabled.waitFor()]);
      const mode = await testReady.isVisible() ? "TEST_READY" : "INTAKE_DISABLED";
      if (mode === "TEST_READY") assert.ok((await page.locator(".booking-option").count()) >= 2, "Booking catalog did not load");
      else {
        assert.ok(await dialog.getByRole("button", { name: "Залишити заявку", exact: true }).isDisabled());
        assert.ok(await page.locator('a[href^="tel:"]').count());
      }
      modes.push(mode);
      await assertNoOverflow(page, `${engineName}/patient-${width}`);
      await page.getByRole("button", { name: "Закрити", exact: true }).click();
      await page.getByRole("dialog").waitFor({ state: "detached" });
      console.log(`${engineName} patient ${width}: ${mode} PASS`);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  assert.deepEqual(pageErrors, [], `Browser page errors:\n${pageErrors.join("\n")}`);
  if (modes.every((mode) => mode === "TEST_READY")) assert.deepEqual(consoleErrors, [], `Browser console errors:\n${consoleErrors.join("\n")}`);
}

console.log("Live preview intake browser QA complete with no overflow or page errors; no submissions.");

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    documentScrollWidth: document.documentElement.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    drawerScrollWidth: document.querySelector(".booking-drawer")?.scrollWidth,
    drawerClientWidth: document.querySelector(".booking-drawer")?.clientWidth,
  }));

  assert.ok(
    dimensions.documentScrollWidth <= dimensions.documentClientWidth + 1,
    `${label} document overflow: ${JSON.stringify(dimensions)}`,
  );
  assert.ok(
    Number(dimensions.drawerScrollWidth) <= Number(dimensions.drawerClientWidth) + 1,
    `${label} drawer overflow: ${JSON.stringify(dimensions)}`,
  );
}
