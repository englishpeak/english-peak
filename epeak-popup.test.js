import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} should exist`);
  const bodyStart = html.indexOf('{', start);
  let depth = 0;
  for (let index = bodyStart; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') depth -= 1;
    if (depth === 0) return html.slice(start, index + 1);
  }
  throw new Error(`Could not extract ${name}`);
}

const context = {};
vm.runInNewContext([
  extractFunction('getEffectiveTier'),
  extractFunction('hasFullAccessTier'),
  extractFunction('getEpeakPlusPopupContent')
].join('\n'), context);

test('visitors and free accounts retain the promotional popup', () => {
  assert.equal(context.getEpeakPlusPopupContent(null), null);
  assert.equal(context.getEpeakPlusPopupContent({ tier: 'free' }), null);
});

test('active ePeak+ members receive membership copy', () => {
  assert.deepEqual(
    { ...context.getEpeakPlusPopupContent({ tier: 'premium' }) },
    {
      title: 'You’re already on ePeak+',
      message: 'Enjoy unlimited access to everything included with your ePeak+ membership.'
    }
  );
});

test('students receive enrollment-specific copy', () => {
  assert.equal(
    context.getEpeakPlusPopupContent({ tier: 'student' }).title,
    'ePeak+ is included with your classes'
  );
});

test('teachers take display priority over the admin access override', () => {
  assert.equal(
    context.getEpeakPlusPopupContent({ tier: 'teacher', is_admin: true }).title,
    'ePeak+ is included with your teacher account'
  );
});

test('other full-access accounts never receive upgrade messaging', () => {
  assert.ok(context.getEpeakPlusPopupContent({ tier: 'courtesy' }));
  assert.ok(context.getEpeakPlusPopupContent({ tier: 'free', is_admin: true }));
});
