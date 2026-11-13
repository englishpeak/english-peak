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
vm.runInNewContext(`${scripts.join('\n')}\nglobalThis.test37 = testData['Test 37'];`, sandbox);
const tasks = sandbox.test37;
const words = tasks.filter((task) => task.type === 'complete-words');
const builds = tasks.filter((task) => task.type === 'build-sentence');
const listening = tasks.filter((task) => task.section === 'Listening');
const repeat = tasks.find((task) => task.type === 'listen-repeat-updated');
const interview = tasks.find((task) => task.type === 'take-interview');

const sourcePassages = [
  "Some caves form when slightly acidic water slowly dissolves limestone underground. Rainwater absorbs carbon dioxide as it moves through soil, producing a weak acid that can widen existing cracks in the rock. Over long periods, narrow passages may become large chambers. Water dripping from a cave ceiling can also deposit minerals, gradually building structures called stalactites. Similar deposits growing upward from the floor are known as stalagmites. The speed of these changes depends on factors such as water flow, temperature, and the composition of the surrounding rock.",
  "Salt has been used to preserve food for thousands of years in many regions. When salt draws moisture out of food, it creates conditions in which many microorganisms grow less easily. People have applied this principle to fish, meat, and certain vegetables, often combining salt with drying or fermentation. Different preservation methods produce distinct textures and flavors, and the amount of salt required depends on the food and its storage conditions. Although refrigeration later transformed food storage, traditional salting methods remain important in some culinary practices and communities."
];
const expectedSplits = [[["abs", "orbs", "absorbs"], ["prod", "ucing", "producing"], ["exis", "ting", "existing"], ["pass", "ages", "passages"], ["cham", "bers", "chambers"], ["drip", "ping", "dripping"], ["dep", "osit", "deposit"], ["grad", "ually", "gradually"], ["tempe", "rature", "temperature"], ["surro", "unding", "surrounding"]], [["mois", "ture", "moisture"], ["condi", "tions", "conditions"], ["microor", "ganisms", "microorganisms"], ["prin", "ciple", "principle"], ["veget", "ables", "vegetables"], ["fermen", "tation", "fermentation"], ["preser", "vation", "preservation"], ["dist", "inct", "distinct"], ["refrig", "eration", "refrigeration"], ["tradi", "tional", "traditional"]]];

