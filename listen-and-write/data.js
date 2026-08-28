export const ACCESS = Object.freeze({ PUBLIC: 'public', REGISTERED: 'registered', PLUS: 'plus' });

// Audio follows the same convention for every set, so sentence definitions never
// need storage-provider fields or individual URLs.
export function listenWriteAudio(testNumber, sentenceNumber) {
  return `/audio/listen-and-write/test-${testNumber}/sentence-${sentenceNumber}.mp3`;
}
function mediumPrompt(answer) {
  const blanks = [];
  const medium = answer.split(/\s+/u).map((token, index) => {
    // Keep the first word as an anchor, then hide every second word. For
    // odd-length sentences this rounds down to the nearest whole word.
    if (index % 2 === 0) return token;

    const match = token.match(/^(.*?)([,.?!;:]*)$/u);
    blanks.push(match[1]);
    return `[blank]${match[2]}`;
  }).join(' ');

  return { medium, blanks };
}

const TEST_1_ROWS = [
  ['I haven’t seen her since we graduated from college.',[5,1,8,3,0,7,2,6,4]],
  ['How long does it usually take you to get ready in the morning?',[8,2,11,4,0,12,7,1,10,5,3,9,6]],
  ['We were supposed to meet at the restaurant around seven.',[6,1,9,3,0,8,5,2,7,4]],
  ['Have you ever considered moving to a different country?',[6,2,8,0,5,3,1,7,4]],
  ['I would have called you if I’d known you were still awake.',[8,2,11,5,0,9,3,7,1,10,4,6]],
  ['The meeting was postponed because several people couldn’t make it.',[6,1,9,4,0,7,2,8,5,3]],
  ['What would you have done if they hadn’t offered you the job?',[9,2,11,5,0,8,3,10,6,1,7,4]],
  ['She eventually realized that the problem was more complicated than she’d initially thought.',[8,1,11,4,0,9,3,12,6,2,10,5,7]],
  ['Despite being warned several times, he kept making the same mistake.',[8,2,10,4,0,7,1,9,5,3,6]],
  ['It’s becoming increasingly difficult to distinguish reliable information from misleading content online.',[8,2,11,4,0,9,6,1,10,5,3,7]]
];

const TEST_1_ITEMS = TEST_1_ROWS.map(([answer, scramble], index) => ({
  answer, ...mediumPrompt(answer),
  audio:listenWriteAudio(1, index + 1),
  scramble
}));

const TEST_2_ROWS = [
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

const TEST_2_ITEMS = TEST_2_ROWS.map((answer, index) => {
  const tokenCount = words(answer).length;
  const scramble = Array.from({length:tokenCount}, (_, i) => tokenCount - i - 1);
  return {
    answer, ...mediumPrompt(answer), scramble,
    audio:listenWriteAudio(2, index + 1)
  };
});

const TEST_3_ROWS = [
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

const TEST_3_ITEMS = TEST_3_ROWS.map((answer, index) => {
  const tokenCount = words(answer).length;
  const scramble = Array.from({length:tokenCount}, (_, i) => tokenCount - i - 1);
  return {
    answer, ...mediumPrompt(answer), scramble,
    audio:listenWriteAudio(3, index + 1)
  };
});

const TEST_4_ROWS = [
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

const TEST_4_ITEMS = TEST_4_ROWS.map((answer, index) => {
  const tokenCount = words(answer).length;
  const scramble = Array.from({length:tokenCount}, (_, i) => tokenCount - i - 1);
  return {
    answer, ...mediumPrompt(answer), scramble,
    audio:listenWriteAudio(4, index + 1)
  };
});

export const LISTEN_WRITE_SETS = Object.freeze([
  { number:1, title:'Test 1', access:ACCESS.PUBLIC, items:TEST_1_ITEMS },
  { number:2, title:'Test 2', access:ACCESS.REGISTERED, items:TEST_2_ITEMS },
  { number:3, title:'Test 3', access:ACCESS.REGISTERED, items:TEST_3_ITEMS },
  { number:4, title:'Test 4', access:ACCESS.PLUS, items:TEST_4_ITEMS }
]);

export function normalizeAnswer(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLowerCase()
    // Mobile and desktop keyboards can produce different apostrophe glyphs.
    .replace(/[\u2018\u2019\u02bc\uff07]/gu, "'")
    .replace(/[.?!]+$/u, '')
    .trim();
}
export function isCorrect(actual, expected) { return normalizeAnswer(actual) === normalizeAnswer(expected); }
export function words(sentence) { return sentence.replace(/[.?!]+$/u, '').split(/\s+/); }
export function scorePercent(correct, total) { return Math.round((correct / total) * 100); }
