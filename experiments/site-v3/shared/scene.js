import {resolution,shouldAnimate} from './policy.js';

// Original GLSL + native WebGL. No network, textures, third-party assets or libraries.
const vertex=`attribute vec2 position; varying vec2 uv;
void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 uv;
uniform vec2 size, pointer;
uniform float time, rotation, progress, state;
uniform int concept;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float object(vec3 p){
 p.xz=turn(rotation+pointer.x*.35+time*.12)*p.xz;
 p.yz=turn(-.25+pointer.y*.2)*p.yz;
 if(concept==0){
  p.xy=turn(.38)*p.xy;
  p.xz=turn(p.y*.72)*p.xz;
  vec2 q=vec2(length(p.xy)-.94,p.z);
  float ring=length(q*vec2(1.,.8))-.23;
  vec3 q2=p; q2.yz=turn(1.57)*q2.yz;
  float inner=length(vec2(length(q2.xy)-.62,q2.z))-.09;
  return min(ring,inner);
 }
 float phase=progress*3.;
 float sphere=length(p)-.92;
 float octa=(abs(p.x)+abs(p.y)+abs(p.z)-1.45)*.57735;
 float cube=box(p,vec3(.75))-.06;
 float shell=abs(box(p,vec3(.86)))-.035;
 // A continuous object: potential -> reasoning -> local boundary -> structure.
 float shape=mix(sphere,octa,smoothstep(0.,1.,phase));
 shape=mix(shape,cube,smoothstep(1.,2.,phase));
 return mix(shape,max(shell,-box(p,vec3(1.2,.42,.42))),smoothstep(2.,3.,phase));
}
vec3 normal(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(object(p+e.xyy)-object(p-e.xyy),object(p+e.yxy)-object(p-e.yxy),object(p+e.yyx)-object(p-e.yyx)));}
void main(){
 vec2 p=uv; p.x*=size.x/size.y;
 vec3 ro=vec3(0.,0.,3.8);vec3 rd=normalize(vec3(p*1.5,-3.2));
 float distance=0.;
 for(int i=0;i<68;i++){float d=object(ro+rd*distance);if(d<.0018||distance>7.)break;distance+=d*.8;}
 if(distance>7.){gl_FragColor=vec4(0.);return;}
 vec3 hit=ro+rd*distance;vec3 n=normal(hit);vec3 light=normalize(vec3(-2.,3.,4.));
 float diffuse=max(dot(n,light),0.);float rim=pow(1.-max(dot(n,-rd),0.),2.5);
 vec3 base=concept==0?vec3(.075,.22,.16):mix(vec3(.28,.4,.34),vec3(.36,.23,.14),progress);
 vec3 color=base*(.38+diffuse*.9);
 float spec=pow(max(dot(reflect(-light,n),-rd),0.),44.);
 color+=vec3(.85,1.,.85)*spec*.85;
 color+=vec3(.54,.92,.67)*rim*.55;
 // Reflect a broad studio strip, rather than adding a postprocessing bloom pass.
 color+=vec3(.7,.83,.69)*pow(max(0.,sin(n.y*3.+n.x*2.)),18.)*.3;
 gl_FragColor=vec4(pow(color,vec3(.83)),1.);
}`;

const particleVertex=`precision highp float;
attribute vec3 position;
uniform float time,rotation,state,focus;
uniform vec2 size,pointer;
varying float brightness,depth;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 vec3 p=position;
 float a=atan(p.y,p.x);float r=length(p.xy);
 p*=1.+.035*sin(a*7.+time*1.3);
 // Four different spatial behaviors, continuously blended as the mode changes.
 float thinking=exp(-pow(state-1.,2.)*5.);
 float listening=exp(-pow(state-2.,2.)*5.);
 float acting=smoothstep(2.,3.,state);
 p.z+=sin(a*8.+time*1.6)*thinking*.22;
 p.xy*=1.+listening*.12*sin(time*2.4+r*9.);
 p.x+=acting*sin(p.y*8.+time)*.16;
 p.xz=turn(time*.11+rotation+pointer.x*.22)*p.xz;
 p.yz=turn(pointer.y*.18+.12)*p.yz;
 p*=focus;
 float z=3.4-p.z;
 vec2 screen=p.xy*2.1/z;screen.x*=size.y/size.x;
 gl_Position=vec4(screen,0.,1.);
 gl_PointSize=clamp((3.+position.z)*2./z,1.,4.5);
 brightness=.28+.65*(p.z+1.5)/3.;depth=p.z;
}`;
const particleFragment=`precision highp float;varying float brightness,depth;uniform float state;
void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;
 vec3 c=mix(vec3(.48,.95,.78),vec3(.9,.84,.52),smoothstep(0.,3.,state));
 gl_FragColor=vec4(c*brightness,(1.-smoothstep(.06,.5,r))*.85);}`;

