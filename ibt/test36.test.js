import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
const elements = new Map();
const sandbox = {
  console, URLSearchParams, clearInterval, setInterval, setTimeout,
  window: { location: { search: '' } },
  document: { getElementById: (id) => elements.get(id) || null, querySelectorAll: () => [] },
};
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test36 = testData['Test 36'];`, sandbox);
const tasks = sandbox.test36;
const words = tasks.filter((task) => task.type === 'complete-words');
const builds = tasks.filter((task) => task.type === 'build-sentence');
const listening = tasks.filter((task) => task.section === 'Listening');
const repeat = tasks.find((task) => task.type === 'listen-repeat-updated');
const interview = tasks.find((task) => task.type === 'take-interview');

const sourcePassages = [
  "Sand dunes can slowly change shape as winds carry grains across the ground. When moving air becomes strong enough, it lifts loose particles and pushes them over the surface. Grains often accumulate on the sheltered side of a dune, where wind speed decreases. As more material collects, the slope may become too steep and small quantities of sand slide downward. This repeated movement causes the entire dune to migrate over time. Plants can limit these changes by trapping sediment with their roots, but vegetation may struggle to survive in extremely dry conditions.",
  "Natural rubber is produced from the milky sap of certain tropical trees. Workers make shallow cuts in the bark and collect the liquid in small containers. This fluid, called latex, contains tiny particles that can be separated and processed into a flexible material. Fresh rubber can be sticky and may change its properties when temperatures rise or fall. A treatment involving heat and sulfur can improve its durability and elasticity. Although synthetic alternatives are widely used today, natural rubber remains valuable for products that require particular combinations of strength, flexibility, and resistance to wear."
];
const expectedSplits = [[["part", "icles", "particles"], ["surf", "ace", "surface"], ["accum", "ulate", "accumulate"], ["shel", "tered", "sheltered"], ["decre", "ases", "decreases"], ["mate", "rial", "material"], ["quant", "ities", "quantities"], ["down", "ward", "downward"], ["migr", "ate", "migrate"], ["veget", "ation", "vegetation"]], [["Work", "ers", "Workers"], ["shal", "low", "shallow"], ["conta", "iners", "containers"], ["part", "icles", "particles"], ["separ", "ated", "separated"], ["flex", "ible", "flexible"], ["prope", "rties", "properties"], ["temper", "atures", "temperatures"], ["durab", "ility", "durability"], ["resis", "tance", "resistance"]]];

test('Test 36 enables exactly 27 tasks in the established section sequence and leaves Test 38 unavailable', () => {
  assert.equal(tasks.length, 27);
  assert.deepEqual([...new Set(tasks.map((task) => task.section))], ['Reading', 'Listening', 'Writing', 'Speaking']);
  assert.deepEqual(Object.fromEntries(Object.entries(Object.groupBy(tasks, (task) => task.section)).map(([key, value]) => [key, value.length])), { Reading: 7, Listening: 10, Writing: 8, Speaking: 2 });
  assert.deepEqual([...vm.runInContext('testCollections[1].tests', sandbox)], ['Test 31', 'Test 32', 'Test 33', 'Test 34', 'Test 35', 'Test 36', 'Test 37']);
  assert.equal(vm.runInContext("testData['Test 38']", sandbox), undefined);
});

test('all 20 locked splits reconstruct the exact source passages with intact first sentences', () => {
  words.forEach((task, taskIndex) => {
    const blanks = [...task.text.matchAll(/([\p{L}]+)\[(\d+)\]/gu)];
    assert.equal(task.answers.length, 10);
    assert.equal(blanks.length, 10);
    const firstSentence = sourcePassages[taskIndex].split('. ')[0] + '.';
    assert.ok(task.text.startsWith(firstSentence));
    blanks.forEach((blank, index) => {
      const [prefix, suffix, word] = expectedSplits[taskIndex][index];
      assert.equal(blank[1], prefix);
      assert.equal(task.answers[index], suffix);
      assert.equal(Number(blank[2]), suffix.length);
      assert.equal(prefix + suffix, word);
    });
    let answerIndex = 0;
    assert.equal(task.text.replace(/\[\d+\]/g, () => task.answers[answerIndex++]), sourcePassages[taskIndex]);
    const markup = sandbox.renderCompleteWordsText(task.text);
    assert.equal((markup.match(/class="incomplete-word"/g) || []).length, 10);
    assert.doesNotMatch(markup, /class="incomplete-word">[^<]*(?:\s|&nbsp;|\u00a0|\u200b)<input/);
    expectedSplits[taskIndex].forEach(([prefix, suffix]) => {
      assert.ok(markup.includes(`class="incomplete-word">${prefix}<input`));
      assert.ok(markup.includes(`maxlength="${suffix.length}"`));
    });
  });
});

test('all 35 MC items retain each supplied key, option order, and A8/B9/C9/D9 distribution', () => {
  const sectionQuestions = ['Reading', 'Listening'].map((section) => tasks.filter((task) => task.section === section).flatMap((task) => task.questions || (task.options ? [task] : [])));
  const expectedKeys = ['CDABDACBDCABCABDC', 'BDACDBACDBCADBADCB'];
  const distribution = (questions) => Object.fromEntries('ABCD'.split('').map((letter, index) => [letter, questions.filter((q) => q.correct === index).length]));
  assert.deepEqual(sectionQuestions.map((qs) => qs.length), [17, 18]);
  sectionQuestions.forEach((questions, index) => {
    questions.forEach((q) => assert.equal(q.options.length, 4));
    assert.equal(questions.map((q) => 'ABCD'[q.correct]).join(''), expectedKeys[index]);
  });
  assert.deepEqual(distribution(sectionQuestions[0]), { A: 4, B: 4, C: 5, D: 4 });
  assert.deepEqual(distribution(sectionQuestions[1]), { A: 4, B: 5, C: 4, D: 5 });
  assert.deepEqual(distribution(sectionQuestions.flat()), { A: 8, B: 9, C: 9, D: 9 });
  assert.deepEqual(Array.from(tasks.filter((task) => ['read-daily', 'academic-reading'].includes(task.type)), (task) => task.questions.length), [2, 2, 3, 5, 5]);
  assert.deepEqual(Array.from(listening.filter((task) => task.questions), (task) => task.questions.length), [2, 2, 1, 1, 4, 4]);
});

test('all 17 exact audio paths exist and every listening script starts hidden', () => {
  assert.equal(listening.length, 10);
  const paths = [...listening.map((task) => task.audioUrl), ...repeat.sentences.map((sentence) => sentence.audio)];
  assert.equal(new Set(paths).size, 17);
  assert.deepEqual(paths.map((path) => path.split('/').pop()), ['task-8.mp3', 'task-9.mp3', 'task-10.mp3', 'task-11.mp3', 'task-15.mp3', 'task-16.mp3', 'task-18.mp3', 'task-19.mp3', 'task-20.mp3', 'task-21.mp3', ...Array.from({ length: 7 }, (_, index) => `sentence-${index + 1}.mp3`)]);
  paths.forEach((path) => {
    assert.ok(path.startsWith('../audio/ibt/test-36/'));
    assert.ok(statSync(new URL(path, import.meta.url)).size > 0);
  });
  listening.forEach((task) => {
    assert.ok(task.script);
    const markup = sandbox.renderScriptControl(task.script);
    assert.match(markup, />Show Script<\/button>/);
    assert.match(markup, /Use only as a last resource :\)/);
    assert.match(markup, /practice-transcript" hidden/);
    assert.ok(markup.includes(task.script));
  });
  assert.equal(interview.audioUrl, undefined);
});

test('six sentence tasks retain the supplied mixed order, one distractor, and exact completed sentences', () => {
  const chunks = [["returned", "was returning", "this morning", "it may", "have been"], ["became", "until", "having", "available", "a place"], ["the rain", "moving", "to move", "because of", "it indoors"], ["the conditions", "to make sure", "understood", "all of", "I understand"], ["a supervisor", "is present", "only if", "available", "been presenting"], ["more clearly", "explained", "was explaining", "someone had", "them"]];
  const sentences = ["She thinks it may have been returned this morning.", "I couldn't enroll until a place became available.", "They decided to move it indoors because of the rain.", "I want to make sure I understand all of the conditions.", "The lab is available only if a supervisor is present.", "I wish someone had explained them more clearly."];
  assert.equal(builds.length, 6);
  builds.forEach((task, index) => {
    assert.deepEqual([...task.words], chunks[index]);
    assert.equal(task.preserveChunkOrder, true);
    assert.equal(task.correctOrder.length, 4);
    assert.deepEqual([...task.words.filter((word) => !task.correctOrder.includes(word))], [task.distractor]);
    assert.equal(task.scaffold.replace(/(?:\s*_+)+/, ' ' + task.correctOrder.join(' ')), sentences[index]);
    assert.equal(task.completedSentence, sentences[index]);
  });
  assert.equal(tasks.find((task) => task.type === 'writing-email').time, 420);
  assert.equal(tasks.find((task) => task.type === 'academic-discussion').time, 600);
});

test('Listen and Repeat keeps one hidden sentence at a time without a countdown and gates Submit until 7/7', () => {
  assert.equal(repeat.sentences.length, 7);
  assert.equal(repeat.sentences[0].text, 'Welcome aboard the university research vessel.');
  elements.set('submit-btn', { style: {} });
  repeat.sentences.forEach((sentence, index) => {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`repeatSentenceIndex = ${index}; renderRepeatSentence(testData['Test 36'].find(task => task.type === 'listen-repeat-updated'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, new RegExp(`Sentence ${index + 1} of 7`));
    assert.match(markup, /id="repeat-text"[^>]* hidden/);
    assert.equal(elements.get('submit-btn').style.display, index === 6 ? 'block' : 'none');
    assert.equal(markup.includes('Continue to next sentence'), index < 6);
    assert.equal(sentence.script, sentence.text);
    assert.ok(markup.includes(sentence.text));
    assert.doesNotMatch(markup, /timer|countdown/i);
  });
});

