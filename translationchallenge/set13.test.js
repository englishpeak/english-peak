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
    const state={screen:"exercise",difficulty:"Hard",setId:13,index:0,progress:{}};
    function show(screen){state.screen=screen}
    ${functions}
    globalThis.challenge={sets,state,valid,normalizeAnswer,stripPunctuationWords,currentUserAnswer,entry,results,chooseDifficulty,startSet};
  `, context);
  return context.challenge;
}

const digest = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Set 13 preserves all approved content and only the 166 supplied alternatives", () => {
  const { sets } = challenge();
  const set = sets.find(set => set.id === 13);
  assert.equal(sets.length, 13);
  assert.equal(set.title, "Set 13");
  assert.equal(set.description, "24 sentences · Mixed levels · Mixed grammar and vocabulary");
  assert.equal(set.sentences.length, 24);
  assert.deepEqual(Array.from(set.sentences, s => s.id), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.deepEqual(Array.from(set.sentences, s => s.level), ["A1","B1","B2","A2","C1","B2","A1","B2","B1","A2","A1","B2","B1","B1","C1","A2","A1","B1","C1","B2","B1","A2","C1","B2"]);
  assert.deepEqual(Object.fromEntries(["A1","A2","B1","B2","C1","C2"].map(level => [level, set.sentences.filter(s => s.level === level).length])), { A1:4, A2:4, B1:6, B2:6, C1:4, C2:0 });
  assert.equal(set.sentences.reduce((total, s) => total + s.acceptedAnswers.length, 0), 166);
  // Fingerprint from the supplied specification; the renderer adds the ellipses.
  assert.equal(digest(set.sentences), "d292661db2d143095daab6bce651be3f76241556d07746cbc4488b147ff0ecb4");
  for (const s of set.sentences) {
    assert.deepEqual(Object.keys(s).sort(), ["acceptedAnswers","id","level","mediumPrompt","note","primaryAnswer","spanish"]);
    assert.ok(s.note.trim());
    assert.ok(s.primaryAnswer.startsWith(`${s.mediumPrompt} `));
    assert.ok(s.mediumPrompt.split(/\s+/).length >= 2 && s.mediumPrompt.split(/\s+/).length <= 3);
  }
});

test("the five vocabulary targets stay integrated without extra learner metadata", () => {
  const sentences = challenge().sets.find(set => set.id === 13).sentences;
  const targets = [[4,"charco","puddle"], [9,"pestillo","latch"], [14,"pelusa","lint"], [21,"deshilachando","fray"], [22,"empañó","fogged up"]];
  assert.equal(targets.length, 5);
  for (const [id, spanish, english] of targets) {
    assert.ok(sentences[id - 1].spanish.includes(spanish));
    assert.ok(sentences[id - 1].primaryAnswer.toLowerCase().includes(english));
  }
});

test("Hard accepts every primary and approved alternative with existing normalization", () => {
  const { sets, valid } = challenge();
  for (const s of sets.find(set => set.id === 13).sentences) {
    for (const answer of [s.primaryAnswer, ...s.acceptedAnswers]) {
      assert.ok(valid(answer, s, "Hard"), `Item ${s.id}: ${answer}`);
      for (const apostrophe of ["’", "‘", "`", "´"]) {
        const variant = `  ${answer.toUpperCase().replaceAll("'", apostrophe).replaceAll(" ", "  ")}!!!  `;
        assert.ok(valid(variant, s, "Hard"), `Normalized item ${s.id}: ${answer}`);
      }
    }
  }
});

test("all 24 Easy banks and supplied Medium openings reconstruct the primary answers", () => {
  const app = challenge();
  app.sets.find(set => set.id === 13).sentences.forEach((s, index) => {
    app.state.index = index;
    app.state.difficulty = "Easy";
    const words = app.stripPunctuationWords(s.primaryAnswer);
    app.entry().chosen = words.map((word, id) => ({ word, id }));
    assert.equal(new Set(app.entry().chosen.map(token => token.id)).size, words.length);
    assert.ok(app.valid(app.currentUserAnswer(), s, "Easy"), `Easy ${s.id}`);
    app.state.difficulty = "Medium";
    app.entry().typed = s.primaryAnswer.slice(s.mediumPrompt.length).trim();
    assert.equal(app.currentUserAnswer(), s.primaryAnswer);
    assert.ok(app.valid(app.currentUserAnswer(), s, "Medium"), `Medium ${s.id}`);
  });
});

test("incorrect word order, missing auxiliaries, and incorrect verb forms remain rejected", () => {
  const { sets, valid } = challenge();
  const sentences = sets.find(set => set.id === 13).sentences;
  for (const s of sentences) {
    for (const wrong of ["", s.primaryAnswer.split(" ").reverse().join(" "), s.primaryAnswer.split(" ").slice(0, -1).join(" "), `${s.primaryAnswer} tomorrow`]) {
      for (const mode of ["Easy", "Medium", "Hard"]) assert.equal(valid(wrong, s, mode), false, `${mode} ${s.id}: ${wrong}`);
    }
  }
  for (const [id, wrong] of [[1,"Whose this jacket is?"], [3,"I would gone with you if they hadn't changed my shift at the last minute."], [6,"I haven't drove in so long that I'm worried I'm out of practice."], [9,"Can you check the latch on this window? It don't close properly, so air gets in."], [12,"I wish I hadn't say that in front of everyone."], [24,"Do you remember to tell me I could share that photo?"]]) {
    assert.equal(valid(wrong, sentences[id - 1], "Hard"), false);
  }
});

test("Sets 1–12 retain their exact runtime content", () => {
  assert.equal(digest(challenge().sets.slice(0, 12)), "92ea8cc9dc1a3e1c5156682eddf1e49b99541a50fafd92c8b55968ab766497f8");
});

test("variable lengths and independent difficulty progress work for new and existing sets", () => {
  for (const [id, total] of [[13,24], [12,24], [11,24], [10,24], [1,30]]) {
    const app = challenge();
    app.startSet(id);
    for (let i = 0; i < total; i++) {
      app.state.index = i;
      Object.assign(app.entry(), { checked:true, correct:i % 2 === 0 });
    }
    assert.deepEqual(JSON.parse(JSON.stringify(app.results())), { correct:total / 2, total, attempted:total, percent:50 });
    app.chooseDifficulty("Medium");
    assert.equal(app.state.setId, id);
    assert.equal(app.state.index, 0);
    assert.equal(app.results().attempted, 0);
    app.chooseDifficulty("Hard");
    assert.equal(app.state.setId, id);
    assert.equal(app.results().attempted, total);
  }
});
