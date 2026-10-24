import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets/main.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/styles.css'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((item, i) => ids.indexOf(item) !== i);
if (duplicates.length) throw new Error(`Duplicate HTML ids: ${duplicates.join(', ')}`);
for (const match of html.matchAll(/\b(?:src|href)="(\.[^"#?]+)"/g)) {
  const candidate = path.resolve(root, match[1]);
  if (!candidate.startsWith(`${root}${path.sep}`) || !fs.existsSync(candidate)) throw new Error(`Invalid local asset: ${match[1]}`);
}
for (const match of html.matchAll(/href="#([a-zA-Z][\w-]*)"/g)) {
  if (!ids.includes(match[1])) throw new Error(`Broken section link: ${match[1]}`);
}
for (const match of html.matchAll(/data-i18n="([a-zA-Z][\w]*)"/g)) {
  const key = match[1];
  if (!js.includes(`${key}:`)) throw new Error(`Missing locale key: ${key}`);
}
if (!css.includes('prefers-reduced-motion')) throw new Error('Motion accessibility settings missing');
if (!html.includes('NO REAL TASK IS EXECUTED')) throw new Error('Simulation disclaimer missing');
if (!html.includes("NOT RELEASED")) throw new Error('Release availability label missing');
if (/https?:\/\//.test(html) || /https?:\/\//.test(js)) throw new Error('Unexpected remote resource or API reference');
console.log(`Static checks passed: ${ids.length} unique ids, local references, localized copy, disclaimers, offline assets.`);