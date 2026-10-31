import test from 'node:test';
import assert from 'node:assert/strict';
import {particleTargets} from '../assets/v3/morph-geometry.js';
import {createMorphState} from '../assets/v3/morph-state.js';
test('persistent IDs produce deterministic bounded, distinct spatial targets',()=>{
 const a=particleTargets(1200),b=particleTargets(1800);
 for(let shape=0;shape<5;shape++){
  assert.deepEqual(a.targets[shape],b.targets[shape].slice(0,3600));
  assert(a.targets[shape].every(x=>Number.isFinite(x)&&Math.abs(x)<6));
 }
 assert.notDeepEqual(a.targets[1],a.targets[2]);assert.notDeepEqual(a.targets[2],a.targets[3]);
});
test('interrupted morph stays continuous, normalized and independent of frame rate',()=>{
 const a=createMorphState(),b=createMorphState();a.mode(1);b.mode(1);
 for(let i=0;i<60;i++)a.step(1/60);for(let i=0;i<30;i++)b.step(1/30);
 a.weights.forEach((v,i)=>assert(Math.abs(v-b.weights[i])<1e-5));
 const before=[...a.weights];a.mode(3);assert.deepEqual([...a.weights],before);a.step(.016);
 assert(Math.abs([...a.weights].reduce((x,y)=>x+y)-1)<1e-6);
});
test('pause discards queued scroll/modes and follow explicitly returns ownership',()=>{
 const s=createMorphState();s.mode(1);s.step(.4);s.pause(true);const frozen=[...s.weights];
 s.progress(.9);s.mode(3);s.step(2);s.pause(false);s.step(.5);assert.deepEqual([...s.weights],frozen);
 s.mode(2);s.progress(.1);assert.equal(s.source,'mode');s.follow();assert.equal(s.source,'scroll');
});
