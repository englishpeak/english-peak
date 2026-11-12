import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const elements = new Map();
const sandbox = {
  console, URLSearchParams, clearInterval, setInterval, setTimeout,
  window: { location: { search: '' } },
  document: { getElementById: (id) => elements.get(id) || null, querySelectorAll: () => [] },
};
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test35 = testData['Test 35'];`, sandbox);
const tasks = sandbox.test35;
const words = tasks.filter((task) => task.type === 'complete-words');
const builds = tasks.filter((task) => task.type === 'build-sentence');
const listening = tasks.filter((task) => task.section === 'Listening');
const repeat = tasks.find((task) => task.type === 'listen-repeat-updated');
const interview = tasks.find((task) => task.type === 'take-interview');

const sourcePassages = [
  'On clear nights, water droplets sometimes appear on grass and other surfaces. When the ground loses heat after sunset, nearby air may cool enough for water vapor to condense. This process occurs especially when winds are light and the sky is relatively cloudless. The droplets do not necessarily fall from clouds; instead, they develop directly on cooler objects. Dew can provide small amounts of moisture to plants and insects, although it is usually less significant than rainfall. In dry regions, even a modest overnight deposit may help small organisms survive.',
  'Before synthetic dyes became common, many textiles were colored with substances obtained from plants and insects. Artisans often crushed leaves, roots, or other materials to release compounds that could produce lasting colors. Some fabrics needed special preparation before dyeing, because certain pigments would not attach easily to fibers. Craftspeople sometimes added a substance called a mordant to help bind the dye to the cloth. The final shade could vary depending on the water, the temperature, and the length of treatment. These methods required patience and experimentation, and techniques frequently differed from one region to another.',
];
const expectedSplits = [
  [['gro', 'und', 'ground'], ['sun', 'set', 'sunset'], ['nea', 'rby', 'nearby'], ['cond', 'ense', 'condense'], ['espec', 'ially', 'especially'], ['relat', 'ively', 'relatively'], ['clou', 'dless', 'cloudless'], ['dire', 'ctly', 'directly'], ['mois', 'ture', 'moisture'], ['over', 'night', 'overnight']],
  [['crus', 'hed', 'crushed'], ['mate', 'rials', 'materials'], ['rele', 'ase', 'release'], ['prepar', 'ation', 'preparation'], ['pigm', 'ents', 'pigments'], ['att', 'ach', 'attach'], ['subs', 'tance', 'substance'], ['temper', 'ature', 'temperature'], ['experime', 'ntation', 'experimentation'], ['frequ', 'ently', 'frequently']],
];

test('Test 35 enables exactly 27 tasks in the established section sequence, with no Test 36', () => {
  assert.equal(tasks.length, 27);
  assert.deepEqual([...new Set(tasks.map((task) => task.section))], ['Reading', 'Listening', 'Writing', 'Speaking']);
  assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(tasks, (task) => task.section)).map(([key, value]) => [key, value.length])), { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 });
  assert.deepEqual([...vm.runInContext('testCollections[1].tests', sandbox)], ['Test 31', 'Test 32', 'Test 33', 'Test 34', 'Test 35']);
  assert.equal(vm.runInContext("testData['Test 36']", sandbox), undefined);
});

test('all 20 locked splits reconstruct the exact source passages with intact first sentences', () => {
  words.forEach((task, taskIndex) => {
    const blanks = [...task.text.matchAll(/([\p{L}]+)\[(\d+)\]/gu)];
    assert.equal(task.answers.length, 10);
    assert.equal(blanks.length, 10);
    const firstSentence = sourcePassages[taskIndex].split('. ')[0] + '.';
    assert.ok(task.text.startsWith(firstSentence));
    blanks.forEach((blank, index) => {
      const [prefix, suffix, word] = expectedSplits[taskIndex][index];
      assert.equal(blank[1], prefix);
      assert.equal(task.answers[index], suffix);
      assert.equal(Number(blank[2]), suffix.length);
      assert.equal(prefix + suffix, word);
    });
    let answerIndex = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[answerIndex++]), sourcePassages[taskIndex]);
    const markup = sandbox.renderCompleteWordsText(task.text);
    assert.equal((markup.match(/class="incomplete-word"/g) || []).length, 10);
    assert.doesNotMatch(markup, /class="incomplete-word">[^<]*(?:\s|&nbsp;|\u00a0|\u200b)<input/);
    expectedSplits[taskIndex].forEach(([prefix, suffix]) => {
      assert.ok(markup.includes(`class="incomplete-word">${prefix}<input`));
      assert.ok(markup.includes(`maxlength="${suffix.length}"`));
    });
  });
});

test('all 35 MC items retain each supplied key, option order, and A8/B9/C9/D9 distribution', () => {
  const sectionQuestions = ['Reading', 'Listening'].map((section) => tasks.filter((task) => task.section === section).flatMap((task) => task.questions || (task.options ? [task] : [])));
  const expectedKeys = ['CDBADCBADCBADBACD', 'ABDCBCDABCDACBCDAB'];
  const distribution = (questions) => Object.fromEntries('ABCD'.split('').map((letter, index) => [letter, questions.filter((q) => q.correct === index).length]));
  assert.deepEqual(sectionQuestions.map((qs) => qs.length), [17, 18]);
  sectionQuestions.forEach((questions, index) => {
    questions.forEach((q) => assert.equal(q.options.length, 4));
    assert.equal(questions.map((q) => 'ABCD'[q.correct]).join(''), expectedKeys[index]);
  });
  assert.deepEqual(distribution(sectionQuestions[0]), { A: 4, B: 4, C: 4, D: 5 });
  assert.deepEqual(distribution(sectionQuestions[1]), { A: 4, B: 5, C: 5, D: 4 });
  assert.deepEqual(distribution(sectionQuestions.flat()), { A: 8, B: 9, C: 9, D: 9 });
  assert.deepEqual(Array.from(tasks.filter((task) => ['read-daily', 'academic-reading'].includes(task.type)), (task) => task.questions.length), [2, 2, 3, 5, 5]);
  assert.deepEqual(Array.from(listening.filter((task) => task.questions), (task) => task.questions.length), [2, 2, 1, 1, 4, 4]);
});

test('all 17 exact audio paths exist and every listening script starts hidden', () => {
  assert.equal(listening.length, 10);
  const paths = [...listening.map((task) => task.audioUrl), ...repeat.sentences.map((sentence) => sentence.audio)];
  assert.equal(new Set(paths).size, 17);
  assert.deepEqual(paths.map((path) => path.split('/').pop()), ['task-8.mp3', 'task-9.mp3', 'task-10.mp3', 'task-11.mp3', 'task-15.mp3', 'task-16.mp3', 'task-18.mp3', 'task-19.mp3', 'task-20.mp3', 'task-21.mp3', ...Array.from({ length: 7 }, (_, index) => `sentence-${index + 1}.mp3`)]);
  paths.forEach((path) => {
    assert.ok(path.startsWith('../audio/ibt/test-35/'));
    assert.ok(statSync(new URL(path, import.meta.url)).size > 0);
  });
  listening.forEach((task) => {
    assert.ok(task.script);
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /Use only as a last resource :\)/);
    assert.match(markup, /practice-transcript" hidden/);
    assert.ok(markup.includes(task.script));
  });
  assert.equal(interview.audioUrl, undefined);
});

test('six sentence tasks retain the supplied mixed order, one distractor, and exact completed sentences', () => {
  const chunks = [
    ['all the documents', 'needed for', 'am gathering', "I've gathered", 'it'],
    ['to next week', 'was postponing', 'without notice', 'had been', 'postponed'],
    ['online tutorials', 'at home', 'watched', 'by watching', 'and practicing'],
    ['the changes', 'approves', 'will approved', 'as soon as', 'the manager'],
    ['has already', 'is passing', 'passed', 'whether', 'the deadline'],
    ['again', 'explain', 'me to', 'explaining', 'the last step'],
  ];
  const sentences = ["Not yet, but I've gathered all the documents needed for it.", 'The lecture had been postponed to next week without notice.', 'I learned by watching online tutorials and practicing at home.', "I'll send them as soon as the manager approves the changes.", "I'm not sure whether the deadline has already passed.", 'She asked me to explain the last step again.'];
  assert.equal(builds.length, 6);
  builds.forEach((task, index) => {
    assert.deepEqual([...task.words], chunks[index]);
    assert.equal(task.preserveChunkOrder, true);
    assert.equal(task.correctOrder.length, 4);
    assert.deepEqual([...task.words.filter((word) => !task.correctOrder.includes(word))], [task.distractor]);
    assert.equal(task.scaffold.replace(/(?:\s*_+)+/, ' ' + task.correctOrder.join(' ')), sentences[index]);
    assert.equal(task.completedSentence, sentences[index]);
  });
  assert.equal(tasks.find((task) => task.type === 'writing-email').time, 420);
  assert.equal(tasks.find((task) => task.type === 'academic-discussion').time, 600);
});

test('Listen and Repeat keeps one hidden sentence at a time without a countdown and gates Submit until 7/7', () => {
  assert.equal(repeat.sentences.length, 7);
  assert.equal(repeat.sentences[0].text, 'Welcome to the university radio station.');
  elements.set('submit-btn', { style: {} });
  repeat.sentences.forEach((sentence, index) => {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`repeatSentenceIndex = ${index}; renderRepeatSentence(testData['Test 35'].find(task => task.type === 'listen-repeat-updated'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, new RegExp(`Sentence ${index + 1} of 7`));
    assert.match(markup, /id="repeat-text"[^>]* hidden/);
    assert.equal(elements.get('submit-btn').style.display, index === 6 ? 'block' : 'none');
    assert.equal(markup.includes('Continue to next sentence'), index < 6);
    assert.equal(sentence.script, sentence.text);
    assert.ok(markup.includes(sentence.text));
    assert.doesNotMatch(markup, /timer|countdown/i);
  });
});

