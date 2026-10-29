import test from 'node:test';
import assert from 'node:assert/strict';
import {sphere,ribbons,bufferSize} from './geometry.js';
test('sphere indexed triangles stay in bounds and on the unit surface',()=>{
 const mesh=sphere(32,20);
 assert.ok(mesh.indices.every(i=>i<mesh.vertices.length/3));
 for(let i=0;i<mesh.vertices.length;i+=3)assert.ok(Math.abs(Math.hypot(...mesh.vertices.slice(i,i+3))-1)<1e-5);
});
test('helix strips have continuous parameter endpoints and bounded triangles',()=>{
 const m=ribbons(128,4);
 assert.equal(m.vertices.length,129*2*4*3);
 assert.equal(m.indices.length,128*6*4);
 assert.ok(m.indices.every(i=>i<m.vertices.length/3));
 for(let orbit=0;orbit<4;orbit++){
  const start=orbit*129*6,end=start+128*6;
  assert.equal(m.vertices[end],1);
  assert.equal(m.vertices[start+1],m.vertices[end+1]);
 }
});
test('quality limits backing pixels and DPR',()=>{
 const [w,h]=bufferSize(3840,2160,3,'high');assert.ok(w*h<=2200000);
 const [bw,bh]=bufferSize(3840,2160,3,'balanced');assert.ok(bw*bh<=1000000);
 assert.deepEqual(bufferSize(0,0,2,'high'),[1,1]);
});
