import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)(process.env.V3_PLAYWRIGHT||'playwright');
const base='http://127.0.0.1:8783';
const server=spawn(process.env.PYTHON||'python3',['experiments/site-v3/preview.py','--port','8783','--minutes','3'],{stdio:'ignore'});
let browser;
const deadline=setTimeout(()=>{server.kill();browser?.close();console.error('Smoke deadline exceeded');setTimeout(()=>process.exit(1),2000).unref();},170000);
const errors=[];
async function open(context,path='concept-b-immersive'){
 const page=await context.newPage();page.setDefaultTimeout(8000);page.setDefaultNavigationTimeout(10000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(`${base}/experiments/site-v3/${path}/`);return page;
}
async function controls(page,quality,ru=false){
 const lite=quality==='lite';
 assert.equal(await page.locator('#quality').inputValue(),quality);
 assert.equal(await page.locator('#lite').getAttribute('aria-pressed'),String(lite));
 assert.equal(await page.locator('#lite').textContent(),lite?(ru?'Включить 3D':'Try 3D'):(ru?'Лёгкий режим':'Lite mode'));
 assert.equal(await page.locator('canvas').getAttribute('data-quality'),quality);
 assert.equal(await page.locator('canvas').getAttribute('data-renderer'),lite?'fallback':'webgl');
}
async function frozen(page){
 const before=await page.locator('canvas').evaluate(c=>c.orbitalMetrics());
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(180);
 const after=await page.locator('canvas').evaluate(c=>c.orbitalMetrics());
 assert.equal(after.frames,before.frames);assert.equal(after.story,before.story);
 assert.equal(await page.locator('.scene-card').first().evaluate(e=>getComputedStyle(e).opacity),'1');
}
try{
 server.on('error',e=>errors.push(e.message));
 let ready=false;
 for(let i=0;i<40;i++){
  try{if((await fetch(base,{signal:AbortSignal.timeout(300)})).ok){ready=true;break;}}catch{}
  await new Promise(r=>setTimeout(r,100));
 }
 assert(ready,'loopback server ready');
 browser=await chromium.launch({headless:true,timeout:15000,channel:process.env.V3_CHANNEL||undefined,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext();
 await context.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{value:2}));
 for(const path of ['concept-a','concept-c','concept-bplus','concept-b-immersive']){
  const page=await open(context,path);await page.waitForFunction(()=>document.title.includes(' — '));
  if(!['concept-bplus','concept-b-immersive'].includes(path)){
   await page.click('#lite');await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');await page.close();continue;
  }
  for(const ru of [false,true]){
   if(ru)await page.click('#language');
   for(const quality of ['high','lite','high','balanced','high']){await page.selectOption('#quality',quality);await controls(page,quality,ru);}
   await page.click('#lite');await controls(page,'lite',ru);await page.click('#lite');await controls(page,'high',ru);
  }
  await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');window.testLoss=gl.getExtension('WEBGL_lose_context');window.testLoss.loseContext();});
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');await controls(page,'lite',true);
  await page.evaluate(()=>window.testLoss.restoreContext());await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');await controls(page,'high',true);
  for(const state of [0,1,2,3]){await page.click(`button[data-state="${state}"]`);assert.equal(await page.locator(`button[data-state="${state}"]`).getAttribute('aria-pressed'),'true');}
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(path==='concept-b-immersive'){
   for(const i of [0,1,2,3]){
    const link=page.locator('.story-nav a').nth(i);await link.click();
    await page.waitForFunction(i=>document.body.dataset.chapter===String(i),i);
    await page.waitForFunction(i=>Math.abs(document.querySelector('canvas').orbitalMetrics().story-i/3)<.04,i);
    assert.equal(await link.getAttribute('aria-current'),'step');
   }
   await page.click('#pause');await frozen(page);await page.click('#pause');
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pause').disabled);await frozen(page);
   await page.emulateMedia({reducedMotion:'no-preference'});
  }
  await page.close();
 }
 const fallback=await browser.newContext();
 await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...rest){return /webgl/.test(type)?null:original.call(this,type,...rest);};});
 const page=await open(fallback);await page.waitForFunction(()=>document.title.includes(' — '));
 await page.selectOption('#quality','high');await controls(page,'lite');await page.click('#language');await controls(page,'lite',true);
 assert.equal(await page.locator('.signal-chapter').count(),4);assert(await page.locator('h1').isVisible());await fallback.close();
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await open(nojs);
 assert.equal(await staticPage.locator('.signal-chapter').count(),4);assert(await staticPage.locator('h1').isVisible());assert(await staticPage.locator('svg').first().isVisible());
 for(const link of await staticPage.locator('.story-nav a').all()){const href=await link.getAttribute('href');assert.equal(await staticPage.locator(href).count(),1);}
 await nojs.close();assert.deepEqual(errors,[]);
 console.log('LOCAL PASS: quality EN/RU + context recovery; four chapters; pause/reduced freeze; no-WebGL/no-JS; A/C/B+ smoke. Hosted CI NOT RUN.');
}finally{
 clearTimeout(deadline);
 await Promise.race([browser?.close(),new Promise(r=>setTimeout(r,3000))]);server.kill();
}
