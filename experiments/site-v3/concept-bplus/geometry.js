export function sphere(longitudes,latitudes){
 const vertices=[],indices=[];
 for(let y=0;y<=latitudes;y++)for(let x=0;x<=longitudes;x++){
  const a=x/longitudes*Math.PI*2,b=y/latitudes*Math.PI;
  vertices.push(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));
 }
 for(let y=0;y<latitudes;y++)for(let x=0;x<longitudes;x++){
  const i=y*(longitudes+1)+x;indices.push(i,i+1,i+longitudes+1,i+1,i+longitudes+2,i+longitudes+1);
 }
 return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
}
// Parameter-space ribbons. The shader wraps their shared topology into a vertical helix.
export function ribbons(segments,count){
 const vertices=[],indices=[];
 for(let band=0;band<count;band++){
  const base=vertices.length/3;
  for(let i=0;i<=segments;i++)for(const side of [-1,1])vertices.push(i/segments,side,band);
  for(let i=0;i<segments;i++){const j=base+i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
 }
 return {vertices:new Float32Array(vertices),indices:new Uint16Array(indices)};
}
export function bufferSize(width,height,dpr,quality){
 if(width<=0||height<=0)return [1,1];
 const scale=Math.min(dpr,quality==='high'?2:1.25,Math.sqrt((quality==='high'?2150000:950000)/(width*height)));
 return [Math.max(1,Math.floor(width*scale)),Math.max(1,Math.floor(height*scale))];
}
