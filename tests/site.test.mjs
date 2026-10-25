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
  const js = read('assets/atelier.js');
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

test('manual motion control and live concept-state explanations are accessible and offline', () => {
  const html=read('index.html');
  const js=read('assets/polish.js');
  const css=read('assets/polish.css');
  const app=read('assets/atelier.js');
  assert.match(html, /id="motionToggle"[^>]+aria-pressed/);
  assert.match(html, /id="signalInsight"[^>]+aria-live="polite"/);
  assert.match(js, /localagent:motion-change/);
  assert.match(js, /No model is running/);
  assert.match(js, /Микрофон выключен/);
  assert.match(css, /motion-paused/);
  assert.match(app, /document\.documentElement\.classList\.contains\('motion-paused'\)/);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage/);
});

test('GitHub Pages 404 returns visitors to project root from nested routes', () => {
  const html=read('404.html');
  assert.match(html, /href="\/localagent-site\/"/);
  assert.doesNotMatch(html, /href="\.\/"/);
});


test('distinctive but readable typography replaces harsh Impact display font', () => {
  const css=read('assets/atelier.css');
  const html=read('index.html');
  assert.match(css, /"Segoe UI"/);
  assert.match(css, /\.hero-title\s*\{/);
  assert.match(css, /\.capabilities-head h2/);
  assert.doesNotMatch(css, /font-family\s*:\s*Impact/i);
  assert.match(html, /assets\/atelier\.css/);
});

test('concept architecture is connected with one coherent bus', () => {
  const html=read('index.html');
  const css=read('assets/atelier.css');
  assert.match(html, /class="architecture-bus"/);
  assert.doesNotMatch(html, /class="architecture-lines"/);
  assert.match(css, /\.architecture-bus::before/);
  assert.match(css, /\.architecture-bus::after/);
  assert.match(html, /data-i18n="archNode1"/);
  assert.match(html, /data-i18n="archNode2"/);
  assert.match(html, /data-i18n="archNode3"/);
});

test('new sculptural scene uses local Canvas 2D, respects performance and pause', () => {
  const html=read('index.html');
  const script=read('assets/atelier.js');
  const app=read('assets/main.js');
  const build=read('scripts/build.mjs');
  assert.match(html, /assets\/atelier\.js/);
  assert.match(script, /getContext\('2d'/);
  assert.match(script, /cancelAnimationFrame/);
  assert.match(script, /document\.hidden/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /Math\.min\(devicePixelRatio/);
  assert.match(script, /localagent:motion-change/);
  assert.match(script, /prefers-reduced-motion/);
  assert.match(script, /for\(let band=0;band<6;band\+\+\)/);
  assert.doesNotMatch(script, /\bfetch\s*\(|\bWebSocket\b|XMLHttpRequest/);
  assert.doesNotMatch(app, /const context = canvas\.getContext/);
  assert.match(build, /assets\/atelier\.js/);
  assert.match(build, /assets\/atelier\.css/);
});


test('cinematic refinement is shipped locally with explicit build inclusion', () => {
  const html=read('index.html');
  const css=read('assets/finish.css');
  const build=read('scripts/build.mjs');
  assert.match(html, /assets\/finish\.css/);
  assert.match(css, /\.architecture-nodes>div:hover/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(build, /assets\/finish\.css/);
  assert.doesNotMatch(css, /@import|https?:\/\//i);
});

test('sculpture updates smoothly on frame-clock, not a hard 30fps snap', () => {
  const js=read('assets/atelier.js');
  assert.match(js, /new Path2D\(\)/);
  assert.match(js, /const frameInterval =/);
  assert.match(js, /1000 \/ 60/);
  assert.match(js, /const smooth=1-Math\.exp\(-delta\/240\)/);
  assert.match(js, /stateMix\[name\]\+=/);
  assert.match(js, /renderColor\[i\]\+=/);
  assert.match(js, /ctx\.globalAlpha=stateMix\.listen/);
  assert.match(js, /ctx\.globalAlpha=stateMix\.think/);
  assert.match(js, /ctx\.globalAlpha=stateMix\.act/);
  assert.match(js, /document\.hidden/);
  assert.match(js, /cancelAnimationFrame/);
});

test('performance keeps bounded canvas dimensions and reduced mobile complexity', () => {
  const js=read('assets/atelier.js');
  assert.match(js, /1600\/Math\.max\(width,height\)/);
  assert.match(js, /width < 650 \|\| lowPower/);
  assert.match(js, /const segments =/);
  assert.match(js, /const max=onPhone\?46:dust\.length/);
  assert.match(js, /ResizeObserver/);
  assert.doesNotMatch(js, /\bfetch\s*\(|\bWebSocket\b|XMLHttpRequest|localStorage/);
});


test('active Canvas suppresses duplicate straight fallback stripes', () => {
  const scene=read('assets/atelier.js');
  const css=read('assets/finish.css');
  const fallback=read('assets/cinematic.css');
  assert.match(fallback, /\.scene-fallback::before/);
  assert.match(css, /html\.has-energy-scene \.field-frame \.scene-fallback::before/);
  assert.match(css, /html\.has-energy-scene \.field-frame \.scene-fallback::after/);
  assert.match(css, /content:none!important/);
  assert.match(css, /display:none!important/);
  assert.match(scene, /Diffus(e|ed) atmospheric light/);
  assert.match(scene, /ctx\.createRadialGradient\(0,0,size\*\.04,0,0,size\*\.70\)/);
  assert.doesNotMatch(scene, /const shaft=ctx\.createLinearGradient/);
  const painted = scene.indexOf('  resize();');
  const activated = scene.lastIndexOf("document.documentElement.classList.add('has-energy-scene')");
  assert.ok(painted >= 0 && activated > painted, 'fallback hides only after first Canvas paint');
});
