import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
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
  assert.equal(set14.sentences.reduce((sum, sentence) => sum + sentence.acceptedAnswers.length, 0), 188);
  // Fingerprint from the supplied text with the renderer's trailing periods omitted.
  assert.equal(digest(set14.sentences), "c8d2afae8f5a869a2a531589fe319e0e6ac2b06c559179e571a335610a644644");

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

test("Hard rejects incorrect auxiliaries, tense, word order, meaning, and unlisted variations", () => {
  for (const [id, answer] of [
    [1, "Do you ready to leave?"],
    [3, "If we haven't booked ahead, we wouldn't have gotten a table."],
    [6, "How long you had been waiting when they finally called you in?"],
    [8, "I would have sent you the location, but my phone didn't die."],
    [18, "You promised you'd let me know as soon as you will find out anything."],
    [24, "I realised I'd mixed up the dates when I checked my calendar."]
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
