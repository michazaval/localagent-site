import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.V3_PLAYWRIGHT||'playwright');
const server=spawn(process.env.PYTHON||'python3',['experiments/site-v3/preview.py','--port','8783','--minutes','2'],{stdio:'ignore'});
let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:8783/')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,channel:process.env.V3_CHANNEL||undefined,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();page.setDefaultTimeout(15000);
 // Deliberately exercise the runner's constrained-device policy on every platform.
 await page.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{value:2}));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['concept-a','concept-c','concept-bplus']){
  await page.goto(`http://127.0.0.1:8783/experiments/site-v3/${path}/`);
  await page.waitForFunction(()=>document.title.includes(' — '));
  if(path==='concept-bplus')await page.selectOption('#quality','high');
  else await page.click('#lite');
  try{await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');}
  catch(error){throw new Error(`${path}: ${JSON.stringify(await page.locator('canvas').evaluate(e=>({...e.dataset})))}`,{cause:error});}
  if(path==='concept-bplus'){
   for(const quality of ['high','balanced','lite','high']){await page.selectOption('#quality',quality);assert.equal(await page.locator('canvas').getAttribute('data-quality'),quality);}
   for(const state of [0,1,2,3]){await page.click(`button[data-state="${state}"]`);assert.equal(await page.locator(`button[data-state="${state}"]`).getAttribute('aria-pressed'),'true');}
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pause').disabled);
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.setViewportSize({width:360,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: A/C WebGL, B+ profiles, states, motion policy and mobile layout');
}finally{await browser?.close();server.kill();}
