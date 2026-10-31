export function mountSite(createScene){
 const root=document.documentElement,canvas=document.querySelector('#signal'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let language='en',paused=false,mode=0,approved=false,scene,queued=0,chapter=0,manual=false;
 const chapters=[...document.querySelectorAll('.chapter')];
 const text=(en,ru)=>language==='ru'?ru:en;
 const descriptions=[['Quiet potential. Waiting for your intent.','Спокойный потенциал. В ожидании твоей команды.'],['Reasoning illustration. No model is running.','Иллюстрация анализа. Модель не запущена.'],['Voice illustration. The microphone is off.','Иллюстрация голоса. Микрофон выключен.'],['Action illustration. No real task is executed.','Иллюстрация действия. Реальная задача не выполняется.']];
 function setText(selector,value){const el=document.querySelector(selector);if(el.textContent!==value)el.textContent=value;}
 function sync(){
  document.querySelector('#pause').textContent=reduced.matches?text('Reduced motion','Без движения'):paused?text('Resume FX','Включить FX'):text('Pause FX','Пауза FX');
  document.querySelector('#pause').disabled=reduced.matches;
  document.querySelector('#pause').setAttribute('aria-pressed',String(paused||reduced.matches));root.classList.toggle('paused',paused||reduced.matches);
  const quality=canvas.dataset.quality||'lite';document.querySelector('#quality').value=quality;
  setText('#renderer-status',canvas.dataset.renderer==='webgl'?text('Local WebGL rendering','Локальная WebGL-графика'):text('Static illustration','Статичная иллюстрация'));
  setText('#state-description',text(...descriptions[mode]));
  document.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.state===mode)));
  setText('#permission-result',approved?text('Simulation approved. No files were read or changed.','Симуляция одобрена. Файлы не читались и не менялись.'):text('No access. No real task is executed.','Доступа нет. Реальная задача не выполняется.'));
 }
 function localize(){root.lang=language;document.querySelectorAll('[data-en]').forEach(e=>e.textContent=e.dataset[language]);document.querySelectorAll('[data-label-en]').forEach(e=>e.setAttribute('aria-label',e.dataset[language==='en'?'labelEn':'labelRu']));document.querySelector('#language').textContent=language==='en'?'RU':'EN';document.querySelector('#language').setAttribute('aria-label',text('Switch to Russian','Переключить на английский'));document.title=text('LocalAgent — Intelligence within reach','LocalAgent — Интеллект на твоей стороне');sync();}
 function update(){queued=0;let nearest=0,distance=Infinity;chapters.forEach((e,i)=>{const d=Math.abs(e.getBoundingClientRect().top);if(d<distance){distance=d;nearest=i;}});chapter=nearest;document.body.dataset.side=[1,3].includes(chapter)?'right':'left';document.body.dataset.chapter=chapter;scene?.progress(Math.max(0,Math.min(1,scrollY/Math.max(1,chapters.at(-1).offsetTop))));if(!manual){mode=Math.min(3,chapter);sync();}}
 function schedule(){if(!queued)queued=requestAnimationFrame(update);}
 document.querySelector('#language').addEventListener('click',()=>{language=language==='en'?'ru':'en';localize();});
 document.querySelector('#pause').addEventListener('click',()=>{paused=!paused;scene?.pause(paused);sync();});
 document.querySelector('#quality').addEventListener('change',e=>{scene?.quality(e.target.value);sync();});
 document.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>{manual=true;mode=+button.dataset.state;scene?.state(mode);sync();}));
 document.querySelector('#follow').addEventListener('click',()=>{manual=false;scene?.follow?.();update();});
 document.querySelector('#permission').addEventListener('click',e=>{approved=!approved;e.currentTarget.setAttribute('aria-pressed',String(approved));sync();});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',sync);
 if(createScene){root.classList.add('has-scene');scene=createScene(canvas,()=>sync());}
 localize();update();
 return ()=>{scene?.dispose();cancelAnimationFrame(queued);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);reduced.removeEventListener('change',sync);};
}


