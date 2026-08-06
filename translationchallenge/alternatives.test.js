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

  assert.equal(expandedSets.length, 4);
  assert.equal(expandedSentences.length, 120);
  expandedSentences.slice(0, 90).forEach((sentence, index) => {
    assert.ok(
      sentence.acceptedAnswers.length > originalCounts[index],
      `Set ${Math.floor(index / 30) + 1}, sentence ${(index % 30) + 1} should gain an alternative`
    );
  });
});

test("Set 4 has the required prompts and complete challenge data", () => {
  const originalSets = evaluateSets(html.slice(dataStart, expansionStart));
  const sets = evaluateSets(html.slice(dataStart, appStart));
  const set4 = sets.find(set => set.id === 4);
  const originalSet4 = originalSets.find(set => set.id === 4);
  const expectedPrompts = [
    "¿Hace cuánto tiempo que conoces a tu mejor amigo?",
    "No pensé que fueras a tomártelo tan en serio.",
    "Para cuando termines de leer esto, ya me habré ido.",
    "¿Qué te hizo cambiar de opinión?",
    "Me cuesta trabajo concentrarme cuando hay tanto ruido.",
    "Si hubiéramos reservado antes, habríamos conseguido mejores asientos.",
    "No recuerdo haberle prometido nada.",
    "Por lo visto, cancelaron el evento a última hora.",
    "Preferiría que no mencionaras esto durante la reunión.",
    "Lleva trabajando aquí desde mucho antes de que yo llegara.",
    "¿Cómo se te ocurrió una idea así?",
    "No importa lo que digan, estoy convencido de que hicimos lo correcto.",
    "Apenas nos alcanzó el dinero para pagar la cuenta.",
    "Tal vez deberíamos haber esperado un poco más.",
    "Me tomó por sorpresa que rechazaran nuestra propuesta.",
    "No me gustan las películas de terror, pero cuéntame sobre esta.",
    "Si las cosas siguen así, tendremos que buscar otra solución.",
    "¿Alguna vez te han confundido con otra persona?",
    "Se suponía que el paquete llegaría hace dos días.",
    "Cuanto menos duermo, más difícil me resulta tomar decisiones.",
    "No habría aceptado la invitación de haber sabido quién iba a estar ahí.",
    "Llevo años queriendo visitar ese lugar.",
    "Lo último que esperaba era encontrarme con ella ahí.",
    "A pesar de haber recibido varias advertencias, siguió cometiendo el mismo error.",
    "No estoy seguro de que valga la pena correr el riesgo.",
    "¿Qué habrías estado haciendo si no te hubiera llamado?",
    "Resulta que habíamos estado hablando de personas completamente distintas.",
    "No dejes que el miedo te impida intentarlo.",
    "Para el próximo mes, habremos terminado la parte más complicada del proyecto.",
    "Aunque al principio parecía una mala decisión, todo terminó saliendo mejor de lo esperado."
  ];

  assert.ok(set4);
  assert.equal(set4.title, "Set 4");
  assert.deepEqual(Array.from(set4.sentences, sentence => sentence.spanish), expectedPrompts);
  assert.deepEqual(Array.from(set4.sentences, sentence => sentence.id), Array.from({ length: 30 }, (_, index) => index + 1));
  originalSet4.sentences.forEach(sentence => assert.ok(sentence.acceptedAnswers.length >= 3 && sentence.acceptedAnswers.length <= 6));
  set4.sentences.forEach((sentence, index) => {
    assert.deepEqual(Object.keys(sentence).sort(), ["acceptedAnswers", "id", "mediumPrompt", "note", "primaryAnswer", "spanish"]);
    assert.ok(sentence.primaryAnswer);
    assert.ok(sentence.acceptedAnswers.length >= 3);
    assert.ok(sentence.acceptedAnswers.length >= originalSet4.sentences[index].acceptedAnswers.length + 2);
    assert.ok(sentence.mediumPrompt.split(/\s+/).length >= 2 && sentence.mediumPrompt.split(/\s+/).length <= 3);
    assert.ok(sentence.note);
    assert.ok(sentence.primaryAnswer.startsWith(sentence.mediumPrompt));
  });
});

test("Set 4 adds curated translation options to every prompt", () => {
  const sets = evaluateSets(html.slice(dataStart, appStart));
  const set4 = sets.find(set => set.id === 4);

  assert.ok(set4.sentences[0].acceptedAnswers.includes("For how long have you known your best friend?"));
  assert.ok(set4.sentences[3].acceptedAnswers.includes("What persuaded you to change your mind?"));
  assert.ok(set4.sentences[17].acceptedAnswers.includes("Have people ever mistaken you for somebody else?"));
  assert.ok(set4.sentences[25].acceptedAnswers.includes("Had I not phoned you, what would you have been doing?"));
  assert.ok(set4.sentences[29].acceptedAnswers.includes("Though it looked like a poor decision initially, everything worked out better than expected."));
});

test("Set 4 answers support Easy reconstruction and strict Medium/Hard validation", () => {
  const sets = evaluateSets(html.slice(dataStart, appStart));
  const set4 = sets.find(set => set.id === 4);
  const normalize = value => String(value).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[¿?¡!]/g, " ").replace(/[.,;]/g, " ").replace(/\s+/g, " ").trim();
  const easyWords = value => value.replace(/[’‘`´]/g, "'").replace(/[.,;:!?¿¡]/g, "").split(/\s+/).filter(Boolean);

  set4.sentences.forEach(sentence => {
    assert.equal(normalize(easyWords(sentence.primaryAnswer).join(" ")), normalize(sentence.primaryAnswer));
    assert.equal(normalize(`${sentence.mediumPrompt} ${sentence.primaryAnswer.slice(sentence.mediumPrompt.length).trim()}`), normalize(sentence.primaryAnswer));
    for (const answer of [sentence.primaryAnswer, ...sentence.acceptedAnswers]) {
      assert.ok([sentence.primaryAnswer, ...sentence.acceptedAnswers].some(candidate => normalize(candidate) === normalize(answer)));
      assert.ok([sentence.primaryAnswer, ...sentence.acceptedAnswers].some(candidate => normalize(candidate) === normalize(answer.toUpperCase().replaceAll("'", "’") + "!!!")));
    }
    assert.equal([sentence.primaryAnswer, ...sentence.acceptedAnswers].some(answer => normalize(answer) === normalize("This is not a valid translation.")), false);
  });
});

test("expanded alternatives include contractions, dialects, and natural synonyms", () => {
  const sets = evaluateSets(html.slice(dataStart, appStart));

  assert.ok(sets[0].sentences[0].acceptedAnswers.includes("I do not know where I left my keys."));
  assert.ok(sets[0].sentences[1].acceptedAnswers.includes("How long have you been working remotely?"));
  assert.ok(sets[1].sentences[4].acceptedAnswers.includes("When was the last time you had a conversation with her?"));
  assert.ok(sets[2].sentences[3].acceptedAnswers.includes("I didn't expect the film to be so good."));
});
