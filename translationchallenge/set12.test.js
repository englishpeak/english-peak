import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
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
    globalThis.challenge={sets,state,valid,stripPunctuationWords,currentUserAnswer,entry,results,chooseDifficulty,startSet};
  `, context);
  return context.challenge;
}

const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const expectedLevels = ["A1","B1","B2","A2","A2","B2","A1","B2","B1","B1","A1","B2","B1","B1","B2","A2","A1","C1","B1","B2","C1","C1","C1","A2"];
const expectedPrompts = ["Where is…","I forgot…","If you’d…","There’s a…","Can you…","I didn’t…","My brother…","No matter…","The zipper…","We ended…","Do you…","You should…","Lately, I’ve…","Did you…","I would…","Can you…","I need…","I don’t…","How did…","I thought…","I don’t…","No matter…","If there’s…","The drawer…"];

test("Set 12 preserves the complete authoritative content, order, and exact Medium prompts", () => {
  const { sets } = challenge();
  const set = sets.find(set => set.id === 12);
  assert.equal(sets.length, 12);
  assert.equal(set.title, "Set 12");
  assert.equal(set.description, "24 sentences · Mixed levels · Mixed grammar and vocabulary");
  assert.equal(set.sentences.length, 24);
  assert.deepEqual(Array.from(set.sentences, s => s.id), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.deepEqual(Array.from(set.sentences, s => s.level), expectedLevels);
  assert.deepEqual(Array.from(set.sentences, s => s.mediumPrompt), expectedPrompts);
  assert.deepEqual(Object.fromEntries(["A1","A2","B1","B2","C1","C2"].map(level => [level, set.sentences.filter(s => s.level === level).length])), { A1:4, A2:4, B1:6, B2:6, C1:4, C2:0 });
  assert.equal(set.sentences.reduce((count, s) => count + s.acceptedAnswers.length, 0), 158);
  // Fingerprint of all fields parsed directly from the user's supplied content.
  // This also ensures runtime expansion never adds uncurated Set 12 answers.
  assert.equal(digest(set.sentences), "622d0cc1f63a16a7f13db8a53d8fc63da8cee19db840448f4e9210bed56d63be");
  for (const s of set.sentences) {
    assert.deepEqual(Object.keys(s).sort(), ["acceptedAnswers","id","level","mediumPrompt","note","primaryAnswer","spanish"]);
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

test("Hard accepts all 24 primary answers and 158 alternatives with existing normalization", () => {
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
  assert.equal(valid("Where is my rucksack?", sets[11].sentences[0], "Hard"), false);
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
