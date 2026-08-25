export const ACCESS = Object.freeze({ PUBLIC: 'public', REGISTERED: 'registered', PLUS: 'plus' });

// Sets are deliberately data-driven: future sets only need one object with ten items.
const SET_ITEMS = [];
const rows = [
  ['hujp37zv3myj3aw5hjgb5','bhteeg03b43vzgh1uoe3h0rvr','x6yw8gqf','I haven’t seen her since we graduated from college.','I haven’t [blank] her since we [blank] from college.',['seen','graduated'],[5,1,8,3,0,7,2,6,4]],
  ['3s67bfgbtsaqc8l3ryhth','hcbx0naa6oywug16bmyserycf','lxaomiaq','How long does it usually take you to get ready in the morning?','How long does it [blank] take you to get [blank] in the morning?',['usually','ready'],[8,2,11,4,0,12,7,1,10,5,3,9,6]],
  ['ozwdw4unagzorznfstrf2','0i0i78zlb5deutl7w4tcyn7zh','jhh6649s','We were supposed to meet at the restaurant around seven.','We were [blank] to meet at the restaurant [blank] seven.',['supposed','around'],[6,1,9,3,0,8,5,2,7,4]],
  ['uoa1a7zaihr1iwp28xiyb','6g7avjse9tzpvhqgv7w7mi6b8','rkgmyk9t','Have you ever considered moving to a different country?','Have you ever [blank] moving to a [blank] country?',['considered','different'],[6,2,8,0,5,3,1,7,4]],
  ['bllvt5aselrm5uij5mo7u','52ydd1gxzz30rooda75zpqy0u','3clo6dvs','I would have called you if I’d known you were still awake.','I would have [blank] you if I’d [blank] you were still awake.',['called','known'],[8,2,11,5,0,9,3,7,1,10,4,6]],
  ['419ow3mc34immshqhokem','n687iw1x1uuh8g4kpsnhq1lky','nwf91bj4','The meeting was postponed because several people couldn’t make it.','The meeting was [blank] because several people couldn’t [blank] it.',['postponed','make'],[6,1,9,4,0,7,2,8,5,3]],
  ['py42jrevp18ygskbkvn7i','89khkm9xege3vr1ga7u237hxx','rsb2balt','What would you have done if they hadn’t offered you the job?','What would you have [blank] if they hadn’t [blank] you the job?',['done','offered'],[9,2,11,5,0,8,3,10,6,1,7,4]],
  ['jxs7wa3me82thbenqd4cz','yg23ojs6nghcrw9cmsylkqiwa','237peeub','She eventually realized that the problem was more complicated than she’d initially thought.','She [blank] realized that the problem was more [blank] than she’d initially thought.',['eventually','complicated'],[8,1,11,4,0,9,3,12,6,2,10,5,7]],
  ['216vy335j32x2unvhb74r','coqkzvcty3lhou57f7qz1ugzg','nwobu6ka','Despite being warned several times, he kept making the same mistake.','Despite being [blank] several times, he kept [blank] the same mistake.',['warned','making'],[8,2,10,4,0,7,1,9,5,3,6]],
  ['byzcwt12x9d66vmd8z6w5','6msj2zg5bbja09ib7snk0z9bz','z16ptapp','It’s becoming increasingly difficult to distinguish reliable information from misleading content online.','It’s becoming [blank] difficult to distinguish reliable information from [blank] content online.',['increasingly','misleading'],[8,2,11,4,0,9,6,1,10,5,3,7]]
];

rows.forEach((r, index) => SET_ITEMS.push({
  answer:r[3], medium:r[4], blanks:r[5],
  audio:`https://dl.dropboxusercontent.com/scl/fi/${r[0]}/sentence-${index+1}.mp3?rlkey=${r[1]}&st=${r[2]}&raw=1`,
  scramble:r[6]
}));

const TEST_2_ROWS = [
  ['utjfqv4dddq2e9g36bra1','a64gg7ap1wifznys9hyyamds6','991lei6y','By the time we arrived, most of the guests had already left.','By the time we [blank], most of the guests had already [blank].',['arrived','left']],
  ['0kdatzwuts6mhq8ic92ab','kag1tgye7kil6few27061x9qx','62egjwc1','Do you mind if I open the window for a few minutes?','Do you [blank] if I open the window for a few [blank]?',['mind','minutes']],
  ['po0d3bjghid7gjk1mwtra','zo52rl4tuxvlext5dcgufcye2','3do9nncw','She reluctantly agreed to take responsibility for what had happened.','She [blank] agreed to take [blank] for what had happened.',['reluctantly','responsibility']],
  ['27gqrkowcs65kecykesuo','pz4zaln09jwuj3gwpibjtv9th','h3w5wofb','I can’t believe you managed to finish everything on your own.','I can’t believe you [blank] to finish everything on your [blank].',['managed','own']],
  ['le3ccjztbl897bw3mysi2','s8h3kxxiptbmcnexhbvr4dkgg','9z1qzfmm','Had I known how expensive it would be, I might have reconsidered my decision.','Had I [blank] how expensive it would be, I might have [blank] my decision.',['known','reconsidered']],
  ['5xffsbpdhkp6z63n3sq2d','n6mcy9mbx38821mhhfi6r4i65','c7naeldb','We’re running out of time, so we’d better make a decision soon.','We’re running [blank] of time, so we’d better make a [blank] soon.',['out','decision']],
  ['ovgderyfcmr7a1or8hlr5','8cji8x8i3esaeu3g893e5ivym','pl27br9b','Why didn’t you tell me that you were having trouble with your car?','Why didn’t you tell me that you were having [blank] with your [blank]?',['trouble','car']],
  ['12vf4e62xdzdkcrnzqzav','rmjr5evbeqc7s73r4a1plgv7f','vy4704ak','The company is expected to announce significant changes within the next few weeks.','The company is [blank] to announce significant changes within the next few [blank].',['expected','weeks']],
  ['8sh6ksbwsaf2w7a1a984n','wacvwjik41qnkszdzdg3idvwq','ul49uw2n','There’s no point in arguing about something we can’t change.','There’s no [blank] in arguing about something we can’t [blank].',['point','change']],
  ['hgm148s6u4de7gtkvgcuc','581q7dng475x64lh1709j2fjp','c5f3j8u7','Although the proposal initially seemed unreasonable, it turned out to be surprisingly effective.','Although the proposal [blank] seemed unreasonable, it turned out to be surprisingly [blank].',['initially','effective']]
];

const TEST_2_ITEMS = TEST_2_ROWS.map((r, index) => {
  const tokenCount = words(r[3]).length;
  const scramble = Array.from({length:tokenCount}, (_, i) => tokenCount - i - 1);
  return {
    answer:r[3], medium:r[4], blanks:r[5], scramble,
    audio:`https://dl.dropboxusercontent.com/scl/fi/${r[0]}/sentence-${index+1}.mp3?rlkey=${r[1]}&st=${r[2]}&raw=1`
  };
});

export const LISTEN_WRITE_SETS = Object.freeze([
  { number:1, title:'Test 1', access:ACCESS.PUBLIC, items:SET_ITEMS },
  { number:2, title:'Test 2', access:ACCESS.REGISTERED, items:TEST_2_ITEMS }
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
