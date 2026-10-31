import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root),'utf8');
test('V3 local entry has complete bilingual copy and valid local navigation/assets',()=>{
 const html=read('v3/index.html');const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),m[1]);
 for(const m of html.matchAll(/(?:href|src)="(\.\.[^"]+)"/g))assert(fs.existsSync(new URL(m[1],new URL('v3/',root))),m[1]);
 assert.equal([...html.matchAll(/data-en=/g)].length,[...html.matchAll(/data-ru=/g)].length);
 assert.doesNotMatch(html, /https?:|\.exe|<script[^>]*src="\/\//);
 assert.match(html,/No microphone, files or Windows tools are connected/);
});
test('V3 solid text surfaces have AA contrast',()=>{
 const lum=hex=>{const c=hex.match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
 for(const [a,b] of [['edf7ef','03120b'],['b8cabb','071b10'],['b0f2b8','071b10'],['092213','b0f2b8']]){const x=lum(a),y=lum(b);assert((Math.max(x,y)+.05)/(Math.min(x,y)+.05)>=4.5);}
});
