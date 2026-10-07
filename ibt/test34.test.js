import assert from 'node:assert/strict';
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
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test34 = testData['Test 34'];`, sandbox);
const tasks = sandbox.test34;
const words = tasks.filter((task) => task.type === 'complete-words');
const listening = tasks.filter((task) => task.section === 'Listening');
const builds = tasks.filter((task) => task.type === 'build-sentence');
const repeat = tasks.find((task) => task.type === 'listen-repeat-updated');
const interview = tasks.find((task) => task.type === 'take-interview');

test('Test 34 contains the complete 27-task sequence and leaves Test 35 unavailable', () => {
  assert.equal(tasks.length, 27);
  assert.deepEqual([...new Set(tasks.map((task) => task.section))], ['Reading', 'Listening', 'Writing', 'Speaking']);
  assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(tasks, (task) => task.section)).map(([key, value]) => [key, value.length])), { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 });
  const catalog = vm.runInContext('testCollections[1].tests', sandbox);
  assert.deepEqual([...catalog], ['Test 31', 'Test 32', 'Test 33', 'Test 34']);
  assert.equal(vm.runInContext("testData['Test 35']", sandbox), undefined);
});

test('all 20 locked prefix/suffix pairs reconstruct exact words and retain first sentences', () => {
  const expected = [
    [['adva', 'ntage', 'advantage'], ['bree', 'ding', 'breeding'], ['throu', 'ghout', 'throughout'], ['infor', 'mation', 'information'], ['posi', 'tion', 'position'], ['magn', 'etic', 'magnetic'], ['inhe', 'rit', 'inherit'], ['exper', 'ience', 'experience'], ['parti', 'cular', 'particular'], ['subst', 'antial', 'substantial']],
    [['tech', 'niques', 'techniques'], ['fib', 'ers', 'fibers'], ['bro', 'ken', 'broken'], ['resu', 'lting', 'resulting'], ['event', 'ually', 'eventually'], ['adap', 'ted', 'adapted'], ['avai', 'lable', 'available'], ['relat', 'ively', 'relatively'], ['contri', 'buted', 'contributed'], ['circu', 'lation', 'circulation']],
  ];
  const firstSentences = [
    'Many bird species travel enormous distances during seasonal migrations.',
    'Paper gradually became an important material for recording and sharing information.',
  ];
  words.forEach((task, taskIndex) => {
    assert.equal(task.answers.length, 10);
    const blanks = [...task.text.matchAll(/([\p{L}]+)\[(\d+)\]/gu)];
    assert.equal(blanks.length, 10);
    assert.ok(task.text.startsWith(firstSentences[taskIndex]));
    blanks.forEach((blank, index) => {
      const [prefix, suffix, word] = expected[taskIndex][index];
      assert.equal(blank[1], prefix);
      assert.equal(task.answers[index], suffix);
      assert.equal(Number(blank[2]), suffix.length);
      assert.equal(prefix + suffix, word);
      assert.match(task.text.slice(blank.index + blank[0].length), /^[\s.,]/);
    });
    const markup = sandbox.renderCompleteWordsText(task.text);
    assert.equal((markup.match(/class="incomplete-word"/g) || []).length, 10);
    assert.doesNotMatch(markup, /class="incomplete-word">[^<]*(?:\s|&nbsp;)<input/);
  });
});

test('Complete the Words keeps trailing punctuation with the word when lines wrap', () => {
  const markup = sandbox.renderCompleteWordsText('An infor[6], a resu[5]; and circu[6]. Next sentence.');
  assert.match(markup, /class="incomplete-word">infor<input[^>]*>,<\/span> /);
  assert.match(markup, /class="incomplete-word">resu<input[^>]*>;<\/span> /);
  assert.match(markup, /class="incomplete-word">circu<input[^>]*>\.<\/span> Next/);
  assert.doesNotMatch(markup, /<\/span>[.,;:!?]/);
  assert.match(html, /\.incomplete-word\s*\{[^}]*white-space:\s*nowrap/);
});

test('all 35 Reading/Listening choices retain the supplied keys and approved A9/B8/C9/D9 distribution', () => {
  const bySection = ['Reading', 'Listening'].map((section) => tasks.filter((task) => task.section === section).flatMap((task) => task.questions || (task.options ? [task] : [])));
  assert.equal(bySection[0].length, 17);
  assert.equal(bySection[1].length, 18);
  const questions = bySection.flat();
  questions.forEach((question) => assert.equal(question.options.length, 4));
  const key = questions.map((question) => 'ABCD'[question.correct]);
  assert.equal(key.join(''), 'DBACDCACABDABDACB' + 'CADBDBCADCDACBBDAC');
  assert.deepEqual(Object.fromEntries('ABCD'.split('').map((letter) => [letter, key.filter((answer) => answer === letter).length])), { A: 9, B: 8, C: 9, D: 9 });
  assert.deepEqual([...listening.filter((task) => task.type === 'listen-conversation')].map((task) => task.questions.length), [2, 2]);
  assert.deepEqual([...listening.filter((task) => task.type === 'listen-academic-talk')].map((task) => task.questions.length), [4, 4]);
});

test('Test 34 uses all 17 existing audio files and hidden scripts on every listening task', () => {
  const paths = [...listening.map((task) => task.audioUrl), ...repeat.sentences.map((sentence) => sentence.audio)];
  const expected = [...[8, 9, 10, 11, 15, 16, 18, 19, 20, 21].map((n) => `../audio/ibt/test-34/task-${n}.mp3`), ...Array.from({ length: 7 }, (_, i) => `../audio/ibt/test-34/sentence-${i + 1}.mp3`)];
  assert.deepEqual(paths, expected);
  paths.forEach((path) => assert.ok(statSync(new URL(path, import.meta.url)).size > 0, path));
  listening.forEach((task) => {
    assert.ok(task.script.trim());
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /Use only as a last resource :\)/);
    assert.match(markup, /practice-transcript" hidden/);
  });
  assert.equal(interview.audioUrl, undefined);
});

test('six sentence tasks keep one distractor and build the specified complete reply', () => {
  const expected = [
    'He said he had to finish an assignment before midnight.',
    'They told me it should be delivered by Friday afternoon.',
    "The forecast says it's likely to rain later this evening.",
    'Yes, but it took longer than I expected.',
    "She isn't sure whether she'll be finished with work by then.",
    'My professor suggested that I apply for it.',
  ];
  assert.equal(builds.length, 6);
  builds.forEach((task, index) => {
    assert.equal(task.words.length, 5);
    assert.equal(task.correctOrder.length, 4);
    assert.deepEqual([...task.words.filter((word) => !task.correctOrder.includes(word))], [task.distractor]);
    assert.equal(task.scaffold.replace(/(?:\s*_+)+/, ' ' + task.correctOrder.join(' ')), expected[index]);
    assert.equal(task.completedSentence, expected[index]);
  });
  assert.equal(tasks.find((task) => task.type === 'writing-email').time, 420);
  assert.equal(tasks.find((task) => task.type === 'academic-discussion').time, 600);
});

test('all seven repeat sentences hide text and expose Submit & Next only at sentence 7', () => {
  assert.equal(repeat.sentences[0].text, "Welcome to today's onboarding session!");
  assert.equal(repeat.sentences.length, 7);
  assert.doesNotMatch(JSON.stringify(repeat), /Welcome to Maple Hall/);
  elements.set('submit-btn', { style: {} });
  for (let index = 0; index < 7; index++) {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`repeatSentenceIndex = ${index}; renderRepeatSentence(testData['Test 34'].find(task => task.type === 'listen-repeat-updated'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, new RegExp(`Sentence ${index + 1} of 7`));
    assert.match(markup, /id="repeat-text"[^>]* hidden/);
    assert.equal(elements.get('submit-btn').style.display, index === 6 ? 'block' : 'none');
    assert.equal(markup.includes('Continue to next sentence'), index < 6);
    assert.doesNotMatch(markup, /timer|countdown/i);
    assert.equal(repeat.sentences[index].script, repeat.sentences[index].text);
  }
});

