import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('website has accessible interactive controls and relevant sections', () => {
  const html = read('index.html');
  for (const section of ['approach','experience','roadmap','availability']) assert.match(html, new RegExp(`id="${section}"`));
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /meta name="viewport"/);
});

test('demo does not make claims of real execution or released builds', () => {
  const html = read('index.html');
  assert.match(html, /SIMULATION/);
  assert.match(html, /NOT A LIVE AGENT SESSION/);
  assert.match(html, /NO REAL TASK IS EXECUTED/);
  assert.match(html, /NOT READY/);
  assert.doesNotMatch(html, /href="[^"]*\.exe"/);
});

test('no cloud backend, tracking scripts or remote visual assets required', () => {
  const html = read('index.html');
  const js = read('assets/main.js');
  assert.doesNotMatch(html, /<script[^>]+(?:http|\/\/)/i);
  assert.doesNotMatch(html, /<link[^>]+(?:https?:)/i);
  assert.doesNotMatch(js, /\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/);
  assert.doesNotMatch(html, /https?:\/\//);
});

test('reduced-motion, responsive styles and paused animation are supported', () => {
  const css = read('assets/styles.css');
  const js = read('assets/main.js');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:580px/);
  assert.match(js, /document\.hidden/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /cancelAnimationFrame/);
});

test('actions are represented as simulations only', () => {
  const js = read('assets/main.js');
  assert.match(js, /scenarioData/);
  assert.match(js, /replaceChildren/);
  assert.match(js, /setAttribute\('aria-pressed'/);
  assert.match(js, /language === 'en' \? 'ru' : 'en'/);
});

test('cinematic assets are explicitly built and do not depend on remote media', () => {
  const html=read('index.html');
  const css=read('assets/cinematic.css');
  const build=read('scripts/build.mjs');
  assert.match(html, /assets\/cinematic\.css/);
  assert.match(html, /scene-fallback/);
  assert.match(html, /VISUAL SIMULATION \/ NO LIVE SESSION/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /max-width:580px/);
  assert.match(build, /assets\/cinematic\.css/);
  assert.doesNotMatch(css, /https?:\/\//);
});