test('four interview prompts each start hidden with their own 45-second response window', () => {
  assert.equal(interview.questions.length, 4);
  assert.equal(interview.responseTime, 45);
  interview.questions.forEach((question, index) => {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`interviewQuestionIndex = ${index}; renderInterviewPrompt(testData['Test 36'].find(task => task.type === 'take-interview'));`, sandbox);
    const markup = elements.get('exercise-content').innerHTML;
    assert.match(markup, /id="interview-question"[^>]* hidden/);
    assert.match(markup, />Show Question<\/button>/);
    assert.match(markup, /id="interview-timer"[^>]*>00:45/);
    assert.ok(markup.includes(question));
  });
});

test('Practice Accuracy counts 61 individual objective items and excludes all four extended task types', () => {
  const resultData = tasks.map((task) => {
    const result = { type: task.type, title: task.title, isCorrect: true };
    if (task.type === 'complete-words') Object.assign(result, { ui: [...task.answers], ans: task.answers, raw: task.text });
    else if (task.section !== 'Speaking' && task.questions) result.qs = task.questions.map((q) => ({ isC: true, qText: q.q, cVal: q.options[q.correct], uVal: q.options[q.correct] }));
    return result;
  });
  resultData[0].ui[0] = 'wrong';
  resultData[0].isCorrect = false;
  resultData[2].qs[0].isC = false;
  resultData[2].isCorrect = false;
  resultData.filter((result) => ['writing-email', 'academic-discussion', 'listen-repeat-updated', 'take-interview'].includes(result.type)).forEach((result) => { result.isCorrect = false; });
  sandbox.resultData = resultData;
  elements.set('screen-results', { classList: { add() {} } });
  elements.set('score-display', { innerHTML: '' });
  elements.set('feedback-display', { innerHTML: '' });
  vm.runInContext("_currentTestKey = 'Test 36'; results = resultData; finish();", sandbox);
  const score = elements.get('score-display').innerHTML;
  assert.match(score, /97%/);
  assert.match(score, /<strong>59<\/strong> correct out of <strong>61<\/strong>/);
  assert.match(score, /Practice Accuracy/);
  assert.match(score, /Writing and Speaking practice tasks are not included in automatic scoring/);
  assert.doesNotMatch(score, /120|TOEFL band/i);
});

