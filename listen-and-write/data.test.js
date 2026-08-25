import test from 'node:test'; import assert from 'node:assert/strict';
import { ACCESS, LISTEN_WRITE_SETS, isCorrect, normalizeAnswer, scorePercent, words } from './data.js';
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

  assert.ok(isCorrect(
    "I would have called you if I'd known you were still awake",
    'I would have called you if I’d known you were still awake.'
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
test('Test 2 has the requested access, order, blanks, and direct audio',()=>{
  const set=LISTEN_WRITE_SETS[1];
  const answers=[
    'By the time we arrived, most of the guests had already left.',
    'Do you mind if I open the window for a few minutes?',
    'She reluctantly agreed to take responsibility for what had happened.',
    'I can’t believe you managed to finish everything on your own.',
    'Had I known how expensive it would be, I might have reconsidered my decision.',
    'We’re running out of time, so we’d better make a decision soon.',
    'Why didn’t you tell me that you were having trouble with your car?',
    'The company is expected to announce significant changes within the next few weeks.',
    'There’s no point in arguing about something we can’t change.',
    'Although the proposal initially seemed unreasonable, it turned out to be surprisingly effective.'
  ];
  const blanks=[['arrived','left'],['mind','minutes'],['reluctantly','responsibility'],['managed','own'],['known','reconsidered'],['out','decision'],['trouble','car'],['expected','weeks'],['point','change'],['initially','effective']];
  assert.equal(set.title,'Test 2');
  assert.equal(set.access,ACCESS.REGISTERED);
  assert.equal(set.items.length,10);
  assert.deepEqual(set.items.map(item=>item.answer),answers);
  assert.deepEqual(set.items.map(item=>item.blanks),blanks);
  set.items.forEach(item=>{
    assert.equal((item.medium.match(/\[blank\]/g)||[]).length,2);
    assert.match(item.audio,/^https:\/\/dl\.dropboxusercontent\.com\//);
    assert.match(item.audio,/raw=1$/);
    assert.deepEqual([...item.scramble].sort((a,b)=>a-b),Array.from({length:words(item.answer).length},(_,i)=>i));
  });
});
