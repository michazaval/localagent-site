import test from 'node:test';import assert from 'node:assert/strict';
import {narrativeProgress} from './policy.js';
test('chapter pacing holds its pose for reading, then arrives at each actual chapter anchor',()=>{
 const anchors=[0,1300,2900,5100,6800];
 anchors.forEach((a,i)=>assert.equal(narrativeProgress(a,anchors),i/4));
 assert.equal(narrativeProgress(200,anchors),0);
 assert(narrativeProgress(900,anchors)>0&&narrativeProgress(900,anchors)<.25);
 assert.equal(narrativeProgress(-100,anchors),0);assert.equal(narrativeProgress(9000,anchors),1);
});
test('reverse scroll is reversible without accumulated timeline state',()=>{
 const a=[0,1000,2400,3400,5000],points=[0,600,1800,3000,5000];
 const forward=points.map(y=>narrativeProgress(y,a));const backward=points.toReversed().map(y=>narrativeProgress(y,a)).reverse();
 assert.deepEqual(forward,backward);assert.equal(narrativeProgress(10,[0]),0);
});
