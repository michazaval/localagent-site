import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const directory = new URL('../.github/workflows/', import.meta.url);
const files = fs.readdirSync(directory).filter(file => /\.ya?ml$/.test(file)).sort();
const read = file => fs.readFileSync(new URL(file, directory), 'utf8').replaceAll('\r\n', '\n');

test('every workflow subscribes only to manual dispatch, including V3', () => {
  assert.deepEqual(files, ['pages.yml', 'publish-pages.yml', 'site-v3-experiments.yml']);
  for (const file of files) {
    const events = read(file).match(/^on:\n((?:[ \t].*\n|\n)*)/m)?.[1];
    assert.ok(events, file);
    assert.deepEqual([...events.matchAll(/^  ([a-z_]+):/gm)].map(match => match[1]), ['workflow_dispatch'], file);
  }
});

test('manual jobs use the main control workflow and preserve bounded read-only checks', () => {
  for (const file of files) {
    const text = read(file);
    assert.match(text, /github\.event_name == 'workflow_dispatch'/);
    assert.match(text, /github\.ref == 'refs\/heads\/main'/);
    assert.match(text, /github\.repository == 'michazaval\/localagent-site'/);
    assert.match(text, /checkpoint:\n\s+description: .+\n\s+required: true\n\s+type: string/);
    assert.match(text, /timeout-minutes: \d+/);
    assert.match(text, /persist-credentials: false/);
    assert.match(text, /npm run build/);
    assert.doesNotMatch(text, /continue-on-error:|secrets:|repository_dispatch|workflow_call/);
    const runs = [...text.matchAll(/run: \|\n((?: {10}.*\n|\n)*)/g)].map(match => match[1]);
    for (const run of runs) assert.doesNotMatch(run, /\$\{\{\s*(?:github\.event\.inputs|inputs)\./);
  }
});

test('source checkpoints are exact commits and do not upload or deploy', () => {
  for (const file of ['pages.yml', 'site-v3-experiments.yml']) {
    const text = read(file);
    assert.match(text, /ref: \$\{\{ inputs\.source_sha \}\}/);
    assert.match(text, /SOURCE_SHA: \$\{\{ inputs\.source_sha \}\}/);
    assert.match(text, /\[\[ "\$SOURCE_SHA" =~ \^\[0-9a-f\]\{40\}\$ \]\]/);
    assert.match(text, /git rev-parse HEAD/);
    assert.doesNotMatch(text, /upload-.*artifact|deploy-pages|pages: write|id-token: write/);
  }
});

test('Pages keeps fixed main/develop sources, exact approvals and deployment-only write permissions', () => {
  const text = read('publish-pages.yml');
  const [build, deploy] = text.split(/^  deploy:\n/m);
  assert.ok(deploy);
  assert.doesNotMatch(build, /pages: write|id-token: write/);
  assert.match(deploy, /pages: write/);
  assert.match(deploy, /id-token: write/);
  assert.match(deploy, /needs: build/);
  assert.match(deploy, /name: github-pages/);
  assert.match(build, /ref: main\n\s+path: stable/);
  assert.match(build, /ref: develop\n\s+path: preview-source/);
  assert.match(build, /MAIN_SHA: \$\{\{ inputs\.main_sha \}\}/);
  assert.match(build, /PREVIEW_SHA: \$\{\{ inputs\.preview_sha \}\}/);
  assert.match(build, /git -C stable rev-parse HEAD/);
  assert.match(build, /git -C preview-source rev-parse HEAD/);
  assert.match(build, /cp -a stable\/dist\/\. publish\//);
  assert.match(build, /cp -a preview-source\/dist\/\. publish\/preview\//);
  assert.match(build, /test -f publish\/preview\/assets\/polish\.js/);
  assert.match(build, /path: publish\n\s+retention-days: 1/);
  assert.equal((build.match(/run: npm run build/g) ?? []).length, 2);
});

test('V3 retains production isolation, syntax, unit and bounded browser smoke checks', () => {
  const text = read('site-v3-experiments.yml');
  assert.match(text, /npm run build/);
  assert.match(text, /node --check "\$file" \|\| exit 1/);
  assert.match(text, /test ! -e dist\/experiments/);
  assert.match(text, /--no-save --ignore-scripts playwright@1\.64\.1/);
  assert.match(text, /install --with-deps chromium/);
  assert.match(text, /timeout-minutes: 3/);
  assert.match(text, /run: node experiments\/site-v3\/concept-bplus\/smoke\.mjs/);
});
