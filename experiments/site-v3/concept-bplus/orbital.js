import {sphere,ribbons,bufferSize} from './geometry.js';
import {fieldGeometry,fieldVertex,fieldFragment} from './field.js';

const vertex=`#version 300 es
precision highp float; precision highp int;
in vec3 position;
uniform float time,orbit,aspect,focus,glow;
uniform vec2 pointer;
uniform vec4 weights;
uniform int kind;
out vec3 normal,world;
out float side,flow,fade;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 vec3 p;side=0.;fade=1.;flow=0.;
 if(kind==0){
  p=position*(.265+.009*sin(time*1.3)+weights.z*.012*sin(time*3.))*(1.+glow*1.2);
  normal=position;
 }else if(kind==1){
  float t=position.x,band=position.z;
  float y=(t*2.-1.);
  float phase=band*2.0944;
  float a=y*4.6+phase+orbit;
  float radius=(.33+.28*cos(y*1.45))*focus;
  radius+=weights.z*.025*sin(y*6.-time*2.8);
  a+=weights.y*.16*sin(y*3.+time*.4+phase);
  a=mix(a,a+sin(y*2.+phase)*.22,weights.w);
  float taper=pow(max(sin(t*3.14159265),0.),.45);
  float width=(.013+weights.y*.002)*(1.+glow*3.5)*taper;
  p=vec3(cos(a)*radius,y*1.43+position.y*width,sin(a)*radius);
  p.xy=turn((band-1.)*.055)*p.xy;
  normal=normalize(vec3(cos(a),.1,sin(a)));
  side=position.y;fade=smoothstep(0.,.035,t)*smoothstep(0.,.035,1.-t);
  flow=.5+.5*sin(t*26.-time*2.4+phase);
 }else{
  p=position; p.xz=turn(time*.045)*p.xz;
  p.y+=.018*sin(time+position.x*5.);normal=vec3(0.,0.,1.);
 }
 p.xz=turn(pointer.x*.45)*p.xz;p.yz=turn(pointer.y*.16)*p.yz;
 normal.xz=turn(pointer.x*.45)*normal.xz;normal.yz=turn(pointer.y*.16)*normal.yz;
 world=p;float z=p.z-4.1;
 gl_Position=vec4(p.x*2.3/aspect,p.y*2.3,-1.002*z-.2002,-z);
 gl_PointSize=2.;
}`;
const fragment=`#version 300 es
precision highp float; precision highp int;
in vec3 normal,world;
in float side,flow,fade;
uniform int kind;
uniform float glow;
uniform vec4 weights;
out vec4 color;
void main(){
 vec3 tint=vec3(.57,.92,.68)+weights.y*vec3(.12,-.04,.05)+weights.z*vec3(-.08,.03,.15)+weights.w*vec3(.19,-.04,-.15);
 if(kind==0){
  vec3 n=normalize(normal);float light=max(dot(n,normalize(vec3(-1.,2.,3.))),0.);
  float rim=pow(1.-max(n.z,0.),2.8);
  float spec=pow(max(dot(reflect(normalize(vec3(1.,-2.,-3.)),n),vec3(0.,0.,1.)),0.),26.);
  if(glow>.5){color=vec4(tint,pow(max(n.z,0.),3.)*.065);return;}
  color=vec4(tint*(.25+light*.48)+rim*tint*.4+vec3(.8,1.,.76)*(spec*.35+pow(max(n.z,0.),10.)*.35),1.);
 }else if(kind==1){
  float edge=1.-smoothstep(.55,1.,abs(side));
  float alpha=edge*fade*(glow>.5?.085:.96);
  float energy=.7+flow*(.12+weights.y*.18+weights.w*.24);
  color=vec4(tint*energy+vec3(.1)*edge,alpha);
 }else{
  float r=length(gl_PointCoord-.5);if(r>.5)discard;
  color=vec4(tint*.65,(1.-smoothstep(0.,.5,r))*.35);
 }
}`;

