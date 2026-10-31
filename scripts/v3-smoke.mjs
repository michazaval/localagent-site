import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.V3_PLAYWRIGHT||'playwright');
const root=new URL('../',import.meta.url),port=Number(process.env.V3_PORT||8784),base=`http://127.0.0.1:${port}`;
const server=spawn(process.env.PYTHON||'python3',['scripts/preview.py','--port',String(port),'--minutes','3'],{cwd:root,stdio:'ignore'});
let browser;const errors=[],samples=[];let layoutCases=0;
const deadline=setTimeout(()=>{server.kill();console.error('V3 smoke deadline including cleanup');process.exit(1);},175000);
const out=process.env.V3_EVIDENCE;
async function checkPose(page){return page.locator('canvas').evaluate(c=>c.scene.metrics());}
async function open(context){const p=await context.newPage();p.setDefaultTimeout(10000);p.setDefaultNavigationTimeout(10000);p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await p.goto(`${base}/v3/`);return p;}
async function freeze(p){
 const before=await checkPose(p);const y=await p.evaluate(()=>scrollY);
 await p.evaluate(()=>scrollTo({top:scrollY>100?0:document.body.scrollHeight,behavior:'instant'}));await p.waitForFunction(y=>Math.abs(scrollY-y)>100,y);await p.waitForTimeout(200);
 const after=await checkPose(p);assert.deepEqual(after.weights,before.weights);assert.equal(after.composition,before.composition);assert.equal(after.frames,before.frames);
}
try{
 server.on('error',e=>errors.push(e.message));let ready=false;for(let i=0;i<40;i++){try{if((await fetch(base,{signal:AbortSignal.timeout(300)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert(ready);
 browser=await chromium.launch({headless:true,channel:process.env.V3_CHANNEL||'chrome',timeout:15000});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000}});const p=await open(ctx);
 await p.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
 if(out)await fs.mkdir(out,{recursive:true});
 for(const [mode,shape] of [[0,1],[1,2],[2,4],[3,3]]){
  await p.locator(`[data-state="${mode}"]`).click();await p.waitForFunction(shape=>document.querySelector('canvas').scene.metrics().weights[shape]>.985,shape);
  assert.equal((await checkPose(p)).source,'mode');
  if(out){await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:`${out}/shape-${shape}-1440.png`});}
 }
 // Rapid redirects preserve current weights; no instantaneous endpoint replacement.
 const before=await checkPose(p);
 await p.evaluate(()=>{for(const v of [0,3,1,2,0])document.querySelector(`button[data-state="${v}"]`).click();});
 const after=await checkPose(p);assert(after.weights.every((v,i)=>Math.abs(v-before.weights[i])<.25));
 await p.locator('#follow').click();assert.equal((await checkPose(p)).source,'scroll');
 for(const i of [0,1,2,3,4,2,0]){
  await p.evaluate(i=>scrollTo({top:document.querySelectorAll('.chapter')[i].offsetTop,behavior:'instant'}),i);
  await p.waitForFunction(i=>document.body.dataset.chapter===String(i),i);await p.waitForTimeout(150);
 }
 await p.locator('#pause').click();assert(await p.locator('[data-state="1"]').isDisabled());assert(await p.locator('#follow').isDisabled());await freeze(p);await p.locator('#pause').click();
 // Resume preserves the frozen morph and composition rather than catching up to old scroll.
 const resume=await checkPose(p);await p.waitForTimeout(200);const resumed=await checkPose(p);assert.deepEqual(resumed.weights,resume.weights);assert.equal(resumed.composition,resume.composition);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('#pause').disabled);assert(await p.locator('[data-state="1"]').isDisabled());await freeze(p);await p.emulateMedia({reducedMotion:'no-preference'});
 const resumedReduced=await checkPose(p);await p.waitForTimeout(200);assert.deepEqual((await checkPose(p)).weights,resumedReduced.weights);
 for(const q of ['lite','high','balanced','high']){await p.selectOption('#quality',q);assert.equal(await p.locator('#quality').inputValue(),q);assert.equal((await checkPose(p)).quality,q);}
 await p.evaluate(()=>{window.loss=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');window.loss.loseContext();});await p.waitForFunction(()=>document.querySelector('#quality').value==='lite');
 await p.waitForTimeout(100);await p.evaluate(()=>window.loss.restoreContext());await p.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');assert.equal(await p.locator('#quality').inputValue(),'high');
 // Simulated hidden policy: no draws, no elapsed-time catch-up.
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 const hidden=await checkPose(p);await p.waitForTimeout(180);assert.equal((await checkPose(p)).totalDraws,hidden.totalDraws);
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 for(const w of [360,390,430,768,1440,1920]){
  await p.setViewportSize({width:w,height:1000});
  for(const ru of [false,true]){
   if(await p.locator('html').getAttribute('lang')!==(ru?'ru':'en'))await p.locator('#language').click();
   for(const i of [0,1,2,3,4]){
    await p.evaluate(i=>scrollTo({top:document.querySelectorAll('.chapter')[i].offsetTop,behavior:'instant'}),i);await p.waitForFunction(i=>document.body.dataset.chapter===String(i),i);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'document overflow');
    assert(await p.evaluate(i=>{const h=document.querySelector('.header').getBoundingClientRect(),c=document.querySelectorAll('.chapter .copy')[i].getBoundingClientRect();return c.top>=h.bottom-1;},i),'header obscures chapter');layoutCases++;
   }
   if(out&&[390,1440].includes(w)){await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(900);await p.screenshot({path:`${out}/hero-${w}-${ru?'ru':'en'}.png`});}
  }
 }
 // Native keyboard and permission simulation; no permission requests or file IO.
 await p.locator('#permission').focus();await p.keyboard.press('Space');assert.equal(await p.locator('#permission').getAttribute('aria-pressed'),'true');
 for(const q of ['high','balanced']){
  await p.setViewportSize({width:1440,height:1000});await p.selectOption('#quality',q);await p.waitForTimeout(2600);samples.push({condition:q,metrics:await checkPose(p)});
 }
 const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await p.selectOption('#quality','balanced');await p.waitForTimeout(2600);samples.push({condition:'4x CPU throttle / balanced',metrics:await checkPose(p)});await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 await p.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false})));const released=await checkPose(p);assert.equal(released.activeBuffers,0);assert.equal(released.activePrograms,0);assert(released.disposed);
 await p.waitForTimeout(150);assert.equal((await checkPose(p)).totalDraws,released.totalDraws);
 const fallback=await browser.newContext();await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:get.call(this,type,...args);};});const f=await open(fallback);await f.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');await f.selectOption('#quality','high');assert.equal(await f.locator('#quality').inputValue(),'lite');assert(await f.locator('.scene-fallback').isVisible());await fallback.close();
 const low=await browser.newContext();await low.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{value:2}));const l=await open(low);await l.waitForFunction(()=>document.querySelector('html').classList.contains('has-scene'));assert.equal(await l.locator('#quality').inputValue(),'lite');await low.close();
 const oom=await browser.newContext();await oom.addInitScript(()=>{const create=WebGL2RenderingContext.prototype.createBuffer;let n=0;WebGL2RenderingContext.prototype.createBuffer=function(){return ++n===3?null:create.call(this);};});
 const o=await open(oom);await o.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');const failed=await checkPose(o);assert.equal(failed.activeBuffers,0);assert.equal(failed.activePrograms,0);assert.equal(failed.quality,'lite');await oom.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const n=await open(nojs);assert.equal(await n.locator('.chapter').count(),5);assert(await n.locator('h1').isVisible());assert(await n.locator('.scene-fallback').isVisible());await nojs.close();
 assert.deepEqual(errors,[]);const report={local:true,hostedCI:'NOT RUN',layoutCases,samples,errors,browser:browser.version()};if(out)await fs.writeFile(`${out}/verification.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{server.kill();await browser?.close();clearTimeout(deadline);}
