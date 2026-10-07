import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
const functionNames = ["normalizeAnswer", "stripPunctuationWords", "setData", "sentence", "key", "entry", "valid", "chooseDifficulty", "startSet", "currentUserAnswer", "results"];
const functions = functionNames.map(name => {
  const line = html.split("\n").find(line => line.startsWith("function ") && line.includes(`function ${name}(`));
  assert.ok(line, `Missing application function: ${name}`);
  return line;
}).filter((line, index, lines) => lines.indexOf(line) === index).join("\n");

function challenge() {
  const context = {};
  vm.runInNewContext(`${data}
    const state={screen:"exercise",difficulty:"Hard",setId:11,index:0,progress:{}};
    function show(screen){state.screen=screen}
    ${functions}
    globalThis.challenge={sets,state,valid,stripPunctuationWords,currentUserAnswer,entry,results,chooseDifficulty,startSet};
  `, context);
  return context.challenge;
}

const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const expectedLevels = ["A1","B1","B2","A2","A2","B2","A1","B2","B1","B1","A1","B2","B1","B1","B2","A2","A1","C1","B1","B2","C1","C1","C1","A2"];
const expectedPrompts = ["What time", "I didn't", "There's no", "This shelf", "Do you", "I thought", "My phone", "If you're", "I think", "We ended", "Are you", "If it", "We ran", "Check the", "I would", "Can you", "It's really", "I don't", "Can you", "It wasn't", "I don't", "No matter", "If there's", "Let the"];

