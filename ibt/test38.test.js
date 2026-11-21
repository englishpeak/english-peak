import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(([, script]) => script);
const elements = {
  'screen-results': { classList: { add() {} } },
  'score-display': {},
  'feedback-display': {},
};
const sandbox = vm.createContext({
  console,
  URLSearchParams,
  clearInterval,
  setInterval,
  setTimeout,
  window: { location: { search: '' } },
  document: { getElementById: (id) => elements[id] ?? null, querySelectorAll: () => [] },
});
const evaluate = (script) => vm.runInContext(script, sandbox);
evaluate(scripts.join('\n'));
const tasks = JSON.parse(evaluate("JSON.stringify(testData['Test 38'])"));
const words = tasks.filter(({ type }) => type === 'complete-words');
const builds = tasks.filter(({ type }) => type === 'build-sentence');
const listening = tasks.filter(({ section }) => section === 'Listening');
const repeat = tasks.find(({ type }) => type === 'listen-repeat-updated');
const interview = tasks.find(({ type }) => type === 'take-interview');

const passages = [
  'Soap helps remove oily dirt that water alone often cannot wash away. Each soap molecule has one part that interacts with water and another that attaches to grease. When soap is mixed into water, its molecules can gather around tiny droplets of oil. Their water-attracting ends face outward, allowing the droplets to remain suspended in the liquid. Rinsing then carries the trapped grease away from the surface. Warm water and gentle rubbing may improve cleaning, but the basic process depends on the unusual structure of soap molecules.',
  'Modern touchscreens allow people to control devices without using a physical keyboard. In one common design, a transparent conductive layer lies beneath the surface of the glass. When a finger approaches or touches the screen, it changes a tiny electrical property at that location. Sensors detect the change, and a processor estimates where the contact occurred. The device then interprets the position as a command, such as opening an application or moving an image. Because the screen does not depend on pressure alone, it can respond to light touches and support several fingers at once.',
];
const splits = [
  [['mol', 'ecule'], ['inter', 'acts'], ['att', 'aches'], ['gath', 'er'], ['drop', 'lets'], ['outw', 'ard'], ['susp', 'ended'], ['Rin', 'sing'], ['trap', 'ped'], ['unus', 'ual']],
  [['trans', 'parent'], ['cond', 'uctive'], ['bene', 'ath'], ['appro', 'aches'], ['elec', 'trical'], ['Sens', 'ors'], ['proc', 'essor'], ['esti', 'mates'], ['inter', 'prets'], ['pres', 'sure']],
];

test('Test 38 follows Test 37 and retains the 27-task sequence and original Tests 1–37 data', () => {
  assert.deepEqual([...evaluate('testCollections[1].tests.slice(-2)')], ['Test 37', 'Test 38']);
  assert.equal(evaluate("testData['Test 39']"), undefined);
  assert.deepEqual(tasks.map(({ section }) => section), [
    ...Array(7).fill('Reading'), ...Array(10).fill('Listening'),
    ...Array(8).fill('Writing'), ...Array(2).fill('Speaking'),
  ]);
  const previousTests = evaluate("JSON.stringify(Object.fromEntries(Object.entries(testData).slice(0, 37)))");
  assert.equal(createHash('sha256').update(previousTests).digest('hex'), '046d0e154c1d382bc3bb3dba17367e3e16f5bcb281f7a97d969325feec13ae15');
});

test('20 locked word splits reconstruct both source passages with exact inline boundaries', () => {
  assert.equal(words.length, 2);
  words.forEach((task, index) => {
    const blanks = [...task.text.matchAll(/([\p{L}]+)\[(\d+)\]/gu)];
    assert.equal(blanks.length, 10);
    assert.deepEqual(task.answers, splits[index].map(([, suffix]) => suffix));
    assert.ok(task.text.startsWith(passages[index].split('. ')[0] + '.'));
    const markup = sandbox.renderCompleteWordsText(task.text);
    blanks.forEach(([, prefix, size], blank) => {
      const [expectedPrefix, suffix] = splits[index][blank];
      assert.equal(prefix, expectedPrefix);
      assert.equal(Number(size), suffix.length);
      assert.ok(markup.includes(`class="incomplete-word">${expectedPrefix}<input`));
    });
    let blank = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[blank++]), passages[index]);
  });
  assert.match(words[0].text, /tiny drop\[4\] of oil.*allowing the droplets to remain/);
});

test('every MC correct index keeps the authoritative key and produces A8/B9/C9/D9', () => {
  const reading = tasks.filter((task) => task.section === 'Reading' && task.questions);
  const groups = (section) => section.map((task) => task.questions ?? [task]);
  const key = (questions) => questions.map(({ correct, options }) => {
    assert.equal(new Set(options).size, 4);
    assert.ok(Number.isInteger(correct) && correct >= 0 && correct < options.length);
    return 'ABCD'[correct];
  }).join('');
  const readingKeys = groups(reading).map(key);
  const listeningKeys = groups(listening).map(key);
  assert.deepEqual(readingKeys, ['BA', 'CD', 'DAC', 'CBDBA', 'BDACC']);
  assert.deepEqual(listeningKeys, ['A', 'C', 'D', 'B', 'DC', 'BD', 'A', 'B', 'DCAB', 'CDAB']);
  const distribution = (keys) => [...'ABCD'].map((letter) => keys.filter((answer) => answer === letter).length);
  assert.deepEqual(distribution(readingKeys.join('').split('')), [4, 4, 5, 4]);
  assert.deepEqual(distribution(listeningKeys.join('').split('')), [4, 5, 4, 5]);
  assert.deepEqual(distribution([...readingKeys, ...listeningKeys].join('').split('')), [8, 9, 9, 9]);
  assert.equal(listening[2].options[listening[2].correct], "You're welcome! I'm glad they helped.");
  const densityQuestion = listening[8].questions[0];
  assert.equal(densityQuestion.options[densityQuestion.correct], 'Warmer surface water is less dense than the colder water below.');
});

