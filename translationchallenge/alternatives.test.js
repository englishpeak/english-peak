import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const dataStart = html.indexOf("const sets=");
const expansionStart = html.indexOf("// Build out common, fully equivalent forms");
const appStart = html.indexOf("const app=");

function evaluateSets(source) {
  const context = {};
  vm.runInNewContext(`${source};globalThis.challengeSets=sets`, context);
  return context.challengeSets;
}

test("every translation challenge sentence gains accepted alternatives", () => {
  const originalSets = evaluateSets(html.slice(dataStart, expansionStart));
  const expandedSets = evaluateSets(html.slice(dataStart, appStart));
  const originalCounts = originalSets.flatMap(set => set.sentences.map(sentence => sentence.acceptedAnswers.length));
  const expandedSentences = expandedSets.flatMap(set => set.sentences);

  assert.equal(expandedSets.length, 3);
  assert.equal(expandedSentences.length, 90);
  expandedSentences.forEach((sentence, index) => {
    assert.ok(
      sentence.acceptedAnswers.length > originalCounts[index],
      `Set ${Math.floor(index / 30) + 1}, sentence ${(index % 30) + 1} should gain an alternative`
    );
  });
});

test("expanded alternatives include contractions, dialects, and natural synonyms", () => {
  const sets = evaluateSets(html.slice(dataStart, appStart));

  assert.ok(sets[0].sentences[0].acceptedAnswers.includes("I do not know where I left my keys."));
  assert.ok(sets[0].sentences[1].acceptedAnswers.includes("How long have you been working remotely?"));
  assert.ok(sets[1].sentences[4].acceptedAnswers.includes("When was the last time you had a conversation with her?"));
  assert.ok(sets[2].sentences[3].acceptedAnswers.includes("I didn't expect the film to be so good."));
});
