import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const appHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);

function loadPage(search = '') {
  const elements = new Map();
  const makeElement = () => ({
    innerHTML: '', textContent: '', style: {}, children: [],
    classList: { add() {}, remove() {} },
    appendChild(child) { this.children.push(child); },
  });
  const element = id => {
    if (!elements.has(id)) elements.set(id, makeElement());
    return elements.get(id);
  };
  const messages = [];
  const sandbox = {
    console, URLSearchParams,
    setInterval: () => 1, clearInterval() {},
    window: {
      location: { search, origin: 'https://example.com' },
      parent: { postMessage: (message, origin) => messages.push({ message, origin }) },
    },
    document: {
      getElementById: element,
      createElement: makeElement,
      querySelectorAll: () => [],
      body: { style: {} },
    },
  };
  vm.createContext(sandbox);
  // Execute both complete scripts so pasted syntax errors prevent the test from passing.
  scripts.forEach(script => vm.runInContext(script, sandbox));
  return { sandbox, element, messages, run: source => vm.runInContext(source, sandbox) };
}

test('ITP boots and renders all 35 menu buttons with guest access restrictions', () => {
  const page = loadPage();
  const buttons = page.element('menu').children;
  assert.equal(buttons.length, 35);
  assert.deepEqual(buttons.slice(0, 3).map(button => button.textContent), ['Test 1', 'Test 2', 'Test 3']);
  assert.ok(buttons.slice(3).every(button => button.textContent.startsWith('🔒 Test ')));
  let prevented = false;
  buttons[34].onclick({ preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.equal(page.messages[0].message.type, 'showModal');
});

test('Test 35 opens, renders all 20 questions, reports its score, and returns to the menu', () => {
  const page = loadPage('?allowed=1,35');
  const buttons = page.element('menu').children;
  assert.equal(buttons[34].textContent, 'Test 35');
  buttons[34].onclick();
  assert.match(page.element('app').innerHTML, /Not until the early twentieth century/);
  assert.equal(page.run('tests[35].mc.length'), 10);
  assert.equal(page.run('tests[35].ed.length'), 10);
  for (let question = 0; question < 20; question++) {
    if (question > 0) page.run(`index = ${question}; render();`);
    assert.match(page.element('app').innerHTML, new RegExp(`Question ${question + 1} of 20`));
    if (question >= 10) assert.match(page.element('app').innerHTML, /class="error-segment"/);
    page.run('check((index < 10 ? tests[35].mc[index] : tests[35].ed[index - 10]).a, (index < 10 ? tests[35].mc[index] : tests[35].ed[index - 10]).a, {classList: {add() {}}});');
    if (question === 9) {
      page.run('showTransition();');
      assert.match(page.element('app').innerHTML, /Ready for Section 2/);
    }
  }
  page.run('index = 20; render();');
  assert.match(page.element('app').innerHTML, /Test Complete!/);
  assert.match(page.element('app').innerHTML, /Score: 20\/20/);
  assert.equal(page.messages.at(-1).message.exerciseName, 'Test 35');
  assert.equal(page.messages.at(-1).message.maxScore, 20);
  page.run('backToMenu();');
  assert.equal(page.element('app').children.length, 35);
  assert.equal(page.element('app').children[34].textContent, 'Test 35');
});

test('the public ITP routes serve the current catalog and full-access tiers include Test 35', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const source of ['/itp', '/itp/:path*']) {
    assert.equal(config.rewrites.find(rule => rule.source === source).destination, '/itp/index.html');
  }
  const tierSource = appHtml.slice(appHtml.indexOf('var ITP_TOTAL ='), appHtml.indexOf('function getEffectiveTier'));
  const sandbox = {};
  vm.runInNewContext(tierSource, sandbox);
  assert.equal(sandbox.ITP_TOTAL, 35);
  for (const tier of ['admin', 'premium', 'teacher', 'student', 'courtesy']) {
    assert.ok(sandbox.TIERS[tier].itpTests.includes(35), tier);
  }
  assert.equal(sandbox.TIERS.visitor.itpTests.length, 3);
  assert.equal(sandbox.TIERS.free.itpTests.length, 6);
});
