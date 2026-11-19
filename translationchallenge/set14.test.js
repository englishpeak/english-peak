import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
const originalData = data.slice(0, data.indexOf("// Build out common, fully equivalent forms"));
const originalSet14 = vm.runInNewContext(`${originalData}
  sets.find(set => set.id === 14)
`);
const functions = html.split("\n").filter(line =>
  /^function (normalizeAnswer|stripPunctuationWords|setData|valid|currentUserAnswer)\(/.test(line)
).join("\n");
const app = vm.runInNewContext(`${data}
  const state={difficulty:"Hard",setId:14,index:0,progress:{}};
  ${functions}
  ({sets,state,valid,normalizeAnswer,stripPunctuationWords,currentUserAnswer,entry})
`);
const set14 = app.sets.find(set => set.id === 14);
const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Set 14 preserves all supplied content in order and only uses the existing item fields", () => {
  assert.equal(set14.title, "Set 14");
  assert.equal(set14.description, "24 sentences · Mixed levels · Mixed grammar and vocabulary");
  assert.deepEqual(Array.from(set14.sentences, sentence => sentence.id), Array.from({ length: 24 }, (_, i) => i + 1));
  const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
  for (const sentence of set14.sentences) {
    counts[sentence.level]++;
    assert.deepEqual(Object.keys(sentence).sort(), ["acceptedAnswers", "id", "level", "mediumPrompt", "note", "primaryAnswer", "spanish"]);
    assert.ok(sentence.note.trim());
  }
  assert.deepEqual(counts, { A1: 4, A2: 4, B1: 6, B2: 6, C1: 4, C2: 0 });
  // Fingerprint from the supplied text with the renderer's trailing periods omitted.
  assert.equal(digest(originalSet14.sentences), "c8d2afae8f5a869a2a531589fe319e0e6ac2b06c559179e571a335610a644644");
  const originalContent = set14.sentences.map((sentence, index) => ({
    ...sentence,
    acceptedAnswers: sentence.acceptedAnswers.slice(0, originalSet14.sentences[index].acceptedAnswers.length)
  }));
  assert.equal(digest(originalContent), digest(originalSet14.sentences));

  for (const [id, spanish, english] of [
    [4, "recogedor", "dustpan"],
    [9, "migajas", "crumbs"],
    [14, "astilla", "splinter"],
    [19, "sacacorchos", "corkscrew"],
    [22, "bache", "pothole"]
  ]) {
    const sentence = set14.sentences[id - 1];
    assert.ok(sentence.spanish.includes(spanish));
    assert.ok(sentence.primaryAnswer.includes(english));
    assert.ok(sentence.note.toLowerCase().includes(english));
  }
});

test("every Set 14 primary answer reconstructs from the Easy bank and Medium opening", () => {
  for (const [index, sentence] of set14.sentences.entries()) {
    app.state.index = index;
    app.state.difficulty = "Easy";
    app.entry().chosen = app.stripPunctuationWords(sentence.primaryAnswer).map((word, id) => ({ word, id }));
    assert.ok(app.valid(app.currentUserAnswer(), sentence), `Easy item ${sentence.id}`);

    app.state.difficulty = "Medium";
    assert.match(sentence.mediumPrompt, /^\S+(?: \S+){1,2}$/);
    assert.ok(sentence.primaryAnswer.startsWith(`${sentence.mediumPrompt} `));
    app.entry().typed = sentence.primaryAnswer.slice(sentence.mediumPrompt.length).trim();
    assert.ok(app.valid(app.currentUserAnswer(), sentence), `Medium item ${sentence.id}`);
  }
});

test("Hard accepts each distinct curated answer with the existing normalization", () => {
  for (const sentence of set14.sentences) {
    const answers = [sentence.primaryAnswer, ...sentence.acceptedAnswers];
    assert.equal(new Set(answers.map(app.normalizeAnswer)).size, answers.length, `Item ${sentence.id}`);
    for (const answer of answers) {
      const normalizedVariant = `  ${answer.toUpperCase().replaceAll("'", "’").replaceAll(" ", "  ")}!!  `;
      assert.ok(app.valid(answer, sentence, "Hard"), answer);
      assert.ok(app.valid(normalizedVariant, sentence, "Hard"), normalizedVariant);
    }
  }
});

