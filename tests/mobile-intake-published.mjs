import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const origin=process.env.DENTIX_PREVIEW_ORIGIN??'https://optidigitalagent.github.io/dentix-booking-demo';
const dir=process.env.DENTIX_QA_OUTPUT??'docs/qa/mobile-intake-2026-09-07';await fs.mkdir(dir,{recursive:true});const results=[];
const sizes=process.env.DENTIX_QA_SIZES?JSON.parse(process.env.DENTIX_QA_SIZES):[[360,844],[375,812],[390,844],[393,852],[412,915],[430,932],[844,390],[768,900],[1024,900],[1440,900]];
for(const [engineName,engine] of Object.entries({chromium,webkit}).filter(([name])=>!process.env.DENTIX_QA_ENGINE||name===process.env.DENTIX_QA_ENGINE)){
 const browser=await engine.launch();try{for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(process.env.DENTIX_QA_LOCAL_ONLY==='true'){
   assert.equal(new URL(origin).hostname,'127.0.0.1');
   await page.route('**/*',async route=>{const req=route.request();assert.ok(['GET','HEAD'].includes(req.method()),'Submission forbidden');if(new URL(req.url()).origin===new URL(origin).origin)return route.continue();return route.fulfill({status:200,contentType:req.resourceType()==='stylesheet'?'text/css':'text/html',body:''});});
  }
  await page.goto(origin+'/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const form=page.locator('.lead-form').first();await form.scrollIntoViewIfNeeded();
  await form.getByLabel('Ім’я *',{exact:true}).fill('Олена');await form.getByLabel('Телефон *',{exact:true}).fill('+380000000001');
  await form.getByRole('button',{name:'Залишити заявку'}).waitFor();assert.ok(await form.getByRole('button',{name:'Залишити заявку'}).isDisabled());
  assert.ok(!/TEST|тестов/iu.test(await form.innerText()));await fields(form,width);
  const trigger=page.getByRole('button',{name:'Записатися онлайн',exact:true}).first();await trigger.scrollIntoViewIfNeeded();await trigger.click();
  const dialog=page.getByRole('dialog');await dialog.getByText('Заявка не резервує час прийому.').waitFor();await fields(dialog,width);
  assert.ok(await dialog.getByRole('button',{name:'Залишити заявку'}).isDisabled());assert.ok(!/TEST|тестов/iu.test(await dialog.innerText()));
  const captured=await page.evaluate(()=>-parseFloat(document.body.style.top));await dialog.getByRole('button',{name:'Закрити',exact:true}).click();
  assert.ok(Math.abs((await page.evaluate(()=>scrollY))-captured)<2);assert.equal(await page.evaluate(()=>document.body.style.position),'');
  await page.goto(origin+'/price.html',{waitUntil:'networkidle'});await fields(page.locator('.lead-form').first(),width);
  if(width===390){await page.locator('.lead-form').first().scrollIntoViewIfNeeded();await page.screenshot({path:`${dir}/published-${engineName}-390.png`});await page.locator('footer.footer').scrollIntoViewIfNeeded();await page.locator('.mobile-call-bar').waitFor({state:'detached',timeout:5000});}
  const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:[...document.querySelectorAll('meta[name=viewport]')].map(x=>x.content),scale:visualViewport?.scale}));
  assert.ok(metrics.overflow<=1);assert.equal(metrics.viewport.length,1);assert.ok(!/user-scalable|maximum-scale/.test(metrics.viewport[0]));assert.deepEqual(errors,[]);
  results.push({engineName,width,height,pass:true,metrics});console.log(`${engineName} ${width}x${height} published PASS`);await page.close();
 }}finally{await browser.close();}
}
await fs.writeFile(`${dir}/published.json`,JSON.stringify({at:new Date().toISOString(),origin,readOnly:true,physicalDevice:false,results},null,2));
async function fields(scope,width){const fields=scope.locator('input:not([type=checkbox]):not([type=radio]):not([tabindex="-1"]),select,textarea');for(let n=0;n<await fields.count();n++){const field=fields.nth(n);if(!await field.isVisible())continue;await field.focus();if(width<=900)assert.ok(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16);await field.blur();}}
