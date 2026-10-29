async page => {
 const base='http://127.0.0.1:8770';
 const evidence='experiments/site-v3/evidence';
 const errors=[],failures=[],cases=[];
 const assert=(ok,message)=>{if(!ok)failures.push(message)};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.addInitScript(()=>{
  window.__draws=0;
  const original=WebGLRenderingContext.prototype.drawArrays;
  WebGLRenderingContext.prototype.drawArrays=function(...args){window.__draws++;return original.apply(this,args)};
 });
 for(const kind of ['a','b','c']){
  await page.goto(`${base}/experiments/site-v3/concept-${kind}/`);
  await page.waitForFunction(()=>document.querySelector('canvas').dataset.renderer==='webgl');
  for(const width of [360,390,430,768,1440,1920]){
   await page.setViewportSize({width,height:width>=1000?1000:844});
   for(const lang of ['en','ru']){
    if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#language').click();
    await page.evaluate(()=>scrollTo(0,0));
    const geometry=await page.evaluate(()=>({
     overflow:document.documentElement.scrollWidth>innerWidth,
     out:[...document.querySelectorAll('h1,h2,.lead,.nav-tools,button')].filter(e=>{const r=e.getBoundingClientRect();return r.width&& (r.right>innerWidth+1||r.left< -1)}).map(e=>e.tagName+':'+e.textContent.slice(0,25)),
     glError:document.querySelector('canvas').getContext('webgl').getError()
    }));
    assert(!geometry.overflow,`${kind}/${width}/${lang}: overflow`);
    assert(!geometry.out.length,`${kind}/${width}/${lang}: clipped ${geometry.out}`);
    assert(geometry.glError===0,`${kind}/${width}/${lang}: WebGL error ${geometry.glError}`);
    cases.push({kind,width,lang,...geometry});
    if(lang==='en'&&[390,430,1440,1920].includes(width)){
     await page.locator('#pause').click();
     await page.evaluate(()=>{document.activeElement.blur();scrollTo(0,0)});
     await page.screenshot({path:`${evidence}/${kind}-${width<1000?'mobile':'desktop'}-${width}.png`});
     await page.locator('#pause').click();
    }
    if(lang==='ru'&&width===390){await page.screenshot({path:`${evidence}/${kind}-ru-mobile.png`});}
   }
  }
  await page.setViewportSize({width:1440,height:1000});
  if(await page.locator('html').getAttribute('lang')!=='en')await page.locator('#language').click();
  if(kind==='a'){
   await page.locator('[data-detail=memory]').click();
   assert((await page.locator('#detail-title').textContent()).includes('Context'),'A detail interaction');
   await page.locator('[data-detail=control]').focus();await page.keyboard.press('Enter');
   assert((await page.locator('#detail-title').textContent()).includes('Permission'),'A keyboard detail');
   await page.locator('#principles').screenshot({path:`${evidence}/a-second-screen.png`});
   await page.evaluate(()=>scrollTo(0,0));
   await page.locator('#angle').focus();const old=await page.locator('#angle').inputValue();await page.keyboard.press('ArrowRight');
   assert(old!==await page.locator('#angle').inputValue(),'A keyboard rotation');
  }
  if(kind==='b'){
   for(const state of [0,1,2,3]){
    await page.locator(`button[data-state="${state}"]`).click();
    assert(await page.locator(`button[data-state="${state}"]`).getAttribute('aria-pressed')==='true',`B mode ${state}`);
   }
   await page.locator('#permission').click();
   assert((await page.locator('#permission-result').textContent()).includes('No files were read'),'B permission simulation');
   await page.locator('#permission-screen').screenshot({path:`${evidence}/b-second-screen.png`});
   await page.locator('#permission').click();assert((await page.locator('#permission-result').textContent()).includes('Awaiting'),'B reversible simulation');
  }
  if(kind==='c'){
   await page.locator('.chapter-nav a[href="#chapter-3"]').click();
   await page.waitForFunction(()=>document.querySelector('#chapter-number').textContent==='03');
   await page.waitForTimeout(350);
   await page.screenshot({path:`${evidence}/c-second-screen.png`});
  }
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
  await page.locator('#pause').click();
  const frozen=await page.locator('canvas').evaluate(e=>e.toDataURL());await page.waitForTimeout(200);
  assert(frozen===await page.locator('canvas').evaluate(e=>e.toDataURL()),`${kind} manual pause`);
  await page.locator('#pause').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('#pause').disabled);
  const reduced=await page.locator('canvas').evaluate(e=>e.toDataURL());await page.waitForTimeout(200);
  assert(reduced===await page.locator('canvas').evaluate(e=>e.toDataURL()),`${kind} reduced motion`);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.querySelector('#pause').disabled);
  await page.locator('#lite').click();assert(await page.locator('.stage').evaluate(e=>e.classList.contains('is-lite')),`${kind} lite mode`);
  await page.locator('#lite').click();assert(await page.locator('.stage').evaluate(e=>!e.classList.contains('is-lite')),`${kind} restore 3D`);
 }
 // Real touch input in a separate mobile browser context.
 const mobile=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 const touch=await mobile.newPage();
 for(const kind of ['a','b','c']){
  await touch.goto(`${base}/experiments/site-v3/concept-${kind}/`);
  await touch.locator('#language').tap();assert(await touch.locator('html').getAttribute('lang')==='ru',`${kind} touch language`);
  if(kind==='b'){await touch.locator('button[data-state="2"]').tap();assert(await touch.locator('button[data-state="2"]').getAttribute('aria-pressed')==='true','B touch state');}
  const box=await touch.locator('canvas').boundingBox();await touch.touchscreen.tap(box.x+box.width*.6,box.y+box.height*.5);
 }
 await mobile.close();
 // Forced WebGL failure, low-memory policy and JS-disabled documents.
 for(const condition of ['no-webgl','low-memory','no-js']){
  const context=await page.context().browser().newContext({javaScriptEnabled:condition!=='no-js'});
  if(condition==='no-webgl')await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args)};});
  if(condition==='low-memory')await context.addInitScript(()=>Object.defineProperty(navigator,'deviceMemory',{value:2}));
  const fallback=await context.newPage();
  for(const kind of ['a','b','c']){
   await fallback.goto(`${base}/experiments/site-v3/concept-${kind}/`);
   if(condition!=='no-js')await fallback.waitForFunction(()=>document.documentElement.classList.contains('js'));
   assert(await fallback.locator('.fallback').isVisible(),`${kind}/${condition} fallback`);
   assert(await fallback.locator('h1').isVisible(),`${kind}/${condition} content`);
   if(condition==='no-webgl')await fallback.screenshot({path:`${evidence}/${kind}-fallback.png`});
  }
  await context.close();
 }
 for(const width of [1440,1920,390,430]){
  await page.setViewportSize({width,height:width>1000?1000:844});await page.goto(base);
  await page.locator('#motionToggle').click();await page.evaluate(()=>document.activeElement.blur());
  await page.screenshot({path:`${evidence}/before-${width>1000?'desktop':'mobile'}-${width}.png`});
 }
 assert(!errors.length,'Browser errors: '+errors.join('; '));
 if(failures.length)throw Error(JSON.stringify({failures,cases},null,2));
 return {passed:true,layoutCases:cases.length,interactions:['A details/keyboard rotation','B 4 modes/permission/reversal','C chapter navigation','touch all 3','pause pixels','reduced pixels','lite/restore','no WebGL','low memory','no JS'],errors};
}
