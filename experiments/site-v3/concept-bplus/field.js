// Original volumetric point geometry: no textures, downloaded models or borrowed assets.
export function fieldGeometry(count){
 const vertices=new Float32Array(count*3);let seed=6417;
 for(let i=0;i<vertices.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;vertices[i]=seed/4294967296*2-1;}
 return {vertices};
}
export const fieldVertex=`#version 300 es
precision highp float;precision highp int;
in vec3 position;
uniform float time,orbit,aspect,focus,progress,pixelRatio;
uniform vec2 pointer;
uniform vec4 weights;
out float luminosity,fog;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float ease(float a,float b,float t){return smoothstep(a,b,t);}
void main(){
 float id=float(gl_VertexID),seed=fract(sin(id*27.17)*1931.17);
 vec3 p=position;
 // A folded, filled volume. Multiple layers move at different rates in real depth.
 float theta=atan(p.z,p.x),height=p.y;
 float radius=.55+.48*pow(abs(sin(theta*1.5+height*2.8)),.7);
 p.xz*=radius;
 p.y*=1.35;
 p.xz=turn(orbit*.22+height*.55)*p.xz;
 p+=normalize(position)*.035*sin(time*.8+theta*3.);
 p.z+=weights.y*.13*sin(height*7.+time*.9);
 p*=1.+weights.z*.045*sin(time*2.2+length(p)*8.);
 p.x+=weights.w*.08*sin(time+height*5.);
 float unfold=ease(.05,.38,progress),boundary=ease(.4,.73,progress),release=ease(.75,1.,progress);
 vec3 stream=vec3(position.x*1.65,position.y*.52+sin(position.x*2.)*.25,position.z*.7);
 p=mix(p,stream,unfold);
 vec3 box=position;
 int face=int(id)%3;
 if(face==0)box.x=sign(position.x);else if(face==1)box.y=sign(position.y);else box.z=sign(position.z);
 box*=vec3(1.15,.88,.7);box.xz=turn(.5)*box.xz;
 p=mix(p,box,boundary);
 vec3 horizon=vec3(position.x*2.,sin(position.x*2.+position.z)*.28+position.y*.12,position.z*1.6);
 p=mix(p,horizon,release);
 // An outer low-density field makes the camera occupy a space, not face a backdrop.
 bool ambient=gl_VertexID%6==0;
 if(ambient)p=position*vec3(4.5,2.6,2.8);
 p.xz=turn(pointer.x*.15)*p.xz;p.yz=turn(pointer.y*.12)*p.yz;
 float side=mix(.95,-.95,ease(.12,.32,progress));side=mix(side,.85,ease(.46,.68,progress));
 if(aspect<.8){p*=.7;side=0.;p.y+=.9;}
 p.x+=side;p*=focus;
 float z=p.z-4.4;
 gl_Position=vec4(p.x*2.0/aspect,p.y*2.0,-1.002*z-.2002,-z);
 float energy=.5+.5*sin(id*.07-time*1.2);
 luminosity=(ambient?.12:.48+seed*.52)*(1.+energy*(weights.y*.25+weights.w*.3));
 fog=clamp((p.z+3.1)/5.2,.12,1.);
 gl_PointSize=clamp((ambient?1.4:2.7+seed*2.)*pixelRatio*3.4/(-z),1.,8.);
}`;
export const fieldFragment=`#version 300 es
precision highp float;
in float luminosity,fog;
out vec4 color;
void main(){
 float radius=length(gl_PointCoord-.5);if(radius>.5)discard;
 float glow=exp(-radius*radius*17.);
 vec3 green=mix(vec3(.12,.47,.25),vec3(.73,1.,.69),luminosity);
 color=vec4(green*luminosity,glow*fog*.65);
}`;
