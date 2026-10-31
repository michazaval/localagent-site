import test from 'node:test';
import assert from 'node:assert/strict';
import { resolution, chapterProgress, shouldAnimate } from './policy.js';

test('render size caps pixels on large displays and keeps a nonzero buffer', () => {
  const [w,h] = resolution(3840,2160,3);
  assert.ok(w*h <= 1100000);
  assert.ok(w/h > 1.7 && w/h < 1.8);
  assert.deepEqual(resolution(0,0,2),[1,1]);
});
test('chapter progress clamps overscroll and handles a short document', () => {
  assert.equal(chapterProgress(-100,1000),0);
  assert.equal(chapterProgress(500,1000),.5);
  assert.equal(chapterProgress(1100,1000),1);
  assert.equal(chapterProgress(10,0),0);
});
test('animation requires visibility, consent to motion and full rendering', () => {
  const active={visible:true,hidden:false,paused:false,reduced:false,lite:false};
  assert.equal(shouldAnimate(active),true);
  for(const key of ['hidden','paused','reduced','lite']) assert.equal(shouldAnimate({...active,[key]:true}),false);
  assert.equal(shouldAnimate({...active,visible:false}),false);
});
