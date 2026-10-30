import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]).join('\n');
const unscoredTypes = ['listen-repeat', 'speaking-timer', 'writing-email'];

function practice(answerMode = 'correct') {
  const elements = new Map();
  const reports = [];
  const errors = [];
  let activeTask;
  const choice = question => answerMode === 'correct' ? question.correct : (question.correct + 1) % question.options.length;
  const document = {
    getElementById(id) {
      if (id === 'menu-grid') return null;
      if (!elements.has(id)) elements.set(id, { innerHTML: '', style: {}, classList: { add() {}, remove() {} } });
      if (id === 'd-area') elements.get(id).children = answerMode === 'correct'
        ? activeTask.correctOrder.map(innerText => ({ innerText }))
        : answerMode === 'wrong' ? [{ innerText: 'incorrect' }] : [];
      return elements.get(id);
    },
    querySelectorAll(selector) {
      if (selector === '.fill-blank') return activeTask.answers.map(answer => ({ value: answerMode === 'correct' ? answer : answerMode === 'wrong' ? 'incorrect' : '' }));
      return [];
    },
    querySelector(selector) {
      if (answerMode === 'unanswered') return null;
      if (selector === '.selected') return { dataset: { idx: String(choice(activeTask)) } };
      const group = selector.match(/^\.q(\d+)\.selected$/);
      return group ? { dataset: { choice: String(choice(activeTask.questions[Number(group[1])])) } } : null;
    },
  };
  const sandbox = {
    URLSearchParams,
    clearInterval() {}, setTimeout() {},
    console: { error: (...args) => errors.push(args) },
    window: { location: { search: '', origin: 'https://englishpeak.test' }, parent: { postMessage: report => reports.push(report) } },
    document,
  };
  vm.createContext(sandbox);
  vm.runInContext(`${scripts}\nglobalThis.data = testData;`, sandbox);
  return { sandbox, elements, reports, errors, setTask(task) { activeTask = task; } };
}

function assertRendered(markup, task, label) {
  assert.ok(markup.includes(task.title), label);
  if (task.options) {
    assert.ok(markup.includes(task.question), `${label}: question`);
    assert.equal((markup.match(/class="option"/g) || []).length, task.options.length, `${label}: choices`);
    if (task.type === 'read-daily') assert.ok(markup.includes(task.text), `${label}: reading passage`);
  }
  if (task.questions) {
    assert.equal((markup.match(/class="option q\d+"/g) || []).length, task.questions.reduce((count, q) => count + q.options.length, 0), `${label}: grouped choices`);
  }
  if (task.type === 'complete-words') {
    assert.equal((markup.match(/class="fill-blank"/g) || []).length, task.answers.length, `${label}: every blank renders`);
    assert.doesNotMatch(markup, /\[\d+\]/, `${label}: no raw blank markers`);
  }
}

test('every task in Tests 1–30 renders its exercise and all answer controls', () => {
  const app = practice();
  for (let number = 1; number <= 30; number++) {
    const key = `Test ${number}`;
    const tasks = app.sandbox.data[key];
    assert.ok(tasks.length > 0, key);
    tasks.forEach((task, index) => {
      app.setTask(task);
      vm.runInContext(`_currentTestKey = '${key}'; curSet = testData[_currentTestKey]; idx = ${index}; render();`, app.sandbox);
      assertRendered(app.elements.get('exercise-content').innerHTML, task, `${key}: ${task.title}`);
    });
  }
});

test('Tests 1–30 have one answer of the correct size for every word blank', () => {
  const { sandbox } = practice();
  for (let number = 1; number <= 30; number++) {
    for (const task of sandbox.data[`Test ${number}`].filter(task => task.type === 'complete-words')) {
      const sizes = [...task.text.matchAll(/\[(\d+)\]/g)].map(match => Number(match[1]));
      const label = `Test ${number}: ${task.title}`;
      assert.equal(sizes.length, task.answers.length, label);
      task.answers.forEach((answer, index) => {
        assert.ok(sizes[index] > 0, `${label}: blank ${index + 1} must accept input`);
        assert.equal(sizes[index], answer.length, `${label}: blank ${index + 1}`);
      });
    }
  }
});

test('Test 24 Linguistics reconstructs the complete intended paragraph', () => {
  const task = practice().sandbox.data['Test 24'].find(task => task.title === 'Task 2: Linguistics');
  let index = 0;
  const paragraph = task.text.replace(/\[\d+\]/g, () => task.answers[index++]);
  assert.equal(paragraph, 'Contemporary linguists study how language acquisition shapes early cognitive development in children. Research indicates that bilingual toddlers display enhanced problem-solving skills compared to their monolingual peers. Furthermore, early exposure to multiple syntactical structures fundamentally alters neurological pathways, providing a distinct academic advantage later in life.');
});

for (const answerMode of ['correct', 'wrong', 'unanswered']) {
  test(`Tests 1–30 advance through every task and report accurate results with ${answerMode} answers`, () => {
    const app = practice(answerMode);
    for (let number = 1; number <= 30; number++) {
      const key = `Test ${number}`;
      const tasks = app.sandbox.data[key];
      vm.runInContext(`start('${key}');`, app.sandbox);
      let possible = 0;
      tasks.forEach((task, index) => {
        app.setTask(task);
        assert.equal(vm.runInContext('idx', app.sandbox), index, key);
        assertRendered(app.elements.get('exercise-content').innerHTML, task, `${key}: ${task.title}`);
        if (!unscoredTypes.includes(task.type)) possible += task.answers?.length || task.questions?.length || 1;
        vm.runInContext('submitAnswer();', app.sandbox);
      });
      const results = vm.runInContext('results', app.sandbox);
      assert.equal(results.length, tasks.length, key);
      for (const [index, result] of results.entries()) {
        if (unscoredTypes.includes(result.type)) continue;
        assert.equal(result.isCorrect, answerMode === 'correct', `${key}: ${result.title}`);
        const task = tasks[index];
        if (task.type === 'read-daily') {
          assert.equal(result.cVal, task.options[task.correct], `${key}: daily-reading answer key`);
          assert.equal(result.uVal, answerMode === 'unanswered' ? 'N/A' : task.options[choiceForMode(task, answerMode)]);
          assert.ok(app.elements.get('feedback-display').innerHTML.includes(task.options[task.correct]), `${key}: daily-reading feedback`);
        }
      }
      const report = app.reports.at(-1);
      assert.equal(report.exerciseName, key);
      assert.equal(report.score, answerMode === 'correct' ? possible : 0, key);
      assert.equal(report.maxScore, possible, key);
      assert.match(app.elements.get('score-display').innerHTML, new RegExp(`>${answerMode === 'correct' ? 100 : 0}%<`), key);
    }
    assert.equal(app.reports.length, 30);
    assert.deepEqual(app.errors, []);
  });
}

function choiceForMode(task, mode) {
  return mode === 'correct' ? task.correct : (task.correct + 1) % task.options.length;
}