test('the 17 uploaded MP3s resolve and listening scripts render behind the existing reveal control', () => {
  const audioNames = [
    ...[8, 9, 10, 11, 15, 16, 18, 19, 20, 21].map((number) => `task-${number}.mp3`),
    ...Array.from({ length: 7 }, (_, index) => `sentence-${index + 1}.mp3`),
  ];
  const audioPaths = [...listening.map(({ audioUrl }) => audioUrl), ...repeat.sentences.map(({ audio }) => audio)];
  assert.deepEqual(audioPaths, audioNames.map((name) => `../audio/ibt/test-38/${name}`));
  audioPaths.forEach((path) => assert.ok(statSync(new URL(path, import.meta.url)).size > 0, path));
  listening.forEach(({ script }) => {
    assert.ok(script);
    const markup = sandbox.renderScriptControl(script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /Use only as a last resource :\)/);
    assert.ok(markup.includes(`class="practice-transcript" hidden>${script}</div>`));
  });
  assert.ok(repeat.sentences.every(({ text, script }) => text === script));
  assert.equal(interview.audioUrl, undefined);
  assert.equal(interview.questions.length, 4);
  assert.equal(interview.responseTime, 45);
});

test('the existing conversation audio handler removes only the compatibility frames from the two uploads', () => {
  listening.forEach(({ audioUrl, type }) => {
    assert.equal(sandbox.requiresContinuousAudioSource(audioUrl), type === 'listen-conversation');
  });
  for (const { audioUrl } of listening.filter(({ type }) => type === 'listen-conversation')) {
    const source = readFileSync(new URL(audioUrl, import.meta.url));
    const { buffer, byteOffset, byteLength } = source;
    const normalized = sandbox.normalizeConversationMp3(buffer.slice(byteOffset, byteOffset + byteLength));
    const expected = [];
    for (let offset = 0; offset < source.length;) {
      const header = source.readUInt32BE(offset);
      if (header === 0xfff3c4c4) {
        expected.push(source.subarray(offset, offset + 384));
        offset += 384;
      } else {
        assert.equal(header, 0xffe318c4);
        offset += 291;
      }
    }
    assert.ok(normalized.length < source.length);
    assert.deepEqual(Buffer.from(normalized), Buffer.concat(expected));
  }
});

test('six writing items have four ordered chunks, one distractor, and exact completed replies', () => {
  const displayOrders = [
    ['with her supervisor', 'confirming', 'first', 'to confirm', 'the budget'],
    ['again', 'works', 'by Monday', 'it should', 'be working'],
    ['the safety', 'was sign', 'form', 'everyone', 'has signed'],
    ['during the trial', 'recording', 'that were', 'all the observations', 'recorded'],
    ['arriving', 'earlier', 'a connection', 'arrive', 'that would'],
    ['before', 'are reply', 'the weekend', 'I was told', 'they would reply'],
  ];
  const replies = [
    'She wanted to confirm the budget with her supervisor first.',
    'They said it should be working again by Monday.',
    "We can't begin until everyone has signed the safety form.",
    'The team included all the observations that were recorded during the trial.',
    'I found a connection that would arrive earlier.',
    'No, but I was told they would reply before the weekend.',
  ];
  assert.equal(builds.length, 6);
  builds.forEach((task, index) => {
    assert.deepEqual(task.words, displayOrders[index]);
    assert.equal(task.preserveChunkOrder, true);
    assert.equal(task.correctOrder.length, 4);
    assert.deepEqual(task.words.filter((word) => !task.correctOrder.includes(word)), [task.distractor]);
    assert.equal(task.scaffold.replace(/(?: +_+)+/, ' ' + task.correctOrder.join(' ')), replies[index]);
    assert.equal(task.completedSentence, replies[index]);
  });
  assert.equal(tasks.find(({ type }) => type === 'writing-email').time, 420);
  assert.equal(tasks.find(({ type }) => type === 'academic-discussion').time, 600);
});

test('Practice Accuracy includes all 61 objective items and scores word and MC groups individually', () => {
  sandbox.testResults = tasks.map((task) => {
    const item = { title: task.title, type: task.type, isCorrect: false };
    if (task.type === 'complete-words') {
      item.ui = [...task.answers];
      item.ans = task.answers;
      item.raw = task.text;
    } else if (task.questions && task.section !== 'Speaking') {
      item.qs = task.questions.map((q) => ({ qText: q.q, isC: true, cVal: q.options[q.correct] }));
    } else {
      item.isCorrect = task.correctOrder !== undefined || task.options !== undefined;
    }
    return item;
  });
  sandbox.testResults[0].ui[0] = 'wrong';
  sandbox.testResults[2].qs[0].isC = false;
  evaluate("_currentTestKey = 'Test 38'; results = testResults; finish();");
  assert.match(elements['score-display'].innerHTML, /Practice Accuracy/);
  assert.match(elements['score-display'].innerHTML, /<strong>59<\/strong> correct out of <strong>61<\/strong>/);
  assert.doesNotMatch(elements['score-display'].innerHTML, /120|TOEFL band/i);
});
