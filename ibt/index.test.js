import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const sandbox = {
  console,
  URLSearchParams,
  window: { location: { search: '' } },
  document: { getElementById: () => null },
};
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test31 = testData["Test 31"];`, sandbox);
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
