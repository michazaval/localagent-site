// Lifecycle/pacing/GPU query policy adapted from PR19 orbital.js @545b838.
// The single renderer is extended with five static target attributes; no second RAF/layer.
import {particleTargets} from './morph-geometry.js';
import {createMorphState} from './morph-state.js';
import {vertex,fragment} from './morph-shaders.js';
export function bufferSize(width,height,dpr,quality){
 if(width<=0||height<=0)return [1,1];
 const scale=Math.min(dpr||1,quality==='high'?2:1.25,Math.sqrt((quality==='high'?2150000:950000)/(width*height)));
 return [Math.max(1,Math.floor(width*scale)),Math.max(1,Math.floor(height*scale))];
}
const percentile=(values,p)=>{if(!values.length)return null;const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*p)];};
export function createMorphScene(canvas,onStatus){
 const stage=canvas.parentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
 const state=createMorphState(reduced.matches);
 let quality=innerWidth<700?'balanced':'high';
 if((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4)quality='lite';
 let gl,program,vao,buffers=[],shaders=[],uniforms={},timerExt,pending,raf=0,last=0,lastRender=0;
 let paused=false,visible=true,lost=false,disposed=false,time=0,orbit=0,composition=0,targetComposition=0;
 let px=0,py=0,aimX=0,aimY=0,frames=0,gpuCount=0,totalDraws=0,pointCount=0;
 const frameTimes=new Float64Array(600),cpuTimes=new Float64Array(600),gpuTimes=new Float64Array(600);
 const listen=(target,type,fn,options={})=>target.addEventListener(type,fn,{...options,signal:events.signal});
 function status(){
  const active=!!gl&&!!program&&quality!=='lite'&&!lost&&!disposed;
  canvas.dataset.renderer=active?'webgl':'fallback';canvas.dataset.quality=active?quality:'lite';
  stage.classList.toggle('is-webgl',active);onStatus();
 }
 function release(){
  if(gl){for(const b of buffers)gl.deleteBuffer(b);for(const s of shaders)gl.deleteShader(s);if(vao)gl.deleteVertexArray(vao);if(program)gl.deleteProgram(program);if(pending)gl.deleteQuery(pending);}
  buffers=[];shaders=[];vao=program=pending=null;
 }
 function compile(type,source){
  const shader=gl.createShader(type);if(!shader)throw Error('Shader allocation failed');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;
 }
 function init(){
  if(program||lost||quality==='lite'||disposed)return;
  try{
   gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false,powerPreference:'default'});
   if(!gl)throw Error('WebGL2 unavailable');
   const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
   program=gl.createProgram();if(!program)throw Error('Program allocation failed');gl.attachShader(program,vs);gl.attachShader(program,fs);
   const attributes=['fieldPosition','spherePosition','polyPosition','boxPosition','wavePosition'];
   attributes.forEach((name,i)=>gl.bindAttribLocation(program,i,name));gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   for(const s of shaders)gl.deleteShader(s);shaders=[];
   for(const name of ['time','orbit','aspect','pixelRatio','composition','pointer','weights[0]'])uniforms[name]=gl.getUniformLocation(program,name);
   const geometry=particleTargets(quality==='high'?22000:8500);pointCount=geometry.count;
   vao=gl.createVertexArray();if(!vao)throw Error('Vertex array allocation failed');gl.bindVertexArray(vao);
   geometry.targets.forEach((data,i)=>{const buffer=gl.createBuffer();if(!buffer)throw Error('Buffer allocation failed');buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);if(gl.getError()!==gl.NO_ERROR)throw Error('GPU target upload failed');gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,3,gl.FLOAT,false,0,0);});
   timerExt=gl.getExtension('EXT_disjoint_timer_query_webgl2');
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
   canvas.dataset.antialias=String(gl.getContextAttributes().antialias);delete canvas.dataset.fallbackReason;
  }catch(error){canvas.dataset.fallbackReason=error.message;release();gl=null;quality='lite';}
  status();
 }
 function draw(record=false,interval=0){
  if(!gl||!program||quality==='lite'||lost||disposed)return;
  const start=performance.now();
  if(pending&&gl.getQueryParameter(pending,gl.QUERY_RESULT_AVAILABLE)){
   if(!gl.getParameter(timerExt.GPU_DISJOINT_EXT))gpuTimes[gpuCount++%600]=gl.getQueryParameter(pending,gl.QUERY_RESULT)/1e6;
   gl.deleteQuery(pending);pending=null;
  }
  let query;
  if(timerExt&&!pending&&totalDraws%12===0){query=gl.createQuery();if(query)gl.beginQuery(timerExt.TIME_ELAPSED_EXT,query);}
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
  gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.orbit,orbit);gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);gl.uniform1f(uniforms.pixelRatio,canvas.width/Math.max(canvas.clientWidth,1));
  gl.uniform1f(uniforms.composition,composition);gl.uniform2f(uniforms.pointer,px,py);gl.uniform1fv(uniforms['weights[0]'],state.weights);
  gl.depthMask(false);gl.bindVertexArray(vao);gl.drawArrays(gl.POINTS,0,pointCount);
  if(query){gl.endQuery(timerExt.TIME_ELAPSED_EXT);pending=query;}
  totalDraws++;
  if(record){frameTimes[frames%600]=interval;cpuTimes[frames%600]=performance.now()-start;frames++;}
 }
 const active=()=>!disposed&&!lost&&quality!=='lite'&&!paused&&!reduced.matches&&!document.hidden&&visible;
 function stop(){if(raf)cancelAnimationFrame(raf);raf=last=lastRender=0;}
 function tick(now){
  raf=0;if(!active())return;
  const interval=quality==='high'?1000/60:1000/30;
  if(!lastRender||now-lastRender>=interval-.4){
   const dt=last?Math.min(now-last,80):16;state.step(dt/1000);
   px+=(aimX-px)*(1-Math.exp(-dt/240));py+=(aimY-py)*(1-Math.exp(-dt/240));
   composition+=(targetComposition-composition)*(1-Math.exp(-dt/420));
   time+=dt/1000;orbit+=dt/1000*.16;
   draw(!!last,last?now-last:0);last=now;lastRender=lastRender&&now-lastRender>=interval?now-((now-lastRender)%interval):now;
  }
  raf=requestAnimationFrame(tick);
 }
 function sync(){stop();if(active())raf=requestAnimationFrame(tick);else if(!document.hidden&&visible)draw();}
 function motion(){state.pause(paused||reduced.matches);targetComposition=composition;aimX=px;aimY=py;sync();}
 function resize(){const r=canvas.getBoundingClientRect();[canvas.width,canvas.height]=bufferSize(r.width,r.height,devicePixelRatio,quality);draw();}
 function point(e){if(paused||reduced.matches)return;const r=canvas.getBoundingClientRect();aimX=(e.clientX-r.left)/r.width-.5;aimY=(e.clientY-r.top)/r.height-.5;}
 listen(window,'pointermove',point,{passive:true});listen(window,'pointerdown',point,{passive:true});
 listen(document,'visibilitychange',sync);listen(reduced,'change',motion);
 const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});intersection.observe(canvas);
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 listen(canvas,'webglcontextlost',e=>{e.preventDefault();stop();lost=true;buffers=[];shaders=[];vao=program=pending=null;status();});
 listen(canvas,'webglcontextrestored',()=>{lost=false;init();resize();sync();});
 function dispose(){if(disposed)return;disposed=true;stop();events.abort();intersection.disconnect();observer.disconnect();release();status();}
 listen(window,'pagehide',e=>{stop();if(!e.persisted)dispose();});listen(window,'pageshow',()=>{if(!disposed)sync();});
 function setQuality(value){if(!['high','balanced','lite'].includes(value)||disposed)return;quality=value;stop();release();init();status();resize();frames=gpuCount=0;sync();}
 const api={
  pause(value){paused=value;motion();},quality:setQuality,
  state(value){if(!Number.isInteger(value)||value<0||value>3)return;state.mode(value);sync();},
  follow(){state.follow();},
  progress(value){state.progress(value);if(!paused&&!reduced.matches)targetComposition=Math.max(0,Math.min(1,value));},
  dispose,
  metrics(){const n=Math.min(frames,600),f=Array.from(frameTimes.subarray(0,n)),c=Array.from(cpuTimes.subarray(0,n)),g=Array.from(gpuTimes.subarray(0,Math.min(gpuCount,600)));return {quality:canvas.dataset.quality,weights:[...state.weights],source:state.source,composition,frames,totalDraws,pointCount,frameP95:percentile(f,.95),cpuP95:percentile(c,.95),gpuP95:percentile(g,.95),gpuSamples:g.length,fps:f.length?1000/(f.reduce((a,b)=>a+b,0)/f.length):null,pixels:canvas.width*canvas.height,activeBuffers:buffers.length,activePrograms:program?1:0,disposed};}
 };
 canvas.scene=api;init();status();resize();sync();return api;
}
