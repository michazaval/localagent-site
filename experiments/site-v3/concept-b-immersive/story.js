import {storyProgress,chapterIndex,revealAmount} from '../shared/story-policy.js';

export function mountStory(scene){
 const chapters=[...document.querySelectorAll('.signal-chapter')];
 const cards=[...document.querySelectorAll('.scene-card,.signal-chapter:not(:first-child) h2,.signal-chapter:not(:first-child) .chapter-copy > .lead')];
 cards.filter(card=>!card.classList.contains('scene-card')).forEach(card=>card.classList.add('scene-emerge'));
 const links=[...document.querySelectorAll('.story-nav a')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let queued=false,current=-1;
 function update(){
  queued=false;
  const first=chapters[0].offsetTop,last=chapters.at(-1).offsetTop;
  const progress=storyProgress(scrollY,first,last);
  const index=chapterIndex(progress);
  const still=reduced.matches||document.documentElement.classList.contains('paused');
  scene.progress(progress);
  if(index!==current){
   current=index;document.body.dataset.chapter=String(index);
   links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  }
  for(const card of cards){
   const rect=card.getBoundingClientRect();
   card.style.setProperty('--reveal',still?'1':String(revealAmount(rect.top,rect.height,innerHeight)));
  }
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 reduced.addEventListener('change',schedule);
 new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 update();
}
