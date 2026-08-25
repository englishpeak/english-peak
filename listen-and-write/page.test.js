import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the app entry point works from the extensionless route', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.match(html, /<script type="module" src="\/listen-and-write\/app\.js"><\/script>/);
  assert.doesNotMatch(html, /<script type="module" src="\.\/app\.js"><\/script>/);
});

test('the play label resets for each sentence', async () => {
  const [html, app] = await Promise.all([
    readFile(new URL('./index.html', import.meta.url), 'utf8'),
    readFile(new URL('./app.js', import.meta.url), 'utf8'),
  ]);

  assert.match(html, /id="play"[^>]*>▶ Play<\/button>/);
  assert.match(app, /function renderItem\(\).*\$\('play'\)\.textContent='▶ Play'/);
});
