import assert from 'node:assert/strict';
import test from 'node:test';
import { TOEFL_DICTIONARY } from '../api/_lib/toefl-dictionary-data.js';
import { filterEntries } from './dictionary.js';

test('Set 1 contains exactly the 30 requested distinct words with complete entries', () => {
  const expected = 'Analyze Assess Assume Benefit Coherent Compile Comprehensive Consequently Considerable Contribute Crucial Decline Demonstrate Derive Diverse Emphasize Empirical Enhance Establish Evident Fluctuate Furthermore Generate Hypothesis Indicate Interpret Justify Maintain Significant Undergo'.split(' ');
  assert.deepEqual(TOEFL_DICTIONARY.map(entry => entry.word).sort(), expected.sort());
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

test('search ignores capitalization, sorts unsorted input, and does not mutate the bank', () => {
  const input = [...TOEFL_DICTIONARY].reverse();
  const before = [...input];
  assert.deepEqual(filterEntries(input).map(entry => entry.word), TOEFL_DICTIONARY.map(entry => entry.word));
  assert.deepEqual(filterEntries(input, '  eMPiR  ').map(entry => entry.word), ['Empirical']);
  assert.deepEqual(filterEntries(input, 'zzzzz'), []);
  assert.deepEqual(input, before);
});

test('future entries are counted and sorted without changes to presentation code', () => {
  const next = { ...TOEFL_DICTIONARY[0], id: 'future-abstract', word: 'Abstract' };
  const result = filterEntries([...TOEFL_DICTIONARY, next]);
  assert.equal(result.length, 31);
  assert.equal(result[0], next);
});
