// Original particle volume + selective emissive strip/halo in one camera and program.
export const vertex=`#version 300 es
precision highp float;precision highp int;
in vec3 fieldPosition,spherePosition,polyPosition,boxPosition,wavePosition;
uniform float time,orbit,aspect,pixelRatio,composition;
uniform float weights[5];
uniform int layer;
uniform vec2 pointer,resolution;
out float energy,depth,occlusion,edge,fade;
out vec2 haloUV;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
vec3 orient(vec3 p){
 p.xz=turn(.42+orbit*.28)*p.xz;p.yz=turn(-.23+.16*sin(time*.09))*p.yz;
 p.xz=turn(pointer.x*.18)*p.xz;p.yz=turn(pointer.y*.14)*p.yz;return p;
}
vec3 compose(vec3 p){
 float side=cos(composition*3.14159265*4.);
 p.x+=side;
 if(aspect<.85){p.x-=side;p*=.39;p.y+=.88;}
 return p;
}
vec4 project(vec3 p){float z=p.z-4.8;return vec4(p.x*2.5/aspect,p.y*2.5,-1.002*z-.2002,-z);}
vec3 curve(float t,float band){
 float y=(t*2.-1.)*1.3,a=t*3.14159265*3.7+band*2.0943951;
 float r=.43+.35*cos(y*1.12);return vec3(cos(a)*r,y,sin(a)*r);
}
float coreOcclusion(vec3 p){
 float r=length(p.xy),front=sqrt(max(.64*.64-r*r,0.));
 return 1.-weights[1]*.78*(1.-smoothstep(.55,.66,r))*(1.-smoothstep(front-.05,front+.05,p.z));
}
void main(){
 float id=float(gl_VertexID),seed=fract(sin(id*27.17)*1931.17);
 bool ambient=gl_VertexID%10==0,ribbon=gl_VertexID%10>=1&&gl_VertexID%10<=3;
 edge=0.;fade=1.;occlusion=1.;energy=1.;depth=1.;haloUV=vec2(0.);
 if(layer==1){
  float t=fieldPosition.x;vec3 p=orient(curve(t,fieldPosition.z));
  vec4 center=project(compose(p)),next=project(compose(orient(curve(min(t+.001,1.001),fieldPosition.z))));
  vec2 direction=normalize((next.xy/next.w-center.xy/center.w)*resolution);
  vec2 normal=vec2(-direction.y,direction.x);
  center.xy+=normal*fieldPosition.y*4.*pixelRatio*2./resolution*center.w;
  gl_Position=center;edge=fieldPosition.y;
  fade=pow(weights[1],3.)*smoothstep(0.,.035,t)*smoothstep(0.,.035,1.-t);
  occlusion=coreOcclusion(p);depth=.7+.3*smoothstep(-.8,.8,p.z);return;
 }
 if(layer==2){
  // Soft local radiance only; the actual core stays a 3D population of points.
  vec3 p=vec3(fieldPosition.xy*.70,0.);gl_Position=project(compose(p));
  haloUV=fieldPosition.xy;fade=pow(weights[1],3.);return;
 }
 vec3 p=fieldPosition*weights[0]+spherePosition*weights[1]+polyPosition*weights[2]+boxPosition*weights[3]+wavePosition*weights[4];
 p+=normalize(p+vec3(.001))*.009*(ribbon?1.-weights[1]:1.)*sin(time*.65+id*.13);
 p=orient(p);
 if(ambient){p=fieldPosition*vec3(2.5,1.8,1.2);p.xz=turn(time*.018)*p.xz;}
 if(ribbon)occlusion=coreOcclusion(p);
 if(!ambient)p=compose(p);
 float z=p.z-4.8;gl_Position=project(p);
 energy=(ambient?.32+seed*.20:.7+seed*.5)*(ribbon?1.+weights[1]*.4:1.);
 if(gl_VertexID%10==4)energy*=1.+weights[1]*2.0;
 if(ribbon)energy*=1.-weights[1]*.7;
 depth=clamp((p.z+3.5)/5.5,.12,1.);
 gl_PointSize=clamp((ambient?2.+seed*2.:ribbon?2.8:3.6+seed*1.6)*pixelRatio*3.4/(-z),1.,8.);
}`;
export const fragment=`#version 300 es
precision highp float;precision highp int;
uniform int layer;
in float energy,depth,occlusion,edge,fade;
in vec2 haloUV;
out vec4 color;
void main(){
 if(layer==1){
  float inner=exp(-edge*edge*30.),halo=exp(-edge*edge*7.)*.17;
  color=vec4(vec3(.70,1.,.80),min(.95,inner*.90+halo)*depth*occlusion*fade);return;
 }
 if(layer==2){
  float radius=length(haloUV);float a=exp(-radius*radius*7.)*.22*(1.-smoothstep(.65,1.,radius));
  color=vec4(vec3(.28,.95,.52),a*fade);return;
 }
 float r=length(gl_PointCoord-.5);if(r>.5)discard;
 float glow=exp(-r*r*19.);
 vec3 green=mix(vec3(.16,.5,.3),vec3(.7,1.,.78),min(energy,1.));
 color=vec4(green*energy,glow*depth*.70*occlusion);
}`;
