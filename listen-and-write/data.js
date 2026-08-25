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

export const LISTEN_WRITE_SETS = Object.freeze([{ number:1, title:'Set 1', access:ACCESS.PUBLIC, items:SET_ITEMS }]);

export function normalizeAnswer(value) {
  return String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ').replace(/[.?!]+$/u, '').trim();
}
export function isCorrect(actual, expected) { return normalizeAnswer(actual) === normalizeAnswer(expected); }
export function words(sentence) { return sentence.replace(/[.?!]+$/u, '').split(/\s+/); }
export function scorePercent(correct, total) { return Math.round((correct / total) * 100); }
