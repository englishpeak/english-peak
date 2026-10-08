import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const access = readFileSync(new URL('./access.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the direct route and static files contain no production vocabulary bank', () => {
  const routing = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(routing.rewrites.some((route) => route.source === '/word-families' && route.destination === '/word-families/index.html'));
  assert.doesNotMatch(html, /id="family-data"|"forms"\s*:|"acceptance"/);
  assert.match(html, /id="practice-content" hidden/);
  assert.match(html, /<template id="practice-template">/);
  assert.doesNotMatch(readFileSync(new URL('./practice.js', import.meta.url), 'utf8'), /"forms"\s*:/);
  assert.match(readFileSync(new URL('../.vercelignore', import.meta.url), 'utf8'), /docs\/word-families\//);
  assert.doesNotMatch(html + access, /SUPABASE_SERVICE_ROLE_KEY/);
});

test('the dashboard adds Word Families under New Practice with the established shell', () => {
  const newPractice = app.slice(app.indexOf('id="new-practice-section"'), app.indexOf('<h2>Free Exercises</h2>'));
  assert.match(newPractice, /class="ex-card" onclick="openWordFamilies\(\)"/);
  assert.match(newPractice, /card-icon purple/);
  assert.match(newPractice, /id="access-word-families">🔒 ePeak\+/);
  assert.match(app, /id="exercise-word-families"/);
  assert.match(app, /id="frame-word-families"[^>]*title="Word Families"/);
});

test('dashboard entry uses existing login/upgrade dialogs and preserves full-access semantics', () => {
  const openSource = app.slice(app.indexOf('function prepareWordFamiliesFrame()'), app.indexOf('function openCollocations()'));
  const tierSource = app.slice(app.indexOf('function getEffectiveTier('), app.indexOf('// Popup presentation only'));
  for (const profile of [null, { tier: 'free' }, { tier: 'premium' }, { tier: 'teacher' }, { tier: 'student' }, { tier: 'courtesy' }, { tier: 'free', is_admin: true }]) {
    const events = [];
    const frame = { src: '', dataset: {} };
    const sandbox = { _currentUser: profile ? { id: 'member' } : null, _currentProfile: profile, document: { querySelectorAll: () => [], getElementById: (id) => id === 'frame-word-families' ? frame : { classList: { add() {} } } }, showAuthModal: (tab) => events.push(tab), showModal: () => events.push('upgrade'), closeMobileSidebar() {} };
    vm.runInNewContext(tierSource + openSource + '\nopenWordFamilies();', sandbox);
    if (!profile) assert.deepEqual(events, ['login']);
    else if (profile.tier === 'free' && !profile.is_admin) assert.deepEqual(events, ['upgrade']);
    else { assert.deepEqual(events, []); assert.equal(frame.src, '/word-families'); }
  }
});

function accessFixture({ session = { access_token: 'session-token', user: { id: 'untrusted-local-user', user_metadata: { tier: 'premium' } } }, status = 200, fail = false, deferred = false } = {}) {
  const elements = new Map();
  const get = (id) => {
    if (!elements.has(id)) elements.set(id, { hidden: true, textContent: '', dataset: {}, children: [], addEventListener() {}, replaceChildren(...children) { this.children = children; }, content: { cloneNode: () => ({ template: true }) } });
    return elements.get(id);
  };
  let authChanged;
  let requested;
  const requests = [];
  const windowEvents = new Map();
  const documentEvents = new Map();
  let now = 100_000;
  let initialized = 0;
  const client = { auth: { async getSession() { return { data: { session } }; }, onAuthStateChange(callback) { authChanged = callback; } } };
  const sandbox = {
    console, AbortController, Date: { now: () => now }, setTimeout: (fn) => fn(),
    document: { visibilityState: 'visible', getElementById: get, body: { classList: { add() {} } }, addEventListener(type, callback) { documentEvents.set(type, callback); } },
    window: { supabase: { createClient: () => client }, location: { origin: 'https://epeak.app' }, addEventListener(type, callback) { windowEvents.set(type, callback); } },
    initializeWordFamilies: () => { initialized++; },
    async fetch(url, options) {
      requested = { url, options };
      requests.push(requested);
      if (fail) throw new Error('network');
      const response = () => ({ status, ok: status === 200, async json() { return { userId: 'server-verified-user', families: [] }; } });
      if (deferred) return new Promise(resolve => { requested.resolve = () => resolve(response()); });
      return response();
    },
  };
  sandbox.window.parent = sandbox.window;
  vm.runInNewContext(access.replace(/^import .*?;\n/, ''), sandbox);
  return {
    sandbox, get, requests, session,
    authChanged: (...args) => authChanged(...args), initialized: () => initialized, requested: () => requested,
    windowEvent: (type, event = {}) => windowEvents.get(type)(event),
    documentEvent: (type) => documentEvents.get(type)(),
    advance: (milliseconds) => { now += milliseconds; },
    setStatus: (value) => { status = value; },
  };
}
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

test('direct navigation initializes only after the protected API returns authorized data', async () => {
  const fixture = accessFixture();
  await settle();
  assert.equal(fixture.initialized(), 1);
  assert.equal(fixture.get('practice-content').hidden, false);
  assert.equal(fixture.requested().url, '/api/word-families');
  assert.equal(fixture.requested().options.headers.Authorization, 'Bearer session-token');
  assert.equal(fixture.requested().options.cache, 'no-store');
});

test('visitor/free/error responses stay locked even when local session metadata claims premium', async () => {
  for (const options of [{ session: null }, { status: 401 }, { status: 403 }, { status: 503 }, { fail: true }]) {
    const fixture = accessFixture(options);
    await settle();
    assert.equal(fixture.initialized(), 0);
    assert.equal(fixture.get('practice-content').hidden, true);
    assert.equal(fixture.get('member-lock').hidden, false);
    assert.equal(fixture.get('practice-content').children.length, 0);
  }
});

test('signing out removes the rendered practice and stale authorized responses cannot reopen it', async () => {
  const fixture = accessFixture();
  await settle();
  fixture.authChanged('SIGNED_OUT', null);
  await settle();
  assert.equal(fixture.get('practice-content').hidden, true);
  assert.equal(fixture.get('practice-content').children.length, 0);
  // Start a pending authorized check, then sign out before its promise settles.
  fixture.authChanged('SIGNED_IN', { access_token: 'session-token' });
  fixture.authChanged('SIGNED_OUT', null);
  await settle();
  assert.equal(fixture.get('practice-content').hidden, true);
});

test('dashboard preloads once, preserves the round on return, and unloads on account or access changes', () => {
  const source = app.slice(app.indexOf('function prepareWordFamiliesFrame()'), app.indexOf('function openCollocations()'));
  const tiers = app.slice(app.indexOf('function getEffectiveTier('), app.indexOf('// Popup presentation only'));
  const navigations = [];
  const frame = { dataset: {}, set src(value) { navigations.push(value); } };
  const sandbox = {
    _currentUser: { id: 'member' }, _currentProfile: { tier: 'premium' },
    document: { querySelectorAll: () => [], getElementById: (id) => id === 'frame-word-families' ? frame : { classList: { add() {} } } },
    closeMobileSidebar() {}, showAuthModal() {}, showModal() {},
  };
  vm.runInNewContext(tiers + source, sandbox);
  sandbox.prepareWordFamiliesFrame();
  sandbox.openWordFamilies();
  sandbox.openWordFamilies();
  assert.deepEqual(navigations, ['/word-families']);
  sandbox._currentUser = { id: 'other-member' };
  sandbox.prepareWordFamiliesFrame();
  assert.deepEqual(navigations, ['/word-families', '/word-families']);
  sandbox._currentProfile = { tier: 'free' };
  sandbox.prepareWordFamiliesFrame();
  assert.equal(navigations.at(-1), 'about:blank');
  assert.equal(frame.dataset.userId, undefined);
  sandbox._currentProfile = { tier: 'premium' };
  sandbox.prepareWordFamiliesFrame();
  sandbox._currentUser = null;
  sandbox.prepareWordFamiliesFrame();
  assert.equal(navigations.at(-1), 'about:blank');
});

test('startup and repeated auth notifications share one protected request', async () => {
  const fixture = accessFixture({ deferred: true });
  await settle();
  const originalRequest = fixture.requested();
  fixture.authChanged('INITIAL_SESSION', fixture.session);
  fixture.authChanged('SIGNED_IN', fixture.session);
  await settle();
  assert.equal(fixture.requests.length, 1);
  assert.equal(originalRequest.options.signal.aborted, false);
  assert.equal(fixture.get('practice-content').hidden, true);
  assert.equal(fixture.get('auth-loading').hidden, false);
  originalRequest.resolve();
  await settle();
  fixture.authChanged('SIGNED_IN', fixture.session);
  await settle();
  assert.equal(fixture.requests.length, 1);
  assert.equal(fixture.initialized(), 1);
});

test('token refresh checks access quietly and preserves the current round', async () => {
  const fixture = accessFixture({ deferred: true });
  await settle();
  fixture.requested().resolve();
  await settle();
  const round = fixture.get('practice-content').children[0];
  fixture.authChanged('TOKEN_REFRESHED', { ...fixture.session, access_token: 'new-token' });
  await settle();
  assert.equal(fixture.requests.length, 2);
  assert.equal(fixture.requested().options.headers.Authorization, 'Bearer new-token');
  assert.equal(fixture.get('practice-content').hidden, false);
  assert.equal(fixture.get('auth-loading').hidden, true);
  fixture.requested().resolve();
  await settle();
  assert.equal(fixture.initialized(), 1);
  assert.equal(fixture.get('practice-content').children[0], round);
});

test('returning to the activity rechecks stale access quietly, with trusted messages only', async () => {
  const fixture = accessFixture({ deferred: true });
  await settle();
  fixture.requested().resolve();
  await settle();
  const message = { origin: 'https://epeak.app', source: fixture.sandbox.window.parent, data: { type: 'wordFamiliesResume' } };
  fixture.windowEvent('message', message);
  await settle();
  assert.equal(fixture.requests.length, 1);
  fixture.advance(60_000);
  fixture.windowEvent('message', { ...message, origin: 'https://other.example' });
  fixture.windowEvent('message', { ...message, source: {} });
  await settle();
  assert.equal(fixture.requests.length, 1);
  fixture.windowEvent('message', message);
  await settle();
  assert.equal(fixture.requests.length, 2);
  assert.equal(fixture.get('practice-content').hidden, false);
  assert.equal(fixture.get('auth-loading').hidden, true);
  fixture.setStatus(403);
  fixture.requested().resolve();
  await settle();
  assert.equal(fixture.get('practice-content').hidden, true);
  assert.equal(fixture.get('practice-content').children.length, 0);
  assert.equal(fixture.get('access-action').dataset.authAction, 'upgrade');
});

test('visibility and history restoration revalidate without resetting the round', async () => {
  const fixture = accessFixture();
  await settle();
  fixture.documentEvent('visibilitychange');
  await settle();
  assert.equal(fixture.requests.length, 2);
  fixture.windowEvent('pagehide');
  assert.equal(fixture.get('practice-content').hidden, true);
  fixture.windowEvent('pageshow', { persisted: true });
  await settle();
  assert.equal(fixture.requests.length, 3);
  assert.equal(fixture.get('practice-content').hidden, false);
  assert.equal(fixture.initialized(), 1);
});

test('switching accounts clears the previous round before the next access check finishes', async () => {
  const fixture = accessFixture({ deferred: true });
  await settle();
  fixture.requested().resolve();
  await settle();
  fixture.authChanged('SIGNED_IN', { access_token: 'other-token', user: { id: 'other-user' } });
  await settle();
  assert.equal(fixture.get('practice-content').hidden, true);
  assert.equal(fixture.get('practice-content').children.length, 0);
  assert.equal(fixture.get('auth-loading').hidden, false);
});

test('a delayed success cannot restore access after sign-out', async () => {
  const fixture = accessFixture({ deferred: true });
  await settle();
  const originalRequest = fixture.requested();
  fixture.authChanged('SIGNED_OUT', null);
  originalRequest.resolve();
  await settle();
  assert.equal(originalRequest.options.signal.aborted, true);
  assert.equal(fixture.initialized(), 0);
  assert.equal(fixture.get('practice-content').hidden, true);
  assert.equal(fixture.get('member-lock').hidden, false);
});

test('failed quiet checks clear the practice rather than keeping stale access', async () => {
  for (const status of [401, 403, 503]) {
    const fixture = accessFixture();
    await settle();
    fixture.setStatus(status);
    fixture.documentEvent('visibilitychange');
    await settle();
    assert.equal(fixture.get('practice-content').hidden, true);
    assert.equal(fixture.get('practice-content').children.length, 0);
    assert.equal(fixture.get('member-lock').hidden, false);
  }
});
