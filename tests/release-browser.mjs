import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { serveArtifact } from '../scripts/serve-artifact.mjs';
if (!process.env.PLAYWRIGHT_MODULE_PATH || !process.env.DENTIX_QA_OUTPUT) throw new Error('External Playwright and evidence directory required');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const { routes } = JSON.parse(await fs.readFile('ops/release/routes.json','utf8'));
const results=[], errors=[], violations=[], seeds=[];
const browser=await chromium.launch();
try {
  for (const target of ['production','preview']) {
    const {server,origin,base}=await serveArtifact(target);
    try { for (const width of [390,1440]) {
      const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      try {
        await context.route('**/*',route=>{
          const req=route.request();
          if (!['GET','HEAD'].includes(req.method())) {violations.push(req.method());return route.abort();}
          if (new URL(req.url()).origin===origin) return route.continue();
          if (/railway\.app|\/api\/public\//.test(req.url())) violations.push('Unexpected backend request: '+req.url());
          return route.fulfill({status:200,contentType:req.resourceType()==='stylesheet'?'text/css':'text/html',body:''});
        });
        const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(['error','warning'].includes(e.type()))errors.push(e.text());});
        for (const route of routes) {
          const response=await page.goto(origin+base+route.path.slice(1),{waitUntil:'networkidle'});assert.equal(response.status(),200);
          assert.equal(await page.locator('h1').count(),1);
          assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'),target==='production'?'index,follow':'noindex,nofollow,noarchive');
          if (target==='production') { assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),route.canonical);assert.equal(await page.title(),route.title); }
          else assert.equal(await page.locator('link[rel="canonical"]').count(),0);
          assert.ok(await page.locator('header').isVisible());
          assert.ok(await page.locator('#contact button[type="submit"]').isDisabled());
          if (['implantation','prosthetics','therapy','surgery'].includes(route.key)) {
            const expected={implantation:'Імплантація зубів',prosthetics:'Протезування зубів',therapy:'Терапія',surgery:'Хірургія'}[route.key];
            await page.locator('.hero-actions button').click();const dialog=page.getByRole('dialog');
            await dialog.locator('.booking-fallback strong').waitFor();assert.equal(await dialog.locator('.booking-fallback strong').textContent(),expected);
            assert.equal(await dialog.locator('textarea').inputValue(),`Цікавить: ${expected}. Прошу зателефонувати, без резервування часу.`);
            assert.ok(await dialog.locator('button[type="submit"]').isDisabled());
            assert.equal(await dialog.locator('.lead-form').getAttribute('data-source-site'),target==='production'?'CANONICAL_CANDIDATE':'PUBLIC_DEMO');
            seeds.push({target,width,path:route.path,requestedInterest:expected,submissions:0,pass:true});
            await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
          }
          const localLink=page.locator('a[href="'+base+'kontakty/"]:visible').first();
          if (route.key!=='contacts' && await localLink.count()) {await localLink.click();await page.waitForURL(origin+base+'kontakty/');assert.equal(await page.locator('h1').count(),1);await page.goto(origin+base+route.path.slice(1),{waitUntil:'networkidle'});}
          if (target==='production') await page.screenshot({path:path.join(process.env.DENTIX_QA_OUTPUT,`release-${width}-${route.key}.png`)});
          results.push({target,width,path:route.path,pass:true});
        }
        for (const missing of ['pr05-missing/','404.html',...(target==='production'?['admin/']:[])]) {
          // Expected 404 resource console messages are scoped away from patient-page errors.
          const p=await context.newPage();const res=await p.goto(origin+base+missing);assert.equal(res.status(),404);assert.equal(await p.locator('link[rel="canonical"]').count(),0);assert.match(await p.locator('meta[name="robots"]').getAttribute('content'),/noindex/);await p.close();
        }
      } finally {await context.close();}
    }} finally {await new Promise(r=>server.close(r));}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(violations,[]);assert.equal(results.length,48);assert.equal(seeds.length,16);
} finally {
  await browser.close();await fs.writeFile(path.join(process.env.DENTIX_QA_OUTPUT,'release-browser.json'),JSON.stringify({results,seeds,errors,violations},null,2)+'\n');
}
console.log('PASS 48 release route/viewport cases; 16 seeded booking checks; zero submissions/errors');
