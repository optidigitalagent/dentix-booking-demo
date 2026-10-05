import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { serveArtifact } from '../scripts/serve-artifact.mjs';
import { therapyPages } from '../src/data/therapy-pages.ts';
import { surgeryPages } from '../src/data/surgery-pages.ts';
import { implantProstheticsPages } from '../src/data/implant-prosthetics-pages.ts';

if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.DENTIX_QA_OUTPUT) throw new Error('External Playwright and evidence directory required');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const { routes } = JSON.parse(await fs.readFile('ops/release/routes.json', 'utf8'));
const output = path.resolve(process.env.DENTIX_QA_OUTPUT);
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const cases = [], forbidden = [], intake = [], errors = [];
let completed = false;
const siteSource = await fs.readFile('src/data/site.ts', 'utf8');
const sourceValue = (key) => {
  const value = siteSource.match(new RegExp(`\\b${key}: "([^"]+)"`))?.[1];
  assert.ok(value, `Missing approved ${key} in site.ts`);
  return value;
};
const hrefs = { phone_primary: sourceValue('phonePrimaryHref'), phone_secondary: sourceValue('phoneSecondaryHref'), viber_primary: sourceValue('viberPrimaryHref'), viber_secondary: sourceValue('viberHref'), instagram: sourceValue('instagramHref') };
const routeInterest = Object.fromEntries([...Object.entries(therapyPages), ...Object.entries(surgeryPages), ...Object.entries(implantProstheticsPages)].map(([key, page]) => [key, page.label]));
try {
  for (const target of ['production', 'preview']) {
    const { server, origin, base } = await serveArtifact(target);
    try {
      for (const width of [390, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        await context.route('**/*', async (route) => {
          const request = route.request();
          if (!['GET', 'HEAD'].includes(request.method())) { forbidden.push({ method: request.method(), url: request.url() }); await route.abort(); return; }
          if (request.url().includes('/intake-status')) { intake.push(request.url()); await route.abort(); return; }
          if (new URL(request.url()).origin === origin && !request.url().endsWith('.mp4')) { await route.continue(); return; }
          await route.fulfill({ status: 200, contentType: request.resourceType() === 'stylesheet' ? 'text/css' : 'text/html', body: '' });
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
        for (const route of routes) {
          await page.goto(origin + base + route.path.slice(1), { waitUntil: 'networkidle' });
          assert.equal(await page.locator('form, .lead-form').count(), 0);
          assert.doesNotMatch(await page.locator('body').innerText(), /Записатися онлайн|Перевіряємо доступність форми/);
          const triggers = page.locator('[data-booking-cta]:visible');
          const count = await triggers.count();
          assert.ok(count > 0, `${target} ${route.path}: no visible booking CTA`);
          for (let i = 0; i < count; i++) {
            const trigger = triggers.nth(i);
            const interest = await trigger.evaluate((element, routeLabel) => {
              const doctor = element.closest('.doc');
              if (doctor) return `Запис до лікаря: ${doctor.querySelector('h3')?.textContent?.trim()}`;
              const service = element.closest('.svc-card');
              if (service) return service.querySelector('h3')?.textContent?.trim();
              const price = element.closest('.price-block');
              if (price) return price.querySelector('.sec-kicker')?.textContent?.trim();
              if (element.closest('.hero-actions, .therapy-evidence-actions')) return routeLabel;
              return null;
            }, routeInterest[route.key] ?? null);
            await trigger.scrollIntoViewIfNeeded();
            await trigger.click();
            const dialog = page.getByRole('dialog', { name: 'Зв’язатися для запису' });
            await dialog.waitFor();
            assert.equal(await dialog.locator('form, input, textarea, select').count(), 0);
            assert.equal(await dialog.locator('[data-conversion-intent="booking_contact"]').count(), 1);
            assert.equal(await dialog.locator('.contact-bridge-interest strong').count(), interest ? 1 : 0);
            if (interest) assert.equal(await dialog.locator('.contact-bridge-interest strong').innerText(), interest);
            for (const [channel, href] of Object.entries(hrefs)) {
              const link = dialog.locator(`[data-contact-channel="${channel}"]`);
              assert.equal(await link.count(), 1);
              assert.equal(await link.getAttribute('href'), href);
              assert.ok(await link.isVisible());
            }
            const primaryContrast = await dialog.locator('[data-contact-channel="phone_primary"]').evaluate((element) => {
              const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number).map((channel) => {
                const unit = channel / 255;
                return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
              });
              const luminance = (channels) => channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
              const style = getComputedStyle(element), a = luminance(rgb(style.color)), b = luminance(rgb(style.backgroundColor));
              return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
            });
            assert.ok(primaryContrast >= 4.5, `Primary phone link contrast ${primaryContrast}`);
            const instagram = dialog.locator('[data-contact-channel="instagram"]');
            assert.equal(await instagram.getAttribute('target'), '_blank');
            assert.match(await instagram.getAttribute('rel'), /noopener/);
            assert.match(await instagram.getAttribute('rel'), /noreferrer/);
            assert.equal(await dialog.locator('[data-contact-channel="contacts"]').getAttribute('href'), base + 'kontakty/');
            if (target === 'production' && route.key === 'home' && i === 0) await page.screenshot({ path: path.join(output, `bridge-${width}.png`), animations: 'disabled' });
            if (i % 2 === 0) await page.keyboard.press('Escape');
            else await dialog.getByRole('button', { name: 'Закрити', exact: true }).click();
            await dialog.waitFor({ state: 'detached' });
            assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
            cases.push({ target, width, route: route.path, cta_index: i, interest, channels: 6, pass: true });
          }
          if (route.key === 'home') {
            const trigger = triggers.first();
            await trigger.click();
            await page.locator('.booking-backdrop').click({ position: { x: 2, y: 2 } });
            assert.equal(await page.getByRole('dialog').count(), 0);
            if (width === 390) {
              await page.getByRole('button', { name: 'Відкрити меню' }).click();
              await page.locator('#nav-mobile [data-booking-cta]').click();
              assert.equal(await page.getByRole('dialog', { name: 'Зв’язатися для запису' }).count(), 1);
              await page.keyboard.press('Escape');
              assert.equal(await page.getByRole('dialog').count(), 0);
              assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('nav-burger')), true);
            }
          }
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          assert.ok(overflow <= 1, `${target} ${width} ${route.path}: overflow ${overflow}`);
        }
        await context.close();
      }
    } finally { await new Promise((resolve) => server.close(resolve)); }
  }
  assert.deepEqual(intake, []);
  assert.deepEqual(forbidden, []);
  assert.deepEqual(errors, []);
  completed = true;
} finally {
  await browser.close();
  await fs.writeFile(path.join(output, 'conversion-bridge-browser.json'), JSON.stringify({ cases, forbidden, intake, errors, pass: completed && forbidden.length === 0 && intake.length === 0 && errors.length === 0 }, null, 2) + '\n');
}
console.log(`PASS ${cases.length} booking CTAs across 12 routes, 2 builds, 2 viewports`);
