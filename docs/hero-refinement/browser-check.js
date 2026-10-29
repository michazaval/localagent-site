async page => {
 const failures=[], rows=[], errors=[];
 const check=(ok,msg)=>{if(!ok)failures.push(msg)};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.reload();
 for(const width of [1440,1920,768,360,390,430]){
  await page.setViewportSize({width,height:width>1000?1000:844});
  for(const lang of ['en','ru']){
   if(await page.locator('html').getAttribute('lang')!==lang)await page.locator('#langToggle').click();
   await page.evaluate(()=>document.fonts.ready);
   for(const mode of ['idle','think','listen','act']){
    await page.locator(`.state-btn[data-state=${mode}]`).click();
    check(await page.locator('#fieldFrame').getAttribute('data-state')===mode,`${width}/${lang}/${mode} state`);
    check(await page.locator('.state-btn[aria-pressed=true]').count()===1,`${width}/${lang}/${mode} selection`);
   }
   const layout=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
    return {overflow:document.documentElement.scrollWidth>innerWidth,copy:rect('.hero-copy'),scene:rect('.field-frame'),insight:rect('.signal-insight'),controls:rect('.field-controls'),buttons:[...document.querySelectorAll('.state-btn')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height})),title:rect('.hero-title')};
   });
   check(!layout.overflow,`${width}/${lang} horizontal overflow`);
   const a=layout.copy,b=layout.scene;
   check(!(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y),`${width}/${lang} copy/scene overlap`);
   check(layout.insight.bottom<=layout.controls.y,`${width}/${lang} insight/controls overlap`);
   check(layout.buttons.every(b=>b.w>=44&&b.h>=44),`${width}/${lang} touch targets`);
   rows.push({width,lang,...layout});
   await page.locator('.state-btn[data-state=idle]').click();

  }
 }
 // Keyboard native button activation and focus-visible.
 await page.locator('.state-btn[data-state=idle]').focus();
 await page.keyboard.press('Tab');
 check(await page.locator('.state-btn[data-state=think]').evaluate(e=>e===document.activeElement),'Tab sequence');
 await page.keyboard.press('Space');
 check(await page.locator('#fieldFrame').getAttribute('data-state')==='think','Space activation');
 await page.keyboard.press('Tab');await page.keyboard.press('Enter');
 check(await page.locator('#fieldFrame').getAttribute('data-state')==='listen','Enter activation');
 // Pause must freeze actual Canvas pixels, not just CSS.
 await page.locator('#motionToggle').click();
 let first=await page.locator('canvas').evaluate(e=>e.toDataURL());
 await page.waitForTimeout(200);
 check(first===await page.locator('canvas').evaluate(e=>e.toDataURL()),'manual pause pixels');
 await page.locator('#motionToggle').click();
 await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForFunction(()=>document.querySelector('#motionToggle').disabled);
 check(await page.locator('#motionToggle').isDisabled(),'reduced motion disables resume');
 await page.locator('.state-btn[data-state=act]').click();
 first=await page.locator('canvas').evaluate(e=>e.toDataURL());await page.waitForTimeout(200);
 check(first===await page.locator('canvas').evaluate(e=>e.toDataURL()),'reduced motion pixels');
 await page.emulateMedia({reducedMotion:'no-preference'});
 check(errors.length===0,'browser/resource errors: '+errors.join(','));
 
 if(failures.length)throw Error(failures.join('; ')); return {cases:rows.map(r=>({width:r.width,lang:r.lang,overflow:r.overflow})),failures,errors,keyboard:true,pausePixels:true,reducedMotionPixels:true};
}


