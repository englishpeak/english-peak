import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const appHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const sandbox = {
  console,
  URLSearchParams,
  clearInterval,
  setInterval,
  setTimeout,
  window: { location: { search: '' } },
  document: { getElementById: () => null },
};
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test31 = testData["Test 31"]; globalThis.testHref = buildTestHref("Test 31");`, sandbox);
const test31 = sandbox.test31;
const test30Source = html.match(/"Test 30": \[([\s\S]*?)\n\s*\],/);

assert.ok(test30Source, 'Test 30 should be present in ibt/index.html');

const completeWordsTasks = [...test30Source[1].matchAll(
  /\{ type: 'complete-words', title: '([^']+)', text: '([^']+)', answers: \[([^\]]+)\] \}/g,
)].map(([, title, text, answerSource]) => ({
  title,
  text,
  answers: [...answerSource.matchAll(/'([^']+)'/g)].map((match) => match[1]),
}));

const expectedParagraphs = [
  'Modern real estate professionals actively utilize virtual reality software to showcase luxury properties to international buyers. These immersive digital experiences allow prospective clients to comfortably explore spacious apartments from remote locations.',
  'Clinical nutritionists frequently recommend consuming diverse plant-based proteins to maintain optimal cardiovascular health. Comprehensive dietary studies demonstrate that organic vegetables significantly reduce the internal accumulation of dangerous arterial plaque. Consequently, proactive patients consistently experience increased physical vitality.',
  'Innovative engineering corporations are heavily investing in advanced geothermal energy extraction methods. By utilizing subterranean volcanic heat, these sustainable facilities can continuously generate massive amounts of clean electricity. Unlike unpredictable solar panels, this renewable baseload power source operates efficiently regardless of external weather conditions.',
];

test('Test 30 contains the expected first three complete-word tasks', () => {
  assert.equal(completeWordsTasks.length, 3);
});

test('Test 30 blank sizes match every supplied answer', () => {
  for (const task of completeWordsTasks) {
    const blankSizes = [...task.text.matchAll(/\[(\d+)\]/g)].map((match) => Number(match[1]));

    assert.equal(
      blankSizes.length,
      task.answers.length,
      `${task.title} should have one answer for every blank`,
    );

    task.answers.forEach((answer, index) => {
      assert.equal(
        answer.length,
        blankSizes[index],
        `${task.title}, blank ${index + 1}: [${blankSizes[index]}] does not match "${answer}"`,
      );
    });
  }
});

test('Test 30 answers reconstruct the intended full words and paragraphs', () => {
  completeWordsTasks.forEach((task, taskIndex) => {
    let answerIndex = 0;
    const completedParagraph = task.text.replace(/\[\d+\]/g, () => task.answers[answerIndex++]);

    assert.equal(completedParagraph, expectedParagraphs[taskIndex], task.title);
  });
});

test('the catalog separates the existing and updated TOEFL collections', () => {
  assert.match(html, /title: 'GENERAL PRACTICE'/);
  assert.match(html, /Build familiarity with TOEFL-style English skills and question types\./);
  assert.match(html, /title: 'UPDATED TOEFL PRACTICE'/);
  assert.match(html, /Practice with the task types and format introduced in the updated TOEFL iBT\./);
  assert.match(html, /tests: Array\.from\(\{length: 30\}/);
  assert.match(html, /tests: \['Test 31'\]/);
});

test('Test 31 deep links remain supported as an optional entry path', () => {
  assert.equal(sandbox.testHref, '?test=Test+31');
  assert.match(html, /start\(_requestedTest\)/);
});

test('the parent serializes the complete allowed-test array into the iframe URL', () => {
  assert.match(appHtml, /params\.set\('allowed', allowed\.join\(','\)\)/);
  assert.match(appHtml, /frame\.src = '\/ibt\?' \+ params\.toString\(\)/);
});

function parentIBTAccess(tier) {
  const tierSource = appHtml.slice(appHtml.indexOf('var ITP_TOTAL ='), appHtml.indexOf('function getEffectiveTier'));
  const openIBTSource = appHtml.slice(appHtml.indexOf('function openIBT()'), appHtml.indexOf('function openGeneral()'));
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { classList: { add() {}, remove() {} }, textContent: '', src: '' });
    return elements.get(id);
  };
  const parentSandbox = {
    URLSearchParams,
    hasFullAccessTier: (tierKey) => ['admin', 'premium', 'teacher', 'student', 'courtesy'].includes(tierKey),
    document: { querySelectorAll: () => [], getElementById: element },
    closeMobileSidebar() {},
  };
  vm.runInNewContext(`${tierSource}\n${openIBTSource}\ncurrentTier = '${tier}'; openIBT(); globalThis.allowed = TIERS[currentTier].ibtTests;`, parentSandbox);
  return { allowed: [...parentSandbox.allowed], frameSrc: element('frame-ibt').src };
}

test('every full-access tier sends Test 31 in the iframe allowed parameter', () => {
  for (const tier of ['admin', 'premium', 'teacher', 'student', 'courtesy']) {
    const access = parentIBTAccess(tier);
    assert.equal(access.allowed.length, 31, tier);
    assert.equal(access.allowed.at(-1), 'Test 31', tier);
    assert.equal(new URLSearchParams(access.frameSrc.split('?')[1]).get('allowed').split(',').at(-1), 'Test 31', tier);
  }
});

test('guest and free iframe access remains restricted', () => {
  assert.deepEqual(parentIBTAccess('visitor').allowed, ['Test 1', 'Test 2']);
  assert.deepEqual(parentIBTAccess('free').allowed, ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']);
});

function catalogControl({ allowedTests, populatedTests, key }) {
  class FakeElement {
    constructor(tagName) {
      this.tagName = tagName.toUpperCase();
      this.children = [];
      this.disabled = false;
      this.className = '';
      this.textContent = '';
      this.style = {};
      this._testsGrid = null;
    }
    appendChild(child) { this.children.push(child); return child; }
    setAttribute() {}
    set innerHTML(value) {
      this._innerHTML = value;
      if (this.tagName === 'SECTION') this._testsGrid = new FakeElement('div');
    }
    get innerHTML() { return this._innerHTML || ''; }
    querySelector(selector) { return selector === '.collection-tests' ? this._testsGrid : null; }
    click() { if (!this.disabled && this.onclick) this.onclick({ preventDefault() {} }); }
  }

  const menuGrid = new FakeElement('div');
  const started = [];
  const upgrades = [];
  const behaviorSandbox = {
    Array,
    document: {
      createElement: (tagName) => new FakeElement(tagName),
      getElementById: (id) => id === 'menu-grid' ? menuGrid : null,
    },
    testData: Object.fromEntries(populatedTests.map((testKey) => [testKey, [{}]])),
    _allowedTests: allowedTests,
    start: (testKey) => started.push(testKey),
    notifyUpgrade: () => upgrades.push(key),
  };
  const catalogSource = html.slice(html.indexOf('var testCollections ='), html.indexOf('function buildTestHref'));
  const futureCollection = key === 'Test 31' ? '' : `testCollections.push({ id: 'future', title: 'FUTURE', description: '', tests: ['${key}'] });`;
  vm.runInNewContext(`${catalogSource}\n${futureCollection}\n_buildIBTMenu();`, behaviorSandbox);
  const controls = menuGrid.children.flatMap((section) => section._testsGrid.children);
  const control = controls.find((entry) => entry.textContent.replace('🔒 ', '') === key || entry.innerHTML.startsWith(key));
  return { control, started, upgrades };
}

test('Test 31 catalog control starts its populated test for a full-access user', () => {
  const result = catalogControl({ allowedTests: ['Test 31'], populatedTests: ['Test 31'], key: 'Test 31' });
  assert.equal(result.control.tagName, 'BUTTON');
  assert.equal(result.control.disabled, false);
  result.control.click();
  assert.deepEqual(result.started, ['Test 31']);
  assert.deepEqual(result.upgrades, []);
});

test('Test 31 catalog control stays locked and requests an upgrade without access', () => {
  const result = catalogControl({ allowedTests: [], populatedTests: ['Test 31'], key: 'Test 31' });
  assert.match(result.control.textContent, /^🔒 Test 31$/);
  result.control.click();
  assert.deepEqual(result.started, []);
  assert.deepEqual(result.upgrades, ['Test 31']);
});

test('a future catalog test without testData remains disabled as coming soon', () => {
  const result = catalogControl({ allowedTests: ['Test 32'], populatedTests: [], key: 'Test 32' });
  assert.equal(result.control.disabled, true);
  assert.match(result.control.innerHTML, /Content coming soon/);
  result.control.click();
  assert.deepEqual(result.started, []);
  assert.deepEqual(result.upgrades, []);
});

test('Test 31 contains the complete updated TOEFL practice sequence', () => {
  assert.match(html, /testData\["Test 31"\] = \[/);
  const sections = [...html.matchAll(/section:'(Reading|Listening|Writing|Speaking)'/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(sections)], ['Reading', 'Listening', 'Writing', 'Speaking']);
  // Nineteen object literals plus four mapped listening-response objects and
  // six mapped build-sentence objects produce the 27-task runtime array.
  assert.equal(sections.length, 19);
  assert.match(html, /Writing and Speaking practice tasks are not included in automatic scoring/);
  assert.match(html, /not an official TOEFL score/);
});

test('Test 31 uses only the supplied audio files and no interview audio', () => {
  const test31 = html.slice(html.indexOf('testData["Test 31"]'), html.indexOf('let curSet = []'));
  for (const task of [8, 9, 10, 11, 15, 16, 18, 19, 20, 21]) {
    assert.match(test31, new RegExp(`test-31/task-(?:\\$\\{x\\[0\\]\\}|${task})\\.mp3`));
  }
  assert.match(test31, /test-31\/sentence-\$\{i\+1\}\.mp3/);
  assert.doesNotMatch(test31, /interview[^\n]*\.mp3/i);
});

test('Test 31 has the specified task and objective-item counts by section', () => {
  const tasksBySection = Object.groupBy(test31, (task) => task.section);
  assert.deepEqual(
    Object.fromEntries(Object.entries(tasksBySection).map(([section, tasks]) => [section, tasks.length])),
    { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 },
  );
  const objectiveCount = test31.reduce((count, task) => {
    if (['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(task.type)) return count;
    if (task.type === 'complete-words') return count + task.answers.length;
    if (task.questions) return count + task.questions.length;
    if (task.type === 'build-sentence' || task.type === 'listen-response') return count + 1;
    return count;
  }, 0);
  assert.equal(objectiveCount, 61);
});

test('Test 31 complete-word passages reconstruct exactly with ten blanks each', () => {
  const expected = [
    'Trees can preserve surprisingly detailed evidence about past climate. As a tree grows, it produces a new ring beneath its bark each year. The width of a ring often reflects the conditions in which the tree grew. During favorable years, when water and sunlight are plentiful, growth may be relatively rapid. In colder or drier years, the resulting ring may be narrower. Scientists compare patterns from living trees with those found in old timber to construct records extending far into the past.',
    'Languages have always borrowed words from one another. When communities interact through trade, migration, conquest, science, or popular culture, useful expressions can cross linguistic boundaries. A borrowed word does not necessarily remain unchanged after entering a new language. Speakers may alter its pronunciation, spelling, or even its meaning so that it fits more naturally into local patterns. Over generations, people may stop recognizing the word as foreign at all. Borrowing therefore provides linguists with valuable evidence of historical contact between different communities.',
  ];
  test31.filter((task) => task.type === 'complete-words').forEach((task, index) => {
    assert.equal(task.answers.length, 10);
    let answer = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[answer++]), expected[index]);
  });
});

test('complete-word rendering keeps each visible fragment and blank in one unspaced word unit', () => {
  const rendered = sandbox.renderCompleteWordsText('It is not neces[7] true.');
  assert.match(rendered, /<span class="incomplete-word">neces<input/);
  assert.doesNotMatch(rendered, /neces\s+<input/);
  assert.match(rendered, /maxlength="7"/);
});

test('Test 31 necessarily blank requests only the six missing characters', () => {
  const task = test31.find((entry) => entry.title === 'Task 2: Borrowed Words');
  assert.match(task.text, /neces\[6\]/);
  assert.doesNotMatch(task.text, /neces\[7\]/);
});

test('practice reveal controls begin closed and toggle accessibly', () => {
  const markup = sandbox.renderScriptControl('Woman: Hello.\n\nMan: Hi.');
  assert.match(markup, />Show Script<\/button>/);
  assert.match(markup, /Use only as a last resource :\)/);
  assert.match(markup, /class="practice-transcript" hidden/);
  assert.match(markup, /Woman: Hello\.\n\nMan: Hi\./);

  const button = { textContent: '', expanded: '', setAttribute(name, value) { if (name === 'aria-expanded') this.expanded = value; } };
  const content = { hidden: true };
  sandbox.togglePracticeReveal(button, content, 'Show Script', 'Hide Script');
  assert.equal(content.hidden, false);
  assert.equal(button.textContent, 'Hide Script');
  assert.equal(button.expanded, 'true');
});

function renderPracticeComponent(expression) {
  const content = { innerHTML: '' };
  sandbox.document.getElementById = (id) => id === 'exercise-content' ? content : null;
  vm.runInContext(expression, sandbox);
  return content.innerHTML;
}

test('Listen and Repeat hides current text, supports unlimited replay, and has no countdown', () => {
  const markup = renderPracticeComponent(`repeatSentenceIndex = 0; renderRepeatSentence(testData['Test 31'].find(task => task.type === 'listen-repeat-updated'))`);
  assert.match(markup, />Show Text<\/button>/);
  assert.match(markup, /id="repeat-text"[^>]* hidden/);
  assert.match(markup, /Play audio/);
  assert.match(markup, /role="progressbar"/);
  assert.match(markup, /Sentence 1 of 7/);
  assert.match(markup, /width:14\.2857/);
  assert.doesNotMatch(markup, /repeat-timer|00:0[89]|00:1[012]/);
  assert.doesNotMatch(sandbox.playRepeatSentence.toString(), /disabled|runTimer/);
});

test('Listen and Repeat exposes Submit & Next only on the final sentence', () => {
  const submit = { style: {} };
  const content = { innerHTML: '' };
  sandbox.document.getElementById = (id) => id === 'exercise-content' ? content : id === 'submit-btn' ? submit : null;
  vm.runInContext(`repeatSentenceIndex = 0; renderRepeatSentence(testData['Test 31'].find(task => task.type === 'listen-repeat-updated'))`, sandbox);
  assert.equal(submit.style.display, 'none');
  vm.runInContext(`repeatSentenceIndex = 6; renderRepeatSentence(testData['Test 31'].find(task => task.type === 'listen-repeat-updated'))`, sandbox);
  assert.equal(submit.style.display, 'block');
  assert.match(content.innerHTML, /Sentence 7 of 7/);
});

test('Build a Sentence renders selected chunks inline with its scaffold and identifies the extra chunk', () => {
  const elements = new Map([
    ['exercise-content', { innerHTML: '' }],
    ['skip-btn', { style: {} }],
  ]);
  sandbox.document.getElementById = (id) => elements.get(id) || null;
  vm.runInContext(`_currentTestKey = 'Test 31'; curSet = [testData['Test 31'].find(task => task.type === 'build-sentence')]; idx = 0; render();`, sandbox);
  const markup = elements.get('exercise-content').innerHTML;
  assert.match(markup, /sentence-construction/);
  assert.match(markup, /reply-scaffold[^>]*>She/);
  assert.match(markup, /reply-scaffold[\s\S]*id="d-area"/);
  assert.match(markup, /There is one extra word or phrase you do not need\./);
  assert.doesNotMatch(markup, /class="drop-area"[^>]*><\/div>/);
  const task = test31.find((entry) => entry.type === 'build-sentence');
  assert.equal(task.words.length, task.correctOrder.length + 1);

  const bank = { children: [], appendChild(node) { this.children.push(node); } };
  const inlineArea = { children: [], appendChild(node) { this.children.push(node); } };
  sandbox.document.getElementById = (id) => id === 'd-area' ? inlineArea : bank;
  const chunk = { innerText: 'said' };
  sandbox.toD(chunk);
  assert.deepEqual(inlineArea.children, [chunk]);
});

test('Interview questions start hidden, reveal on request, reset hidden, and retain 45 seconds', () => {
  let markup = renderPracticeComponent(`interviewQuestionIndex = 0; renderInterviewPrompt(testData['Test 31'].find(task => task.type === 'take-interview'))`);
  assert.match(markup, />Show Question<\/button>/);
  assert.match(markup, /id="interview-question"[^>]* hidden/);
  assert.match(markup, /id="interview-timer"[^>]*>00:45/);

  markup = renderPracticeComponent(`interviewQuestionIndex = 1; renderInterviewPrompt(testData['Test 31'].find(task => task.type === 'take-interview'))`);
  assert.match(markup, /Question 2 of 4/);
  assert.match(markup, /id="interview-question"[^>]* hidden/);
  assert.match(markup, />Show Question<\/button>/);
});

test('all ten Test 31 listening tasks expose scripts through the closed reusable control', () => {
  const listening = test31.filter((task) => task.section === 'Listening');
  assert.equal(listening.length, 10);
  for (const task of listening) {
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/, task.title);
    assert.match(markup, /practice-transcript" hidden/, task.title);
  }
});

test('updated-test architecture defines each required task family and audio contract', () => {
  for (const taskType of [
    'complete-words', 'read-daily', 'academic-reading',
    'listen-response', 'listen-conversation', 'listen-announcement-updated', 'listen-academic-talk',
    'build-sentence', 'writing-email', 'academic-discussion',
    'listen-repeat-updated', 'take-interview',
  ]) {
    assert.match(html, new RegExp(`'${taskType}'`), `${taskType} should be represented`);
  }

  assert.match(html, /repeatFiles: \['sentence-1\.mp3'[\s\S]*'sentence-7\.mp3'\]/);
  assert.match(html, /targetFilesPerTest: 17/);
  assert.match(html, /maximumFilesPerTest: 19/);
});

test('results use item-level Practice Accuracy instead of an unofficial TOEFL score', () => {
  assert.match(html, /Practice Accuracy/);
  assert.match(html, /r\.qs\.filter\(q => q\.isC\)\.length/);
  assert.match(html, /r\.ui\.filter\(\(value, i\) => value === r\.ans\[i\]\.toLowerCase\(\)\)\.length/);
  assert.match(html, /if\(r\.skipped \|\| unscoredTypes\.includes\(r\.type\)\) return/);
  assert.doesNotMatch(html, /TOEFL Band Score/);
  assert.doesNotMatch(html, /Approximate iBT Total/);
});
