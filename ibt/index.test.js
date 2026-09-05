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
