export const clamp=value=>Math.max(0,Math.min(1,value));
export function storyProgress(scroll,first,last){return last>first?clamp((scroll-first)/(last-first)):0;}
export function chapterIndex(progress){return Math.min(3,Math.floor(clamp(progress)*3+.5));}
export function revealAmount(top,height,viewport){return clamp((viewport*.88-top)/Math.max(height*.65,1));}
