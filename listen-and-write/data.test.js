import test from 'node:test'; import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { ACCESS, LISTEN_WRITE_SETS, isCorrect, listenWriteAudio, normalizeAnswer, scorePercent, scrambleWords, words } from './data.js';

function assertGenuinelyScrambled(item, label) {
  const tokens = words(item.answer);
  const original = Array.from({ length: tokens.length }, (_, index) => index);
  const reversed = [...original].reverse();
  const oddThenEven = original.filter(index => index % 2 === 0).concat(original.filter(index => index % 2 === 1));
  const half = Math.ceil(tokens.length / 2);
  const swappedHalves = original.slice(half).concat(original.slice(0, half));
  const alphabetical = [...original].sort((a, b) => tokens[a].localeCompare(tokens[b]));

  assert.deepEqual([...item.scramble].sort((a, b) => a - b), original, `${label} contains every token exactly once`);
  assert.ok(item.scramble.every((value, index) => value !== index), `${label} moves every token from its original position`);
  assert.notDeepEqual(item.scramble.map(index => tokens[index]), tokens, `${label} is not the displayed sentence order`);
  assert.notDeepEqual(item.scramble.map(index => tokens[index]), [...tokens].reverse(), `${label} is not the displayed reverse order`);
  [original, reversed, oddThenEven, swappedHalves, alphabetical, [...alphabetical].reverse()].forEach(pattern => {
    assert.notDeepEqual(item.scramble, pattern, `${label} does not use a trivial ordering`);
  });
  original.slice(1).forEach(offset => {
    assert.notDeepEqual(item.scramble, original.map((_, index) => (index + offset) % original.length), `${label} is not a rotation`);
  });
}

test('Listen and Write generates local audio paths for current and future tests',()=>{
  assert.equal(listenWriteAudio(3,6),'/audio/listen-and-write/test-3/sentence-6.mp3');
  assert.equal(listenWriteAudio(20,9),'/audio/listen-and-write/test-20/sentence-9.mp3');
  LISTEN_WRITE_SETS.forEach(set=>{
    assert.equal(set.items.length,10);
    set.items.forEach((item,index)=>{
      assert.equal(item.audio,`/audio/listen-and-write/test-${set.number}/sentence-${index+1}.mp3`);
      assert.doesNotMatch(item.audio,/dropbox/i);
      assert.doesNotMatch(item.audio,/\?/);
    });
  });
});

test('all local Listen and Write MP3 files exist, are non-empty, and contain MP3 data',async()=>{
  for(const set of LISTEN_WRITE_SETS){
    for(let sentence=1;sentence<=10;sentence++){
      const fileUrl=new URL(`../audio/listen-and-write/test-${set.number}/sentence-${sentence}.mp3`,import.meta.url);
      assert.ok((await stat(fileUrl)).size>0,`${fileUrl.pathname} is non-empty`);
      const bytes=(await readFile(fileUrl)).subarray(0,3);
      const hasId3=bytes.toString('ascii')==='ID3';
      const hasFrameSync=bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
      assert.ok(hasId3||hasFrameSync,`${fileUrl.pathname} has an MP3 signature`);
    }
  }
});

test('every Easy word bank uses a genuine shuffle, including all Test 3 and Test 4 items',()=>{
  LISTEN_WRITE_SETS.forEach(set=>set.items.forEach((item,index)=>assertGenuinelyScrambled(item,`Test ${set.number} item ${index+1}`)));
});

test('scrambling preserves contractions as complete tokens',()=>{
  const answer="I didn't recognize him because he'd changed.";
  const shuffled=scrambleWords(answer);
  const tokens=words(answer);
  assert.deepEqual(shuffled.map(index=>tokens[index]).sort(),tokens.sort());
  assert.ok(tokens.includes("didn't"));
  assert.ok(tokens.includes("he'd"));
});
test('Medium difficulty hides every second word in Tests 1 and 2',()=>{
  LISTEN_WRITE_SETS.slice(0,2).forEach(set=>set.items.forEach(item=>{
    const sentenceWords=words(item.answer);
    assert.equal(item.blanks.length,Math.floor(sentenceWords.length/2));
    assert.equal((item.medium.match(/\[blank\]/g)||[]).length,item.blanks.length);
    assert.deepEqual(item.blanks,sentenceWords.filter((_,index)=>index%2===1).map(word=>word.replace(/[,.?!;:]+$/u,'')));
  }));
});
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
test('Test 2 has the requested access, order, blanks, and local audio',()=>{
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
  assert.equal(set.title,'Test 2');
  assert.equal(set.access,ACCESS.REGISTERED);
  assert.equal(set.items.length,10);
  assert.deepEqual(set.items.map(item=>item.answer),answers);
  set.items.forEach((item,index)=>{
    assertGenuinelyScrambled(item,`Test 2 item ${index+1}`);
    assert.equal((item.medium.match(/\[blank\]/g)||[]).length,Math.floor(words(item.answer).length/2));
    assert.equal(item.audio,`/audio/listen-and-write/test-2/sentence-${index+1}.mp3`);
    assert.deepEqual([...item.scramble].sort((a,b)=>a-b),Array.from({length:words(item.answer).length},(_,i)=>i));
  });

  const contractionTokens=set.items.flatMap(item=>words(item.answer));
  ['can’t','We’re','we’d','didn’t','There’s'].forEach(contraction=>{
    assert.ok(contractionTokens.includes(contraction),`${contraction} remains one Test 2 token`);
  });
});

