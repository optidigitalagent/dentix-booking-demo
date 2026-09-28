#!/usr/bin/env node
/** Isolated Chromium entrypoint. Input credentials arrive on stdin only. */
import fs from 'node:fs';

const [phase, profile] = process.argv.slice(2);
const blocked = (code) => ({site_id: 'DENTIX', status: 'BLOCKED', blocker: code,
  temporary_profile: 'ISOLATED'});
let result = blocked('PANEL_AUTOMATION_FAILED');
let context;
try {
  if (!['panel-audit', 'ensure-ftp-ip', 'create-staging',
    'cleanup-temporary-access'].includes(phase)) throw Error('invalid phase');
  const data = JSON.parse(fs.readFileSync(0, 'utf8'));
  const {chromium} = await import(process.env.PLAYWRIGHT_MODULE_PATH);
  context = await chromium.launchPersistentContext(profile, {headless: true});
  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://control.mirohost.net/auth/login',
    {waitUntil: 'domcontentloaded', timeout: 30000});
  await page.locator('#form_login').fill(data.login);
  await page.locator('#form_password').fill(data.password);
  await page.locator('#form_submit').click();
  await page.waitForTimeout(4500);
  const path = new URL(page.url()).pathname;
  const body = (await page.locator('body').innerText()).toLowerCase();
  if (/\b(auth\/login|login)\b/.test(path)) {
    result = blocked(/sms|2fa|двофактор|одноразов/.test(body)
      ? 'PANEL_TWO_FACTOR_REQUIRED' : 'PANEL_LOGIN_NOT_CONFIRMED');
  } else if (!body.includes('dentix.ua') && !body.includes('h-158422')) {
    result = blocked('DENTIX_SERVICE_NOT_CONFIRMED');
  } else if (phase !== 'panel-audit') {
    // No panel mutation is attempted until its exact live controls are audited.
    result = blocked('PANEL_MUTATION_CONTROLS_UNVERIFIED');
  } else {
    result = {site_id: 'DENTIX', status: 'PASS', temporary_profile: 'ISOLATED',
      service_code_visible: body.includes('h-158422'),
      domain_visible: body.includes('dentix.ua'),
      server_visible: body.includes('hvh34.mirohost.net'),
      production_root_visible: body.includes('/var/www/dentixx/dentix.ua')};
  }
} catch {
  result = blocked('PANEL_AUTOMATION_FAILED');
} finally {
  if (context) await context.close();
}
process.stdout.write(JSON.stringify(result) + '\n');
process.exitCode = result.status === 'PASS' ? 0 : 2;
