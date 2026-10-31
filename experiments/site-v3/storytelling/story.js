import {mountSite} from '../../../assets/v3/ui.js';
import {createMorphScene} from '../../../assets/v3/morph-scene.js';
import {narrativeProgress} from './policy.js';
const chapters=[...document.querySelectorAll('.chapter')];
const nav=document.createElement('nav');nav.className='story-steps';nav.setAttribute('aria-label','Story chapters');nav.dataset.labelEn='Story chapters';nav.dataset.labelRu='Разделы истории';
for(const [i,section] of chapters.entries()){
 const a=document.createElement('a');a.href=`#${section.id}`;
 const number=document.createElement('span');number.textContent=String(i+1);
 const title=document.createElement('span');title.className='sr-only';title.dataset.en=`. ${section.querySelector('h1,h2').dataset.en}`;title.dataset.ru=`. ${section.querySelector('h1,h2').dataset.ru}`;title.textContent=title.dataset.en;
 a.append(number,title);nav.append(a);
}
document.body.append(nav);
const progress=document.createElement('div');progress.className='story-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
const headerObserver=new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',`${document.querySelector('.header').getBoundingClientRect().height}px`));headerObserver.observe(document.querySelector('.header'));
let current=-1;
const currentObserver=new MutationObserver(()=>{
 const index=Number(document.body.dataset.chapter);if(index===current)return;current=index;
 [...nav.children].forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
});currentObserver.observe(document.body,{attributes:true,attributeFilter:['data-chapter']});
// A factory adapter shares the production renderer/state ownership. Only scroll pacing differs.
const dispose=mountSite((canvas,onStatus)=>{
 const scene=createMorphScene(canvas,onStatus),setProgress=scene.progress;
 scene.progress=()=>setProgress(narrativeProgress(scrollY,chapters.map(c=>c.offsetTop)));
 return scene;
});
window.addEventListener('pagehide',e=>{if(!e.persisted){dispose();headerObserver.disconnect();currentObserver.disconnect();}});