test("Set 14 adds alternatives to every prompt with more coverage for longer prompts", () => {
  const minimumByLevel = { A1: 5, A2: 9, B1: 11, B2: 18, C1: 22 };
  for (const [index, sentence] of set14.sentences.entries()) {
    const original = originalSet14.sentences[index];
    const additions = sentence.acceptedAnswers.length - original.acceptedAnswers.length;
    assert.ok(additions >= minimumByLevel[sentence.level], `Item ${sentence.id} added only ${additions}`);
  }
  assert.ok(app.valid("Are you all set to go?", set14.sentences[0], "Hard"));
  assert.ok(app.valid("When you were finally called in, how long had you been waiting?", set14.sentences[5], "Hard"));
  assert.ok(app.valid("I realised I'd mixed up the dates when I checked my calendar.", set14.sentences[23], "Hard"));
});

test("the next batch preserves prior answers and adds Medium completions to every Set 14 prompt", () => {
  const priorCounts = [15, 22, 28, 16, 35, 27, 16, 28, 22, 16, 32, 21, 15, 18, 31, 17, 33, 27, 21, 9, 32, 19, 35, 24];
  const minimumByLevel = { A1: 3, A2: 5, B1: 8, B2: 14, C1: 17 };
  const priorSentences = set14.sentences.map((sentence, index) => ({
    ...sentence,
    acceptedAnswers: sentence.acceptedAnswers.slice(0, priorCounts[index])
  }));
  assert.equal(digest(priorSentences), "f450ad8b4f28b83048257cf7f060b665d2634cdb5aef9cb1d6232d51a146a39e");

  for (const [index, sentence] of set14.sentences.entries()) {
    const additions = sentence.acceptedAnswers.slice(priorCounts[index]);
    assert.ok(additions.length >= minimumByLevel[sentence.level], `Too few new answers for item ${sentence.id}`);
    const opening = `${app.normalizeAnswer(sentence.mediumPrompt)} `;
    assert.ok(additions.some(answer => app.normalizeAnswer(answer).startsWith(opening)), `No new Medium completion for item ${sentence.id}`);
  }
});

test("Medium accepts curated alternatives that fit its displayed opening", () => {
  app.state.difficulty = "Medium";
  for (const [index, sentence] of set14.sentences.entries()) {
    app.state.index = index;
    const opening = app.normalizeAnswer(sentence.mediumPrompt);
    const completions = sentence.acceptedAnswers.map(app.normalizeAnswer)
      .filter(answer => answer.startsWith(`${opening} `));
    assert.ok(completions.length > 0, `No Medium alternatives for item ${sentence.id}`);
    for (const answer of completions) {
      app.entry().typed = answer.slice(opening.length).trim();
      assert.ok(app.valid(app.currentUserAnswer(), sentence), answer);
    }
  }
});

test("Hard rejects incorrect auxiliaries, tense, word order, and meaning", () => {
  for (const [id, answer] of [
    [1, "Do you ready to leave?"],
    [3, "If we haven't booked ahead, we wouldn't have gotten a table."],
    [6, "How long you had been waiting when they finally called you in?"],
    [8, "I would have sent you the location, but my phone didn't die."],
    [18, "You promised you'd let me know as soon as you will find out anything."],
    [24, "I realised I'd got the dates right when I checked my calendar."]
  ]) {
    assert.equal(app.valid(answer, set14.sentences[id - 1], "Hard"), false, answer);
  }
});

test("Sets 1–13 retain their runtime content and original lengths", () => {
  const existing = app.sets.filter(set => set.id < 14);
  assert.deepEqual(Array.from(existing, set => set.sentences.length), [
    30, 30, 30, 30, 30, 30, 30, 30, 30, 24, 24, 24, 24
  ]);
  assert.equal(digest(existing), "25c27f891ac7bd389e26c60faa668a48760fae05abf2e6a90ba920bc73f0171a");
});