test('four interview prompts each start hidden with their own 45-second response window', () => {
  assert.equal(interview.questions.length, 4);
  assert.equal(interview.responseTime, 45);
  interview.questions.forEach((question, index) => {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`interviewQuestionIndex = ${index}; renderInterviewPrompt(testData['Test 35'].find(task => task.type === 'take-interview'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, /id="interview-question"[^>]* hidden/);
    assert.match(markup, />Show Question<\/button>/);
    assert.match(markup, /id="interview-timer"[^>]*>00:45/);
    assert.ok(markup.includes(question));
  });
});

test('Practice Accuracy counts 61 individual objective items and excludes all four extended task types', () => {
  const resultData = tasks.map((task) => {
    const result = { type: task.type, title: task.title, isCorrect: true };
    if (task.type === 'complete-words') Object.assign(result, { ui: [...task.answers], ans: task.answers, raw: task.text });
    else if (task.section !== 'Speaking' && task.questions) result.qs = task.questions.map((q) => ({ isC: true, qText: q.q, cVal: q.options[q.correct], uVal: q.options[q.correct] }));
    return result;
  });
  resultData[0].ui[0] = 'wrong';
  resultData[0].isCorrect = false;
  resultData[2].qs[0].isC = false;
  resultData[2].isCorrect = false;
  resultData.filter((result) => ['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(result.type)).forEach((result) => { result.isCorrect = false; });
  sandbox.resultData = resultData;
  elements.set('screen-results', { classList: { add() {} } });
  elements.set('score-display', { innerHTML: '' });
  elements.set('feedback-display', { innerHTML: '' });
  vm.runInContext("_currentTestKey = 'Test 35'; results = resultData; finish();", sandbox);
  const score = elements.get('score-display').innerHTML;
  assert.match(score, /97%/);
  assert.match(score, /<strong>59<\/strong> correct out of <strong>61<\/strong>/);
  assert.match(score, /Practice Accuracy/);
  assert.match(score, /Writing and Speaking practice tasks are not included in automatic scoring/);
  assert.doesNotMatch(score, /120|TOEFL band/i);
});

test('Tests 1–34 retain their original data exactly', () => {
  const priorData = vm.runInContext('JSON.stringify(Object.fromEntries(Object.entries(testData).filter(([key]) => key !== "Test 35")))', sandbox);
  assert.equal(createHash('sha256').update(priorData).digest('hex'), '9ccc1b6096bad4afcee744ce230a6c81a7aca0c66cac8eeb27ad34b49a485e7e');
});
