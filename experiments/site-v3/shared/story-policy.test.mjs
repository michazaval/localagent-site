import test from 'node:test';
import assert from 'node:assert/strict';
import {storyProgress,chapterIndex,revealAmount} from './story-policy.js';
test('story progress is bounded for negative scroll, short documents and overscroll',()=>{
 assert.equal(storyProgress(-20,0,100),0);assert.equal(storyProgress(50,0,100),.5);assert.equal(storyProgress(200,0,100),1);assert.equal(storyProgress(2,5,5),0);
});
test('chapter identity does not step outside available anchors',()=>{
 assert.equal(chapterIndex(-2),0);assert.equal(chapterIndex(.4),1);assert.equal(chapterIndex(1),3);assert.equal(chapterIndex(4),3);
});
test('content reaches a fully legible state before leaving the viewport',()=>{
 assert.equal(revealAmount(1000,200,800),0);assert.equal(revealAmount(300,200,800),1);assert.equal(revealAmount(-400,200,800),1);
});
