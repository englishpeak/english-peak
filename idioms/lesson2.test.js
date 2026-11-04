import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDIOM_LESSON_CONTENT } from '../api/idioms.js';
import { IDIOM_LESSONS } from './catalog.js';
import { QuizRound } from './quiz.js';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');

test('published lessons contain no duplicate idioms after normalising case and punctuation', () => {
  const seen = new Map();
  for (const lesson of IDIOM_LESSONS.filter(item => item.published)) {
    for (const item of IDIOM_LESSON_CONTENT[lesson.id]) {
      const normalised = item.idiom.normalize('NFKC').toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/^(?:to|be) /, '');
      assert.ok(!seen.has(normalised),
        `Duplicate idiom "${item.idiom}" in Lesson ${lesson.id}; already in Lesson ${seen.get(normalised)}`);
      seen.set(normalised, lesson.id);
    }
  }
});

for (const [lessonId, digest] of [
  [2, 'baba9a778b32d496fd11c026578b536b26951cdc93c6d9fa2bacfd181e01e071'],
  [3, 'c08a9f8db28708b68195579b661d9243a0c1507bc337423c776497a3d7d1aac5'],
  [4, 'b5d8c2d862c62377e04d6e7b59d259bd693d18117c0bdc1214f0cb75ce948edf'],
]) {
  test(`Lesson ${lessonId} pins the exact supplied questions, choices, answers, 40 examples and ten equivalents`, () => {
    const items = IDIOM_LESSON_CONTENT[lessonId];
    assert.equal(createHash('sha256').update(JSON.stringify(items)).digest('hex'),
      digest);
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
}

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

for (const lessonId of [2, 3, 4]) {
  test(`Lesson ${lessonId} renders every item, reveals and hides details, scores, navigates and restarts independently`, () => {
    const nodes = new Map();
    const get = id => { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); };
    const sandbox = {
      QuizRound,
      document: { getElementById: get, createElement: element },
      window: { scrollTo() {} },
    };
    vm.runInNewContext(read('practice.js').replace(/^import .*;\n/, '').replace(/export /g, ''), sandbox);
    sandbox.showPractice(IDIOM_LESSONS[lessonId - 1], IDIOM_LESSON_CONTENT[lessonId]);
    assert.equal(get('lessonTitle').textContent, `LESSON ${lessonId}`);
    for (const [index, item] of IDIOM_LESSON_CONTENT[lessonId].entries()) {
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
    for (const targetId of [1, 2, 3, 4]) {
      sandbox.clearPractice();
      sandbox.showPractice(IDIOM_LESSONS[targetId - 1], IDIOM_LESSON_CONTENT[targetId]);
      assert.equal(get('lessonTitle').textContent, `LESSON ${targetId}`);
      assert.equal(get('questionPrompt').textContent, targetId === 1
        ? 'What does this idiom mean?' : IDIOM_LESSON_CONTENT[targetId][0].question);
      assert.equal(get('counter').textContent, '1 of 10');
      assert.equal(get('nextBtn').disabled, true);
      const firstChoice = get('answers').children[0];
      assert.equal(firstChoice.disabled, false);
      firstChoice.click();
      assert.equal(get('nextBtn').disabled, false);
    }
  });
}

test('Lessons 2–4 unlock only for eligible accounts while Lessons 5–6 remain locked', () => {
  const source = read('app.js');
  const buildGrid = source.slice(source.indexOf('function buildGrid()'), source.indexOf('function closeModal()'));
  for (const plusAccess of [false, true]) {
    const grid = element();
    const opened = [];
    const sandbox = { IDIOM_LESSONS, plusAccess, checking: false, $: () => grid,
      document: { createElement: element }, openLesson: id => opened.push(id) };
    vm.runInNewContext(buildGrid + '\nbuildGrid();', sandbox);
    assert.equal(grid.children.length, 6);
    for (const lessonId of [2, 3, 4]) {
      const button = grid.children[lessonId - 1];
      assert.equal(button.className.includes('locked'), !plusAccess);
      assert.equal(button.innerHTML.includes('COMING SOON'), false);
      assert.equal(button.innerHTML.includes('circle lock'), !plusAccess);
      button.click();
    }
    assert.deepEqual(opened, [2, 3, 4]);
    for (const button of grid.children.slice(4)) {
      assert.match(button.className, /locked/);
      assert.match(button.innerHTML, /COMING SOON/);
    }
  }
  const html = read('index.html');
  const index = html.slice(0, html.indexOf('id="lessonView"'));
  assert.doesNotMatch(index, /English Peak · Learn a little\. Speak a lot\./);
  assert.doesNotMatch(html.slice(html.indexOf('id="lessonView"')), /English Peak · Learn a little\. Speak a lot\./);
});