test("Set 11 preserves every supplied prompt, answer, alternative, and teaching note", () => {
  const { sets } = challenge();
  const set = sets.find(set => set.id === 11);
  assert.equal(set.title, "Set 11");
  assert.equal(set.description, "24 sentences · Mixed levels · Mixed grammar and vocabulary");
  assert.equal(set.sentences.length, 24);
  assert.deepEqual(Array.from(set.sentences, sentence => sentence.id), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.deepEqual(Array.from(set.sentences, sentence => sentence.level), expectedLevels);
  assert.deepEqual(Array.from(set.sentences, sentence => sentence.mediumPrompt), expectedPrompts);
  assert.deepEqual(Object.fromEntries(["A1","A2","B1","B2","C1","C2"].map(level => [level, set.sentences.filter(sentence => sentence.level === level).length])), { A1:4, A2:4, B1:6, B2:6, C1:4, C2:0 });
  assert.equal(set.sentences.reduce((count, sentence) => count + sentence.acceptedAnswers.length, 0), 158);
  // Fingerprint of the complete manually supplied content, with only the final
  // mediumPrompt ellipses removed because the existing renderer supplies them.
  assert.equal(digest(set.sentences), "5ac697743b2a44db18b514116ba7e03e84cb43f66dbf7b6b6824b2d87021bdc9");
  set.sentences.forEach(sentence => {
    assert.deepEqual(Object.keys(sentence).sort(), ["acceptedAnswers", "id", "level", "mediumPrompt", "note", "primaryAnswer", "spanish"]);
  });
});

test("Set 11 includes the five specified vocabulary targets without special learner labels", () => {
  const { sets } = challenge();
  const sentences = sets.find(set => set.id === 11).sentences;
  const targets = [[4,"enchuecando","warp"], [9,"fleco","bangs"], [14,"caducó","expired"], [19,"destornillador","screwdriver"], [24,"escurrir","drain"]];
  assert.equal(targets.length / sentences.length, 5 / 24);
  for (const [id, spanish, english] of targets) {
    assert.ok(sentences[id - 1].spanish.includes(spanish));
    assert.ok(sentences[id - 1].primaryAnswer.includes(english));
  }
  assert.ok(sentences[8].acceptedAnswers.some(answer => answer.includes("fringe")));
});

test("the actual Hard validator accepts all 182 supplied answers and existing mechanical normalization", () => {
  const { sets, valid } = challenge();
  for (const sentence of sets.find(set => set.id === 11).sentences) {
    for (const answer of [sentence.primaryAnswer, ...sentence.acceptedAnswers]) {
      assert.ok(valid(answer, sentence, "Hard"), `Item ${sentence.id}: ${answer}`);
      assert.ok(valid(`  ${answer.toUpperCase().replaceAll("'", "’").replaceAll(" ", "  ")}!!!  `, sentence, "Hard"));
    }
  }
});

test("the actual validator rejects wrong structures, meanings, and unlisted automatic variants", () => {
  const { sets, valid } = challenge();
  const sentences = sets.find(set => set.id === 11).sentences;
  const wrongAnswers = [
    "What time do your class end?",
    "I didn't realize I'll leave the window open.",
    "There's no point in argue if neither of us is going to change our mind.",
    "This shelf is starting to melt from the weight of the books.",
    "Do you want I save you a seat?",
    "I thought I'd use the noise by now.",
    "My phone is under the table.",
    "If you're going to cancel, let me know too late so I can make other plans.",
    "I think I'm going to cut my eyebrows a little shorter.",
    "We ended up stay one more night.",
    "Do you have hungry?",
    "If it weren't for the traffic, I got to your house in twenty minutes.",
    "We ran into coffee this morning.",
    "Check the date because I think this milk is fresh.",
    "I would stay longer, but I don't want to overstay my welcome.",
    "Can you let me know when you will get there?",
    "Today has very heat.",
    "I know how he manages to get away with it every time he does something like that.",
    "Can you pass me the hammer that's in the toolbox?",
    "It wasn't until I got to the airport that I remembered I'll leave my passport at home.",
    "I don't want to jump to conclusions, but I'm entirely convinced by his explanation.",
    "No matter how hard I try to play it down, the situation never worries me.",
    "If there's one thing that bothers me, it's that he always takes it for granted that I'll be unavailable.",
    "Let the pasta soak before you put it on the plate."
  ];
  sentences.forEach((sentence, i) => {
    assert.equal(valid(wrongAnswers[i], sentence, "Hard"), false, `Item ${sentence.id}`);
    assert.equal(valid(sentence.primaryAnswer.split(" ").slice(0, -1).join(" "), sentence, "Hard"), false);
    assert.equal(valid(`${sentence.primaryAnswer} tomorrow`, sentence, "Hard"), false);
  });
  assert.equal(valid("I did not realize I'd left the window open.", sentences[1], "Hard"), false);
  assert.equal(valid("It's really hot today.", sentences[6], "Hard"), false);
});

test("all 24 Easy and Medium answers pass through the application's actual answer assembly", () => {
  const app = challenge();
  const sentences = app.sets.find(set => set.id === 11).sentences;
  sentences.forEach((sentence, index) => {
    app.state.index = index;
    app.state.difficulty = "Easy";
    const words = app.stripPunctuationWords(sentence.primaryAnswer);
    app.entry().chosen = words.map((word, id) => ({ word, id }));
    assert.ok(app.valid(app.currentUserAnswer(), sentence, "Easy"), `Easy item ${sentence.id}`);
    assert.equal(new Set(app.entry().chosen.map(token => token.id)).size, words.length);
    app.state.difficulty = "Medium";
    assert.ok(sentence.primaryAnswer.startsWith(sentence.mediumPrompt));
    app.entry().typed = sentence.primaryAnswer.slice(sentence.mediumPrompt.length).trim();
    assert.ok(app.valid(app.currentUserAnswer(), sentence, "Medium"), `Medium item ${sentence.id}`);
  });
});

test("Sets 1–10 keep their complete original runtime content, including expanded alternatives", () => {
  assert.equal(digest(challenge().sets.slice(0, 10)), "2d6b239becf7e55a708c8398e03016cb450ea6f68320e2658e70de5d0caa50d2");
});

test("30-item and 24-item sets keep correct results and retain the active set when switching difficulty", () => {
  for (const [id, total] of [[9, 30], [10, 24], [11, 24]]) {
    const app = challenge();
    app.startSet(id);
    for (let i = 0; i < total; i++) {
      app.state.index = i;
      Object.assign(app.entry(), { checked: true, correct: i % 2 === 0 });
    }
    assert.deepEqual(JSON.parse(JSON.stringify(app.results())), { correct: total / 2, total, attempted: total, percent: 50 });
    app.chooseDifficulty("Medium");
    assert.equal(app.state.setId, id);
    assert.equal(app.state.index, 0);
    assert.equal(app.state.screen, "exercise");
    assert.equal(app.results().attempted, 0);
    app.chooseDifficulty("Hard");
    assert.equal(app.results().attempted, total);
    assert.equal(app.state.setId, id);
  }
});
