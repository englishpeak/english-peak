import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const dataStart = html.indexOf("const sets=");
const originalData = html.slice(dataStart, html.indexOf("// Build out common, fully equivalent forms"));
const data = html.slice(dataStart, html.indexOf("const app="));
const names = ["normalizeAnswer", "stripPunctuationWords", "setData", "sentence", "key", "entry", "valid", "chooseDifficulty", "startSet", "currentUserAnswer", "results"];
const functions = [...new Set(names.map(name => {
  const line = html.split("\n").find(line => line.startsWith("function ") && line.includes(`function ${name}(`));
  assert.ok(line, `Missing application function: ${name}`);
  return line;
}))].join("\n");

function challenge() {
  const context = {};
  vm.runInNewContext(`${data}
    const state={screen:"exercise",difficulty:"Hard",setId:12,index:0,progress:{}};
    function show(screen){state.screen=screen}
    ${functions}
    globalThis.challenge={sets,state,valid,normalizeAnswer,stripPunctuationWords,currentUserAnswer,entry,results,chooseDifficulty,startSet};
  `, context);
  return context.challenge;
}

function originalSet12() {
  const context = {};
  vm.runInNewContext(`${originalData};globalThis.set12=sets.find(set=>set.id===12)`, context);
  return context.set12;
}

function previouslyExpandedSet12() {
  const context = {};
  const furtherStart = html.indexOf("// Further reviewed Set 12 alternatives");
  assert.ok(furtherStart > dataStart);
  vm.runInNewContext(`${html.slice(dataStart, furtherStart)};globalThis.set12=set12`, context);
  return context.set12;
}

const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const expectedLevels = ["A1","B1","B2","A2","A2","B2","A1","B2","B1","B1","A1","B2","B1","B1","B2","A2","A1","C1","B1","B2","C1","C1","C1","A2"];
const expectedPrompts = ["Where is…","I forgot…","If you’d…","There’s a…","Can you…","I didn’t…","My brother…","No matter…","The zipper…","We ended…","Do you…","You should…","Lately, I’ve…","Did you…","I would…","Can you…","I need…","I don’t…","How did…","I thought…","I don’t…","No matter…","If there’s…","The drawer…"];

