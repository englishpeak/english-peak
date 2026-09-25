import { COLLOCATIONS, COLLOCATION_LEVELS } from './collocations-data.js';

export const SESSION_SIZE = 10;
export const MODES = Object.freeze(['easy', 'medium', 'hard']);

export function normalizeAnswer(value) {
  return String(value ?? '').trim().replace(/\s+/gu, ' ').toLowerCase();
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function filterByLevels(items, levels) {
  const selected = new Set(levels);
  return selected.size === 0 ? [...items] : items.filter(item => selected.has(item.level));
}

export function createSession(pool, count = SESSION_SIZE, random = Math.random) {
  if (!pool.length) return [];
  const varied = [];
  shuffle(pool, random).forEach(item => {
    if (!varied.some(chosen => chosen.first === item.first || chosen.second === item.second)) varied.push(item);
  });
  const remaining = shuffle(pool.filter(item => !varied.some(chosen => chosen.id === item.id)), random);
  return [...varied, ...remaining].slice(0, Math.min(count, pool.length));
}

export function getDistractor(answer, pool, random = Math.random) {
  // A different partner already used with the same first word would also form
  // a valid collocation, so exclude it rather than presenting two right answers.
  const candidates = pool.filter(item => item.id !== answer.id && item.first !== answer.first && item.second !== answer.second);
  const ranked = candidates.map(item => ({
    item,
    score: (item.category === answer.category ? 4 : 0) +
      (item.level === answer.level ? 2 : 0) +
      (item.first === answer.first ? 3 : 0) +
      (item.second.split(/\s+/).length === answer.second.split(/\s+/).length ? 1 : 0) + random()
  })).sort((a, b) => b.score - a.score);
  return ranked[0]?.item ?? null;
}

export function isCorrectAnswer(actual, expected) {
  return normalizeAnswer(actual) === normalizeAnswer(expected);
}

const state = { mode: 'easy', levels: [], session: [], index: 0, score: 0, answered: false, selectedFirst: null };
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const pool = () => filterByLevels(COLLOCATIONS, state.levels);

function announce(message) { $('#live-region').textContent = message; }
function setFeedback(message, kind = '') {
  const feedback = $('#feedback');
  feedback.textContent = message;
  feedback.className = `feedback ${kind}`.trim();
}
function updateMeta() {
  $('#session-meta').textContent = `${state.session.length} items · ${state.levels.length ? state.levels.join(', ') : 'All levels'}`;
}
function startSession() {
  state.session = createSession(pool()); state.index = 0; state.score = 0; state.answered = false; state.selectedFirst = null;
  updateMeta(); renderExercise();
}
function setMode(mode) {
  state.mode = mode;
  $$('.mode-button').forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
  startSession();
}
function setLevel(level) {
  state.levels = level === 'all' ? [] : [level];
  $$('.level-button').forEach(button => { const active = button.dataset.level === level; button.classList.toggle('active', active); button.setAttribute('aria-pressed', active); });
  startSession();
}
function progress() { return `${Math.min(state.index + 1, state.session.length)} / ${state.session.length}`; }

function renderEasy() {
  const left = shuffle(state.session); const right = shuffle(state.session);
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">Match the pairs</span><h2>Build 10 collocations</h2></div><strong id="easy-progress">0 / ${state.session.length}</strong></div><p class="instructions">Choose a word on the left, then its natural partner on the right.</p><div class="match-grid"><div class="match-column" aria-label="First parts">${left.map(item => `<button class="match-card first" data-id="${item.id}">${item.first}</button>`).join('')}</div><div class="match-column" aria-label="Second parts">${right.map(item => `<button class="match-card second" data-id="${item.id}">${item.second}</button>`).join('')}</div></div>`;
  $$('.match-card.first').forEach(button => button.addEventListener('click', () => {
    if (button.disabled) return; state.selectedFirst = Number(button.dataset.id);
    $$('.match-card.first').forEach(card => card.classList.toggle('selected', card === button));
    announce(`${button.textContent} selected. Now choose its partner.`);
  }));
  $$('.match-card.second').forEach(button => button.addEventListener('click', () => matchPair(button)));
}
function matchPair(secondButton) {
  if (!state.selectedFirst || secondButton.disabled) { announce('Choose a word from the left first.'); return; }
  const firstButton = $(`.match-card.first[data-id="${state.selectedFirst}"]`);
  const correct = state.selectedFirst === Number(secondButton.dataset.id);
  if (!correct) {
    [firstButton, secondButton].forEach(button => { button.classList.add('incorrect'); setTimeout(() => button.classList.remove('incorrect'), 450); });
    state.selectedFirst = null; firstButton.classList.remove('selected'); announce('Not quite. Try another partner.'); return;
  }
  [firstButton, secondButton].forEach(button => { button.disabled = true; button.classList.remove('selected'); button.classList.add('matched'); });
  state.score += 1; state.selectedFirst = null; $('#easy-progress').textContent = `${state.score} / ${state.session.length}`;
  announce(`Correct. ${firstButton.textContent} ${secondButton.textContent}.`);
  if (state.score === state.session.length) renderComplete();
}

function renderQuestion() {
  const item = state.session[state.index];
  const hard = state.mode === 'hard';
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">${hard ? 'Active recall' : 'Choose the partner'}</span><h2>${hard ? 'Complete the collocation' : 'Which words go together?'}</h2></div><strong>${progress()}</strong></div><div class="prompt"><span>${item.first}</span><span class="blank" aria-hidden="true"></span></div>${hard ? `<form id="answer-form"><label for="answer">Type the missing words</label><div class="answer-row"><input id="answer" autocomplete="off" spellcheck="false"><button class="primary" type="submit">Check</button></div></form>` : `<div class="choices">${mediumChoices(item).map(choice => `<button data-answer="${choice.second}" class="choice">${choice.second}</button>`).join('')}</div>`}<button id="next" class="primary next" hidden>Continue →</button>`;
  if (hard) { $('#answer-form').addEventListener('submit', event => { event.preventDefault(); checkTyped(item); }); $('#answer').focus(); }
  else $$('.choice').forEach(button => button.addEventListener('click', () => checkChoice(button, item)));
  $('#next').addEventListener('click', nextQuestion);
}
function mediumChoices(item) {
  const distractor = getDistractor(item, pool());
  return shuffle(distractor ? [item, distractor] : [item]);
}
function finishAnswer(ok, item) {
  state.answered = true; if (ok) state.score += 1;
  setFeedback(ok ? `Correct — ${item.full}.` : `Not quite. The correct answer is “${item.second}”.`, ok ? 'correct' : 'wrong');
  announce($('#feedback').textContent); $('#next').hidden = false; $('#next').focus();
}
function checkChoice(button, item) {
  if (state.answered) return; const ok = button.dataset.answer === item.second;
  $$('.choice').forEach(choice => { choice.disabled = true; if (choice.dataset.answer === item.second) choice.classList.add('correct'); });
  if (!ok) button.classList.add('wrong'); finishAnswer(ok, item);
}
function checkTyped(item) {
  if (state.answered) return; const input = $('#answer'); const ok = isCorrectAnswer(input.value, item.second);
  input.disabled = true; input.classList.add(ok ? 'correct-input' : 'wrong-input'); finishAnswer(ok, item);
}
function nextQuestion() { state.index += 1; state.answered = false; setFeedback(''); state.index >= state.session.length ? renderComplete() : renderQuestion(); }
function renderComplete() {
  $('#exercise').innerHTML = `<div class="success-state"><span class="success-mark">✓</span><span class="eyebrow">Session complete</span><h2>${state.score} / ${state.session.length}</h2><p>${state.score === state.session.length ? 'Excellent — every collocation was correct.' : 'Good practice. A new set is ready whenever you are.'}</p><button id="another-set" class="primary">Try another set</button></div>`;
  $('#another-set').addEventListener('click', startSession); announce(`Session complete. Score ${state.score} out of ${state.session.length}.`);
}
function renderExercise() { setFeedback(''); state.mode === 'easy' ? renderEasy() : renderQuestion(); }

if (typeof document !== 'undefined') {
  $$('.mode-button').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $$('.level-button').forEach(button => button.addEventListener('click', () => setLevel(button.dataset.level)));
  $('#new-set').addEventListener('click', startSession);
  startSession();
}

export { COLLOCATIONS, COLLOCATION_LEVELS };