test('all four interview questions start hidden and retain a 45-second response timer', () => {
  assert.equal(interview.questions.length, 4);
  assert.equal(interview.responseTime, 45);
  for (let index = 0; index < 4; index++) {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`interviewQuestionIndex = ${index}; renderInterviewPrompt(testData['Test 34'].find(task => task.type === 'take-interview'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, /id="interview-question"[^>]* hidden/);
    assert.match(markup, />Show Question<\/button>/);
    assert.match(markup, /id="interview-timer"[^>]*>00:45/);
  }
});

test('Practice Accuracy scores 61 objective subitems individually and excludes extended tasks', () => {
  const resultData = tasks.map((task) => {
    const result = { type: task.type, title: task.title, isCorrect: true };
    if (task.type === 'complete-words') Object.assign(result, { ui: [...task.answers], ans: task.answers, raw: task.text });
    else if (task.section !== 'Speaking' && task.questions) result.qs = task.questions.map((q) => ({ isC: true, qText: q.q, cVal: q.options[q.correct], uVal: q.options[q.correct] }));
    return result;
  });
  // One wrong blank and one wrong Daily Life question must lose exactly two items.
  resultData[0].ui[0] = 'incorrect';
  resultData[0].isCorrect = false;
  resultData[2].qs[0].isC = false;
  resultData[2].isCorrect = false;
  resultData.filter((result) => ['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(result.type)).forEach((result) => { result.isCorrect = false; });
  sandbox.resultData = resultData;
  elements.set('screen-results', { classList: { add() {} } });
  elements.set('score-display', { innerHTML: '' });
  elements.set('feedback-display', { innerHTML: '' });
  vm.runInContext("_currentTestKey = 'Test 34'; results = resultData; finish();", sandbox);
  const score = elements.get('score-display').innerHTML;
  assert.match(score, /97%/);
  assert.match(score, /<strong>59<\/strong> correct out of <strong>61<\/strong>/);
  assert.match(score, /Practice Accuracy/);
  assert.match(score, /Writing and Speaking practice tasks are not included in automatic scoring/);
  assert.match(score, /not an official TOEFL score/);
  assert.doesNotMatch(score, /120|TOEFL band/i);
});
