// One stable ID maps to five positions. Prefixes remain identical across quality tiers.
export function particleTargets(count){
 const targets=Array.from({length:5},()=>new Float32Array(count*3));
 const phi=(1+Math.sqrt(5))/2;
 const verts=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]].map(v=>v.map(x=>x/Math.hypot(...v)));
 const faces=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 let seed=6417;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let id=0;id<count;id++){
  const u=random(),v=random(),w=random(),j=random();
  const a=u*Math.PI*2,z=v*2-1,r=Math.sqrt(1-z*z),rad=id%10===4?.10+.19*Math.cbrt(w):.48+.16*Math.cbrt(w);
  const sphere=[Math.cos(a)*r*rad,z*rad,Math.sin(a)*r*rad];
  if(id%10>=1&&id%10<=3){
   const t=(Math.floor(id/10)*.61803398875)%1,band=id%10-1,angle=t*Math.PI*3.7+band*Math.PI*2/3;
   const y=(t*2-1)*1.3,radius=.43+.35*Math.cos(y*1.12),width=(v-.5)*.016;
   sphere[0]=Math.cos(angle)*(radius+width);sphere[1]=y+width;sphere[2]=Math.sin(angle)*(radius+width);
  }
  const face=faces[id%20],s=Math.sqrt(u),bary=[1-s,s*(1-v),s*v];
  const poly=[0,1,2].map(axis=>face.reduce((n,index,k)=>n+verts[index][axis]*bary[k],0)*1.35);
  const box=[u*2-1,v*2-1,w*2-1];box[id%3]=id%2?1:-1;
  // A small rounded inset and perspective orientation keep the boundary spatial.
  const norm=Math.hypot(...box);for(let k=0;k<3;k++)box[k]=box[k]*.87+box[k]/norm*.13;
  const tube=v*Math.PI*2,ring=u*Math.PI*2,torus=[(1+.27*Math.cos(tube))*Math.cos(ring),.35*Math.sin(tube)+.24*Math.sin(ring*2),(.95+.27*Math.cos(tube))*Math.sin(ring)];
  const field=[(u*2-1)*2.2,(v*2-1)*1.65,(w*2-1)*2.5];
  const all=[field,sphere,poly,box,torus];
  for(let shape=0;shape<5;shape++)targets[shape].set(all[shape],id*3);
 }
 return {targets,count};
}

// Ordered triangles, not random point adjacency. Same curve is sampled by the shader.
export function ribbonStrip(segments){
 const vertices=[],indices=[];
 for(let band=0;band<3;band++){
  const base=vertices.length/3;
  for(let i=0;i<=segments;i++)for(const side of [-1,1])vertices.push(i/segments,side,band);
  for(let i=0;i<segments;i++){const j=base+i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
 }
 return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
}
