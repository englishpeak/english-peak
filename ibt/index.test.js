import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
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

test('Test 31 is a content-safe placeholder rather than invented test data', () => {
  assert.doesNotMatch(html, /"Test 31": \[/);
  assert.match(html, /btn\.disabled = true/);
  assert.match(html, /Content coming soon/);
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
