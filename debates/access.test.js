import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./access.js', import.meta.url), 'utf8').replace("import('./app.js')", 'loadActivity()');
async function access(result) {
  const elements = Object.fromEntries(['practice-content', 'member-lock', 'dashboard-link'].map(id => [id, { hidden: true }]));
  let listener, loads = 0;
  const client = { auth: { getUser: async () => result, onAuthStateChange: fn => { listener = fn; } } };
  const window = { supabase: { createClient: () => client } };
  window.self = window.top = window;
  vm.runInNewContext(source, { window, document: { getElementById: id => elements[id] }, loadActivity: async () => { loads++; }, setTimeout });
  await new Promise(resolve => setImmediate(resolve));
  return { elements, loads, listener };
}
test('visitors and invalid sessions cannot initialize the slideshow', async () => {
  for (const result of [{ data: { user: null } }, { data: { user: { id: 'expired' } }, error: new Error('expired') }]) {
    const state = await access(result);
    assert.equal(state.loads, 0);
    assert.equal(state.elements['practice-content'].hidden, true);
    assert.equal(state.elements['member-lock'].hidden, false);
  }
});
test('all verified accounts qualify and signing out hides slides', async () => {
  for (const tier of ['free', 'premium', 'teacher', 'student']) {
    const state = await access({ data: { user: { id: tier } } });
    assert.equal(state.loads, 1);
    assert.equal(state.elements['practice-content'].hidden, false);
    state.listener('SIGNED_OUT');
    assert.equal(state.elements['practice-content'].hidden, true);
    assert.equal(state.elements['member-lock'].hidden, false);
  }
});
test('dashboard visitors get the existing login prompt without loading the iframe', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const fn = html.match(/function openDebates\(\) \{[\s\S]*?\n\}/)[0];
  let prompt;
  vm.runInNewContext(fn + '\nopenDebates();', { _currentUser: null, showAuthModal: value => { prompt = value; } });
  assert.equal(prompt, 'login');
});
