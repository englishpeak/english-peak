import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const data = html.slice(html.indexOf("const sets="), html.indexOf("const app="));
const originalData = html.slice(html.indexOf("const sets="), html.indexOf("// Build out common, fully equivalent forms"));
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

function originalSet13() {
  const context = {};
  vm.runInNewContext(`${originalData};globalThis.set13=sets.find(set=>set.id===13)`, context);
  return context.set13;
}

test("Set 13 preserves every original prompt, primary answer, alternative, opening, and note", () => {
  const { sets } = challenge();
  const set = originalSet13();
  const runtimeSet = sets.find(set => set.id === 13);
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
    const expanded = runtimeSet.sentences[s.id - 1];
    for (const [field, value] of Object.entries(s)) {
      if (field === "acceptedAnswers") {
        assert.deepEqual(Array.from(expanded.acceptedAnswers.slice(0, value.length)), Array.from(value));
      } else {
        assert.equal(expanded[field], value);
      }
    }
  }
});

test("all 24 prompts gain distinct curated answers, with more coverage for longer sentences", () => {
  const app = challenge();
  const originals = originalSet13().sentences;
  const sentences = app.sets.find(set => set.id === 13).sentences;
  const minimumByLevel = { A1:6, A2:8, B1:14, B2:16, C1:20 };
  let added = 0;
  for (const s of sentences) {
    const additions = s.acceptedAnswers.slice(originals[s.id - 1].acceptedAnswers.length);
    assert.ok(additions.length >= minimumByLevel[s.level], `Item ${s.id} needs more alternatives`);
    added += additions.length;
    const answers = [s.primaryAnswer, ...s.acceptedAnswers];
    assert.equal(new Set(answers.map(app.normalizeAnswer)).size, answers.length, `Duplicate item ${s.id}`);
    let mediumCompatible = 0;
    for (const answer of additions) {
      assert.ok(app.valid(answer, s, "Hard"), `New Hard ${s.id}: ${answer}`);
      if (answer.startsWith(`${s.mediumPrompt} `)) {
        app.state.index = s.id - 1;
        app.state.difficulty = "Medium";
        app.entry().typed = answer.slice(s.mediumPrompt.length).trim();
        assert.ok(app.valid(app.currentUserAnswer(), s, "Medium"), `New Medium ${s.id}: ${answer}`);
        mediumCompatible++;
      }
    }
    assert.ok(mediumCompatible >= 2, `Item ${s.id} needs multiple Medium completions`);
  }
  assert.equal(added, 384);
  assert.equal(sentences.reduce((total, s) => total + s.acceptedAnswers.length, 0), 550);
});

test("new paraphrases preserve tense, negation, vocabulary, and sentence details", () => {
  const { sets, valid } = challenge();
  const sentences = sets.find(set => set.id === 13).sentences;
  const examples = [
    [1, "Who is this jacket's owner?", "Who is this jacket's buyer?"],
    [2, "My signal went out just as you were trying to call me.", "My signal came back just as you were trying to call me."],
    [3, "I would have gone with you had they not changed my shift at the last minute.", "I would have gone with you had they changed my shift at the last minute."],
    [4, "The rain left a pool of water in front of the door.", "The rain left a pool of water behind the door."],
    [5, "I do trust you; I just prefer to check it myself.", "I don't trust you; I just prefer to check it myself."],
    [6, "I'm worried I'm out of practice because I haven't driven in so long.", "I'm worried I'm out of practice because I haven't drove in so long."],
    [7, "I'll be seeing you tomorrow morning.", "I'll be seeing you tomorrow evening."],
    [8, "They arrived nearly an hour late despite having promised me they'd be early.", "They arrived nearly an hour early despite having promised me they'd be early."],
    [9, "Could you take a look at this window's catch? It doesn't close properly, and there's a draught.", "Could you take a look at this window's catch? It closes properly, and there's no draught."],
    [10, "Can you tell me how I can get to the library?", "Can you tell me how can I get to the library?"],
    [11, "I don't have any lessons today.", "I doesn't have any lessons today."],
    [12, "I wish I hadn't said that with everyone there.", "I wish I haven't said that with everyone there."],
    [13, "Have you already got enough food, or should I bring something?", "Have you already got enough money, or should I bring something?"],
    [14, "This black T-shirt collects lint every time I wash it.", "This black T-shirt collects lint every time I wear it."],
    [15, "I get the feeling they're dragging their feet so they don't have to commit to a date.", "I get the feeling they're dragging their feet so they have to commit to a date."],
    [16, "Which of these two options do you like better?", "Which of these three options do you like better?"],
    [17, "I need a further five minutes.", "I need a further fifty minutes."],
    [18, "I thought I'd already replied to you, but I never pressed send.", "I thought I'd already replied to you, but I already pressed send."],
    [19, "I don't want to come off as demanding, but I'd appreciate it if you gave me more notice next time.", "I don't want to come off as demanding, but I'd appreciate it if you gave me less notice next time."],
    [20, "At first I thought they were exaggerating, but then I realized they were right.", "At first I thought they were exaggerating, but then I realized they were wrong."],
    [21, "This towel has started fraying around the edges.", "This towel has started fray around the edges."],
    [22, "The bathroom mirror misted up after I took a shower.", "The bathroom mirror misted up before I took a shower."],
    [23, "I don't want to hurry things, but we can't keep going in circles without making a decision.", "I don't want to hurry things, but we can keep going in circles without making a decision."],
    [24, "Do you remember giving me the go-ahead to share that photo?", "Do you remember to give me the go-ahead to share that photo?"]
  ];
  for (const [id, accepted, rejected] of examples) {
    assert.ok(valid(accepted, sentences[id - 1], "Hard"), `Curated item ${id}: ${accepted}`);
    for (const difficulty of ["Medium", "Hard"]) {
      assert.equal(valid(rejected, sentences[id - 1], difficulty), false, `Incorrect item ${id}: ${rejected}`);
    }
  }
});

test("gender-ambiguous prompts cover natural he, she, and they paraphrases", () => {
  const sentences = challenge().sets.find(set => set.id === 13).sentences;
  for (const [id, fragments] of [[8,["she turned up", "he turned up", "they turned up"]], [15,["he's dragging his feet", "she's dragging her feet", "they're dragging their feet"]], [20,["she was blowing things out of proportion", "he was blowing things out of proportion", "they were blowing things out of proportion"]]]) {
    for (const fragment of fragments) assert.ok(sentences[id - 1].acceptedAnswers.some(answer => answer.includes(fragment)), `Item ${id}: ${fragment}`);
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
