// Geometry ownership is explicit: mode holds until Follow. Paused requests never queue.
export function createMorphState(still=false){
 const weights=new Float32Array(still?[0,1,0,0,0]:[1,0,0,0,0]);
 const target=new Float32Array([0,1,0,0,0]);
 let paused=still,source='scroll',progress=0;
 function scrollTarget(){
  const path=[1,2,3,4,0],p=Math.max(0,Math.min(1,progress))*4,i=Math.min(3,Math.floor(p)),f=p-i;
  target.fill(0);target[path[i]]=1-f;target[path[i+1]]=f;
 }
 return {weights,get source(){return source;},get paused(){return paused;},
  progress(value){progress=Math.max(0,Math.min(1,value));if(!paused&&source==='scroll')scrollTarget();},
  mode(value){if(paused)return;source='mode';target.fill(0);target[[1,2,4,3][value]]=1;},
  follow(){source='scroll';if(!paused)scrollTarget();},
  pause(value){paused=value;target.set(weights);},
  step(seconds){if(paused)return;const k=1-Math.exp(-Math.max(0,Math.min(seconds,.5))/.48);for(let i=0;i<5;i++)weights[i]+=(target[i]-weights[i])*k;}
 };
}
