import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Vercel routes the Conditionals Review exercise and nested paths', () => {
  const vercelConfig = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const rewrites = vercelConfig.rewrites.filter(({ source }) => source.startsWith('/aleconditionals'));

  assert.deepEqual(rewrites, [
    { source: '/aleconditionals', destination: '/aleconditionals/index.html' },
    { source: '/aleconditionals/:path*', destination: '/aleconditionals/index.html' }
  ]);
});