test("Set 12 preserves the complete authoritative content, order, and exact Medium prompts", () => {
  const { sets } = challenge();
  const set = originalSet12();
  const runtimeSet = sets.find(set => set.id === 12);
  assert.equal(sets.length, 13);
  assert.equal(set.title, "Set 12");
  assert.equal(set.description, "24 sentences · Mixed levels · Mixed grammar and vocabulary");
  assert.equal(set.sentences.length, 24);
  assert.deepEqual(Array.from(set.sentences, s => s.id), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.deepEqual(Array.from(set.sentences, s => s.level), expectedLevels);
  assert.deepEqual(Array.from(set.sentences, s => s.mediumPrompt), expectedPrompts);
  assert.deepEqual(Object.fromEntries(["A1","A2","B1","B2","C1","C2"].map(level => [level, set.sentences.filter(s => s.level === level).length])), { A1:4, A2:4, B1:6, B2:6, C1:4, C2:0 });
  assert.equal(set.sentences.reduce((count, s) => count + s.acceptedAnswers.length, 0), 158);
  // Keep the original fingerprint so reviewed additions cannot hide changes
  // to any supplied prompt, primary answer, alternative, or teaching note.
  assert.equal(digest(set.sentences), "622d0cc1f63a16a7f13db8a53d8fc63da8cee19db840448f4e9210bed56d63be");
  for (const s of set.sentences) {
    assert.deepEqual(Object.keys(s).sort(), ["acceptedAnswers","id","level","mediumPrompt","note","primaryAnswer","spanish"]);
    const expanded = runtimeSet.sentences.find(sentence => sentence.id === s.id);
    for (const [field, value] of Object.entries(s)) {
      if (field === "acceptedAnswers") {
        assert.deepEqual(Array.from(expanded.acceptedAnswers.slice(0, value.length)), Array.from(value));
      } else {
        assert.equal(expanded[field], value);
      }
    }
  }
});

test("every Set 12 sentence gains distinct alternatives, with more coverage for longer prompts", () => {
  const app = challenge();
  const set = app.sets.find(set => set.id === 12);
  const original = originalSet12();
  let addedTotal = 0;
  set.sentences.forEach((sentence, index) => {
    const additions = sentence.acceptedAnswers.slice(original.sentences[index].acceptedAnswers.length);
    const minimum = sentence.level === "C1" ? 16 : sentence.level === "B2" ? 12 :
      sentence.level === "B1" || sentence.primaryAnswer.split(/\s+/).length >= 10 ? 8 : 4;
    assert.ok(additions.length >= minimum, `Item ${sentence.id} should gain at least ${minimum} alternatives`);
    addedTotal += additions.length;
    const answers = [sentence.primaryAnswer, ...sentence.acceptedAnswers];
    assert.equal(new Set(answers.map(app.normalizeAnswer)).size, answers.length, `Item ${sentence.id} has duplicate answers`);

    app.state.index = index;
    const prefix = app.normalizeAnswer(sentence.mediumPrompt.replace(/…$/, ""));
    let mediumAdditions = 0;
    for (const answer of additions) {
      assert.ok(answer.trim());
      assert.equal(app.valid(answer, sentence, "Easy"), false, `Easy must keep its primary word bank for item ${sentence.id}`);
      const normalized = app.normalizeAnswer(answer);
      if (normalized.startsWith(`${prefix} `)) {
        app.state.difficulty = "Medium";
        app.entry().typed = normalized.slice(prefix.length).trim();
        assert.ok(app.valid(app.currentUserAnswer(), sentence, "Medium"), `Medium ${sentence.id}: ${answer}`);
        mediumAdditions++;
      }
    }
    assert.ok(mediumAdditions > 0, `Item ${sentence.id} needs a new answer compatible with its locked Medium prompt`);
  });
  assert.equal(addedTotal, 516);
  assert.equal(set.sentences.reduce((total, sentence) => total + sentence.acceptedAnswers.length, 0), 674);
});

test("the further Set 12 expansion preserves every previous answer and prioritizes complex prompts", () => {
  const app = challenge();
  const previous = previouslyExpandedSet12();
  assert.equal(digest(previous.sentences), "1ed899736022cc3c10e778a79316940c9928da5c3f8409b687983c049a06c0c1");
  const current = app.sets.find(set => set.id === 12);
  let total = 0;
  for (const [index, sentence] of current.sentences.entries()) {
    const prior = previous.sentences[index];
    for (const [field, value] of Object.entries(prior)) {
      if (field === "acceptedAnswers") {
        assert.deepEqual(Array.from(sentence.acceptedAnswers.slice(0, value.length)), Array.from(value));
      } else {
        assert.equal(sentence[field], value);
      }
    }
    const additions = sentence.acceptedAnswers.slice(prior.acceptedAnswers.length);
    const minimum = sentence.level === "C1" ? 24 : sentence.level === "B2" ? 16 :
      sentence.level === "B1" ? 10 : sentence.id === 5 ? 12 : [16, 24].includes(sentence.id) ? 8 : 2;
    assert.ok(additions.length >= minimum, `Further expansion for item ${sentence.id} needs ${minimum} answers`);
    total += additions.length;
    const prefix = app.normalizeAnswer(sentence.mediumPrompt.replace(/…$/, ""));
    let mediumCompatible = 0;
    app.state.index = index;
    for (const answer of additions) {
      assert.ok(app.valid(answer, sentence, "Hard"), `New Hard ${sentence.id}: ${answer}`);
      assert.equal(app.valid(answer, sentence, "Easy"), false, `Easy keeps its primary word bank: ${sentence.id}`);
      const normalized = app.normalizeAnswer(answer);
      if (normalized.startsWith(`${prefix} `)) {
        app.state.difficulty = "Medium";
        app.entry().typed = answer.trim().slice(sentence.mediumPrompt.slice(0, -1).length).trim();
        assert.ok(app.valid(app.currentUserAnswer(), sentence, "Medium"), `New Medium ${sentence.id}: ${answer}`);
        mediumCompatible++;
      }
    }
    assert.ok(mediumCompatible > 0, `New answers must include Medium completions for item ${sentence.id}`);
  }
  assert.equal(total, 292);
});

test("further paraphrases preserve conditional time, negation, quantities, and question details", () => {
  const { sets, valid } = challenge();
  const sentences = sets.find(set => set.id === 12).sentences;
  const examples = [
    [3, "Had you let me know you were busy, I wouldn't have interrupted you.", "Had you let me know you were busy, I would have interrupted you."],
    [5, "Could you help me carry these bags into the car?", "Could you help me carry these bags out of the car?"],
    [6, "I didn't expect the meeting to last as long as it did.", "I expected the meeting to last as long as it did."],
    [7, "My brother owns a pair of dogs.", "My brother owns a pair of cats."],
    [8, "No matter how hard I try, I can't bring her name to mind.", "No matter how hard I try, I can bring her name to mind."],
    [9, "My jacket won't zip up because its zipper broke.", "My jacket won't zip up because its button broke."],
    [10, "We ended up ordering a takeaway because nobody felt like cooking.", "We ended up cooking because nobody felt like ordering a takeaway."],
    [12, "You should have let me know before reaching a decision.", "You should have let me know after reaching a decision."],
    [13, "Recently, I've been overspending.", "Recently, I've been underspending."],
    [14, "Have you put the leftovers from dinner in the fridge?", "Have you put the leftovers from dinner in the freezer?"],
    [15, "I would have been delighted to join you, but I'd already made other plans.", "I would have been delighted to join you, but I will make other plans."],
    [16, "Could you reduce the volume a little?", "Could you increase the volume a little?"],
    [18, "I can't fathom how she stays calm even when everything goes wrong.", "I can't fathom how she stays calm only when everything goes right."],
    [19, "How come you've got that bruise on your leg?", "How come you've got that bruise on your arm?"],
    [20, "I thought that by the time I arrived, you'd already have finished.", "I thought that by the time I arrived, you'd already have started."],
    [21, "I don't want to fan the flames, but I think someone should tell her the truth.", "I don't want to fan the flames, but I think someone should lie to her."],
    [22, "Despite her attempts to play it down, I know she's still affected by what happened.", "Despite her attempts to play it down, I know she's no longer affected by what happened."],
    [23, "Working with him has taught me that nothing should ever be taken for granted.", "Working with him has taught me that everything should always be taken for granted."],
    [24, "The drawer gets stuck each time I try to open it.", "The drawer gets stuck each time I try to close it."]
  ];
  for (const [id, accepted, rejected] of examples) {
    assert.ok(valid(accepted, sentences[id - 1], "Hard"), `Meaning-preserving item ${id}: ${accepted}`);
    for (const difficulty of ["Medium", "Hard"]) {
      assert.equal(valid(rejected, sentences[id - 1], difficulty), false, `Meaning-changing item ${id}: ${rejected}`);
    }
  }
});

test("Set 12 accepts natural changes in word order, idioms, dialect, and sentence structure", () => {
  const { sets, valid } = challenge();
  const sentences = sets.find(set => set.id === 12).sentences;
  const examples = [
    [1, "Where is my rucksack?"],
    [2, "I overslept because I forgot to set my alarm."],
    [3, "I wouldn't have interrupted you had you told me you were busy."],
    [6, "The meeting lasted longer than I expected."],
    [8, "Try as I might, I can't remember her name."],
    [9, "I can't do up my jacket because the zip broke."],
    [12, "You ought to have told me before making a decision."],
    [15, "I would have loved to accompany you, but I already had other plans."],
    [18, "How he manages to stay calm even when everything goes wrong is beyond me."],
    [20, "I expected you to be done by the time I arrived."],
    [21, "I don't want to inflame the situation, but I think someone should tell her the truth."],
    [22, "Despite his efforts to downplay it, I know what happened still affects him."],
    [23, "If working with him has taught me anything, it's never to take anything for granted."],
    [24, "Whenever I try to open the drawer, it gets stuck."]
  ];
  for (const [id, answer] of examples) {
    assert.ok(valid(answer, sentences[id - 1], "Hard"), `Curated example ${id}: ${answer}`);
  }
});

test("Set 12 retains the five designated vocabulary targets in translations and notes", () => {
  const sentences = challenge().sets.find(set => set.id === 12).sentences;
  const targets = [[4,"gotera","leak"], [9,"cierre","zipper"], [14,"sobras","leftovers"], [19,"moretón","bruise"], [24,"atora","get stuck"]];
  assert.equal(targets.length, 5);
  for (const [id, spanish, english] of targets) {
    const s = sentences[id - 1];
    assert.ok(s.spanish.includes(spanish));
    assert.ok(s.primaryAnswer.toLowerCase().includes(english === "get stuck" ? "gets stuck" : english));
    assert.ok(s.note.toLowerCase().includes(english));
  }
});

test("Hard accepts all 24 primary answers and all supplied and added alternatives with existing normalization", () => {
  const { sets, valid } = challenge();
  for (const s of sets.find(set => set.id === 12).sentences) {
    for (const answer of [s.primaryAnswer, ...s.acceptedAnswers]) {
      assert.ok(valid(answer, s, "Hard"), `Item ${s.id}: ${answer}`);
      const normalizedVariant = `  ${answer.toUpperCase().replace(/[’‘]/g, "'").replaceAll(" ", "  ")}!!!  `;
      assert.ok(valid(normalizedVariant, s, "Hard"), `Normalized item ${s.id}: ${answer}`);
    }
  }
});

test("all 24 Easy word banks and exact Medium starts reconstruct the full primary answer", () => {
  const app = challenge();
  app.sets.find(set => set.id === 12).sentences.forEach((s, index) => {
    app.state.index = index;
    app.state.difficulty = "Easy";
    const words = app.stripPunctuationWords(s.primaryAnswer);
    app.entry().chosen = words.map((word, id) => ({ word, id }));
    assert.equal(new Set(app.entry().chosen.map(token => token.id)).size, words.length);
    assert.ok(app.valid(app.currentUserAnswer(), s, "Easy"), `Easy ${s.id}`);
    app.state.difficulty = "Medium";
    const start = s.mediumPrompt.slice(0, -1);
    assert.ok(s.primaryAnswer.startsWith(start));
    app.entry().typed = s.primaryAnswer.slice(start.length).trim();
    assert.equal(app.currentUserAnswer(), s.primaryAnswer);
    assert.ok(app.valid(app.currentUserAnswer(), s, "Medium"), `Medium ${s.id}`);
  });
});

test("Hard rejects incorrect grammar, reversed meanings, incomplete answers, and arbitrary synonyms", () => {
  const { sets, valid } = challenge();
  const wrong = [
    "Where are my backpack?", "I remembered to set my alarm and woke up on time.",
    "If you told me you are busy, I won't interrupted you.", "There’s a hole in the kitchen floor.",
    "Can you help I put these bags in the car?", "I expected the meeting to end quickly.",
    "My brother have two dogs.", "No matter how hard I try, I can remember his name.",
    "The button on my jacket broke, and I can’t zip it up.", "We ended up cook because nobody felt like ordering food.",
    "Does you like this song?", "You should told me after making a decision.",
    "Lately, I’ve been spending less than I should.", "Did you throw the dinner leftovers away?",
    "I would have loved to go with you, but I already have other plans.", "Can you turn the volume up a little?",
    "I needs a glass of water.", "I don’t understand how she manages to panic even when everything goes wrong.",
    "How did you get that cut on your leg?", "I thought you will have finished by the time I arrived.",
    "I don’t want to add fuel to the fire, but I think someone should hide the truth from him.",
    "No matter how hard he tries to downplay it, I know what happened no longer affects him.",
    "If there’s one thing I’ve learned from working with him, it’s that you should always take everything for granted.",
    "The drawer opens easily every time I try to open it."
  ];
  sets.find(set => set.id === 12).sentences.forEach((s, i) => {
    for (const answer of [wrong[i], "", s.primaryAnswer.split(" ").slice(0, -1).join(" "), `${s.primaryAnswer} tomorrow`]) {
      assert.equal(valid(answer, s, "Hard"), false, `Item ${s.id}: ${answer}`);
    }
  });
  assert.equal(valid("Where is your backpack?", sets[11].sentences[0], "Hard"), false);
  assert.equal(valid("Two cats belong to my brother.", sets[11].sentences[6], "Hard"), false);
  assert.equal(valid("I don't want to inflame the situation, but I think someone should hide the truth from her.", sets[11].sentences[20], "Hard"), false);
  assert.equal(valid("Despite his efforts to downplay it, I know what happened no longer affects him.", sets[11].sentences[21], "Hard"), false);
  assert.equal(valid("If working with him has taught me anything, it's to take everything for granted.", sets[11].sentences[22], "Hard"), false);
});

test("all previous sets retain their exact runtime content", () => {
  assert.equal(digest(challenge().sets.slice(0, 11)), "e19ea776d8a8311fea66b686e2ac58ca0e9f4fff9c8a8fce7f8501f5950ae631");
});

test("Set 12, Set 11, and a legacy 30-item set keep independent scores and difficulty progress", () => {
  const app = challenge();
  for (const [id, total] of [[12, 24], [11, 24], [1, 30]]) {
    app.startSet(id);
    for (let i = 0; i < total; i++) {
      app.state.index = i;
      Object.assign(app.entry(), { checked: true, correct: i % 2 === 0 });
    }
    assert.deepEqual(JSON.parse(JSON.stringify(app.results())), { correct: total / 2, total, attempted: total, percent: 50 });
    app.chooseDifficulty("Medium");
    assert.equal(app.state.setId, id);
    assert.equal(app.state.index, 0);
    assert.equal(app.results().attempted, 0);
    app.chooseDifficulty("Hard");
    assert.equal(app.state.setId, id);
    assert.equal(app.results().attempted, total);
  }
});
