// Local #15 proof: native position -> paced geometry. No clock, scroll locks or history mutation.
export function narrativeProgress(y,anchors){
 if(anchors.length<2)return 0;
 if(y<=anchors[0])return 0;
 if(y>=anchors.at(-1))return 1;
 let i=0;while(i<anchors.length-2&&y>=anchors[i+1])i++;
 const t=(y-anchors[i])/Math.max(1,anchors[i+1]-anchors[i]);
 const phase=Math.max(0,Math.min(1,(t-.22)/.64));
 return (i+phase*phase*(3-2*phase))/(anchors.length-1);
}