test('Test 37 enables exactly 27 tasks in the established section sequence and leaves Test 38 unavailable', () => {
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
  const expectedKeys = ['DBACCDABADCBDCBAC', 'CABDBDACDBCDABDACB'];
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
    assert.ok(path.startsWith('../audio/ibt/test-37/'));
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
  const chunks = [["approved", "the committee", "was approving", "hasn't been", "by"], ["on time", "my class", "will finishing", "as long as", "finishes"], ["their results", "are checking", "were consistent", "to check", "whether"], ["the east gallery", "had moving", "to", "it had", "been moved"], ["to change", "the part", "adapting", "about how", "people adapt"], ["figures have", "the final", "checking", "been checked", "once"]];
  const sentences = ["It hasn't been approved by the committee.", "I can come as long as my class finishes on time.", "The researchers wanted to check whether their results were consistent.", "They told me it had been moved to the east gallery.", "Yes, especially the part about how people adapt to change.", "It should be ready once the final figures have been checked."];
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
  assert.equal(repeat.sentences[0].text, 'Welcome to the university teaching kitchen.');
  elements.set('submit-btn', { style: {} });
  repeat.sentences.forEach((sentence, index) => {
    elements.set('exercise-content', { innerHTML: '' });
    vm.runInContext(`repeatSentenceIndex = ${index}; renderRepeatSentence(testData['Test 37'].find(task => task.type === 'listen-repeat-updated'));`, sandbox);
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
    vm.runInContext(`interviewQuestionIndex = ${index}; renderInterviewPrompt(testData['Test 37'].find(task => task.type === 'take-interview'));`, sandbox);
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
  vm.runInContext("_currentTestKey = 'Test 37'; results = resultData; finish();", sandbox);
  const score = elements.get('score-display').innerHTML;
  assert.match(score, /97%/);
  assert.match(score, /<strong>59<\/strong> correct out of <strong>61<\/strong>/);
  assert.match(score, /Practice Accuracy/);
  assert.match(score, /Writing and Speaking practice tasks are not included in automatic scoring/);
  assert.doesNotMatch(score, /120|TOEFL band/i);
});

test('Tests 1–36 retain their original data exactly', () => {
  const priorData = vm.runInContext('JSON.stringify(Object.fromEntries(Object.entries(testData).filter(([key]) => Number(key.replace("Test ", "")) <= 36)))', sandbox);
  assert.equal(createHash('sha256').update(priorData).digest('hex'), '901a356e789d8008b83e43b651c0caea14a4fe9351d53d3e1a06c9f10111743e');
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
    vm.runInContext("_currentTestKey = 'Test 37'; curSet = testData['Test 37']; idx = 23; render(); idx = 24; render(); idx = 25; render();", sandbox);
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
    "q": "Which item requires an appointment?",
    "options": [
      "A bicycle light",
      "A small toy",
      "An ordinary portable household item",
      "A sewing machine"
    ],
    "correct": 3
  },
  {
    "q": "What must visitors do while volunteers inspect their items?",
    "options": [
      "Pay for the inspection in advance.",
      "Remain present during the inspection.",
      "Leave their items until the following day.",
      "Purchase replacement parts before arriving."
    ],
    "correct": 1
  },
  {
    "q": "Which purchase is eligible for an ordinary return?",
    "options": [
      "An unused sketchbook returned with its receipt within 14 days",
      "An opened, nondefective container of paint",
      "An unused item returned without proof of purchase",
      "An item returned 40 days after purchase"
    ],
    "correct": 0
  },
  {
    "q": "What does the policy indicate about defective merchandise?",
    "options": [
      "Defective merchandise must always be returned by mail.",
      "Opened products are never eligible for any exchange.",
      "A defective item may be exchanged within 30 days with proof of purchase.",
      "Refunds for defective items are always paid in cash."
    ],
    "correct": 2
  },
  {
    "q": "Why was the event moved to Room 305?",
    "options": [
      "More participants registered than expected.",
      "Room 120 is needed for another class.",
      "The projector in the original room is not working.",
      "The guest speakers requested a smaller room."
    ],
    "correct": 2
  },
  {
    "q": "What will Sam probably do when he arrives?",
    "options": [
      "Arrange all the chairs by himself.",
      "Register remote viewers for the event.",
      "Prepare the speakers' presentation slides.",
      "Help test the microphones."
    ],
    "correct": 3
  },
  {
    "q": "What will remote participants receive?",
    "options": [
      "An updated link to watch the event",
      "A new ticket for a different date",
      "A printed schedule delivered to their homes",
      "Instructions to attend in person instead"
    ],
    "correct": 0
  },
  {
    "q": "What is the main subject of the passage?",
    "options": [
      "Why ants in all species search for food alone",
      "How ants can coordinate foraging through chemical signals",
      "Why visual landmarks are useless to insects",
      "How central leaders direct every ant in a colony"
    ],
    "correct": 1
  },
  {
    "q": "How can an ant help other workers locate a food source?",
    "options": [
      "By depositing a chemical trail as it returns to the nest",
      "By changing the physical shape of its antennae",
      "By moving the food source closer to the colony",
      "By preventing other ants from leaving the nest"
    ],
    "correct": 0
  },
  {
    "q": "Why may an unused chemical trail become difficult to follow?",
    "options": [
      "Ants intentionally remove all chemical signals at night.",
      "The nest produces chemicals that immediately neutralize it.",
      "Food sources always disappear after one visit.",
      "Pheromones gradually evaporate or break down."
    ],
    "correct": 3
  },
  {
    "q": "The word \"exhausted\" in paragraph 2 is closest in meaning to",
    "options": [
      "discovered",
      "protected",
      "used up",
      "transported"
    ],
    "correct": 2
  },
  {
    "q": "Why does the author mention differences among ant species?",
    "options": [
      "To show that all species depend exclusively on visual cues",
      "To demonstrate that ants can use different combinations of information to navigate",
      "To argue that pheromone trails are never effective",
      "To explain why individual ants cannot find food"
    ],
    "correct": 1
  },
  {
    "q": "What is the passage mainly about?",
    "options": [
      "Why cultivated plants have no useful genetic variation",
      "Why seed banks can replace all habitat conservation",
      "How refrigeration changes the flavor of harvested crops",
      "How seed banks preserve useful plant diversity and why additional conservation is needed"
    ],
    "correct": 3
  },
  {
    "q": "Why are seeds generally dried and stored at low temperatures?",
    "options": [
      "To make seeds grow faster during storage",
      "To ensure that seeds cannot be planted again",
      "To slow processes that reduce their ability to germinate",
      "To increase the immediate size of the seeds"
    ],
    "correct": 2
  },
  {
    "q": "The word \"viable\" in paragraph 2 is closest in meaning to",
    "options": [
      "recently harvested",
      "capable of germinating",
      "unusually large",
      "resistant to every plant disease"
    ],
    "correct": 1
  },
  {
    "q": "What may technicians do when stored seeds begin to lose their ability to germinate?",
    "options": [
      "Grow new plants and collect fresh seeds",
      "Increase the storage temperature permanently",
      "Stop checking the seed collection",
      "Replace all seeds with cultivated crops"
    ],
    "correct": 0
  },
  {
    "q": "Why does the author suggest protecting plants in their natural habitats as well as storing seeds?",
    "options": [
      "Seed storage is always more expensive than habitat protection.",
      "Plants cannot be studied after their seeds are collected.",
      "Seed banks cannot preserve every species or the ecosystems where plants evolved.",
      "Wild plants do not possess useful genetic traits."
    ],
    "correct": 2
  },
  {
    "q": "Choose the best response.",
    "options": [
      "The workshop begins at a different location.",
      "I already canceled my reservation last month.",
      "That's great! I'm glad a spot opened up for you.",
      "You should probably book a different workshop."
    ],
    "correct": 2
  },
  {
    "q": "Choose the best response.",
    "options": [
      "Not at all. You can sit here instead.",
      "The window was cleaned yesterday.",
      "I bought a new screen last month.",
      "The classroom has several windows."
    ],
    "correct": 0
  },
  {
    "q": "Choose the best response.",
    "options": [
      "The meeting room is on the third floor.",
      "Good idea. I'll check half of them, and you can take the rest.",
      "These sources were published several years ago.",
      "I finished the meeting notes yesterday."
    ],
    "correct": 1
  },
  {
    "q": "Choose the best response.",
    "options": [
      "The lecture hall is painted blue.",
      "I attended yesterday's lecture online.",
      "My notebook has a green cover.",
      "No, I didn't, but you could check the lost-and-found office."
    ],
    "correct": 3
  },
  {
    "q": "Why can't the student borrow the costume immediately?",
    "options": [
      "Costumes are never available for student films.",
      "The department requires a fitting before lending costumes.",
      "The online catalog is no longer accessible.",
      "The jacket is being repaired until Friday."
    ],
    "correct": 1
  },
  {
    "q": "What does the student need to bring to her appointment?",
    "options": [
      "A copy of the finished film",
      "A payment for the costume",
      "A list of all actors in her production",
      "Her instructor's approval"
    ],
    "correct": 3
  },
  {
    "q": "Why does the professor question the student's conclusion?",
    "options": [
      "Most responses came from a group that may not represent the university population.",
      "The survey was distributed before classes began.",
      "The student forgot to ask about public transportation.",
      "The participants refused to answer the questions."
    ],
    "correct": 0
  },
  {
    "q": "What does the professor recommend?",
    "options": [
      "Removing all existing survey responses",
      "Interviewing only students from environmental studies",
      "Collecting responses from students with more varied academic backgrounds and commuting habits",
      "Replacing the survey with a laboratory experiment"
    ],
    "correct": 2
  },
  {
    "q": "Where should recreational swimmers go between 4:00 and 6:00 p.m. on weekdays?",
    "options": [
      "To the north pool, which will remain open to everyone",
      "To the changing rooms to request a special pass",
      "To the outdoor training area",
      "To the south pool"
    ],
    "correct": 3
  },
  {
    "q": "What must students submit on Monday?",
    "options": [
      "A completed short film with recorded audio",
      "A storyboard with at least eight frames, uploaded as a PDF",
      "A printed copy of the film script without illustrations",
      "A video explaining their planned camera equipment"
    ],
    "correct": 1
  },
  {
    "q": "Why do deeper sections of an ice sheet generally contain older ice?",
    "options": [
      "Ice near the surface melts more quickly than deeper ice.",
      "Older ice moves upward during the summer.",
      "New layers of snow accumulate above earlier deposits.",
      "Scientists place older ice beneath newer layers."
    ],
    "correct": 2
  },
  {
    "q": "What can scientists learn by examining air bubbles trapped in ice cores?",
    "options": [
      "The exact locations of ancient weather stations",
      "How quickly modern glaciers will disappear",
      "The number of animals living near an ice sheet",
      "Past concentrations of atmospheric gases"
    ],
    "correct": 3
  },
  {
    "q": "What can differences in oxygen isotopes provide evidence about?",
    "options": [
      "Past temperatures when the snow originally fell",
      "The speed at which an ice-core drill operates",
      "The number of snowstorms in a single week",
      "The height of nearby mountain peaks"
    ],
    "correct": 0
  },
  {
    "q": "Why do researchers compare several types of evidence from ice cores?",
    "options": [
      "Air bubbles cannot preserve atmospheric gases.",
      "Ice layers may be compressed or distorted, making individual measurements harder to interpret.",
      "Oxygen isotopes occur only in surface snow.",
      "Every ice layer contains identical chemical information."
    ],
    "correct": 1
  },
  {
    "q": "What is reverberation?",
    "options": [
      "The complete prevention of sound reflection",
      "The change in pitch when an instrument is moved",
      "The movement of sound through electrical cables",
      "The gradual fading of reflected sound after the original sound has stopped"
    ],
    "correct": 3
  },
  {
    "q": "Why can excessive reverberation make spoken words difficult to understand?",
    "options": [
      "Reflected sounds overlap with one another.",
      "It prevents all sound waves from reaching listeners.",
      "It makes sound travel more slowly through air.",
      "It removes the higher frequencies from every sound."
    ],
    "correct": 0
  },
  {
    "q": "How do curtains and upholstered seats generally affect sound?",
    "options": [
      "They reflect more sound than concrete walls.",
      "They eliminate the need for acoustic design.",
      "They absorb more sound energy than hard surfaces.",
      "They make every musical instrument sound louder."
    ],
    "correct": 2
  },
  {
    "q": "Why might a concert hall have adjustable panels or curtains?",
    "options": [
      "To change the building's seating capacity",
      "To adapt the acoustic conditions to different performances",
      "To prevent musicians from hearing one another",
      "To eliminate all sound reflections permanently"
    ],
    "correct": 1
  }
];
test('all 35 question texts and option orders match the supplied content', () => {
  const actual = tasks.filter(t => ['Reading', 'Listening'].includes(t.section)).flatMap(t => t.questions || (t.options ? [{q: t.question, options: t.options, correct: t.correct}] : []));
  assert.deepEqual(JSON.parse(JSON.stringify(actual)), lockedQuestions);
  actual.forEach(q => {
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
    assert.equal(new Set(q.options).size, 4);
  });
});

const lockedScripts = [
  "I thought the workshop was completely booked, but someone must have canceled because I just got a place.",
  "Would you mind switching seats with me? The glare from the window makes it difficult to see my screen.",
  "We won't have time to check all these sources before the meeting unless we split them up.",
  "You didn't happen to see a blue notebook in the lecture hall yesterday, did you?",
  "Narrator:\nListen to a conversation at a university theatre department.\n\nWoman:\nHi. I'm working on a short film for my media studies class, and I was wondering if I could borrow a costume from the department.\n\nMan:\nPossibly. We lend costumes to students working on university productions, but you'll need your instructor's approval.\n\nWoman:\nThat's fine. My instructor already said I could use one. I found a jacket in the online catalog that would be perfect.\n\nMan:\nGreat. Have you arranged a fitting?\n\nWoman:\nNo, I thought I could just pick it up today.\n\nMan:\nWe need to check the size and condition before lending anything out. Our next available fitting appointment is Wednesday afternoon.\n\nWoman:\nThat should work. We're not filming until Friday.\n\nMan:\nPerfect. Bring your instructor's approval to the appointment, and we'll prepare the loan paperwork then.\n\nWoman:\nThanks. I'll book the appointment now.",
  "Narrator:\nListen to a conversation between a student and his sociology professor.\n\nMan:\nProfessor Chen, I finished collecting responses for my survey about how students use public transportation.\n\nWoman:\nGood. How many responses did you get?\n\nMan:\nAlmost eighty. But I'm surprised by the results. Nearly everyone said they take the bus regularly.\n\nWoman:\nWhere did you distribute the survey?\n\nMan:\nMostly in my environmental studies class. A few classmates shared it with their friends too.\n\nWoman:\nThat might explain the pattern. Students in that course may be more interested in environmentally friendly transportation than the university population as a whole.\n\nMan:\nSo my results aren't useful?\n\nWoman:\nThey can still tell you something about the people who responded. But you should be careful about generalizing to all students.\n\nMan:\nShould I collect more responses from other departments?\n\nWoman:\nExactly. Try reaching students with a wider range of academic backgrounds and commuting habits.\n\nMan:\nOkay. I'll revise my sampling plan.",
  "Narrator:\nListen to an announcement at a university recreation center.\n\nWoman:\nStarting Monday, the north swimming pool will be reserved for the university swim team's practice sessions from four until six in the afternoon on weekdays. Recreational swimmers may continue using the south pool during those hours. The changing rooms and main entrance will remain open as usual. Please check the updated lane schedule online before your visit, since availability may vary throughout the week.",
  "Narrator:\nListen to an announcement in a film studies class.\n\nMan:\nFor Monday's assignment, I only want you to submit the storyboard for your short film, not the finished video. Your storyboard should include at least eight frames, with a brief description of the action and camera angle for each one. You can draw the frames by hand or create them digitally, but the final document must be uploaded as a PDF. We'll begin working on the actual filming next week.",
  "Narrator:\nListen to part of a talk about climate science.\n\nMan:\nHow can scientists learn about Earth's climate thousands of years before thermometers and weather stations existed? One important source of evidence comes from ice cores.\n\nIn places such as Antarctica and Greenland, snow accumulates year after year. As more snow falls, the weight of the upper layers compresses the snow beneath them. Over time, it gradually becomes solid ice.\n\nScientists can drill deep into these ice sheets and extract long cylinders of ice, called ice cores. The deeper portions generally contain older ice, allowing researchers to study environmental conditions from different periods.\n\nNow, the ice itself contains useful information, but so do the tiny bubbles of air trapped inside it. These bubbles preserve samples of the atmosphere from the past. By analyzing the gases they contain, scientists can estimate past concentrations of carbon dioxide and other atmospheric gases.\n\nResearchers also examine the chemical composition of the ice. For example, differences in the relative abundance of certain oxygen isotopes can provide clues about temperatures when the snow originally fell.\n\nHowever, interpreting ice cores requires care. Layers may become compressed or distorted, particularly deep within an ice sheet. Scientists therefore compare several types of evidence rather than relying on one measurement.\n\nIce cores are especially valuable because they allow researchers to examine relationships between atmospheric composition and climate changes over very long periods.",
  "Narrator:\nListen to part of a talk about acoustics.\n\nWoman:\nHave you ever noticed that music can sound very different depending on the room where it's performed? A violin played in a small classroom may sound quite different from the same instrument played in a large concert hall.\n\nOne important reason is the way sound waves interact with the room's surfaces.\n\nWhen sound reaches a hard surface, such as a concrete wall, much of it can be reflected back into the room. These reflections continue after the original sound has stopped. The gradual fading of this reflected sound is called reverberation.\n\nSome reverberation can make music sound fuller and more connected. But too much can create problems. In a room with very long reverberation, individual sounds may overlap so much that spoken words become difficult to understand.\n\nSoft materials, such as curtains and upholstered seats, tend to absorb more sound energy than hard surfaces. This means that changing the materials inside a room can affect its acoustics.\n\nDesigners must also consider the size and shape of the space. Some modern performance halls include adjustable panels or curtains, allowing the acoustic conditions to be changed for different events.\n\nFor example, a hall used for orchestral music may benefit from different reverberation characteristics than one used primarily for lectures.\n\nSo designing a successful performance space involves more than making sure sound is loud enough. It also requires controlling how sound travels, reflects, and gradually fades."
];
const lockedSentences = [
  {
    "script": "Welcome to the university teaching kitchen.",
    "text": "Welcome to the university teaching kitchen.",
    "audio": "../audio/ibt/test-37/sentence-1.mp3"
  },
  {
    "script": "Please wash your hands before touching any ingredients.",
    "text": "Please wash your hands before touching any ingredients.",
    "audio": "../audio/ibt/test-37/sentence-2.mp3"
  },
  {
    "script": "Each workstation has a cutting board, a set of utensils, and a small digital scale.",
    "text": "Each workstation has a cutting board, a set of utensils, and a small digital scale.",
    "audio": "../audio/ibt/test-37/sentence-3.mp3"
  },
  {
    "script": "Before you turn on the stove, check that the pans are placed securely and the area is clear.",
    "text": "Before you turn on the stove, check that the pans are placed securely and the area is clear.",
    "audio": "../audio/ibt/test-37/sentence-4.mp3"
  },
  {
    "script": "If you have a food allergy, inform the instructor before the demonstration so that suitable ingredients can be prepared.",
    "text": "If you have a food allergy, inform the instructor before the demonstration so that suitable ingredients can be prepared.",
    "audio": "../audio/ibt/test-37/sentence-5.mp3"
  },
  {
    "script": "After the lesson, students should label any food they intend to take home and return all equipment to the storage cabinets.",
    "text": "After the lesson, students should label any food they intend to take home and return all equipment to the storage cabinets.",
    "audio": "../audio/ibt/test-37/sentence-6.mp3"
  },
  {
    "script": "Anyone interested in joining the advanced cooking workshops next semester should complete the online application, indicate their previous experience, and attend a short orientation before using the kitchen independently.",
    "text": "Anyone interested in joining the advanced cooking workshops next semester should complete the online application, indicate their previous experience, and attend a short orientation before using the kitchen independently.",
    "audio": "../audio/ibt/test-37/sentence-7.mp3"
  }
];
test('all ten listening transcripts and seven repeat sentences match the locked scripts', () => {
  assert.deepEqual(Array.from(listening, t => t.script), lockedScripts);
  assert.deepEqual(JSON.parse(JSON.stringify(repeat.sentences)), lockedSentences);
});

test('only the first conditions is incomplete and its storage conditions remains intact', () => {
  assert.match(words[1].text, /it creates condi\[5\] in which/);
  assert.match(words[1].text, /its storage conditions\./);
  assert.equal((words[1].text.match(/condi\[5\]/g) || []).length, 1);
});

const lockedOpenResponses = [
  {
    "section": "Writing",
    "type": "writing-email",
    "taskFamily": "Write an Email",
    "title": "Write an Email",
    "instruction": "Write as much as you can and in complete sentences.",
    "time": 420,
    "text": "<p>You contributed photographs to your university's student magazine. Yesterday, the magazine published an article that included two of your photographs.</p><p>However, you noticed that one photograph was credited to another student, and the caption under the second photograph identified the wrong location.</p><p>Write an email to Ms. Park, the magazine editor.</p><p>In your email:</p><ul><li>identify the article and explain which photographs you contributed;</li><li>describe the two mistakes you noticed;</li><li>politely request that the published information be corrected; and</li><li>suggest one way the magazine could verify photograph details before future publications.</li></ul><p>Write as much as you can and in complete sentences.</p>"
  },
  {
    "section": "Writing",
    "type": "academic-discussion",
    "taskFamily": "Write for an Academic Discussion",
    "title": "Write for an Academic Discussion",
    "time": 600,
    "professor": "Professor Okafor",
    "professorPrompt": "<p>Many universities record classroom lectures and make the recordings available online afterward.</p><p>Supporters argue that recordings help students review difficult material, catch up after an absence, and study at their own pace. Others believe that easy access to recordings may discourage students from attending classes and participating in discussions.</p><p>Should universities make recordings of most lectures available to students? Why or why not?</p>",
    "studentAName": "Clara",
    "studentA": "I support making recordings available because students learn at different speeds. If I don't understand a complicated explanation the first time, being able to watch it again can help. Recordings are also useful for students who miss a class because of illness or other unavoidable circumstances. I think they should supplement regular attendance.",
    "studentBName": "Ben",
    "studentB": "I think universities should be more selective. If recordings are automatically available for every lecture, some students might stop attending regularly. They could miss opportunities to ask questions and interact with classmates. Perhaps recordings should be provided when students have a specific reason for needing them.",
    "studentInstruction": "Write a response to the professor's question. In your response: - express and support your own opinion; - make a meaningful contribution to the discussion; and - use your own words. An effective response will contain at least 100 words."
  },
  {
    "section": "Speaking",
    "type": "take-interview",
    "taskFamily": "Take an Interview",
    "title": "Take an Interview",
    "adaptationNote": "Self-study practice: Read each interview question and answer aloud. In a teacher-led session, your teacher may ask the questions.",
    "introduction": "You are participating in a research interview about repairing, reusing, and maintaining everyday objects.",
    "responseTime": 45,
    "questions": [
      "Tell me about an object you have repaired or had repaired, such as a phone, an appliance, or a piece of clothing. What happened, and what did you do?",
      "What do you think is the best way for someone to learn basic repair or maintenance skills?",
      "When an everyday object stops working, do you generally think it is better to repair it or replace it? What factors should influence that decision?",
      "Some schools are considering teaching practical skills such as repairing clothing, maintaining bicycles, or fixing simple household objects. Do you think these skills should be part of students' education? Why or why not?"
    ]
  }
];
test('email, academic discussion, and all interview questions retain the supplied prompts', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(tasks.filter(t => ['writing-email','academic-discussion','take-interview'].includes(t.type)))), lockedOpenResponses);
});
