export function resolution(width,height,dpr=1) {
  if(width<=0 || height<=0)return [1,1];
  const scale=Math.min(dpr,1.5,Math.sqrt(1050000/(width*height)));
  return [Math.max(1,Math.floor(width*scale)),Math.max(1,Math.floor(height*scale))];
}
export const chapterProgress=(offset,range)=>range>0?Math.max(0,Math.min(1,offset/range)):0;
export const shouldAnimate=({visible,hidden,paused,reduced,lite})=>visible&&!hidden&&!paused&&!reduced&&!lite;