test('Tests 1–35 retain their original data exactly', () => {
  const priorData = vm.runInContext('JSON.stringify(Object.fromEntries(Object.entries(testData).filter(([key]) => Number(key.replace("Test ", "")) <= 35)))', sandbox);
  assert.equal(createHash('sha256').update(priorData).digest('hex'), '94b4a04a0c9307edab7fd3c2840c5ecb0ad59bfd5024d011420c1b1c94066558');
});

test('rapid navigation cancels deferred writing timers and finishing clears the active timer', () => {
  const deferred = [];
  const intervals = [];
  const cleared = [];
  sandbox.setTimeout = callback => deferred.push(callback);
  sandbox.setInterval = (callback, delay) => {
    intervals.push({ callback, delay });
    return intervals.length;
  };
  sandbox.clearInterval = id => cleared.push(id);
  elements.set('skip-btn', { style: {} });
  elements.set('email-t', { innerText: '07:00' });
  elements.set('discussion-t', { innerText: '10:00' });
  try {
    vm.runInContext("_currentTestKey = 'Test 36'; curSet = testData['Test 36']; idx = 23; render(); idx = 24; render(); idx = 25; render();", sandbox);
    assert.equal(deferred.length, 2);
    deferred.splice(0).forEach(callback => callback());
    assert.equal(intervals.length, 0, 'timers from submitted tasks must not start');
    for (const [index, timerId, expected] of [[23, 'email-t', '06:59'], [24, 'discussion-t', '09:59']]) {
      vm.runInContext(`idx = ${index}; render();`, sandbox);
      deferred.shift()();
      assert.equal(intervals.at(-1).delay, 1000);
      intervals.at(-1).callback();
      assert.equal(elements.get(timerId).innerText, expected);
    }
    const clearCount = cleared.length;
    vm.runInContext('results = []; finish();', sandbox);
    assert.equal(cleared.length, clearCount + 1);
    assert.equal(cleared.at(-1), intervals.length);
  } finally {
    Object.assign(sandbox, { setTimeout, setInterval, clearInterval });
  }
});