export function createScene(canvas,kind,onStatus) {
  const stage=canvas.closest('.stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false,visible=true,lite=(navigator.deviceMemory||8)<=4 || (navigator.hardwareConcurrency||8)<=4;
  let gl,program,buffer,raf=0,last=0,elapsed=0,mode=0,targetMode=0,angle=0,focus=1,progress=0;
  let pointer=[0,0],targetPointer=[0,0];
  const locations={};
  function status(){stage.classList.toggle('is-lite',lite||!gl);onStatus(lite||!gl?'lite':'webgl');}
  function compile(type,source){
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const message=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(message);}
    return shader;
  }
  function init(){
    if(gl)return;
    try{
      gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:true});
      if(!gl)throw Error('WebGL unavailable');
      const shaders=[compile(gl.VERTEX_SHADER,kind==='b'?particleVertex:vertex),compile(gl.FRAGMENT_SHADER,kind==='b'?particleFragment:fragment)];
      program=gl.createProgram();shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);
      shaders.forEach(s=>gl.deleteShader(s));
      if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      let vertices;
      if(kind==='b'){
        // Deterministic Fibonacci sphere, woven into a spatial signal chamber.
        const count=innerWidth<600?1800:3400;vertices=new Float32Array(count*3);
        for(let i=0;i<count;i++){
          const y=1-2*(i+.5)/count,a=i*2.39996323,r=Math.sqrt(1-y*y);
          const radius=1.02+.14*Math.sin(i*.17);
          vertices.set([Math.cos(a)*r*radius,y*radius,Math.sin(a)*r*radius],i*3);
        }
        canvas.dataset.vertices=String(count);
      }else vertices=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);
      gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
      const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,kind==='b'?3:2,gl.FLOAT,false,0,0);
      for(const name of ['time','rotation','progress','state','focus','size','pointer','concept']) locations[name]=gl.getUniformLocation(program,name);
      if(kind==='b'){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);}
      canvas.dataset.renderer='webgl';
    }catch(error){
      canvas.dataset.fallbackReason=error.message;
      if(gl){if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);}
      gl=null;lite=true;canvas.dataset.renderer='fallback';
    }
    status();
  }
  function draw(){
    if(!gl||lite)return;
    gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(locations.size,canvas.width,canvas.height);gl.uniform2f(locations.pointer,...pointer);
    gl.uniform1f(locations.time,elapsed);gl.uniform1f(locations.rotation,angle);gl.uniform1f(locations.progress,progress);
    gl.uniform1f(locations.state,mode);gl.uniform1f(locations.focus,focus);gl.uniform1i(locations.concept,kind==='a'?0:2);
    gl.drawArrays(kind==='b'?gl.POINTS:gl.TRIANGLES,0,kind==='b'?Number(canvas.dataset.vertices):6);
  }
  const active=()=>shouldAnimate({visible,hidden:document.hidden,paused,reduced:reduced.matches,lite});
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function tick(now){
    raf=0;if(!active())return;
    if(!last||now-last>=1000/30){
      const delta=last?Math.min(now-last,80):16;last=now;elapsed+=delta/1000;
      const mix=1-Math.exp(-delta/280);mode+=(targetMode-mode)*mix;
      pointer=pointer.map((v,i)=>v+(targetPointer[i]-v)*mix);draw();
    }
    raf=requestAnimationFrame(tick);
  }
  function sync(){stop();if(active())raf=requestAnimationFrame(tick);else draw();}
  function resize(){
    const box=canvas.getBoundingClientRect();[canvas.width,canvas.height]=resolution(box.width,box.height,devicePixelRatio);draw();
  }
  function point(e){
    if(paused||reduced.matches||lite)return;
    const box=canvas.getBoundingClientRect();targetPointer=[(e.clientX-box.left)/box.width-.5,(e.clientY-box.top)/box.height-.5];
  }
  stage.addEventListener('pointermove',point,{passive:true});
  stage.addEventListener('pointerdown',point,{passive:true});
  stage.addEventListener('pointerleave',()=>{targetPointer=[0,0];});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();gl=null;lite=true;canvas.dataset.renderer='fallback';status();});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener('pagehide',event=>{stop();if(!event.persisted&&gl){gl.deleteBuffer(buffer);gl.deleteProgram(program);}});
  window.addEventListener('pageshow',sync);
  if(!lite)init();status();resize();sync();
  return {
    pause(value){paused=value;sync();},
    state(value){targetMode=value;if(paused||reduced.matches)mode=value;sync();},
    rotate(value){angle=value;draw();},
    focus(value){focus=value;draw();},
    progress(value){if(paused||reduced.matches)return;progress=value;draw();},
    lite(value){lite=value;if(!lite)init();status();resize();sync();return lite;}
  };
}
