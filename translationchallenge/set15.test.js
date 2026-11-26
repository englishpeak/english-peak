import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
const originalData = data.slice(0, data.indexOf("// Build out common, fully equivalent forms"));
const originalSet15 = vm.runInNewContext(`${originalData}
  sets.find(set => set.id === 15)
`);
const functions = html.split("\n").filter(line =>
  /^function (normalizeAnswer|stripPunctuationWords|setData|valid|currentUserAnswer)\(/.test(line)
).join("\n");
const app = vm.runInNewContext(`${data}
  const state={difficulty:"Hard",setId:15,index:0,progress:{}};
  ${functions}
  ({sets,state,valid,normalizeAnswer,stripPunctuationWords,currentUserAnswer,entry})
`);
const set15 = app.sets.find(set => set.id === 15);
const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Set 15 contains the supplied content, including the exact openings and notes, in order", () => {
  assert.deepEqual(Array.from(app.sets, set => set.id), Array.from({ length: 15 }, (_, index) => index + 1));
  assert.equal(set15.title, "Set 15");
  assert.deepEqual(Array.from(set15.sentences, sentence => sentence.id), Array.from({ length: 24 }, (_, index) => index + 1));
  assert.deepEqual(Array.from(set15.sentences, sentence => sentence.level), [
    "A2", "B1", "A1", "C1", "B2", "A1", "B1", "C1", "A2", "B1", "B2", "A1",
    "C1", "A2", "B1", "B2", "B1", "A1", "A2", "B2", "B1", "C1", "B2", "B2"
  ]);

  // Hash of the supplied fields after excluding the five alternatives flagged below.
  assert.equal(digest(originalSet15.sentences), "a6ff358ea8a6b980ead92d53808f053f912ea480eba8223a262e141dbda05c36");
  const originalContent = set15.sentences.map((sentence, index) => ({
    ...sentence,
    acceptedAnswers: sentence.acceptedAnswers.slice(0, originalSet15.sentences[index].acceptedAnswers.length)
  }));
  assert.equal(digest(originalContent), digest(originalSet15.sentences));
  for (const [id, spanish, english] of [
    [2, "calambre", "a cramp"],
    [4, "Carraspeó", "cleared his throat"],
    [6, "hipo", "the hiccups"],
    [9, "cierre", "the zipper"],
    [16, "abolladura", "a dent"]
  ]) {
    const sentence = set15.sentences[id - 1];
    assert.ok(sentence.spanish.includes(spanish));
    assert.ok(sentence.primaryAnswer.toLowerCase().includes(english));
  }
});

test("Hard accepts every primary and approved alternative with existing normalization", () => {
  for (const sentence of set15.sentences) {
    const answers = [sentence.primaryAnswer, ...sentence.acceptedAnswers];
    assert.equal(new Set(answers.map(app.normalizeAnswer)).size, answers.length, `Duplicate answer for item ${sentence.id}`);
    for (const answer of answers) {
      const variant = `  ${answer.toUpperCase().replaceAll("'", "’").replaceAll(" ", "  ")}!!  `;
      assert.ok(app.valid(answer, sentence, "Hard"), answer);
      assert.ok(app.valid(variant, sentence, "Hard"), variant);
    }
  }
});

test("Every Set 15 prompt gains alternatives, with more coverage for complex prompts", () => {
  const minimumByLevel = { A1: 5, A2: 9, B1: 11, B2: 13, C1: 18 };
  for (const [index, sentence] of set15.sentences.entries()) {
    const additions = sentence.acceptedAnswers.slice(originalSet15.sentences[index].acceptedAnswers.length);
    assert.ok(additions.length >= minimumByLevel[sentence.level], `Item ${sentence.id} gained only ${additions.length} answers`);

    const opening = sentence.mediumPrompt.slice(0, -3);
    const mediumAdditions = additions.filter(answer => app.normalizeAnswer(answer).startsWith(`${app.normalizeAnswer(opening)} `));
    assert.ok(mediumAdditions.length >= 2, `Item ${sentence.id} needs more Medium completions`);
  }
});

test("Easy tokens and exact Medium openings assemble valid answers for all 24 items", () => {
  for (const [index, sentence] of set15.sentences.entries()) {
    app.state.index = index;
    app.state.difficulty = "Easy";
    app.entry().chosen = app.stripPunctuationWords(sentence.primaryAnswer).map((word, id) => ({ word, id }));
    assert.ok(app.valid(app.currentUserAnswer(), sentence), `Easy item ${sentence.id}`);

    app.state.difficulty = "Medium";
    assert.match(sentence.mediumPrompt, /^\S+(?: \S+){1,2}\.{3}$/);
    const opening = sentence.mediumPrompt.slice(0, -3);
    assert.ok(sentence.primaryAnswer.startsWith(`${opening} `));
    const compatibleAnswers = [sentence.primaryAnswer, ...sentence.acceptedAnswers].filter(answer => answer.startsWith(`${opening} `));
    for (const answer of compatibleAnswers) {
      app.entry().typed = answer.slice(opening.length + 1);
      assert.equal(app.currentUserAnswer(), answer);
      assert.ok(app.valid(app.currentUserAnswer(), sentence), `Medium item ${sentence.id}: ${answer}`);
    }
  }
});

test("Hard rejects grammar errors, changes in meaning, and alternatives flagged for review", () => {
  const incorrect = [
    [1, "Can you turn down it a bit? I'm trying to sleep."],
    [2, "While I was swimming, I get a cramp in my leg and had to get out of the water."],
    [3, "What time do the pharmacy open?"],
    [4, "He cleared his throat a few times before telling us the news, and that's when I realized something was wrong."],
    [4, "She cleared her throat a few times before telling us the news, and that's when I realized something was wrong."],
    [5, "Does anybody know who took my phone charger? I could've sworn I left it here."],
    [6, "I got the hiccups!"],
    [7, "We arrived on time yesterday because we got stuck in traffic for over an hour."],
    [9, "The zipper on my jacket is broken. Do you know where can I get it fixed?"],
    [10, "By the time we got to the cinema, the film had already started, but they let us in."],
    [11, "Why didn't anyone tell me the meeting had canceled?"],
    [13, "He says he'd love to help us, but the boss has already given him the go-ahead."],
    [19, "Which one is cheaper?"],
    [20, "It would've been better if you would have told me from the beginning instead of keeping me waiting."],
    [22, "They got on well from the start because they'd known each other all their lives."],
    [23, "It turns out the restaurant they recommended to us opens in a few months."],
    [24, "My brother loves cooking, but he never cleans up the mess he makes in the kitchen."]
  ];
  for (const [id, answer] of incorrect) {
    assert.equal(app.valid(answer, set15.sentences[id - 1], "Hard"), false, answer);
  }
});