const lockedQuestions = [
  {
    "q": "When will volunteers practice communicating with visitors?",
    "options": [
      "10:00–11:30 a.m.",
      "11:45 a.m.–12:30 p.m.",
      "1:15–2:00 p.m.",
      "12:30–1:15 p.m."
    ],
    "correct": 2
  },
  {
    "q": "What is required for participants entering Lab 2?",
    "options": [
      "A printed volunteer guide",
      "A parking validation ticket",
      "Their own exhibition materials",
      "Closed-toe shoes"
    ],
    "correct": 3
  },
  {
    "q": "What is included with the workshop registration?",
    "options": [
      "Drawing materials",
      "Transportation to the arts center",
      "A printed course textbook",
      "Lunch and refreshments"
    ],
    "correct": 0
  },
  {
    "q": "What should a participant do to request a session change without being subject to the late-change availability condition?",
    "options": [
      "Ask the instructor when the workshop begins.",
      "Contact the registration office by Thursday at 4:00 p.m.",
      "Wait until all participants have checked in.",
      "Submit a new payment on Saturday morning."
    ],
    "correct": 1
  },
  {
    "q": "Why was the workshop rescheduled?",
    "options": [
      "The instructor was unavailable.",
      "The botanical garden will close early.",
      "Too few people registered for Friday.",
      "Rain is expected."
    ],
    "correct": 3
  },
  {
    "q": "Why might Nora be unable to use the gardening tools?",
    "options": [
      "She may miss the required safety briefing.",
      "She has not purchased the tools.",
      "She is not registered as a student.",
      "The tools will be collected before eleven."
    ],
    "correct": 0
  },
  {
    "q": "What will Nora probably do next?",
    "options": [
      "Ask Tessa to bring the tools to her.",
      "Cancel her swimming practice immediately.",
      "Contact the workshop organizer.",
      "Travel to the botanical garden on Friday."
    ],
    "correct": 2
  },
  {
    "q": "What is the passage mainly about?",
    "options": [
      "Why most crops grow best immediately after volcanic eruptions",
      "How volcanic ash can damage land initially but contribute to soil development over time",
      "Why volcanic glass cannot undergo chemical changes",
      "How all volcanic eruptions produce identical soils"
    ],
    "correct": 1
  },
  {
    "q": "How can volcanic ash eventually increase the nutrients available to plants?",
    "options": [
      "It prevents water from reaching plant roots.",
      "It blocks sunlight throughout the growing season.",
      "It removes existing minerals from the soil.",
      "Minerals in the ash may break down and release nutrients."
    ],
    "correct": 3
  },
  {
    "q": "The word \"weathering\" in paragraph 2 refers to",
    "options": [
      "the movement of ash by strong winds",
      "the prediction of rainfall after eruptions",
      "the gradual breakdown or alteration of materials",
      "the rapid growth of vegetation on new deposits"
    ],
    "correct": 2
  },
  {
    "q": "What can be inferred about volcanic deposits in very dry environments?",
    "options": [
      "Some mineral changes may occur relatively slowly.",
      "They always become fertile more quickly than wet deposits.",
      "They cannot contain minerals useful to plants.",
      "They immediately produce deep, mature soils."
    ],
    "correct": 0
  },
  {
    "q": "Why do researchers compare volcanic deposits of different ages?",
    "options": [
      "To determine which volcano will erupt next",
      "To investigate how soil characteristics develop over time",
      "To show that all ash deposits have the same composition",
      "To measure how much sunlight is blocked during an eruption"
    ],
    "correct": 1
  },
  {
    "q": "What is the passage mainly about?",
    "options": [
      "Why scientific journals no longer accept experimental research",
      "How researchers decide which subjects are popular",
      "How peer review evaluates research and why it has limitations",
      "Why all published studies must reach identical conclusions"
    ],
    "correct": 2
  },
  {
    "q": "Who typically evaluates a paper during peer review?",
    "options": [
      "Specialists familiar with the research area",
      "Students selected randomly from the university",
      "Readers who have never studied the subject",
      "Journal subscribers without technical experience"
    ],
    "correct": 0
  },
  {
    "q": "The word \"scrutiny\" in paragraph 3 is closest in meaning to",
    "options": [
      "financial support",
      "careful examination",
      "public celebration",
      "immediate publication"
    ],
    "correct": 1
  },
  {
    "q": "Which limitation of peer review is mentioned?",
    "options": [
      "Reviewers are prohibited from discussing methods.",
      "Journals cannot request revisions.",
      "Authors must always accept every suggestion.",
      "Reviewers may disagree or overlook problems."
    ],
    "correct": 3
  },
  {
    "q": "Why does the author mention researchers repeating an experiment after publication?",
    "options": [
      "To suggest that published research should not be read",
      "To argue that experiments are unnecessary before publication",
      "To show that the evaluation of findings can continue after peer review",
      "To explain why journals do not use reviewers"
    ],
    "correct": 2
  },
  {
    "q": "Choose the most appropriate response.",
    "options": [
      "The forms are usually available at reception.",
      "You should probably send it now, if the deadline hasn't passed.",
      "I printed several copies of the form yesterday.",
      "The drafts folder is easier to organize than the inbox."
    ],
    "correct": 1
  },
  {
    "q": "Choose the most appropriate response.",
    "options": [
      "The cafeteria was crowded this morning.",
      "I bought a reusable bottle last year.",
      "The water fountain is beside the cafeteria.",
      "Of course. Is still water okay?"
    ],
    "correct": 3
  },
  {
    "q": "Choose the most appropriate response.",
    "options": [
      "Wow, the concert must be really popular!",
      "I played the violin in high school.",
      "The concert will probably last two hours.",
      "Orchestra rehearsals are held every Thursday."
    ],
    "correct": 0
  },
  {
    "q": "Choose the most appropriate response.",
    "options": [
      "The laboratory was renovated last year.",
      "I usually arrive at five.",
      "Let's divide the remaining work so we can finish more quickly.",
      "The inventory forms are printed on blue paper."
    ],
    "correct": 2
  },
  {
    "q": "Why can't the woman's heater be repaired immediately?",
    "options": [
      "The housing office has not inspected the room.",
      "The university is closing for the weekend.",
      "The woman has not completed the necessary form.",
      "A replacement component has not arrived yet."
    ],
    "correct": 3
  },
  {
    "q": "What arrangement does the employee offer?",
    "options": [
      "Moving the student to another residence hall",
      "Delivering a portable heater to her room",
      "Giving the student permission to repair the valve",
      "Refunding the student's housing payment"
    ],
    "correct": 1
  },
  {
    "q": "Why is the professor cautious about the student's conclusion?",
    "options": [
      "The growing conditions were not adequately controlled.",
      "The seedlings were all the same height.",
      "The student used different types of seeds.",
      "The plants were measured too frequently."
    ],
    "correct": 0
  },
  {
    "q": "What does the professor recommend?",
    "options": [
      "Using a different kind of seed for every group",
      "Moving all plants outdoors permanently",
      "Comparing groups while keeping water, soil, and containers the same",
      "Measuring only the tallest plant in each group"
    ],
    "correct": 2
  },
  {
    "q": "Which statement about the graduate-school fair is accurate?",
    "options": [
      "It has been postponed until Friday.",
      "Students must register before attending.",
      "It will now begin at four in the afternoon.",
      "The location has changed, but the scheduled time remains the same."
    ],
    "correct": 3
  },
  {
    "q": "What should students do if they created maps using the original data file?",
    "options": [
      "Submit them without making changes.",
      "Generate the maps again using the corrected data.",
      "Rewrite the introduction but keep the original maps.",
      "Ask the professor to extend the deadline."
    ],
    "correct": 1
  },
  {
    "q": "Why are suspension bridges particularly useful for some wide crossings?",
    "options": [
      "They eliminate the need for cables.",
      "They require supports at short intervals beneath the roadway.",
      "They can span long distances with relatively few supports below the roadway.",
      "They do not experience forces from vehicles."
    ],
    "correct": 2
  },
  {
    "q": "According to the speaker, how is the weight of vehicles transferred?",
    "options": [
      "Through the vertical cables to the main cables",
      "Directly from the roadway into the water",
      "Entirely through the bridge's road surface",
      "Through the anchorages without involving cables"
    ],
    "correct": 0
  },
  {
    "q": "What is the function of the bridge's anchorages?",
    "options": [
      "To prevent vehicles from entering during high winds",
      "To carry the roadway above the towers",
      "To measure the vertical movement of the bridge",
      "To resist the horizontal pull of the main cables"
    ],
    "correct": 3
  },
  {
    "q": "Why do engineers test suspension-bridge models in wind tunnels?",
    "options": [
      "To determine the cost of purchasing steel",
      "To study how the bridge may respond to wind",
      "To measure water depth beneath the bridge",
      "To choose the location of nearby roads"
    ],
    "correct": 1
  },
  {
    "q": "What is lexical borrowing?",
    "options": [
      "The adoption of words from one language into another",
      "The process of removing rarely used words from a dictionary",
      "The creation of new writing systems from symbols",
      "The translation of every word in a language into another"
    ],
    "correct": 0
  },
  {
    "q": "According to the speaker, what can encourage word borrowing?",
    "options": [
      "A complete lack of communication between communities",
      "The disappearance of all local expressions",
      "A requirement that languages have identical grammar",
      "Contact through trade, migration, and cultural exchange"
    ],
    "correct": 3
  },
  {
    "q": "What can happen to a borrowed word after it enters another language?",
    "options": [
      "Its original pronunciation must always be preserved.",
      "Its spelling can change, but its meaning never changes.",
      "Its pronunciation, spelling, or meaning may change.",
      "It must replace every existing word with a similar meaning."
    ],
    "correct": 2
  },
  {
    "q": "What can borrowed vocabulary reveal to linguists?",
    "options": [
      "The exact number of people living in an ancient city",
      "Evidence of historical contact between communities",
      "The complete grammar of a language that no longer exists",
      "Proof that languages stop changing after borrowing words"
    ],
    "correct": 1
  }
];
test('all 35 question texts and option orders match the supplied content', () => {
  const actual = tasks.filter(t => ['Reading', 'Listening'].includes(t.section)).flatMap(t => t.questions || (t.options ? [{q: t.question, options: t.options, correct: t.correct}] : []));
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), lockedQuestions);
});

