import {createScene} from './scene.js';
import {chapterProgress} from './policy.js';

const kind=document.body.dataset.concept;
document.documentElement.classList.add('js');
const canvas=document.querySelector('canvas');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let language='en',paused=false,lite=false,renderMode='lite';
let preferredQuality='high';
const text=(en,ru)=>language==='ru'?ru:en;
const stateDescriptions=[
  ['Quiet potential. Waiting for your intent.','Спокойный потенциал. В ожидании твоей команды.'],
  ['Reasoning preview. No model is running.','Визуализация анализа. Модель не запущена.'],
  ['Voice preview. The microphone is off.','Визуализация голоса. Микрофон выключен.'],
  ['Action preview. No operation is executed.','Визуализация действия. Ничего не выполняется.']
];
let selectedState=0;
function showRenderer(){
  document.querySelector('#renderer-status').textContent=renderMode==='webgl'?text('WebGL · local rendering','WebGL · локальная графика'):text('Static preview · lightweight','Статичный эскиз · лёгкий режим');
}
function syncQualityControls(){
  lite=renderMode!=='webgl';
  const quality=document.querySelector('#quality');
  if(quality)quality.value=lite?'lite':canvas.dataset.quality;
  const button=document.querySelector('#lite');
  button.textContent=lite?text('Try 3D','Включить 3D'):text('Lite mode','Лёгкий режим');
  button.setAttribute('aria-pressed',String(lite));
  if(!lite&&canvas.dataset.quality)preferredQuality=canvas.dataset.quality;
  showRenderer();
  syncNavHeight();
}
function syncNavHeight(){document.documentElement.style.setProperty('--nav-height',`${document.querySelector('.site-nav').getBoundingClientRect().height+8}px`);}
window.addEventListener('resize',syncNavHeight);
const factory=['bplus','bimmersive'].includes(kind)?(await import('../concept-bplus/orbital.js')).createOrbital:createScene;
const scene=factory(canvas,kind,value=>{renderMode=value;syncQualityControls();});
document.querySelector('#quality')?.addEventListener('change',event=>scene.quality(event.target.value));
function motionLabels(){
  const button=document.querySelector('#pause');
  button.textContent=reduced.matches?text('Reduced motion','Без движения'):paused?text('Resume FX','Включить FX'):text('Pause FX','Пауза FX');
  button.setAttribute('aria-pressed',String(paused||reduced.matches));button.disabled=reduced.matches;
  document.documentElement.classList.toggle('paused',paused||reduced.matches);
}
function announceState(){
  const status=document.querySelector('#state-description');
  if(status)status.textContent=text(...stateDescriptions[selectedState]);
}
function localize(){
  document.documentElement.lang=language;
  document.querySelectorAll('[data-en]').forEach(el=>el.textContent=el.dataset[language]);
  document.querySelectorAll('[data-label-en]').forEach(el=>el.setAttribute('aria-label',el.dataset[language==='ru'?'labelRu':'labelEn']));
  const toggle=document.querySelector('#language');toggle.textContent=language==='en'?'RU':'EN';
  toggle.setAttribute('aria-label',text('Switch to Russian','Переключить на английский'));
  syncQualityControls();motionLabels();announceState();updateDetail();
  const title={a:['Sculptural Clarity','Скульптурная ясность'],b:['Immersive Signal','Иммерсивный сигнал'],bimmersive:['Immersive Signal / Living space','Живое пространство'],bplus:['Orbital Intelligence','Орбитальный интеллект'],c:['Cinematic Journey','Кинематографичная история']}[kind];
  document.title=`LocalAgent / ${kind==='bplus'?'B+':kind==='bimmersive'?'B':kind.toUpperCase()} — ${text(...title)}`;
  syncNavHeight();
}
document.querySelector('#language').addEventListener('click',()=>{language=language==='en'?'ru':'en';localize();});
document.querySelector('#pause').addEventListener('click',()=>{paused=!paused;scene.pause(paused);motionLabels();});
reduced.addEventListener('change',motionLabels);
document.querySelector('#lite').addEventListener('click',()=>{
  if(scene.quality)scene.quality(lite?preferredQuality:'lite');else scene.lite(!lite);
  syncQualityControls();
});
for(const button of document.querySelectorAll('.modes [data-state]'))button.addEventListener('click',()=>{
  selectedState=Number(button.dataset.state);scene.state(selectedState);
  document.querySelectorAll('.modes [data-state]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  document.body.dataset.state=String(selectedState);announceState();
});
document.querySelector('#angle')?.addEventListener('input',e=>scene.rotate(Number(e.target.value)*Math.PI/180));
document.querySelector('#focus')?.addEventListener('input',e=>scene.focus(Number(e.target.value)/100));

const details={
  model:[['On your hardware. On your terms.','На твоём устройстве. На твоих условиях.'],['Local models are the intended foundation for core responses. Hardware support and availability are still being developed.','Локальные модели — планируемая основа ответов. Поддержка оборудования и доступность ещё в разработке.']],
  memory:[['Context with a clear boundary.','Контекст с понятной границей.'],['The concept: remembered preferences on your machine, with control over what stays and what goes. This is an illustration, not a connected memory store.','Концепция: предпочтения на твоём компьютере с контролем сохранения и удаления. Это иллюстрация, не подключённая память.']],
  control:[['Permission is part of the design.','Разрешение — часть замысла.'],['Tools should act within a scope you choose, with a visible stop. No Windows action is performed by this prototype.','Инструменты должны работать в выбранных тобой границах с понятной остановкой. Прототип не выполняет действия в Windows.']]
};
let detail='model';
function updateDetail(){
  const heading=document.querySelector('#detail-title');if(!heading)return;
  heading.textContent=text(...details[detail][0]);document.querySelector('#detail-copy').textContent=text(...details[detail][1]);
}
document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>{
  detail=button.dataset.detail;
  document.querySelectorAll('[data-detail]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
  scene.rotate({model:0,memory:1.1,control:2.2}[detail]);updateDetail();
}));
// Deliberately DOM-only simulation: no file access, permission API or AI call.
let approved=false;
document.querySelector('#permission')?.addEventListener('click',()=>{
  approved=!approved;
  document.querySelector('#permission').setAttribute('aria-pressed',String(approved));
  const result=document.querySelector('#permission-result');
  result.dataset.en=approved?'Simulation approved. Scope: one selected folder. No files were read or changed.':'Awaiting your choice. Nothing has access to your files.';
  result.dataset.ru=approved?'Симуляция одобрена. Область: одна выбранная папка. Файлы не читались и не менялись.':'Ожидает решения. Доступа к твоим файлам нет.';
  result.textContent=result.dataset[language];
});
if(kind==='c'){
  const chapters=[...document.querySelectorAll('.chapter')];
  let scheduled=false;
  function scroll(){
    scheduled=false;
    const first=chapters[0].offsetTop,last=chapters.at(-1).offsetTop;
    const progress=chapterProgress(scrollY+innerHeight*.35-first,last-first);
    scene.progress(progress);
    const index=Math.min(3,Math.round(progress*3));
    document.querySelectorAll('.chapter-nav a').forEach((a,i)=>{
      if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');
    });
    document.querySelector('#chapter-number').textContent=String(index+1).padStart(2,'0');
  }
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scroll);}},{passive:true});scroll();
}
localize();
if(kind==='bimmersive'){
 const {mountStory}=await import('../concept-b-immersive/story.js');mountStory(scene);
}