function percentile(values,p){if(!values.length)return null;const sorted=values.slice().sort((a,b)=>a-b);return sorted[Math.floor((sorted.length-1)*p)];}
export function createOrbital(canvas,_kind,onStatus){
 const immersive=_kind==='bimmersive';
 const stage=canvas.closest('.stage'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let quality=innerWidth<700?'balanced':'high';
 if((navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4)quality='lite';
 let gl,program,meshes=[],uniforms={},timerExt,pending=null,raf=0,last=0,lastRender=0,time=0,orbit=0;
 let paused=false,visible=true,target=0,focus=1,px=0,py=0,aimX=0,aimY=0,disposed=false,lost=false,story=0,targetStory=0;
 const weights=new Float32Array([1,0,0,0]);
 const frameTimes=new Float64Array(600),cpuTimes=new Float64Array(600),gpuTimes=new Float64Array(600);
 let frames=0,gpuCount=0,totalDraws=0;
 function status(){
  stage.classList.toggle('is-lite',quality==='lite'||!gl||lost);
  canvas.dataset.renderer=gl&&quality!=='lite'&&!lost?'webgl':'fallback';canvas.dataset.quality=canvas.dataset.renderer==='webgl'?quality:'lite';
  onStatus(canvas.dataset.renderer==='webgl'?'webgl':'lite');
 }
 function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(error);}return shader;}
 function mesh(data){
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,data.vertices,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,0,0);
  let ibo=null;if(data.indices){ibo=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,data.indices,gl.STATIC_DRAW);}
  return {vao,vbo,ibo,count:data.indices?.length||data.vertices.length/3};
 }
 function release(){
  if(!gl)return;
  for(const m of meshes){gl.deleteBuffer(m.vbo);if(m.ibo)gl.deleteBuffer(m.ibo);gl.deleteVertexArray(m.vao);}meshes=[];
  if(program)gl.deleteProgram(program);program=null;
  if(pending){gl.deleteQuery(pending);pending=null;}
 }
 function init(){
  if(program||lost)return;
  try{
   gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:false,powerPreference:'default'});
   if(!gl)throw Error('WebGL2 unavailable');
   const vs=compile(gl.VERTEX_SHADER,immersive?fieldVertex:vertex),fs=compile(gl.FRAGMENT_SHADER,immersive?fieldFragment:fragment);
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.bindAttribLocation(program,0,'position');gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
   for(const name of ['time','orbit','aspect','focus','glow','pointer','weights','kind','progress','pixelRatio'])uniforms[name]=gl.getUniformLocation(program,name);
   const high=quality==='high';
   const dust=new Float32Array((high?100:45)*3);
   for(let i=0;i<dust.length;i+=3){const a=i*2.399;dust[i]=Math.sin(a)*(1.+(i%13)/20);dust[i+1]=Math.cos(i*.63)*1.55;dust[i+2]=Math.cos(a)*1.2;}
   meshes=immersive?[mesh(fieldGeometry(high?18000:6500))]:[mesh(sphere(high?96:48,high?64:32)),mesh(ribbons(high?420:180,3)),mesh({vertices:dust})];
   timerExt=gl.getExtension('EXT_disjoint_timer_query_webgl2');
   gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);
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
  let query=null;if(timerExt&&!pending&&totalDraws%12===0){query=gl.createQuery();gl.beginQuery(timerExt.TIME_ELAPSED_EXT,query);}
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
  gl.uniform1f(uniforms.time,time);gl.uniform1f(uniforms.orbit,orbit);gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);gl.uniform2f(uniforms.pointer,px,py);gl.uniform4fv(uniforms.weights,weights);gl.uniform1f(uniforms.focus,focus);
  if(immersive){
   gl.uniform1f(uniforms.progress,story);gl.uniform1f(uniforms.pixelRatio,canvas.width/Math.max(canvas.clientWidth,1));
   gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.bindVertexArray(meshes[0].vao);gl.drawArrays(gl.POINTS,0,meshes[0].count);
  }else{
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
  gl.uniform1i(uniforms.kind,0);gl.uniform1f(uniforms.glow,0);gl.bindVertexArray(meshes[0].vao);gl.drawElements(gl.TRIANGLES,meshes[0].count,gl.UNSIGNED_SHORT,0);
  gl.uniform1i(uniforms.kind,1);gl.bindVertexArray(meshes[1].vao);gl.drawElements(gl.TRIANGLES,meshes[1].count,gl.UNSIGNED_SHORT,0);
  // Soft ribbon halo: depth tested against the solid core, never an all-screen bloom.
  gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.uniform1f(uniforms.glow,1);gl.drawElements(gl.TRIANGLES,meshes[1].count,gl.UNSIGNED_SHORT,0);
  gl.uniform1i(uniforms.kind,0);gl.bindVertexArray(meshes[0].vao);gl.drawElements(gl.TRIANGLES,meshes[0].count,gl.UNSIGNED_SHORT,0);
  gl.uniform1i(uniforms.kind,2);gl.bindVertexArray(meshes[2].vao);gl.drawArrays(gl.POINTS,0,meshes[2].count);gl.depthMask(true);
  }
  if(query){gl.endQuery(timerExt.TIME_ELAPSED_EXT);pending=query;}
  totalDraws++;
  if(record){frameTimes[frames%600]=interval;cpuTimes[frames%600]=performance.now()-start;frames++;}
 }
 const active=()=>!disposed&&!lost&&quality!=='lite'&&!paused&&!reduced.matches&&!document.hidden&&visible;
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;lastRender=0;}
 function tick(now){
  raf=0;if(!active())return;
  const interval=quality==='high'?1000/60:1000/30;
  if(!lastRender||now-lastRender>=interval){
   const dt=last?Math.min(now-last,80):16;
   const smoothing=1-Math.exp(-dt/380);
   for(let i=0;i<4;i++)weights[i]+=((i===target?1:0)-weights[i])*smoothing;
   px+=(aimX-px)*(1-Math.exp(-dt/240));py+=(aimY-py)*(1-Math.exp(-dt/240));
   story+=(targetStory-story)*(1-Math.exp(-dt/420));
   time+=dt/1000;orbit+=dt/1000*(.18+weights[1]*.18+weights[3]*.28);draw(!!last,last?now-last:0);last=now;lastRender=lastRender?now-((now-lastRender)%interval):now;
  }
  raf=requestAnimationFrame(tick);
 }
 function sync(){stop();if(active())raf=requestAnimationFrame(tick);else if(!document.hidden&&visible)draw();}
 function resize(){const r=canvas.getBoundingClientRect();[canvas.width,canvas.height]=bufferSize(r.width,r.height,devicePixelRatio,quality);draw();}
 function point(e){if(paused||reduced.matches)return;const r=canvas.getBoundingClientRect();aimX=(e.clientX-r.left)/r.width-.5;aimY=(e.clientY-r.top)/r.height-.5;}
 const inputSurface=immersive?window:stage;
 inputSurface.addEventListener('pointermove',point,{passive:true});inputSurface.addEventListener('pointerdown',point,{passive:true});stage.addEventListener('pointerleave',()=>{aimX=aimY=0;});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 const intersection=new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();});intersection.observe(canvas);
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();lost=true;program=null;meshes=[];pending=null;status();});
 canvas.addEventListener('webglcontextrestored',()=>{lost=false;init();resize();sync();});
 window.addEventListener('pagehide',e=>{stop();if(!e.persisted){release();intersection.disconnect();observer.disconnect();disposed=true;}});
 window.addEventListener('pageshow',()=>{if(!disposed)sync();});
 canvas.orbitalMetrics=()=>{
  const n=Math.min(frames,600),f=Array.from(frameTimes.subarray(0,n)),c=Array.from(cpuTimes.subarray(0,n)),g=Array.from(gpuTimes.subarray(0,Math.min(gpuCount,600)));
  const debug=gl?.getExtension('WEBGL_debug_renderer_info');
  return {quality,story,frames,totalDraws,fps:f.length?1000/(f.reduce((a,b)=>a+b,0)/f.length):null,frameP50:percentile(f,.5),frameP95:percentile(f,.95),cpuP95:percentile(c,.95),gpuP50:percentile(g,.5),gpuP95:percentile(g,.95),gpuSamples:g.length,gpuTimerAvailable:!!timerExt,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',pixels:canvas.width*canvas.height,antialias:canvas.dataset.antialias};
 };
 function setQuality(value){quality=value;stop();release();if(quality!=='lite')init();status();resize();frames=gpuCount=0;sync();return quality;}
 if(quality!=='lite')init();status();resize();sync();
 return {pause(value){paused=value;sync();},state(value){target=value;if(paused||reduced.matches){weights.fill(0);weights[value]=1;}sync();},focus(value){focus=value;draw();},rotate(value){aimX=value;draw();},progress(value){targetStory=Math.max(0,Math.min(1,value));},lite(value){setQuality(value?'lite':'balanced');return quality==='lite';},quality:setQuality};
}