const lockedScripts = [
  "I was certain I'd sent the form, but it's still sitting in my drafts folder.",
  "If you're heading to the cafeteria, could you grab me a bottle of water?",
  "It turns out the student orchestra's concert is sold out, even though tickets only went on sale yesterday.",
  "We need to finish the laboratory inventory before five, and we've barely started.",
  "Narrator:\nListen to a conversation at a university housing office.\n\nWoman:\nHi. I reported that the heater in my room stopped working on Monday. I got a message saying it had been inspected, but it's still cold.\n\nMan:\nLet me check the report. Ah, yes. The technician identified a faulty valve, but the replacement part won't arrive until Thursday.\n\nWoman:\nOh. I was hoping it could be fixed today. Is there anything I can do in the meantime?\n\nMan:\nWe can provide a portable heater, as long as you follow the safety instructions. I'll also ask maintenance to prioritize the repair once the part arrives.\n\nWoman:\nWould I need to pick up the heater somewhere?\n\nMan:\nNo. A staff member can bring it to your room this afternoon. Just make sure someone's there to receive it.\n\nWoman:\nOkay. I'll be back after two. Thanks for your help.",
  "Narrator:\nListen to a conversation between a student and his biology professor.\n\nMan:\nProfessor Silva, can I ask about the seedlings we grew for the lab? Mine were much taller than the others, even though we all used the same seeds.\n\nWoman:\nInteresting. Were the plants kept under the same conditions?\n\nMan:\nNot exactly. I put mine by a window at home, but some students kept theirs under classroom lights.\n\nWoman:\nThat could explain part of the difference. But we can't conclude that the window caused it based on just one group of seedlings.\n\nMan:\nSo should I repeat the experiment?\n\nWoman:\nIt would be helpful to set up a comparison where the only intentional difference is the type of light. Keep the water, soil, and containers the same.\n\nMan:\nAnd measure their height each day?\n\nWoman:\nExactly. That way, you'll have better evidence about whether lighting affects their growth.\n\nMan:\nAll right. I'll prepare another set of plants this week.",
  "Narrator:\nListen to an announcement at a university.\n\nWoman:\nThe graduate-school fair this Thursday has moved from the recreation hall to the central auditorium. The event will still run from noon until four, and students don't need to register in advance. Representatives from several universities will be available to answer questions about academic programs and application requirements. If you're planning to attend, bringing a list of questions may help you make the most of your conversations.",
  "Narrator:\nListen to an announcement in a geography class.\n\nMan:\nFor next week's mapping assignment, please use the updated data file I posted this morning. I discovered that a few locations in the original file had incorrect coordinates. You don't need to redo the written introduction, but any maps made using the earlier file should be generated again. The submission deadline remains Tuesday at six o'clock.",
  "Narrator:\nListen to part of a talk about bridge engineering.\n\nMan:\nImagine trying to build a bridge across a wide channel where placing numerous supports in the water would be difficult. One solution is a suspension bridge, a design that can span remarkably long distances.\n\nIn a suspension bridge, the roadway hangs from vertical cables connected to much larger main cables. These main cables pass over tall towers and are secured to massive anchorages at either end of the bridge.\n\nWhen vehicles travel across the bridge, their weight is transferred through the vertical cables to the main cables. The main cables are under tension, meaning they're being pulled rather than pushed. The towers carry large downward forces, while the anchorages resist the horizontal pull of the cables.\n\nThis arrangement allows engineers to build bridges with relatively few supports beneath the roadway. That's especially valuable when crossing wide rivers or deep waterways.\n\nHowever, the flexibility of suspension bridges creates challenges. Wind and moving vehicles can cause the roadway to vibrate or shift. Engineers therefore incorporate structures that help stabilize the bridge and study how it responds to different wind conditions.\n\nIn fact, designers often test scale models in wind tunnels before construction begins.\n\nSo the success of a suspension bridge depends not only on the strength of its materials, but also on how its different components distribute forces and keep the roadway stable.",
  "Narrator:\nListen to part of a talk about linguistics.\n\nWoman:\nWhen English speakers use words like karaoke, sofa, or algebra, they may not think about where those words originally came from. But all three entered English through contact with other languages, although their histories are quite different.\n\nLinguists call this process lexical borrowing. It happens when speakers adopt words from one language into another.\n\nBorrowing often occurs when communities come into contact through trade, migration, education, or cultural exchange. Sometimes speakers encounter a new object or practice and adopt the word already used to describe it.\n\nHowever, borrowed words don't always remain exactly as they were in the original language. Their pronunciation may change to fit the sound patterns of the receiving language. Their spelling may also be adjusted, and occasionally their meaning changes over time.\n\nInterestingly, borrowing doesn't necessarily mean that a language lacks a word for something. Speakers sometimes adopt foreign expressions even when a similar word already exists in their own language.\n\nAnd borrowing isn't limited to English. It's a normal process found in languages around the world.\n\nWhat makes this particularly interesting is that borrowed vocabulary can provide clues about historical contact between communities. By studying when certain words entered a language and where they came from, linguists can learn about patterns of trade, migration, and cultural influence.\n\nSo a familiar everyday word may preserve evidence of relationships between societies that developed centuries ago."
];
const lockedSentences = [
  {
    "script": "Welcome aboard the university research vessel.",
    "text": "Welcome aboard the university research vessel.",
    "audio": "../audio/ibt/test-36/sentence-1.mp3"
  },
  {
    "script": "Please keep your life jacket on throughout the tour.",
    "text": "Please keep your life jacket on throughout the tour.",
    "audio": "../audio/ibt/test-36/sentence-2.mp3"
  },
  {
    "script": "Our research team collects water samples from different depths to study changes in ocean conditions.",
    "text": "Our research team collects water samples from different depths to study changes in ocean conditions.",
    "audio": "../audio/ibt/test-36/sentence-3.mp3"
  },
  {
    "script": "Before stepping onto the upper deck, make sure your life jacket is properly fastened and follow the crew's instructions.",
    "text": "Before stepping onto the upper deck, make sure your life jacket is properly fastened and follow the crew's instructions.",
    "audio": "../audio/ibt/test-36/sentence-4.mp3"
  },
  {
    "script": "Any equipment used during today's demonstration must be cleaned and returned to its assigned storage area before we leave the vessel.",
    "text": "Any equipment used during today's demonstration must be cleaned and returned to its assigned storage area before we leave the vessel.",
    "audio": "../audio/ibt/test-36/sentence-5.mp3"
  },
  {
    "script": "Although the vessel normally operates near the coast, some research expeditions require scientists to travel farther offshore to investigate changes in marine ecosystems.",
    "text": "Although the vessel normally operates near the coast, some research expeditions require scientists to travel farther offshore to investigate changes in marine ecosystems.",
    "audio": "../audio/ibt/test-36/sentence-6.mp3"
  },
  {
    "script": "Students who are interested in participating in future research expeditions should contact the program coordinator after today's tour to learn about the required safety training, application procedures, and opportunities to work alongside experienced marine scientists.",
    "text": "Students who are interested in participating in future research expeditions should contact the program coordinator after today's tour to learn about the required safety training, application procedures, and opportunities to work alongside experienced marine scientists.",
    "audio": "../audio/ibt/test-36/sentence-7.mp3"
  }
];
test('all ten listening transcripts and seven repeat sentences match the locked scripts', () => {
  assert.deepEqual(Array.from(listening, t => t.script), lockedScripts);
  assert.deepEqual(JSON.parse(JSON.stringify(repeat.sentences)), lockedSentences);
});
