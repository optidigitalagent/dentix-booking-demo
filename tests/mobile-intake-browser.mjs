import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { serveArtifact } from '../scripts/serve-artifact.mjs';

if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.DENTIX_QA_OUTPUT) throw new Error('External Playwright and evidence directory required');
const { chromium, webkit } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const output = path.resolve(process.env.DENTIX_QA_OUTPUT);
await fs.mkdir(output, { recursive: true });
const sizes = process.env.DENTIX_QA_SIZES ? JSON.parse(process.env.DENTIX_QA_SIZES) : [[360,844],[375,812],[390,844],[393,852],[412,915],[430,932],[844,390],[768,900],[1024,900],[1440,900]];
const channels = ['phone_primary','phone_secondary','viber_primary','viber_secondary','instagram','contacts'];
const reports = [], forbidden = [], intake = [];
let completed = false;
const { server, origin, base } = await serveArtifact('production');
try {
  for (const [engineName, engine] of Object.entries({ chromium, webkit }).filter(([name]) => !process.env.DENTIX_QA_ENGINE || name === process.env.DENTIX_QA_ENGINE)) {
    const browser = await engine.launch();
    try {
      for (const [width, height] of sizes) {
        const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        await context.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET','HEAD'].includes(request.method())) { forbidden.push({ method: request.method(), url: request.url() }); await route.abort(); return; }
          if (request.url().includes('/intake-status')) { intake.push(request.url()); await route.abort(); return; }
          if (new URL(request.url()).origin === origin && !request.url().endsWith('.mp4')) { await route.continue(); return; }
          await route.fulfill({ status: 200, contentType: request.resourceType() === 'stylesheet' ? 'text/css' : 'text/html', body: '' });
        });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        for (const file of ['', 'price.html']) {
          await page.goto(origin + base + file, { waitUntil: 'networkidle' });
          assert.equal(await page.locator('#contact .lead-form').count(), 0);
          const contact = page.locator('#contact [data-conversion-intent="booking_contact"]');
          assert.equal(await contact.count(), 1);
          for (const channel of channels) assert.equal(await contact.locator(`[data-contact-channel="${channel}"]`).count(), 1);
          const trigger = page.getByRole('button', { name: 'Записатися', exact: true }).first();
          await trigger.scrollIntoViewIfNeeded();
          await trigger.click();
          const dialog = page.getByRole('dialog', { name: 'Зв’язатися для запису' });
          await dialog.waitFor();
          assert.equal(await dialog.locator('form, input, textarea, select').count(), 0);
          for (const channel of channels) assert.equal(await dialog.locator(`[data-contact-channel="${channel}"]`).count(), 1);
          assert.match(await dialog.innerText(), /Візит буде підтверджено після розмови/);
          assert.match(await dialog.innerText(), /не резервує час прийому/);
          assert.match(await dialog.innerText(), /Не надсилайте медичні дані/);
          await dialog.getByRole('button', { name: 'Закрити', exact: true }).focus();
          await page.keyboard.press('Tab');
          assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-contact-channel')), 'phone_primary');
          await page.keyboard.press('Shift+Tab');
          assert.equal(await dialog.getByRole('button', { name: 'Закрити', exact: true }).evaluate((element) => element === document.activeElement), true);
          if (width === 390 && !file) {
            const viewport = await page.evaluate(() => {
              const view = visualViewport, layer = document.querySelector('.booking-layer');
              const prior = layer.style.getPropertyValue('--booking-visible-height');
              Object.defineProperty(view, 'scale', { configurable: true, value: 2 });
              Object.defineProperty(view, 'height', { configurable: true, value: 300 });
              view.dispatchEvent(new Event('resize'));
              const pinchIgnored = layer.style.getPropertyValue('--booking-visible-height') === prior;
              delete view.scale;
              delete view.height;
              view.dispatchEvent(new Event('resize'));
              return { pinchIgnored };
            });
            assert.deepEqual(viewport, { pinchIgnored: true });
          }
          const capturedY = await page.evaluate(() => -parseFloat(document.body.style.top));
          if (width === 390 && !file) await page.screenshot({ path: path.join(output, `${engineName}-bridge-mobile-390.png`), animations: 'disabled' });
          if (width === 1440 && !file) await page.screenshot({ path: path.join(output, `${engineName}-bridge-desktop-1440.png`), animations: 'disabled' });
          await page.keyboard.press('Escape');
          await dialog.waitFor({ state: 'detached' });
          assert.ok(Math.abs((await page.evaluate(() => scrollY)) - capturedY) < 2);
          assert.equal(await page.evaluate(() => document.body.style.position), '');
          assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          assert.ok(overflow <= 1, `${engineName} ${width} ${file}: overflow ${overflow}`);
          const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
          assert.ok(!/user-scalable|maximum-scale/.test(viewport));
          assert.deepEqual(errors, []);
          reports.push({ engineName, width, height, route: file || 'home', channels: channels.length, forbidden_requests: 0, intake_requests: 0, pass: true });
          console.log(`${engineName} ${width}x${height} ${file || 'home'} PASS`);
        }
        await context.close();
      }
    } finally { await browser.close(); }
  }
  assert.deepEqual(forbidden, []);
  assert.deepEqual(intake, []);
  completed = true;
} finally {
  await new Promise((resolve) => server.close(resolve));
  await fs.writeFile(path.join(output, 'mobile-contact-bridge.json'), JSON.stringify({ reports, forbidden, intake, physical_device: false, pass: completed && forbidden.length === 0 && intake.length === 0 }, null, 2) + '\n');
}
