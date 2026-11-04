import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDIOM_LESSONS } from './catalog.js';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('New Practice contains only Idioms Lessons; relocated cards occur once in General English', () => {
  const html = read('../index.html');
  const newPractice = html.slice(html.indexOf('id="new-practice-section"'), html.indexOf('<h2>Free Exercises</h2>'));
  const general = html.slice(html.indexOf('<h2>General English</h2>'), html.indexOf('<h2>Business</h2>'));
  assert.equal((newPractice.match(/class="ex-card"/g) || []).length, 1);
  assert.match(newPractice, /Idioms Lessons/);
  assert.match(html, /id="exercise-idioms"/);
  assert.match(html, /id="frame-idioms" title="Idioms Lessons"/);
  for (const handler of ['openCollocations', 'openListenAndWrite', 'openWordFamilies']) {
    assert.equal(html.split(`onclick="${handler}()"`).length - 1, 1);
    assert.ok(general.includes(`onclick="${handler}()"`));
    assert.ok(!newPractice.includes(handler));
  }
  assert.match(html, /\['word-families', 'idioms'\].*showModal\(\)/);
});

test('extensionless /idioms serves the shell with no static lesson content or secret', () => {
  const routes = JSON.parse(read('../vercel.json')).rewrites;
  for (const source of ['/idioms', '/idioms/']) {
    assert.ok(routes.some(route => route.source === source && route.destination === '/index.html'));
  }
  const sources = ['index.html', 'app.js', 'practice.js', 'quiz.js', 'catalog.js'].map(read).join('\n');
  assert.doesNotMatch(sources, /Break the ice|Romper el hielo|Tomarle el pelo|To joke with someone|Leer entre líneas|To understand a hidden or implied meaning|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(read('index.html'), /type="module" src="\/idioms\/app.js"/);
  assert.match(read('app.js'), /storageKey: 'ep-auth-token'/);
  assert.match(read('app.js'), /Authorization: `Bearer \$\{token\}`/);
  assert.match(read('app.js'), /cache: 'no-store'/);
});

test('Idioms content removes its own top bar and delegates login and upgrades to the shared shell', () => {
  const html = read('index.html');
  const app = read('app.js');
  assert.doesNotMatch(html, /class="topbar"|id="accountAction"/);
  assert.doesNotMatch(app, /accountAction|querySelector\('\.topbar'\)/);
  const source = app.slice(app.indexOf('function updateLocation('), app.indexOf('async function verifyAccess('));
  const messages = [];
  const urls = [];
  const sandbox = {
    URLSearchParams, location: { origin: 'https://epeak.app' },
    history: { replaceState(state, title, url) { urls.push(url); } },
    window: { parent: { postMessage(message, origin) { messages.push({ message, origin }); } } },
  };
  vm.runInNewContext(source, sandbox);
  sandbox.signIn();
  sandbox.upgrade();
  sandbox.updateLocation(1);
  sandbox.updateLocation(null);
  assert.deepEqual(JSON.parse(JSON.stringify(messages)), [
    { message: { type: 'showAuthModal', tab: 'login' }, origin: 'https://epeak.app' },
    { message: { type: 'showModal' }, origin: 'https://epeak.app' },
    { message: { type: 'idiomsNavigation', lessonId: 1 }, origin: 'https://epeak.app' },
    { message: { type: 'idiomsNavigation', lessonId: null }, origin: 'https://epeak.app' },
  ]);
  assert.deepEqual(urls, ['/idioms/index.html?embedded=1&lesson=1', '/idioms/index.html?embedded=1']);
});

test('dashboard entry and direct lesson URLs mount one content frame without loading a nested shell', () => {
  const app = read('../index.html');
  const source = app.slice(app.indexOf('function openIdioms()'), app.indexOf('function openCollocations()'));
  for (const url of ['https://epeak.app/', 'https://epeak.app/idioms', 'https://epeak.app/idioms/?lesson=1', 'https://epeak.app/idioms?lesson=3']) {
    const nodes = new Map();
    const get = id => {
      if (!nodes.has(id)) nodes.set(id, { classList: { add() {} } });
      return nodes.get(id);
    };
    const navigations = [];
    const sandbox = {
      URLSearchParams, window: { location: new URL(url) },
      document: { querySelectorAll: () => [], getElementById: get },
      history: { pushState(state, title, path) { navigations.push(path); } }, closeMobileSidebar() {},
    };
    vm.runInNewContext(source + '\nopenIdioms();', sandbox);
    const lessonId = new URL(url).searchParams.get('lesson');
    assert.equal(get('frame-idioms').src, '/idioms/index.html?embedded=1' + (lessonId ? '&lesson=' + lessonId : ''));
    assert.equal(get('topbarTitle').textContent, '💡 Idioms Lessons');
    assert.deepEqual(navigations, url === 'https://epeak.app/' ? ['/idioms'] : []);
  }
});

test('only navigation messages from the active same-origin Idioms iframe update the public URL', async () => {
  const app = read('../index.html');
  const start = app.indexOf("window.addEventListener('message', async function(e) {");
  const end = app.indexOf("  if (e.data && e.data.type === 'listenWriteAccessRequest')", start);
  const frameWindow = {};
  let active = true;
  let listener;
  const urls = [];
  const sandbox = {
    Number,
    isTrustedExerciseMessage: () => true,
    window: { location: { origin: 'https://epeak.app' }, addEventListener(type, fn) { listener = fn; } },
    document: { getElementById(id) { return id === 'frame-idioms' ? { contentWindow: frameWindow } : { classList: { contains: () => active } }; } },
    history: { replaceState(state, title, url) { urls.push(url); } },
  };
  vm.runInNewContext(app.slice(start, end) + '});', sandbox);
  const valid = { origin: 'https://epeak.app', source: frameWindow, data: { type: 'idiomsNavigation', lessonId: 1 } };
  for (const overrides of [{ origin: 'https://other.example' }, { source: {} }, { data: { type: 'idiomsNavigation', lessonId: '../profile' } }, { data: { type: 'idiomsNavigation', lessonId: -1 } }]) await listener({ ...valid, ...overrides });
  active = false;
  await listener(valid);
  assert.deepEqual(urls, []);
  active = true;
  await listener(valid);
  await listener({ ...valid, data: { type: 'idiomsNavigation', lessonId: null } });
  assert.deepEqual(urls, ['/idioms?lesson=1', '/idioms']);
});

test('catalog publishes Lessons 1–3 and reserves Lessons 4–6', () => {
  assert.deepEqual(IDIOM_LESSONS.map(item => item.id), [1, 2, 3, 4, 5, 6]);
  assert.equal(IDIOM_LESSONS[0].published, true);
  assert.equal(IDIOM_LESSONS[0].access, 'free');
  assert.equal(IDIOM_LESSONS[1].published, true);
  assert.equal(IDIOM_LESSONS[1].access, 'premium');
  assert.equal(IDIOM_LESSONS[2].published, true);
  assert.equal(IDIOM_LESSONS[2].access, 'premium');
  for (const item of IDIOM_LESSONS.slice(3)) {
    assert.equal(item.access, 'premium');
    assert.equal(item.published, false);
    assert.equal(item.items, undefined);
  }
});
