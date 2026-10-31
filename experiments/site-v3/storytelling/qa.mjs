import {createRequire} from 'node:module';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)(process.env.V3_PLAYWRIGHT||'playwright');
const url='http://127.0.0.1:8779/experiments/site-v3/storytelling/';
const b=await chromium.launch({headless:true,channel:'chrome',timeout:15000});const deadline=setTimeout(()=>process.exit(1),75000);const errors=[],samples=[];
try{
 for(const width of [1440,390]){
 const c=await b.newContext({viewport:{width,height:width===390?844:1000},isMobile:width===390,hasTouch:width===390});const p=await c.newPage();p.setDefaultTimeout(9000);p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.url());});await p.goto(url);await p.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
 for(const ru of [false,true]){
  if(ru)await p.click('#language');
  for(const i of [0,1,2,3,4,2,0]){
   await p.evaluate(i=>scrollTo({top:document.querySelectorAll('.chapter')[i].offsetTop,behavior:'instant'}),i);await p.waitForFunction(i=>document.body.dataset.chapter===String(i),i);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');
   const opacity=await p.locator('#control .demo-panel').evaluate(e=>+getComputedStyle(e).opacity);assert(opacity>=.75);
   assert.equal(await p.locator('.story-steps [aria-current="step"]').textContent().then(t=>t.trim().slice(0,1)),String(i+1));
  }
 }
 await p.locator('.actions a[href="#experience"]').click();await p.waitForFunction(()=>location.hash==='#experience'&&document.body.dataset.chapter==='2');
 await p.goBack();await p.waitForFunction(()=>location.hash==='');
 // Pause and reduced motion expose all three moments fully, with no continued scrubbing.
 for(const reduced of [false,true]){
  if(reduced){await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('#pause').disabled);}else await p.click('#pause');
  const before=await p.locator('canvas').evaluate(c=>c.scene.metrics());
  const y=await p.evaluate(()=>scrollY);
  await p.evaluate(()=>scrollTo({top:scrollY>100?0:document.querySelector('#control').offsetTop,behavior:'instant'}));
  await p.waitForFunction(y=>Math.abs(scrollY-y)>100,y);await p.waitForTimeout(100);
  const after=await p.locator('canvas').evaluate(c=>c.scene.metrics());assert.deepEqual(before.weights,after.weights);
  for(const selector of ['#home h1','#idea .principles','#control .demo-panel'])assert.equal(await p.locator(selector).evaluate(e=>getComputedStyle(e).transform),'none');
  if(!reduced)await p.click('#pause');
 }
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>!document.querySelector('#pause').disabled);
 await p.locator('#permission').focus();await p.keyboard.press('Space');assert.equal(await p.locator('#permission').getAttribute('aria-pressed'),'true');
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(700);samples.push({width,metrics:await p.locator('canvas').evaluate(c=>c.scene.metrics())});
 if(process.env.V3_EVIDENCE){await fs.mkdir(process.env.V3_EVIDENCE,{recursive:true});await p.screenshot({path:`${process.env.V3_EVIDENCE}/story-${width}.png`});}
 await c.close();
 }
 const n=await b.newContext({javaScriptEnabled:false});const p=await n.newPage();await p.goto(url);assert.equal(await p.locator('.chapter').count(),5);assert.equal(await p.locator('#home h1').evaluate(e=>getComputedStyle(e).animationName),'none');assert(await p.locator('.scene-fallback').isVisible());await n.close();
 assert.deepEqual(errors,[]);const report={pass:true,localOnly:true,productionIntegration:'GATED ON OWNER #22 VISUAL ACCEPTANCE',samples,errors};console.log(JSON.stringify(report,null,2));if(process.env.V3_EVIDENCE)await fs.writeFile(`${process.env.V3_EVIDENCE}/verification.json`,JSON.stringify(report,null,2));
}finally{await b.close();clearTimeout(deadline);}
