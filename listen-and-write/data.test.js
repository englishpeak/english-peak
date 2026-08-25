import test from 'node:test'; import assert from 'node:assert/strict';
import { LISTEN_WRITE_SETS, isCorrect, normalizeAnswer, scorePercent, words } from './data.js';
test('Set 1 is complete and streams direct Dropbox audio',()=>{const set=LISTEN_WRITE_SETS[0];assert.equal(set.items.length,10);set.items.forEach((item,i)=>{const count=words(item.answer).length;assert.match(item.audio,/^https:\/\/dl\.dropboxusercontent\.com\//);assert.match(item.audio,/raw=1$/);assert.deepEqual([...item.scramble].sort((a,b)=>a-b),Array.from({length:count},(_,n)=>n));assert.notDeepEqual(item.scramble,[...item.scramble.keys()],`item ${i+1} is scrambled`)})});
test('complete-sentence validation ignores spacing, capitalization, and final punctuation',()=>{
  const expected='I haven’t seen her since we graduated from college.';
  [
    'I haven’t seen her since we graduated from college.',
    'I haven’t seen her since we graduated from college',
    'i haven’t seen her since we graduated from college.',
    'i haven’t seen her since we graduated from college',
    '  I  HAVEN’T seen her since we graduated from college!  '
  ].forEach(answer=>assert.ok(isCorrect(answer,expected),answer));

  assert.ok(isCorrect(
    'Have you ever considered moving to a different country',
    'Have you ever considered moving to a different country?'
  ));
});
test('validation remains strict about sentence content and non-final punctuation',()=>{
  const expected='I haven’t seen her since we graduated from college.';
  assert.ok(!isCorrect('I haven’t saw her since we graduated from college.',expected));
  assert.ok(!isCorrect('I have seen her since we graduated from college.',expected));
  assert.ok(!isCorrect('I haven’t seen her, since we graduated from college.',expected));
  assert.ok(!isCorrect('I havent seen her since we graduated from college.',expected));
});
test('scores are percentages',()=>{assert.equal(scorePercent(10,10),100);assert.equal(scorePercent(7,10),70)});
