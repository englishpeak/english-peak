import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDIOM_LESSON_CONTENT } from '../api/idioms.js';
import { IDIOM_LESSONS } from './catalog.js';
import { QuizRound } from './quiz.js';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');

test('Lesson 2 pins the exact supplied questions, choices, answers, 40 examples and ten equivalents', () => {
  const items = IDIOM_LESSON_CONTENT[2];
  assert.equal(createHash('sha256').update(JSON.stringify(items)).digest('hex'),
    '507da50e9f1b14f688a4bc244212f901eb4554016c38a9662faa1aa3da947f9e');
  assert.equal(items.length, 10);
  assert.equal(new Set(items.map(item => item.idiom)).size, 10);
  assert.equal(new Set(items.map(item => item.id)).size, 10);
  for (const item of items) {
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options).size, 4);
    assert.ok(Number.isInteger(item.correct) && item.correct >= 0 && item.correct < 4);
    assert.equal(item.examples.length, 4);
    assert.ok(item.question && item.spanish);
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      const round = new QuizRound([item], random);
      assert.equal(round.item.options[round.item.correct], item.options[item.correct]);
    }
  }
});

function element() {
  const classes = new Set();
  return {
    children: [], attrs: {}, style: {}, textContent: '', disabled: false,
    classList: {
      add(...names) { names.forEach(name => classes.add(name)); },
      remove(...names) { names.forEach(name => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name, force = !classes.has(name)) { if (force) classes.add(name); else classes.delete(name); },
    },
    events: {},
    addEventListener(type, callback) { this.events[type] = callback; },
    click() { if (!this.disabled) this.events.click?.(); },
    setAttribute(name, value) { this.attrs[name] = String(value); },
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; this.textContent = ''; },
    querySelector() { return this.label ??= element(); },
    focus() {},
  };
}

test('Lesson 2 renders every item, reveals and hides details, scores, navigates and restarts independently', () => {
  const nodes = new Map();
  const get = id => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); };
  const sandbox = {
    QuizRound,
    document: { getElementById: get, createElement: element },
    window: { scrollTo() {} },
  };
  vm.runInNewContext(read('practice.js').replace(/^import .*;\n/, '').replace(/export /g, ''), sandbox);
  sandbox.showPractice(IDIOM_LESSONS[1], IDIOM_LESSON_CONTENT[2]);
  assert.equal(get('lessonTitle').textContent, 'LESSON 2');
  for (const [index, item] of IDIOM_LESSON_CONTENT[2].entries()) {
    assert.equal(get('questionPrompt').textContent, item.question);
    assert.equal(get('idiom').textContent, '“' + item.idiom + '”');
    assert.equal(get('counter').textContent, (index + 1) + ' of 10');
    assert.equal(get('progress').attrs['aria-valuenow'], String(index + 1));
    assert.equal(get('progressFill').style.width, ((index + 1) * 10) + '%');
    assert.equal(get('nextBtn').disabled, true);
    assert.deepEqual(get('answers').children.map(button => button.children[1].textContent).sort(), [...item.options].sort());
    assert.deepEqual(get('exampleList').children.map(li => li.textContent), item.examples);
    assert.equal(get('spanishText').textContent, item.spanish);
    for (const [buttonId, panelId] of [['exampleBtn', 'examplesPanel'], ['spanishBtn', 'spanishPanel']]) {
      assert.equal(get(panelId).classList.contains('hidden'), true);
      get(buttonId).click();
      assert.equal(get(panelId).classList.contains('hidden'), false);
      assert.equal(get(buttonId).attrs['aria-expanded'], 'true');
      get(buttonId).click();
      assert.equal(get(panelId).classList.contains('hidden'), true);
      assert.equal(get(buttonId).attrs['aria-expanded'], 'false');
    }
    const selected = item.options[index % 2 === 0 ? item.correct : (item.correct + 1) % 4];
    get('answers').children.find(button => button.children[1].textContent === selected).click();
    assert.equal(get('answers').children.every(button => button.disabled), true);
    assert.match(get('feedback').textContent, index % 2 === 0 ? /Exactly right/ : /Not quite/);
    assert.equal(get('nextBtn').disabled, false);
    if (index === 1) {
      get('prevBtn').click();
      assert.equal(get('counter').textContent, '1 of 10');
      assert.equal(get('answers').children.every(button => button.disabled), true);
      get('nextBtn').click();
      assert.equal(get('counter').textContent, '2 of 10');
    }
    get('nextBtn').click();
  }
  assert.equal(get('scoreText').textContent, '5 / 10 correct answers');
  assert.equal(get('completePanel').classList.contains('hidden'), false);
  get('retryBtn').click();
  assert.equal(get('counter').textContent, '1 of 10');
  assert.equal(get('nextBtn').disabled, true);
  assert.equal(get('answers').children.every(button => !button.disabled), true);
  sandbox.clearPractice();
  sandbox.showPractice(IDIOM_LESSONS[0], IDIOM_LESSON_CONTENT[1]);
  assert.equal(get('lessonTitle').textContent, 'LESSON 1');
  assert.equal(get('questionPrompt').textContent, 'What does this idiom mean?');
  assert.equal(get('nextBtn').disabled, true);
  sandbox.clearPractice();
  sandbox.showPractice(IDIOM_LESSONS[1], IDIOM_LESSON_CONTENT[2]);
  assert.equal(get('counter').textContent, '1 of 10');
  assert.equal(get('nextBtn').disabled, true);
});

test('Lesson 2 card unlocks only for eligible accounts while Lessons 3–6 remain locked', () => {
  const source = read('app.js');
  const buildGrid = source.slice(source.indexOf('function buildGrid()'), source.indexOf('function closeModal()'));
  for (const plusAccess of [false, true]) {
    const grid = element();
    const opened = [];
    const sandbox = { IDIOM_LESSONS, plusAccess, checking: false, $: () => grid,
      document: { createElement: element }, openLesson: id => opened.push(id) };
    vm.runInNewContext(buildGrid + '\nbuildGrid();', sandbox);
    assert.equal(grid.children.length, 6);
    const lesson2 = grid.children[1];
    assert.equal(lesson2.className.includes('locked'), !plusAccess);
    assert.equal(lesson2.innerHTML.includes('COMING SOON'), false);
    assert.equal(lesson2.innerHTML.includes('circle lock'), !plusAccess);
    lesson2.click();
    assert.deepEqual(opened, [2]);
    for (const button of grid.children.slice(2)) {
      assert.match(button.className, /locked/);
      assert.match(button.innerHTML, /COMING SOON/);
    }
  }
  const html = read('index.html');
  const index = html.slice(0, html.indexOf('id="lessonView"'));
  assert.doesNotMatch(index, /English Peak · Learn a little\. Speak a lot\./);
  assert.match(html.slice(html.indexOf('id="lessonView"')), /English Peak · Learn a little\. Speak a lot\./);
});
