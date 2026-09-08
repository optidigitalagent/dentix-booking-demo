import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium, webkit } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE_PATH).href);
const origin = process.env.DENTIX_PREVIEW_ORIGIN ?? 'http://127.0.0.1:4179/dentix-rebrand';
const sizes = process.env.DENTIX_QA_SIZES ? JSON.parse(process.env.DENTIX_QA_SIZES) : [[360,844],[375,812],[390,844],[393,852],[412,915],[430,932],[844,390],[768,900],[1024,900],[1440,900]];
const output = process.env.DENTIX_QA_OUTPUT ?? 'docs/qa/mobile-intake-2026-09-07';
const reports = [];
const startsAt = '2026-10-01T10:00:00Z', endsAt = '2026-10-01T11:00:00Z';
for (const [engineName, engine] of Object.entries({chromium,webkit}).filter(([name]) => !process.env.DENTIX_QA_ENGINE || name === process.env.DENTIX_QA_ENGINE)) {
 const browser = await engine.launch();
 try {
  for (const [width,height] of sizes) {
   const page = await browser.newPage({viewport:{width,height}});
   const errors = []; page.on('pageerror', e => errors.push(e.message));
   let available = true, leadResult = 422, bookingResult = 409; const sent = [];
   await page.route('**/api/public/**', async route => {
    const req = route.request(), url = new URL(req.url()); let data;
    if (url.pathname.endsWith('/intake-status')) data = {lead:{enabled:available,mode:available?'LIVE':'UNAVAILABLE',policyUrl:available?'https://example.org/approved-policy':null,consentVersion:'fixture-v1'},timed:{enabled:available,mode:available?'LIVE':'UNAVAILABLE',policyUrl:available?'https://example.org/approved-policy':null,consentVersion:'fixture-v1'}};
    else if (url.pathname.endsWith('/catalog')) data = {mode:'LIVE_REQUESTS_READY',testOnly:false,timezone:'Europe/Kyiv',requestDurationMinutes:60,minDate:'2026-10-01',maxDate:'2026-10-30',consentVersion:'fixture-v1',services:[{id:'service',name:'Ізольована послуга',category:'QA fixture',duration_minutes:60}],doctors:[{id:'doctor',name:'Ізольований лікар',role_label:'QA fixture'}],doctorServices:[{doctor_id:'doctor',service_id:'service',active:true,public_bookable:true,booking_mode:'DIRECT_SLOT',reservation_duration_minutes:60,buffer_before_minutes:0,buffer_after_minutes:0,consultation_service_id:null,scheduled_service_id:'service',scheduled_service_name:'Ізольована послуга'}]};
    else if (url.pathname.endsWith('/availability')) data={date:'2026-10-01',durationMinutes:60,slots:[{startsAt,endsAt,localStart:'13:00',localEnd:'14:00'}]};
    else if (req.method()==='POST') {
     const body=req.postDataJSON(); sent.push(body); assert.equal(body.consent,true); assert.equal(body.test_submission,undefined); assert.equal(body.consent_version,'fixture-v1');
     const code=url.pathname.endsWith('/leads')?leadResult:bookingResult;
     if(code===0)return route.abort('failed');
     if(code!==200)return route.fulfill({status:code,json:{error:{code:code===409?'SLOT_NO_LONGER_AVAILABLE':'VALIDATION_ERROR',message:code===409?'Час уже недоступний. Оберіть інший.':'Перевірте дані.'}}});
     data=url.pathname.endsWith('/leads')?{message:'Дякуємо! Адміністратор DENTIX зв’яжеться з вами для уточнення деталей.'}:{appointmentId:'fixture',reference:'FIXTURE',status:'AWAITING_CALLBACK',revision:1,message:'Запит на запис отримано. Адміністратор DENTIX зателефонує, щоб уточнити та підтвердити деталі.',startsAt,endsAt};
    }
    await route.fulfill({json:{data}});
   });
   await page.goto(`${origin}/`,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   const form=page.locator('.lead-form').first();
   await form.scrollIntoViewIfNeeded();
   await checkFields(form,width);
   await form.getByLabel('Ім’я *',{exact:true}).fill('Анна-Марія Мар’ян');
   await form.getByLabel('Телефон *',{exact:true}).fill('+380000000001');
   await form.locator('textarea').fill('Перевірка форми без реального пацієнта');
   assert.equal(await page.locator('.mobile-call-bar').isVisible(),false);
   await form.locator('select').selectOption('VIBER');
   await form.locator('input[type=checkbox]').check();
   await form.getByRole('button',{name:'Залишити заявку'}).click();
   await form.getByRole('alert').waitFor(); await checkFields(form,width);
   leadResult=0; await Promise.all([page.waitForEvent('requestfailed',{predicate:request=>request.method()==='POST'&&new URL(request.url()).pathname.endsWith('/leads')}),form.getByRole('button',{name:'Залишити заявку'}).click()]); await page.waitForFunction(()=>{const button=document.querySelector('.lead-form button[type=submit]');return button&&!button.disabled;});
   leadResult=200; await form.getByRole('button',{name:'Залишити заявку'}).click(); await form.getByText(/Дякуємо!/).waitFor();
   const trigger=page.getByRole('button',{name:'Записатися онлайн',exact:true}).first();
   await trigger.scrollIntoViewIfNeeded(); const before=await page.evaluate(()=>({y:scrollY,style:document.body.getAttribute('style')}));
   await trigger.click(); const capturedY=await page.evaluate(()=>-parseFloat(document.body.style.top)); const dialog=page.getByRole('dialog'); await dialog.locator('.booking-options').getByText('Ізольована послуга',{exact:true}).click(); await next();
   await dialog.getByText('Ізольований лікар',{exact:true}).click();await next();
   await checkFields(dialog,width); await dialog.locator('input[type=date]').fill('2026-10-01');await dialog.getByRole('button',{name:'13:00–14:00'}).click();await next();
   await checkFields(dialog,width);
   if(width===390){
    const adapter=await page.evaluate(()=>{
     const v=visualViewport, layer=document.querySelector('.booking-layer'), prior=layer.style.getPropertyValue('--booking-visible-height');
     Object.defineProperty(v,'scale',{configurable:true,value:2});Object.defineProperty(v,'height',{configurable:true,value:300});v.dispatchEvent(new Event('resize'));
     const pinchIgnored=layer.style.getPropertyValue('--booking-visible-height')===prior && v.scale===2;
     Object.defineProperty(v,'scale',{configurable:true,value:1});v.dispatchEvent(new Event('resize'));
     const keyboardAdapted=layer.style.getPropertyValue('--booking-visible-height')==='300px';
     const body=document.querySelector('.booking-body'),footer=document.querySelector('.booking-footer'),close=document.querySelector('.booking-icon-button');
     body.scrollTop=body.scrollHeight;
     const bounds=layer.getBoundingClientRect(),foot=footer.getBoundingClientRect(),head=close.getBoundingClientRect();
     if(foot.bottom>bounds.bottom+1||head.top<bounds.top||body.clientHeight<=0)throw new Error('Keyboard-sized dialog controls inaccessible');
     delete v.scale;delete v.height;v.dispatchEvent(new Event('resize'));return{pinchIgnored,keyboardAdapted};
    });assert.deepEqual(adapter,{pinchIgnored:true,keyboardAdapted:true});
   }
   await dialog.getByLabel('Ім’я *',{exact:true}).fill('Олена');await dialog.getByLabel('Телефон *',{exact:true}).fill('+380000000001');await dialog.locator('input[type=checkbox]').check();if(width===390){await fs.mkdir(output,{recursive:true});await page.screenshot({path:`${output}/${engineName}-booking390.png`});}await next();
   await dialog.getByRole('button',{name:'Надіслати запит'}).click();await dialog.getByRole('alert').waitFor();assert.ok(await dialog.locator('input[type=date]').isVisible());
   bookingResult=200;await dialog.getByRole('button',{name:'13:00–14:00'}).click();await next();await next();await dialog.getByRole('button',{name:'Надіслати запит'}).click();await dialog.getByText('FIXTURE',{exact:true}).waitFor();await dialog.getByRole('button',{name:'Готово'}).click();
   const after=await page.evaluate(()=>({y:scrollY,style:document.body.getAttribute('style')}));assert.ok(Math.abs(capturedY-after.y)<2,`${engineName} scroll restore ${JSON.stringify({before,after})}`);assert.equal(after.style??'',before.style??'');
   await trigger.click();await dialog.locator('.booking-options').getByText('Ізольована послуга',{exact:true}).waitFor();await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);
   available=false;await trigger.click();await dialog.getByText('Заявка не резервує час прийому.').waitFor();assert.equal(await dialog.getByRole('button',{name:'Залишити заявку'}).isDisabled(),true);assert.equal(await dialog.locator('.booking-options').getByText('Ізольована послуга',{exact:true}).count(),0);await checkFields(dialog,width);await dialog.getByRole('button',{name:'Закрити',exact:true}).click();
   const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,viewport:[...document.querySelectorAll('meta[name=viewport]')].map(x=>x.content),scale:visualViewport?.scale}));assert.ok(metrics.overflow<=1);assert.equal(metrics.viewport.length,1);assert.ok(!/user-scalable|maximum-scale/.test(metrics.viewport[0]));assert.deepEqual(errors,[]);
   if(width<1024){await page.getByRole('button',{name:'Відкрити меню',exact:true}).click();await page.locator('#nav-mobile').getByRole('button',{name:'Записатися онлайн',exact:true}).click();await dialog.getByText('Заявка не резервує час прийому.').waitFor();await dialog.getByRole('button',{name:'Закрити',exact:true}).click();assert.equal(await page.evaluate(()=>document.body.style.overflow),'');assert.equal(await page.evaluate(()=>document.documentElement.style.overflow),'');}
   await page.goto(`${origin}/price.html`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await checkFields(page.locator('.lead-form').first(),width);
   if(width===390){await page.locator('footer.footer').scrollIntoViewIfNeeded();await page.locator('.mobile-call-bar').waitFor({state:'detached',timeout:5000});await page.locator('.lead-form').first().scrollIntoViewIfNeeded();await page.screenshot({path:`${output}/${engineName}-price390.png`});}
   reports.push({engineName,width,height,pass:true,metrics,requests:sent.length,physicalDevice:false});console.log(`${engineName} ${width}x${height} PASS`);await page.close();
   async function next(){await dialog.getByRole('button',{name:'Далі',exact:true}).click();}
  }
 } finally{await browser.close();}
}
await fs.mkdir(output,{recursive:true});await fs.writeFile(`${output}/browser-fixtures${process.env.DENTIX_QA_REPORT_SUFFIX??""}.json`,JSON.stringify({kind:'isolated browser API fixtures, no live mutations',physicalDeviceVerification:'pending',reports},null,2));
async function checkFields(scope,width){const fields=scope.locator('input:not([type=checkbox]):not([type=radio]):not([tabindex="-1"]),select,textarea');for(let i=0;i<await fields.count();i++){const field=fields.nth(i);if(!await field.isVisible())continue;if(width<=900)assert.ok(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16);await field.focus();if(width<=900)assert.ok(await field.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16);await field.blur();}}
