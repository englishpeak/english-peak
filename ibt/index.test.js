import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
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
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.practiceTests = testData; globalThis.testHref = buildTestHref("Test 31");`, sandbox);
const {
  'Test 31': test31, 'Test 32': test32, 'Test 33': test33, 'Test 39': test39,
} = sandbox.practiceTests;
const updatedTestKeys = Array.from({ length: 9 }, (_, index) => `Test ${index + 31}`);
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
  assert.deepEqual([...sandbox.testCollections[1].tests], updatedTestKeys);
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

test('every full-access tier sends Tests 31–39 in the iframe allowed parameter', () => {
  for (const tier of ['admin', 'premium', 'teacher', 'student', 'courtesy']) {
    const access = parentIBTAccess(tier);
    assert.equal(access.allowed.length, 39, tier);
    assert.deepEqual(access.allowed.slice(-updatedTestKeys.length), updatedTestKeys, tier);
    assert.deepEqual(new URLSearchParams(access.frameSrc.split('?')[1]).get('allowed').split(',').slice(-updatedTestKeys.length), updatedTestKeys, tier);
  }
});

test('guest and free iframe access remains restricted', () => {
  assert.deepEqual(parentIBTAccess('visitor').allowed, ['Test 1', 'Test 2']);
  assert.deepEqual(parentIBTAccess('free').allowed, ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']);
});

test('Test 36 catalog control opens for full access and remains locked without access', () => {
  const allowed = catalogControl({ allowedTests: ['Test 36'], populatedTests: ['Test 36'], key: 'Test 36' });
  assert.equal(allowed.control.disabled, false);
  allowed.control.click();
  assert.deepEqual(allowed.started, ['Test 36']);
  const locked = catalogControl({ allowedTests: [], populatedTests: ['Test 36'], key: 'Test 36' });
  assert.match(locked.control.textContent, /^🔒 Test 36$/);
  locked.control.click();
  assert.deepEqual(locked.started, []);
  assert.deepEqual(locked.upgrades, ['Test 36']);
});

test('Test 37 catalog control opens for full access and remains locked without access', () => {
  const allowed = catalogControl({ allowedTests: ['Test 37'], populatedTests: ['Test 37'], key: 'Test 37' });
  assert.equal(allowed.control.disabled, false);
  allowed.control.click();
  assert.deepEqual(allowed.started, ['Test 37']);
  const locked = catalogControl({ allowedTests: [], populatedTests: ['Test 37'], key: 'Test 37' });
  assert.match(locked.control.textContent, /^🔒 Test 37$/);
  locked.control.click();
  assert.deepEqual(locked.started, []);
  assert.deepEqual(locked.upgrades, ['Test 37']);
});

for (const key of ['Test 38', 'Test 39']) {
  test(`${key} catalog control opens for full access and remains locked without access`, () => {
    const allowed = catalogControl({ allowedTests: [key], populatedTests: [key], key });
    assert.equal(allowed.control.disabled, false);
    allowed.control.click();
    assert.deepEqual(allowed.started, [key]);
    const locked = catalogControl({ allowedTests: [], populatedTests: [key], key });
    assert.equal(locked.control.textContent, `🔒 ${key}`);
    locked.control.click();
    assert.deepEqual(locked.started, []);
    assert.deepEqual(locked.upgrades, [key]);
  });
}

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
  vm.runInNewContext(`${catalogSource}\n_buildIBTMenu();`, behaviorSandbox);
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
  const test31Source = html.slice(html.indexOf('testData["Test 31"]'), html.indexOf('testData["Test 32"]'));
  const sections = [...test31Source.matchAll(/section:'(Reading|Listening|Writing|Speaking)'/g)].map((match) => match[1]);
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
  const inlineArea = {
    children: [],
    appendChild(node) { this.children.push(node); },
    closest(selector) { return selector === '.sentence-construction'; },
    replaceChildren(...nodes) {
      this.nodes = nodes;
      this.children = nodes.filter((node) => typeof node !== 'string');
    },
  };
  sandbox.document.getElementById = (id) => id === 'd-area' ? inlineArea : bank;
  const chunk = { innerText: 'said' };
  sandbox.toD(chunk);
  assert.deepEqual(inlineArea.children, [chunk]);
  const nextChunk = { innerText: 'she' };
  sandbox.toD(nextChunk);
  assert.deepEqual(inlineArea.nodes, [chunk, ' ', nextChunk]);
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


test('Test 32 is enabled in the updated catalog and preserves the complete section sequence', () => {
  assert.equal(test32.length, 27);
  assert.deepEqual([...new Set(test32.map((task) => task.section))], ['Reading', 'Listening', 'Writing', 'Speaking']);
  const result = catalogControl({ allowedTests: ['Test 32'], populatedTests: ['Test 32'], key: 'Test 32' });
  assert.equal(result.control.disabled, false);
  result.control.click();
  assert.deepEqual(result.started, ['Test 32']);
});

test('Test 32 has the expected task and item counts', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(test32, (task) => task.section)).map(([section, tasks]) => [section, tasks.length])), { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 });
  const count = test32.reduce((total, task) => {
    if (['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(task.type)) return total;
    if (task.type === 'complete-words') return total + task.answers.length;
    if (task.questions) return total + task.questions.length;
    return total + 1;
  }, 0);
  assert.equal(count, 61);
});

test('all twenty Test 32 complete-word prefixes and suffixes reconstruct exactly', () => {
  const expected = [
    'Cities are often warmer than the rural areas surrounding them. Materials such as asphalt and concrete absorb solar energy during the day and release heat slowly after sunset. Buildings can also reduce air circulation, while vehicles and cooling systems produce additional heat. This phenomenon, known as the urban heat island effect, can raise nighttime temperatures considerably. Planting trees and creating green roofs may help moderate the effect because vegetation provides shade and cools the surrounding air through evaporation.',
    "Sleep plays an important role in the formation of long-term memories. During waking hours, the brain continuously receives new information, but not all of it will be retained. Research suggests that processes occurring during sleep help stabilize some recently acquired memories. Different stages of sleep may contribute in different ways, and scientists are still investigating the mechanisms involved. Although sleep cannot replace effective study, adequate rest after learning may improve a person's ability to remember information later.",
  ];
  test32.filter((task) => task.type === 'complete-words').forEach((task, taskIndex) => {
    assert.equal(task.answers.length, 10);
    let index = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[index++]), expected[taskIndex]);
    assert.match(sandbox.renderCompleteWordsText(task.text), /class="incomplete-word">[^<]+<input/g);
    assert.doesNotMatch(sandbox.renderCompleteWordsText(task.text), /class="incomplete-word">[^<]+\s+<input/g);
  });
});

test('Test 32 uses every supplied audio path and closed script controls', () => {
  const listening = test32.filter((task) => task.section === 'Listening');
  assert.equal(listening.length, 10);
  for (const task of listening) {
    assert.match(task.audioUrl, /^\.\.\/audio\/ibt\/test-32\/task-(8|9|10|11|15|16|18|19|20|21)\.mp3$/);
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /practice-transcript" hidden/);
  }
  const repeat = test32.find((task) => task.type === 'listen-repeat-updated');
  assert.deepEqual([...repeat.sentences].map((sentence) => sentence.audio), Array.from({ length: 7 }, (_, index) => `../audio/ibt/test-32/sentence-${index + 1}.mp3`));
});

test('Test 32 extended tasks retain established timing and sentence behavior', () => {
  assert.equal(test32.find((task) => task.type === 'writing-email').time, 420);
  assert.equal(test32.find((task) => task.type === 'academic-discussion').time, 600);
  assert.equal(test32.find((task) => task.type === 'take-interview').responseTime, 45);
  for (const task of test32.filter((entry) => entry.type === 'build-sentence')) assert.equal(task.words.length, task.correctOrder.length + 1);
  const repeat = test32.find((task) => task.type === 'listen-repeat-updated');
  assert.equal(repeat.sentences.length, 7);
  const markup = renderPracticeComponent(`repeatSentenceIndex = 0; renderRepeatSentence(testData['Test 32'].find(task => task.type === 'listen-repeat-updated'))`);
  assert.match(markup, /Sentence 1 of 7/);
  assert.match(markup, />Show Text<\/button>/);
});

test('Test 33 is enabled with the complete updated practice sequence', () => {
  assert.equal(test33.length, 27);
  assert.deepEqual([...new Set(test33.map((task) => task.section))], ['Reading', 'Listening', 'Writing', 'Speaking']);
  assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(test33, (task) => task.section)).map(([section, tasks]) => [section, tasks.length])), { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 });
  const result = catalogControl({ allowedTests: ['Test 33'], populatedTests: ['Test 33'], key: 'Test 33' });
  assert.equal(result.control.disabled, false);
});

test('all twenty Test 33 prefix and suffix pairs reconstruct exactly without DOM separators', () => {
  const expected = [
    'Coral reefs support an extraordinary variety of marine life. Although corals may resemble rocks or plants, they are colonies of small animals that live together. Many reef-building corals maintain a close relationship with tiny algae living inside their tissues. The algae use sunlight to produce nutrients, some of which are transferred to the coral. In return, the algae receive shelter and access to compounds they need for photosynthesis. This partnership helps corals grow efficiently in tropical waters where certain nutrients may be scarce.',
    'Writing systems allowed people to preserve information beyond the limits of human memory. Some early systems developed from visual symbols representing objects, quantities, or ideas. Over time, however, written signs could acquire more abstract functions, including the representation of sounds. This change made it possible to record a much wider range of language. Writing did not develop in exactly the same way in every society, and different systems often combined several principles. Their invention nevertheless transformed administration, trade, literature, and the transmission of knowledge across generations.',
  ];
  test33.filter((task) => task.type === 'complete-words').forEach((task, taskIndex) => {
    assert.equal(task.answers.length, 10);
    let answer = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[answer++]), expected[taskIndex]);
    const markup = sandbox.renderCompleteWordsText(task.text);
    assert.equal((markup.match(/class="incomplete-word"/g) || []).length, 10);
    assert.equal((markup.match(/<\/span>/g) || []).length, 10);
    assert.doesNotMatch(markup, /class="incomplete-word">[^<]+\s+<input/);
    assert.doesNotMatch(markup, /class="incomplete-word">[^<]+&nbsp;<input/);
  });
});

test('Test 33 uses all exact audio paths with hidden listening scripts', () => {
  const listening = test33.filter((task) => task.section === 'Listening');
  assert.equal(listening.length, 10);
  assert.deepEqual([...listening].map((task) => task.audioUrl), [8,9,10,11,15,16,18,19,20,21].map((number) => `../audio/ibt/test-33/task-${number}.mp3`));
  for (const task of listening) {
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /practice-transcript" hidden/);
  }
  const repeat = test33.find((task) => task.type === 'listen-repeat-updated');
  assert.deepEqual([...repeat.sentences].map((sentence) => sentence.audio), Array.from({length: 7}, (_, index) => `../audio/ibt/test-33/sentence-${index + 1}.mp3`));
});

test('Test 33 conversation audio is normalized for continuous browser playback', () => {
  assert.equal(sandbox.requiresContinuousAudioSource('../audio/ibt/test-33/task-15.mp3'), true);
  assert.equal(sandbox.requiresContinuousAudioSource('../audio/ibt/test-33/task-16.mp3'), true);
  assert.equal(sandbox.requiresContinuousAudioSource('../audio/ibt/test-33/task-18.mp3'), false);

  const conversationFrame = new Uint8Array(384);
  conversationFrame.set([0xff, 0xf3, 0xc4, 0xc4]);
  const compatibilityFrame = new Uint8Array(291);
  compatibilityFrame.set([0xff, 0xe3, 0x18, 0xc4]);
  const input = new Uint8Array(conversationFrame.length * 2 + compatibilityFrame.length);
  input.set(conversationFrame, 0);
  input.set(compatibilityFrame, conversationFrame.length);
  input.set(conversationFrame, conversationFrame.length + compatibilityFrame.length);

  const normalized = sandbox.normalizeConversationMp3(input.buffer);
  assert.equal(normalized.length, conversationFrame.length * 2);
  assert.deepEqual([...normalized.subarray(0, 4)], [0xff, 0xf3, 0xc4, 0xc4]);
  assert.deepEqual([...normalized.subarray(384, 388)], [0xff, 0xf3, 0xc4, 0xc4]);
});

test('Test 33 scoring and extended-task contracts match Tests 31 and 32', () => {
  const objectiveCount = test33.reduce((total, task) => {
    if (['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(task.type)) return total;
    if (task.type === 'complete-words') return total + task.answers.length;
    if (task.questions) return total + task.questions.length;
    return total + 1;
  }, 0);
  assert.equal(objectiveCount, 61);
  assert.equal(test33.find((task) => task.type === 'writing-email').time, 420);
  assert.equal(test33.find((task) => task.type === 'academic-discussion').time, 600);
  assert.equal(test33.find((task) => task.type === 'take-interview').responseTime, 45);
  test33.filter((task) => task.type === 'build-sentence').forEach((task) => assert.equal(task.words.length, task.correctOrder.length + 1));
  assert.equal(test33.find((task) => task.type === 'listen-repeat-updated').sentences.length, 7);
});

test('Test 39 reconstructs both source passages using the 20 locked suffixes', () => {
  const expected = [
    {
      text: 'Many trees produce a new layer of wood around their trunks each growing season. In regions with distinct seasons, growth is often rapid in spring and slower toward the end of summer. This difference can create visible bands, which appear as rings when a trunk is cut across. Scientists compare patterns of wide and narrow rings to investigate conditions that affected a tree during its lifetime. However, ring width does not reflect rainfall alone; temperature, competition, and disturbances such as insect outbreaks may also influence growth. Researchers often examine samples from multiple trees before drawing conclusions about past environments.',
      prefixes: ['dist', 'rap', 'diff', 'vis', 'Scien', 'patt', 'invest', 'life', 'compe', 'concl'],
      suffixes: ['inct', 'id', 'erence', 'ible', 'tists', 'erns', 'igate', 'time', 'tition', 'usions'],
    },
    {
      text: 'Public libraries expanded access to books long before digital resources became common. In many towns, early lending programs relied on donations and modest membership fees. As municipal governments began supporting libraries, more residents could borrow materials without purchasing them. Librarians developed catalogs to organize growing collections, while reading rooms offered quiet spaces for study. Over time, libraries added newspapers, lectures, and educational programs that served diverse communities. Their role continues to evolve as they provide internet access and help visitors evaluate information. Although their services have changed, the central goal of sharing knowledge remains remarkably consistent.',
      prefixes: ['lend', 'dona', 'muni', 'resi', 'Libr', 'cata', 'colle', 'educ', 'eval', 'cons'],
      suffixes: ['ing', 'tions', 'cipal', 'dents', 'arians', 'logs', 'ctions', 'ational', 'uate', 'istent'],
    },
  ];
  const passages = test39.filter((task) => task.type === 'complete-words');
  assert.equal(passages.length, 2);
  expected.forEach(({ text, prefixes, suffixes }, index) => {
    const passage = passages[index];
    assert.equal(passage.text.split('. ')[0], text.split('. ')[0]);
    assert.deepEqual([...passage.answers], suffixes);
    const matches = [...passage.text.matchAll(/(\w+)\[(\d+)\]/g)];
    assert.deepEqual(matches.map(([, prefix]) => prefix), prefixes);
    assert.deepEqual(matches.map(([, , size]) => Number(size)), suffixes.map((suffix) => suffix.length));
    let answer = 0;
    assert.equal(passage.text.replace(/\[\d+\]/g, () => passage.answers[answer++]), text);
    const markup = sandbox.renderCompleteWordsText(passage.text);
    assert.deepEqual([...markup.matchAll(/class="incomplete-word">(\w+)<input/g)].map(([, prefix]) => prefix), prefixes);
  });
});

test('Test 39 has the supplied question order, answer distribution, and 61 objective items', () => {
  const [reading, listening, writing, speaking] = ['Reading', 'Listening', 'Writing', 'Speaking']
    .map((section) => [...test39].filter((task) => task.section === section));
  assert.deepEqual([...test39], [...reading, ...listening, ...writing, ...speaking]);
  assert.deepEqual([reading.length, listening.length, writing.length, speaking.length], [7, 10, 8, 2]);

  const readingGroups = reading.slice(2).map((task) => [...task.questions]);
  const listeningGroups = listening.map((task) => task.questions ? [...task.questions] : [task]);
  const groupKeys = (groups) => groups.map((group) => group.map(({ correct }) => 'ABCD'[correct]).join(''));
  assert.deepEqual(groupKeys(readingGroups), ['DB', 'AC', 'CDA', 'BDCAB', 'CABDC']);
  assert.deepEqual(groupKeys(listeningGroups), ['C', 'A', 'D', 'B', 'DC', 'BA', 'D', 'B', 'CADB', 'DBCA']);

  const readingMC = readingGroups.flat();
  const listeningMC = listeningGroups.flat();
  const countAnswers = (questions) => [0, 1, 2, 3].map((index) => questions.filter(({ correct }) => correct === index).length);
  for (const { options, correct } of [...readingMC, ...listeningMC]) {
    assert.equal(new Set(options).size, 4);
    assert.ok(options[correct]);
  }
  assert.deepEqual(countAnswers(readingMC), [4, 4, 5, 4]);
  assert.deepEqual(countAnswers(listeningMC), [4, 5, 4, 5]);
  assert.deepEqual(countAnswers([...readingMC, ...listeningMC]), [8, 9, 9, 9]);

  const sentenceTasks = writing.filter((task) => task.type === 'build-sentence');
  assert.equal(sentenceTasks.length, 6);
  const objectiveCount = reading[0].answers.length + reading[1].answers.length
    + readingMC.length + listeningMC.length + sentenceTasks.length;
  assert.equal(objectiveCount, 61);
  for (const task of sentenceTasks) {
    assert.equal(task.preserveChunkOrder, true);
    assert.deepEqual([...task.words], [...task.chunks]);
    assert.equal(new Set(task.words).size, 5);
    assert.equal(task.correctOrder.length, 4);
    assert.deepEqual([...task.words].filter((word) => !task.correctOrder.includes(word)), [task.distractor]);
    let chunk = 0;
    assert.equal(task.scaffold.replace(/______/g, () => task.correctOrder[chunk++]), task.completedSentence);
  }
  assert.equal(writing[6].type, 'writing-email');
  assert.equal(writing[6].time, 420);
  assert.equal(writing[7].type, 'academic-discussion');
  assert.equal(writing[7].time, 600);
  assert.equal(speaking[0].type, 'listen-repeat-updated');
  assert.equal(speaking[1].type, 'take-interview');
  assert.equal(speaking[1].responseTime, 45);
  assert.equal(speaking[1].questions.length, 4);
  assert.equal(speaking[1].audioUrl, undefined);
});

test('Test 39 uses all 17 existing MP3 files and the established transcript reveals', () => {
  const audioFiles = [
    ...[8, 9, 10, 11, 15, 16, 18, 19, 20, 21].map((number) => `task-${number}.mp3`),
    ...Array.from({ length: 7 }, (_, index) => `sentence-${index + 1}.mp3`),
  ];
  const listening = [...test39].filter((task) => task.section === 'Listening');
  const repeat = test39.find((task) => task.type === 'listen-repeat-updated');
  const urls = [...listening.map((task) => task.audioUrl), ...[...repeat.sentences].map((sentence) => sentence.audio)];
  assert.deepEqual(urls, audioFiles.map((file) => `../audio/ibt/test-39/${file}`));
  assert.deepEqual(readdirSync(new URL('../audio/ibt/test-39/', import.meta.url)).filter((file) => file.endsWith('.mp3')).sort(), [...audioFiles].sort());
  for (const task of listening) {
    assert.ok(task.script);
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /practice-transcript" hidden/);
  }
  for (const sentence of repeat.sentences) assert.equal(sentence.text, sentence.script);
});
