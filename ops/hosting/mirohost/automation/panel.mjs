#!/usr/bin/env node
/** DENTIX-only Chromium entrypoint. Private browser state stays outside Git. */
import fs from 'node:fs';
import path from 'node:path';

process.umask(0o077);
const [phase, profile, sessionRoot] = process.argv.slice(2);
const blocked = (code) => ({site_id: 'DENTIX', status: 'BLOCKED', blocker: code,
  temporary_profile: 'ISOLATED'});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function writePrivate(root, name, data) {
  const target = path.join(root, name);
  const temp = path.join(root, `.${name}.${process.pid}.tmp`);
  fs.writeFileSync(temp, JSON.stringify(data) + '\n', {mode: 0o600, flag: 'wx'});
  fs.chmodSync(temp, 0o600);
  fs.renameSync(temp, target);
}

async function serviceVisible(page) {
  const url = new URL(page.url());
  if (url.hostname !== 'control.mirohost.net' ||
      /(?:^|\/)(?:auth|login)(?:\/|$)/i.test(url.pathname)) return null;
  if (await page.locator('input[type="password"]').count()) return null;
  const body = (await page.locator('body').innerText()).toLowerCase();
  const service = body.includes('h-158422');
  const domain = body.includes('dentix.ua');
  return service || domain ? {service_code_visible: service, domain_visible: domain,
    server_visible: body.includes('hvh34.mirohost.net'),
    production_root_visible: body.includes('/var/www/dentixx/dentix.ua')} : null;
}

if (phase === 'manual-login-helper') {
  let context;
  const status = (value) => writePrivate(sessionRoot, 'status.json',
    {site_id: 'DENTIX', phase: 'manual-login', status: value,
      helper_pid: process.pid, recorded_at: new Date().toISOString()});
  try {
    const {chromium} = await import(process.env.PLAYWRIGHT_MODULE_PATH);
    context = await chromium.launchPersistentContext(profile, {headless: false,
      viewport: null});
    status('WAITING_FOR_USER');
    const page = context.pages()[0] || await context.newPage();
    await page.goto('https://control.mirohost.net/',
      {waitUntil: 'domcontentloaded', timeout: 30000});
    writePrivate(sessionRoot, 'window-ready.json',
      {site_id: 'DENTIX', opened: true, helper_pid: process.pid});
    const deadline = Date.now() + 120 * 60 * 1000;
    while (Date.now() < deadline) {
      for (const candidate of context.pages()) {
        let marker;
        try { marker = await serviceVisible(candidate); } catch { continue; }
        if (marker) {
          const storage = path.join(sessionRoot, 'storage-state.json');
          await context.storageState({path: storage});
          fs.chmodSync(storage, 0o600);
          writePrivate(sessionRoot, 'authenticated.json',
            {site_id: 'DENTIX', authenticated: true, ...marker,
              recorded_at: new Date().toISOString()});
          await context.close();
          context = null;
          status('AUTHENTICATED');
          process.exit(0);
        }
      }
      await delay(1500);
    }
    status('EXPIRED');
  } catch {
    status('ERROR');
  } finally {
    if (context) await context.close().catch(() => {});
  }
  process.exit(2);
}

let result = blocked('PANEL_AUTOMATION_FAILED');
let context;
let browser;
try {
  if (!['resume-after-login', 'panel-audit', 'ensure-ftp-ip', 'create-staging',
    'cleanup-temporary-access'].includes(phase)) throw Error('invalid phase');
  const resume = phase === 'resume-after-login';
  const data = resume ? null : JSON.parse(fs.readFileSync(0, 'utf8'));
  const {chromium} = await import(process.env.PLAYWRIGHT_MODULE_PATH);
  if (resume) {
    browser = await chromium.launch({headless: process.env.DENTIX_PANEL_HEADED !== '1'});
    context = await browser.newContext({
      storageState: path.join(path.dirname(profile), 'storage-state.json')
    });
  } else {
    context = await chromium.launchPersistentContext(profile, {
      headless: process.env.DENTIX_PANEL_HEADED !== '1'
    });
  }
  const page = context.pages()[0] || await context.newPage();
  await page.goto(resume ? 'https://control.mirohost.net/order/H-158422' :
    'https://control.mirohost.net/',
    {waitUntil: 'domcontentloaded', timeout: 30000});
  if (!resume) {
    await page.locator('#form_login').fill(data.login);
    await page.locator('#form_password').fill(data.password);
    await page.locator('#form_submit').click();
    await page.waitForTimeout(4500);
  }
  let marker = await serviceVisible(page);
  if (resume && !marker) {
    for (let attempt = 0; attempt < 8 && !marker; attempt++) {
      await delay(1000);
      marker = await serviceVisible(page);
    }
  }
  if (!marker) {
    result = blocked(resume ? 'RETAINED_SESSION_NOT_AUTHENTICATED' :
      'PANEL_LOGIN_NOT_CONFIRMED');
    if (resume) {
      const pathname = new URL(page.url()).pathname;
      result.path_class = /(?:^|\/)auth|login/i.test(pathname) ? 'LOGIN' :
        pathname.includes('/order/') ? 'ORDER' :
        pathname.includes('/services') ? 'SERVICES' : 'OTHER';
      result.password_input_visible = (await page.locator('input[type="password"]').count()) > 0;
      result.body_present = (await page.locator('body').innerText()).length > 0;
    }
  } else if (!resume && phase !== 'panel-audit') {
    result = blocked('PANEL_MUTATION_CONTROLS_UNVERIFIED');
  } else {
    result = {site_id: 'DENTIX', status: 'PASS', temporary_profile: 'ISOLATED',
      ...marker};
  }
} catch {
  result = blocked('PANEL_AUTOMATION_FAILED');
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
}
process.stdout.write(JSON.stringify(result) + '\n');
process.exitCode = result.status === 'PASS' ? 0 : 2;
