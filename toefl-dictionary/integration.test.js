import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const access = readFileSync(new URL('./access.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('routes expose only the shell and browser assets contain no vocabulary', () => {
  const routing = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const source of ['/toefl-dictionary', '/toefl-dictionary/']) {
    assert.ok(routing.rewrites.some(route => route.source === source && route.destination === '/toefl-dictionary/index.html'));
  }
  const browser = html + access + readFileSync(new URL('./dictionary.js', import.meta.url), 'utf8');
  assert.doesNotMatch(browser, /_lib\/toefl-dictionary-data|soil samples|Researchers analyzed|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(html, /id="practice-content" hidden/);
  assert.match(html, /\/word-families\/access.css/);
  const api = readFileSync(new URL('../api/toefl-dictionary.js', import.meta.url), 'utf8');
  assert.match(api, /hasFullAccessTier/);
  // Vercel does not serve api/** as static files, and /_ directories cannot
  // become function entrypoints. Keep the dataset in this private module.
  assert.match(api, /from '\.\/_lib\/toefl-dictionary-data.js'/);
  assert.doesNotMatch(readFileSync(new URL('../api/_lib/toefl-dictionary-data.js', import.meta.url), 'utf8'), /export default/);
  assert.ok(!routing.rewrites.some(route => route.destination.includes('/api/_lib/')));
});

test('NEW has one dictionary card following existing login, upgrade and member flows', () => {
  const section = app.slice(app.indexOf('id="new-practice-section"'), app.indexOf('<h2>Free Exercises</h2>'));
  assert.match(section, /onclick="openToeflDictionary\(\)"/);
  assert.match(section, /id="access-toefl-dictionary">🔒 ePeak\+/);
  assert.match(section, /onclick="openIdioms\(\)"/);
  assert.equal((app.match(/onclick="openToeflDictionary\(\)"/g) || []).length, 1);
  assert.match(app, /id="frame-toefl-dictionary"[^>]*title="TOEFL Dictionary"/);
  const source = app.slice(app.indexOf('function updateToeflDictionaryCard()'), app.indexOf('function prepareWordFamiliesFrame()'));
  const tiers = app.slice(app.indexOf('function getEffectiveTier('), app.indexOf('// Popup presentation only'));
  for (const profile of [null, { tier: 'free' }, ...['premium', 'teacher', 'student', 'courtesy', 'admin'].map(tier => ({ tier })), { tier: 'free', is_admin: true }]) {
    const events = [];
    const frame = { src: 'about:blank', dataset: {} };
    const sandbox = {
      _currentUser: profile ? { id: 'member' } : null, _currentProfile: profile,
      document: { querySelectorAll: () => [], getElementById: id => id === 'frame-toefl-dictionary' ? frame : { classList: { add() {} } } },
      showAuthModal: tab => events.push(tab), showModal: () => events.push('upgrade'), closeMobileSidebar() {},
    };
    vm.runInNewContext(tiers + source + '\nopenToeflDictionary();', sandbox);
    if (!profile) assert.deepEqual(events, ['login']);
    else if (profile.tier === 'free' && !profile.is_admin) assert.deepEqual(events, ['upgrade']);
    else {
      assert.deepEqual(events, []);
      assert.equal(frame.src, '/toefl-dictionary');
      sandbox._currentUser = null;
      sandbox.updateToeflDictionaryCard();
      assert.equal(frame.src, 'about:blank');
      assert.equal(frame.dataset.userId, undefined);
    }
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
    initializeDictionary: () => { initialized++; },
    async fetch(url, options) {
      requested = { url, options };
      requests.push(requested);
      if (fail) throw new Error('network');
      const response = () => ({ status, ok: status === 200, async json() { return { userId: 'server-verified-user', entries: [] }; } });
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
  assert.equal(fixture.requested().url, '/api/toefl-dictionary');
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

test('signing out removes the rendered dictionary and stale authorized responses cannot reopen it', async () => {
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

test('token refresh checks access quietly and preserves the dictionary', async () => {
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
  const message = { origin: 'https://epeak.app', source: fixture.sandbox.window.parent, data: { type: 'toeflDictionaryResume' } };
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

test('visibility and history restoration revalidate without resetting the dictionary', async () => {
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

test('switching accounts clears the previous dictionary before the next access check finishes', async () => {
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

test('failed quiet checks clear the dictionary rather than keeping stale access', async () => {
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
