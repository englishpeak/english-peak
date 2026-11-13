import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { TOEFL_DICTIONARY } from '../api/_lib/toefl-dictionary-data.js';
import { filterEntries } from './dictionary.js';

test('Set 1 contains exactly the 30 requested distinct words with complete entries', () => {
  const expected = 'Analyze Assess Assume Benefit Coherent Compile Comprehensive Consequently Considerable Contribute Crucial Decline Demonstrate Derive Diverse Emphasize Empirical Enhance Establish Evident Fluctuate Furthermore Generate Hypothesis Indicate Interpret Justify Maintain Significant Undergo'.split(' ');
  const original = TOEFL_DICTIONARY.filter(entry => entry.id.startsWith('set-1-'));
  assert.deepEqual(original.map(entry => entry.word).sort(), expected.sort());
  // Freeze every original ID and content field while future sets are appended.
  assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), 'b96e64a282ca0da7c35721ddb5aa3b765ccda364221d0e0617dc0fc4e161d63c');
});

test('the combined dictionary contains 90 unique, complete entries including all Set 2 words', () => {
  const expected = 'Allocate Ambiguous Attribute Bias Capacity Constraint Contradict Correlate Diminish Distinguish Emerge Facilitate Inhibit Inevitable Prevalent Retain Subsequent Sustain Valid Widespread'.split(' ');
  const added = TOEFL_DICTIONARY.filter(entry => entry.id.startsWith('set-2-'));
  assert.deepEqual(added.map(entry => entry.word), expected);
  assert.equal(createHash('sha256').update(JSON.stringify(added)).digest('hex'), '5e37808f6d5d20198742a7dc35d59749c4944ec2c1c038bd5a8f803bcdafd71d');
  assert.equal(TOEFL_DICTIONARY.length, 90);
  for (const entry of added) {
    assert.equal(entry.id, 'set-2-' + entry.word.toLowerCase());
    assert.equal(entry.collocations.length, 3, entry.word);
  }
  assert.equal(new Set(TOEFL_DICTIONARY.map(entry => entry.id)).size, TOEFL_DICTIONARY.length);
  assert.equal(new Set(TOEFL_DICTIONARY.map(entry => entry.word.toLowerCase())).size, TOEFL_DICTIONARY.length);
  for (const entry of TOEFL_DICTIONARY) {
    assert.match(entry.id, /^[a-z0-9-]+$/);
    assert.ok(['noun', 'verb', 'adjective', 'adverb'].includes(entry.partOfSpeech));
    assert.ok(entry.definition.trim());
    assert.equal(entry.examples.length, 2, entry.word);
    for (const example of entry.examples) assert.ok(typeof example === 'string' && example.trim(), entry.word);
    assert.ok(Array.isArray(entry.collocations));
    for (const collocation of entry.collocations) assert.ok(collocation.trim());
    assert.doesNotMatch(entry.definition, /organised|recognised/);
  }
  assert.deepEqual(TOEFL_DICTIONARY.filter(entry => !entry.collocations.length).map(entry => entry.word), ['Consequently', 'Furthermore']);
});

test('Set 3 contains exactly the 20 requested words with stable IDs', () => {
  const expected = 'Abundant Adapt Advocate Aggregate Arbitrary Cease Constitute Detect Deviate Elaborate Exclude Infer Integrate Modify Persist Proportion Reinforce Relevant Substitute Verify'.split(' ');
  const added = TOEFL_DICTIONARY.filter(entry => entry.id.startsWith('set-3-'));
  assert.deepEqual(added.map(entry => entry.word), expected);
  assert.equal(createHash('sha256').update(JSON.stringify(added)).digest('hex'), '39530cee0100e8f3994402a8bbe45aeb6634e737d396ac846904422d6c775045');
  for (const entry of added) {
    assert.equal(entry.id, 'set-3-' + entry.word.toLowerCase());
    assert.equal(entry.examples.length, 2, entry.word);
    assert.equal(entry.collocations.length, 3, entry.word);
  }
});

test('Set 4 contains the 20 requested words with exact content and stable IDs', () => {
  const expected = 'Accumulate Adequate Alter Anticipate Approximate Attain Catalyst Coincide Controversial Deduce Deteriorate Discrete Disperse Exceed Exploit Fundamental Imply Innovative Parameter Simulate'.split(' ');
  const added = TOEFL_DICTIONARY.filter(entry => entry.id.startsWith('set-4-'));
  assert.deepEqual(added.map(entry => entry.word), expected);
  assert.equal(createHash('sha256').update(JSON.stringify(added)).digest('hex'), 'b895cd2bed52c0eb32a31de96c437d22690abda29f497b60d98c72c24945924d');
  for (const entry of added) {
    assert.equal(entry.id, 'set-4-' + entry.word.toLowerCase());
    assert.equal(entry.examples.length, 2, entry.word);
    assert.equal(entry.collocations.length, 3, entry.word);
    assert.deepEqual(filterEntries(TOEFL_DICTIONARY, `  ${entry.word.toUpperCase()}  `), [entry]);
  }
});

test('search ignores capitalization, sorts unsorted input, and does not mutate the bank', () => {
  const input = [...TOEFL_DICTIONARY].reverse();
  const before = [...input];
  assert.deepEqual(filterEntries(input).map(entry => entry.word), TOEFL_DICTIONARY.map(entry => entry.word).sort((a, b) => a.localeCompare(b, 'en-US')));
  assert.deepEqual(filterEntries(input, '  eMPiR  ').map(entry => entry.word), ['Empirical']);
  assert.deepEqual(filterEntries(input, '  aLLoC  ').map(entry => entry.word), ['Allocate']);
  assert.deepEqual(filterEntries(input, 'WIDESPREAD').map(entry => entry.word), ['Widespread']);
  assert.deepEqual(filterEntries(input, 'con').map(entry => entry.word), ['Consequently', 'Considerable', 'Constitute', 'Constraint', 'Contradict', 'Contribute', 'Controversial']);
  for (const [query, word] of [['  aBUn  ', 'Abundant'], ['CONSTITU', 'Constitute'], ['proportion', 'Proportion'], ['VERIFY', 'Verify']]) {
    assert.deepEqual(filterEntries(input, query).map(entry => entry.word), [word]);
  }
  assert.deepEqual(filterEntries(input, 'zzzzz'), []);
  assert.deepEqual(input, before);
});

test('future entries are counted and sorted without changes to presentation code', () => {
  const next = { ...TOEFL_DICTIONARY[0], id: 'future-abstract', word: 'Abstract' };
  const result = filterEntries([...TOEFL_DICTIONARY, next]);
  assert.equal(result.length, TOEFL_DICTIONARY.length + 1);
  assert.equal(result.find(entry => entry.word === 'Abstract'), next);
  assert.deepEqual(result.map(entry => entry.word), result.map(entry => entry.word).sort((a, b) => a.localeCompare(b, 'en-US')));
});
