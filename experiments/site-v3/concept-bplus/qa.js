async page => {
 const base='http://127.0.0.1:8772/experiments/site-v3/concept-bplus/';
 const output='experiments/site-v3/concept-bplus/evidence';
 const failures=[],errors=[],samples=[],layouts=[];const check=(ok,msg)=>{if(!ok)failures.push(msg)};
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+':'+r.url())});
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
 for(const width of [360,390,430,768,1440,1920]){
  await page.setViewportSize({width,height:width>=1000?1000:844});
  for(const lang of ['en','ru']){
   if(await page.locator('html').getAttribute('lang')!==lang)await page.click('#language');
   for(const state of [0,1,2,3]){await page.click(`button[data-state="${state}"]`);check(await page.locator(`button[data-state="${state}"]`).getAttribute('aria-pressed')==='true',`${width}/${lang}/${state}`);}
   check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${width}/${lang}:overflow`);layouts.push({width,lang});
   await page.click('button[data-state="0"]');await page.evaluate(()=>scrollTo(0,0));
   if([390,430,1440,1920].includes(width)&&lang==='en'){await page.click('#pause');await page.screenshot({path:`${output}/${width}-en.png`});await page.click('#pause');}
   if(width===390&&lang==='ru')await page.screenshot({path:`${output}/390-ru.png`});
  }
 }
 await page.setViewportSize({width:1440,height:1000});if(await page.locator('html').getAttribute('lang')==='ru')await page.click('#language');
 for(const quality of ['high','balanced'])for(const state of [0,1,2,3]){
  await page.selectOption('#quality',quality);await page.click(`button[data-state="${state}"]`);await page.evaluate(()=>scrollTo(0,0));
  await page.waitForTimeout(5500);
  samples.push({state,...await page.locator('canvas').evaluate(e=>e.orbitalMetrics())});
  if(quality==='high')await page.screenshot({path:`${output}/state-${state}.png`});
 }
 await page.selectOption('#quality','high');await page.click('#pause');
 let count=await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws);await page.waitForTimeout(250);check(count===await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws),'manual pause');await page.click('#pause');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pause').disabled);count=await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws);await page.waitForTimeout(250);check(count===await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws),'reduced motion');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('button[data-state="1"]').focus();await page.keyboard.press('Enter');check(await page.locator('button[data-state="1"]').getAttribute('aria-pressed')==='true','keyboard mode');
 await page.locator('#focus').focus();const value=await page.locator('#focus').inputValue();await page.keyboard.press('ArrowRight');check(value!==await page.locator('#focus').inputValue(),'keyboard width');
 await page.selectOption('#quality','lite');check(await page.locator('.fallback').isVisible(),'Lite fallback');await page.screenshot({path:`${output}/fallback.png`});await page.selectOption('#quality','high');
 await page.evaluate(()=>(window.lossExtension=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context')).loseContext());await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');check(await page.locator('.fallback').isVisible(),'context loss');
 await page.evaluate(()=>window.lossExtension.restoreContext());await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
 await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(150);count=await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws);await page.waitForTimeout(250);check(count===await page.locator('canvas').evaluate(e=>e.orbitalMetrics().totalDraws),'offscreen');
 const context=await page.context().browser().newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const touch=await context.newPage();await touch.goto(base);await touch.locator('button[data-state="2"]').tap();check(await touch.locator('button[data-state="2"]').getAttribute('aria-pressed')==='true','touch mode');await context.close();
 for(const condition of ['no-webgl','no-js','low-power']){
  const ctx=await page.context().browser().newContext({javaScriptEnabled:condition!=='no-js'});
  if(condition==='no-webgl')await ctx.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args)}});
  if(condition==='low-power')await ctx.addInitScript(()=>Object.defineProperty(navigator,'deviceMemory',{value:2}));
  const p=await ctx.newPage();await p.goto(base);if(condition!=='no-js')await p.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');check(await p.locator('.fallback').isVisible(),condition);await ctx.close();
 }
 check(!errors.length,'browser errors '+errors.join(';'));
 if(failures.length)throw Error(JSON.stringify({failures,samples}));
 return {passed:true,layouts,samples,errors};
}
