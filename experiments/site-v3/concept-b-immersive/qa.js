async page => {
 const base='http://127.0.0.1:8774/experiments/site-v3';
 const out='experiments/site-v3/concept-b-immersive/evidence';
 const failures=[],errors=[],metrics=[];
 const check=(ok,msg)=>{if(!ok)failures.push(msg)};
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 await page.goto(`${base}/concept-b-immersive/`);await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
 for(const width of [360,390,430,768,1440,1920]){
  await page.setViewportSize({width,height:width>1000?1000:844});
  for(const lang of ['en','ru']){
   if(await page.locator('html').getAttribute('lang')!==lang)await page.click('#language');
   for(let chapter=0;chapter<4;chapter++){
    await page.locator('.story-nav a').nth(chapter).click();await page.waitForTimeout(250);
    check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),`${width}/${lang}/${chapter} overflow`);
    const cards=await page.locator('.scene-card').evaluateAll(list=>list.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right}}));
    check(cards.every(r=>r.left>=0&&r.right<=width),`${width}/${lang} card bounds`);
    if(lang==='en'&&[390,1440].includes(width)){await page.waitForTimeout(650);await page.screenshot({path:`${out}/${width}-chapter-${chapter}.png`});}
   }
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
   if(lang==='en'&&[430,1920].includes(width))await page.screenshot({path:`${out}/${width}-hero.png`});
   if(lang==='ru'&&width===390)await page.screenshot({path:`${out}/390-ru.png`});
  }
 }
 await page.setViewportSize({width:1440,height:1000});if(await page.locator('html').getAttribute('lang')==='ru')await page.click('#language');
 for(const quality of ['high','balanced']){
  await page.selectOption('#quality',quality);
  for(let chapter=0;chapter<4;chapter++){
   await page.locator('.story-nav a').nth(chapter).click();await page.waitForTimeout(3500);
   metrics.push({chapter,...await page.locator('canvas').evaluate(e=>e.orbitalMetrics())});
  }
 }
 for(const mode of [0,1,2,3]){await page.locator('button[data-state]').nth(mode).focus();await page.keyboard.press('Enter');check(await page.locator('button[data-state]').nth(mode).getAttribute('aria-pressed')==='true',`mode ${mode}`);}
 await page.locator('.story-nav a').nth(2).click();await page.click('#permission');check((await page.locator('#permission-result').textContent()).includes('No files were read'),'simulation');
 await page.click('#pause');await page.locator('.story-nav a').nth(1).click();let before=await page.locator('canvas').evaluate(e=>e.orbitalMetrics());await page.waitForTimeout(200);let after=await page.locator('canvas').evaluate(e=>e.orbitalMetrics());check(before.totalDraws===after.totalDraws&&before.story===after.story,'pause render and scroll freeze');
 check(await page.locator('.scene-card').first().evaluate(e=>getComputedStyle(e).opacity==='1'),'paused content remains readable');await page.click('#pause');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('#pause').disabled);before=await page.locator('canvas').evaluate(e=>e.orbitalMetrics());await page.locator('.story-nav a').nth(3).click();await page.waitForTimeout(200);after=await page.locator('canvas').evaluate(e=>e.orbitalMetrics());check(before.totalDraws===after.totalDraws,'reduced motion');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.selectOption('#quality','lite');check(await page.locator('.fallback').isVisible(),'Lite fallback');await page.selectOption('#quality','high');
 const browser=page.context().browser();
 const mobile=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});const touch=await mobile.newPage();await touch.goto(`${base}/concept-b-immersive/`);await touch.locator('.story-nav a').nth(1).tap();await touch.waitForFunction(()=>document.body.dataset.chapter==='1');check(await touch.locator('body').getAttribute('data-chapter')==='1','touch chapter');await mobile.close();
 for(const condition of ['no-webgl','no-js']){
  const context=await browser.newContext({javaScriptEnabled:condition!=='no-js'});
  if(condition==='no-webgl')await context.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args)}});
  const p=await context.newPage();await p.goto(`${base}/concept-b-immersive/`);if(condition==='no-webgl')await p.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='fallback');check(await p.locator('.fallback').isVisible(),condition);check(await p.locator('.scene-card').first().evaluate(e=>Number(getComputedStyle(e).opacity)>.3),`${condition} content`);await context.close();
 }
 await page.goto(`${base}/concept-c/`);await page.setViewportSize({width:1440,height:1000});await page.locator('.chapter-nav a').nth(2).click();await page.waitForTimeout(500);await page.screenshot({path:`${out}/c-green.png`});
 check(!errors.length,errors.join(';'));if(failures.length)throw Error(JSON.stringify({failures,metrics}));return {passed:true,layoutCases:48,metrics,errors};
}
