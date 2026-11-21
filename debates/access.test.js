import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./access.js', import.meta.url), 'utf8').replace("import('./app.js')", 'loadActivity()');
const waitForCheck = () => new Promise(resolve => setTimeout(resolve, 0));
const session = (id, token = id) => ({ access_token: token, user: { id } });
const valid = id => ({ data: { user: { id } } });

async function access(getUser, initialSession) {
  const ids = ['practice-content', 'member-lock', 'dashboard-link', 'auth-loading', 'access-error', 'access-retry'];
  const elements = Object.fromEntries(ids.map(id => [id, { hidden: id !== 'auth-loading', addEventListener() {} }]));
  const calls = [];
  let listener, resets = 0;
  const client = { auth: {
    getUser(token) { calls.push(token); return getUser(token); },
    onAuthStateChange(fn) {
      listener = fn;
      fn('INITIAL_SESSION', initialSession);
      return { data: { subscription: { unsubscribe() {} } } };
    }
  } };
  const window = { supabase: { createClient: () => client } };
  vm.runInNewContext(source, {
    window, document: { getElementById: id => elements[id] }, setTimeout,
    loadActivity: async () => ({ resetActivity() { resets++; } })
  });
  await Promise.resolve();
  await waitForCheck();
  return { elements, calls, get resets() { return resets; }, emit: listener };
}

test('visitors and invalid sessions cannot initialize the slideshow', async () => {
  const visitor = await access(() => assert.fail('a visitor has no token to verify'), null);
  assert.deepEqual(visitor.calls, []);
  assert.equal(visitor.elements['member-lock'].hidden, false);
  for (const result of [{ data: { user: null } }, { ...valid('expired'), error: new Error('expired') }, valid('other')]) {
    const state = await access(() => result, session('expired'));
    assert.equal(state.resets, 0);
    assert.equal(state.elements['practice-content'].hidden, true);
    assert.equal(state.elements['member-lock'].hidden, false);
  }
});

test('all verified accounts qualify and signing out hides the slides immediately', async () => {
  for (const tier of ['free', 'premium', 'teacher', 'student']) {
    const state = await access(() => valid(tier), session(tier));
    assert.equal(state.resets, 1);
    assert.equal(state.elements['practice-content'].hidden, false);
    state.emit('SIGNED_OUT');
    assert.equal(state.elements['practice-content'].hidden, true);
    assert.equal(state.elements['member-lock'].hidden, false);
  }
});

test('repeated auth events share the check and preserve the visible slides', async () => {
  let finish;
  const response = new Promise(resolve => { finish = resolve; });
  const state = await access(() => response, session('member'));
  state.emit('SIGNED_IN', session('member'));
  await waitForCheck();
  assert.deepEqual(state.calls, ['member']);
  finish(valid('member'));
  await waitForCheck();
  state.emit('SIGNED_IN', session('member'));
  await waitForCheck();
  assert.deepEqual(state.calls, ['member']);
  assert.equal(state.resets, 1);
  assert.equal(state.elements['practice-content'].hidden, false);
});

test('token renewal keeps the slide visible and sign-out invalidates pending checks', async () => {
  let finish;
  const renewed = new Promise(resolve => { finish = resolve; });
  const state = await access(token => token === 'renewed' ? renewed : valid(token), session('member'));
  state.emit('TOKEN_REFRESHED', session('member', 'renewed'));
  await waitForCheck();
  assert.deepEqual(state.calls, ['member', 'renewed']);
  assert.equal(state.elements['practice-content'].hidden, false);
  assert.equal(state.elements['auth-loading'].hidden, true);
  state.emit('SIGNED_OUT');
  finish(valid('member'));
  await waitForCheck();
  assert.equal(state.resets, 1);
  assert.equal(state.elements['practice-content'].hidden, true);
  assert.equal(state.elements['member-lock'].hidden, false);
});

test('a different account gets a fresh slideshow after verification', async () => {
  const state = await access(valid, session('member'));
  state.emit('SIGNED_IN', session('other'));
  assert.equal(state.elements['practice-content'].hidden, true);
  await waitForCheck();
  assert.equal(state.resets, 2);
  assert.equal(state.elements['practice-content'].hidden, false);
});

test('temporary verification failures offer a retry', async () => {
  const state = await access(() => ({ error: { status: 503 } }), session('member'));
  assert.equal(state.elements['access-error'].hidden, false);
  assert.equal(state.elements['member-lock'].hidden, true);
  assert.equal(state.resets, 0);
});

test('dashboard loads Debates once per account and clears it at sign-out', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const fn = html.slice(html.indexOf('function updateDebatesAccess()'), html.indexOf('function hideLock('));
  const navigations = [];
  const frame = { dataset: {}, set src(value) { navigations.push(value); } };
  const screen = { classList: { add() {}, contains: () => false } };
  const elements = new Map([['frame-debates', frame], ['exercise-debates', screen]]);
  let prompt;
  const context = vm.createContext({
    _currentUser: null, showAuthModal: value => { prompt = value; }, closeMobileSidebar() {},
    document: {
      querySelectorAll() { return []; },
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, {});
        return elements.get(id);
      }
    }
  });
  vm.runInContext(`${fn}\nopenDebates();`, context);
  assert.equal(prompt, 'login');
  assert.deepEqual(navigations, []);
  vm.runInContext("_currentUser = { id: 'member' }; openDebates(); openDebates();", context);
  assert.deepEqual(navigations, ['/debates']);
  assert.match(elements.get('btn-debates').textContent, /Resume Practice/);
  vm.runInContext('_currentUser = null; updateDebatesAccess(); updateDebatesAccess();', context);
  assert.equal(frame.dataset.userId, undefined);
  assert.deepEqual(navigations, ['/debates', 'about:blank']);
  vm.runInContext("_currentUser = { id: 'other' }; openDebates();", context);
  assert.deepEqual(navigations, ['/debates', 'about:blank', '/debates']);
});
