import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { ACCESS, LISTEN_WRITE_SETS, isCorrect, scrambleWords, words } from './data.js';

const set = LISTEN_WRITE_SETS.find(set => set.number === 6);
const answers = [
  "I was about to leave the house when I realized I'd forgotten my wallet.",
  'How often do you visit your grandparents?',
  'The negotiations would have been far more productive had both parties been willing to compromise.',
  "She's been putting off making a decision because she's afraid of disappointing her colleagues.",
  'Can you show me how to use this machine?',
  'What surprised me most was how quickly everyone adjusted to the unexpected changes.',
  'The company has come under increasing scrutiny following allegations of financial misconduct.',
  'We might as well take a taxi since the last bus has already left.',
  'Had it not been for her persistence, the entire investigation might have been called off.',
  "I'm not entirely convinced that postponing the announcement will make the situation any easier to manage."
];

test('Test 6 preserves the exact content, audio mapping, and existing access tiers', async () => {
  assert.equal(set.title, 'Test 6');
  assert.equal(set.access, ACCESS.PLUS);
  assert.deepEqual(LISTEN_WRITE_SETS.map(set => set.access), [ACCESS.PUBLIC, ACCESS.REGISTERED, ACCESS.REGISTERED, ACCESS.PLUS, ACCESS.PLUS, ACCESS.PLUS]);
  assert.deepEqual(set.items.map(item => item.answer), answers);
  set.items.forEach((item, index) => assert.equal(item.audio, `/audio/listen-and-write/test-6/sentence-${index + 1}.mp3`));
  await assert.rejects(stat(new URL('../audio/listen-and-write/test-6/.gitkeep', import.meta.url)), { code:'ENOENT' });
});

function assertScrambled(answer, order) {
  const tokens = words(answer);
  const original = tokens.map((_, index) => index);
  const displayed = order.map(index => tokens[index]);
  assert.deepEqual([...order].sort((a, b) => a - b), original);
  // Comparing tokens as well as indices protects repeated words.
  assert.deepEqual([...displayed].sort(), [...tokens].sort());
  const half = Math.ceil(tokens.length / 2);
  const alphabetical = [...tokens].sort((a, b) => a.localeCompare(b));
  const patterns = [
    tokens, [...tokens].reverse(), alphabetical, [...alphabetical].reverse(),
    tokens.filter((_, i) => i % 2 === 0).concat(tokens.filter((_, i) => i % 2 === 1)),
    tokens.slice(half).concat(tokens.slice(0, half)),
    ...tokens.slice(1).map((_, i) => tokens.slice(i + 1).concat(tokens.slice(0, i + 1)))
  ];
  patterns.forEach(pattern => assert.notDeepEqual(displayed, pattern));
}

test('all 10 Test 6 Easy banks preserve tokens and reject recognizable orders over 100 shuffles each', () => {
  let seed = 6;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  set.items.forEach(item => {
    assertScrambled(item.answer, item.scramble);
    const sequences = new Set();
    for (let attempt = 0; attempt < 100; attempt++) {
      const order = scrambleWords(item.answer, random);
      assertScrambled(item.answer, order);
      sequences.add(order.join(','));
    }
    assert.ok(sequences.size > 1, 'banks vary across shuffles');
    assert.ok(isCorrect(words(item.answer).join(' '), item.answer));
  });
  const tokens = set.items.flatMap(item => words(item.answer));
  ["I'd", "She's", "she's", "I'm"].forEach(token => assert.ok(tokens.includes(token)));
  assert.equal(words(set.items[9].answer).filter(token => token === 'the').length, 2);
});

test('all 10 Test 6 Medium prompts have balanced, distributed, varied blanks and reconstruct exactly', () => {
  let nonAlternating = 0;
  set.items.forEach(item => {
    const tokens = item.medium.split(/\s+/u);
    const missing = tokens.flatMap((token, i) => token.startsWith('[blank]') ? [i] : []);
    assert.equal(missing.length, item.blanks.length);
    assert.ok(Math.abs(item.blanks.length - tokens.length / 2) <= 0.5);
    const middle = Math.floor(tokens.length / 2);
    assert.ok(missing.some(i => i < middle) && missing.some(i => i >= middle));
    assert.ok(tokens.some((token, i) => i < middle && !token.startsWith('[blank]')));
    assert.ok(tokens.some((token, i) => i >= middle && !token.startsWith('[blank]')));
    if (missing.some((value, i) => i > 0 && value - missing[i - 1] !== 2)) nonAlternating++;
    let blank = 0;
    assert.equal(item.medium.replace(/\[blank\]/g, () => item.blanks[blank++]), item.answer);
    item.blanks.forEach(expected => {
      assert.ok(isCorrect(`  ${expected.toUpperCase()}  `, expected));
      assert.ok(!isCorrect(`${expected}x`, expected));
      assert.ok(!isCorrect('', expected));
    });
  });
  assert.ok(nonAlternating >= 8, 'blank patterns vary across the test');
});

test('all 10 Test 6 Hard answers normalize presentation while rejecting meaningful errors', () => {
  set.items.forEach(item => {
    const plain = item.answer.replace(/[.?!]+$/u, '');
    [item.answer, plain, `${plain}!`, `${plain}?`, `  ${plain.toUpperCase().replace(/ /g, '   ')}  `].forEach(answer => assert.ok(isCorrect(answer, item.answer)));
    [plain.slice(1), plain.replace(/\S+\s/u, ''), `${plain} really`, words(item.answer).reverse().join(' ')].forEach(answer => assert.ok(!isCorrect(answer, item.answer)));
    if (plain.includes("'")) {
      assert.ok(!isCorrect(plain.replace(/'/g, ''), item.answer));
      assert.ok(!isCorrect(plain.replace(/'(?:d|s|m)\b/u, "'ll"), item.answer));
    }
  });
  assert.ok(!isCorrect('How often does you visit your grandparents?', set.items[1].answer));
  assert.ok(!isCorrect('Can you show me how to use this device?', set.items[4].answer));
});
