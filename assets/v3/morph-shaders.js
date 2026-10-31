// Original point-cloud shader. No textures, copied models or fullscreen noise layer.
export const vertex=`#version 300 es
precision highp float;
in vec3 fieldPosition,spherePosition,polyPosition,boxPosition,wavePosition;
uniform float time,orbit,aspect,pixelRatio,composition;
uniform float weights[5];
uniform vec2 pointer;
out float energy,depth,occlusion;
mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
void main(){
 float id=float(gl_VertexID),seed=fract(sin(id*27.17)*1931.17);
 bool ambient=gl_VertexID%10==0;
 bool ribbon=gl_VertexID%10>=1&&gl_VertexID%10<=3;
 vec3 p=fieldPosition*weights[0]+spherePosition*weights[1]+polyPosition*weights[2]+boxPosition*weights[3]+wavePosition*weights[4];
 p.xz=turn(.42+orbit*.28)*p.xz;
 p.yz=turn(-.23+.16*sin(time*.09))*p.yz;
 p+=normalize(p+vec3(.001))*.012*sin(time*.65+id*.13);
 if(ambient){p=fieldPosition*vec3(2.5,1.8,1.2);p.xz=turn(time*.018)*p.xz;}
 p.xz=turn(pointer.x*.18)*p.xz;p.yz=turn(pointer.y*.14)*p.yz;
 // Suppress far-side ribbon segments inside the point-core silhouette, preserving transparency.
 occlusion=1.;
 if(ribbon&&p.z<0.)occlusion=1.-weights[1]*.92*(1.-smoothstep(.68,.92,length(p.xy)));
 float side=cos(composition*3.14159265*4.)*1.0;
 if(!ambient){p.x+=side;if(aspect<.85){p-=vec3(side,0.,0.);p*=.46;p.y+=.88;}}
 float z=p.z-4.8;
 gl_Position=vec4(p.x*2.5/aspect,p.y*2.5,-1.002*z-.2002,-z);
 energy=(ambient?.32+seed*.20:.55+seed*.45)*(ribbon?1.+weights[1]*.7:1.);
 if(gl_VertexID%10==4)energy*=1.+weights[1]*1.5;
 depth=clamp((p.z+3.5)/5.5,.12,1.);
 gl_PointSize=clamp((ambient?2.+seed*2.:ribbon?3.8:3.2+seed*1.6)*pixelRatio*3.4/(-z),1.,8.);
}`;
export const fragment=`#version 300 es
precision highp float;
in float energy,depth,occlusion;
out vec4 color;
void main(){
 float r=length(gl_PointCoord-.5);if(r>.5)discard;
 float glow=exp(-r*r*19.);
 vec3 green=mix(vec3(.16,.5,.3),vec3(.7,1.,.78),min(energy,1.));
 color=vec4(green*energy,glow*depth*.70*occlusion);
}`;