test('Test 3 has the requested access, order, distributed blanks, and local audio',()=>{
  const set=LISTEN_WRITE_SETS[2];
  const answers=[
    'I forgot to bring my umbrella, so I got completely soaked on the way home.',
    'Could you please turn the music down a little bit?',
    'The new policy is unlikely to have a significant impact on most employees.',
    "We've been trying to solve this problem since early this morning.",
    'What time are you planning to leave tomorrow?',
    'She denied having shared the confidential information with anyone outside the company.',
    "I wish I'd paid more attention when she explained how the system worked.",
    'Apparently, the restaurant we wanted to try has been fully booked for weeks.',
    'Were it not for their financial support, the project would probably have been abandoned.',
    'He ended up taking the train because his flight had been canceled at the last minute.'
  ];
  assert.equal(set.title,'Test 3');
  assert.equal(set.access,ACCESS.REGISTERED);
  assert.equal(set.items.length,10);
  assert.deepEqual(set.items.map(item=>item.answer),answers);
  set.items.forEach((item,index)=>{
    const sentenceWords=words(item.answer);
    assert.equal(item.blanks.length,Math.floor(sentenceWords.length/2));
    assert.equal((item.medium.match(/\[blank\]/g)||[]).length,item.blanks.length);
    assert.deepEqual(item.blanks,sentenceWords.filter((_,wordIndex)=>wordIndex%2===1).map(word=>word.replace(/[,.?!;:]+$/u,'')));
    assert.equal(item.audio,`/audio/listen-and-write/test-3/sentence-${index+1}.mp3`);
    assert.deepEqual([...item.scramble].sort((a,b)=>a-b),Array.from({length:sentenceWords.length},(_,i)=>i));
    assert.notDeepEqual(item.scramble,[...item.scramble.keys()],`item ${index+1} is scrambled`);
  });
});

test('Test 4 is ePeak+ and has the requested order, modes, and local audio',()=>{
  const set=LISTEN_WRITE_SETS[3];
  const answers=[
    'Have you seen my keys anywhere?',
    'She would rather work from home than spend two hours commuting every day.',
    "I didn't recognize him at first because he'd grown a beard.",
    'What would happen if everyone simply refused to follow the new regulations?',
    'We need to buy some groceries before the stores close.',
    'Not until I started working abroad did I realize how much I took for granted.',
    "They've been looking for a larger apartment, but they haven't found anything affordable yet.",
    "I'd appreciate it if you could keep me informed of any further developments.",
    "There's a good chance the concert will be canceled if the weather gets any worse.",
    'Having spent several years developing the technology, the researchers were reluctant to abandon the project.'
  ];
  assert.equal(set.title,'Test 4');
  assert.equal(set.access,ACCESS.PLUS);
  assert.deepEqual(set.items.map(item=>item.answer),answers);
  set.items.forEach((item,index)=>{
    const sentenceWords=words(item.answer);
    assert.equal(item.blanks.length,Math.floor(sentenceWords.length/2));
    assert.equal((item.medium.match(/\[blank\]/g)||[]).length,item.blanks.length);
    assert.equal(item.audio,`/audio/listen-and-write/test-4/sentence-${index+1}.mp3`);
    assert.deepEqual([...item.scramble].sort((a,b)=>a-b),Array.from({length:sentenceWords.length},(_,i)=>i));
    assert.notDeepEqual(item.scramble,[...item.scramble.keys()],`item ${index+1} is scrambled`);
  });
});
