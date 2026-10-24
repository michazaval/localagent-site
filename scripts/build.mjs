import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
// Explicit allow-list. No accidental publication of workspace files or secrets.
const files = ['index.html', 'robots.txt', '404.html', 'assets/styles.css', 'assets/cinematic.css', 'assets/main.js', 'assets/polish.js', 'assets/polish.css', 'assets/favicon.svg'];
fs.rmSync(dist, { recursive: true, force: true });
for (const file of files) {
  const source = path.join(root, file);
  if (fs.lstatSync(source).isSymbolicLink()) throw new Error(`Refusing symlink ${file}`);
  const output = path.join(dist, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(source, output);
}
console.log(`Static distribution ready: ${files.join(', ')}`);