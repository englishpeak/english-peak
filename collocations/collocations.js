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
  return shuffle(pool, random).slice(0, Math.min(count, pool.length));
}

export function createEasySession(pool, count = SESSION_SIZE, random = Math.random) {
  if (!pool.length) return [];
  const groups = new Map();
  pool.forEach(item => groups.set(item.first, [...(groups.get(item.first) ?? []), item]));
  const selected = shuffle([...groups.values()], random)
    .slice(0, Math.min(count, groups.size))
    .map(group => shuffle(group, random)[0]);
  if (selected.length < Math.min(count, pool.length)) {
    const selectedIds = new Set(selected.map(item => item.id));
    selected.push(...shuffle(pool.filter(item => !selectedIds.has(item.id)), random).slice(0, count - selected.length));
  }
  return selected;
}

export function getDistractor(answer, pool, random = Math.random, catalogue = COLLOCATIONS) {
  const validSeconds = new Set(catalogue.filter(item => item.first === answer.first).map(item => item.second));
  const candidates = pool.filter(item => item.id !== answer.id && !validSeconds.has(item.second));
  const ranked = candidates.map(item => ({
    item,
    score: (item.category === answer.category ? 4 : 0) +
      (item.level === answer.level ? 2 : 0) +
      (item.second.split(/\s+/).length === answer.second.split(/\s+/).length ? 1.5 : 0) +
      (Math.abs(item.second.length - answer.second.length) <= 3 ? 1 : 0) + random()
  })).sort((a, b) => b.score - a.score);
  return ranked[0]?.item ?? null;
}

export function isCorrectAnswer(actual, expected) {
  return normalizeAnswer(actual) === normalizeAnswer(expected);
}

const state = { mode: 'easy', levels: [], session: [], previousIds: '', index: 0, score: 0, answered: false, selectedFirst: null, missed: new Set() };
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
  const available = pool();
  const makeSession = () => state.mode === 'easy' ? createEasySession(available) : createSession(available);
  let nextSession = makeSession();
  // A refresh should visibly refresh, not occasionally reproduce the same set.
  for (let attempt = 0; attempt < 4 && nextSession.map(item => item.id).join(',') === state.previousIds; attempt += 1) nextSession = makeSession();
  state.session = nextSession; state.previousIds = nextSession.map(item => item.id).join(',');
  state.index = 0; state.score = 0; state.answered = false; state.selectedFirst = null; state.missed = new Set();
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
  const tile = (item, side, index) => `<button type="button" class="match-card ${side} pastel-${Math.floor(Math.random() * 8) + 1}" data-id="${item.id}" style="--float-duration:${7 + Math.random() * 4}s;--float-delay:${-Math.random() * 8}s;--float-distance:${2 + index % 3}px">${item[side]}</button>`;
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">Match the pairs</span><h2>Build 10 collocations</h2></div><strong id="easy-progress">0 / ${state.session.length}</strong></div><div class="progress-track" aria-hidden="true"><span id="progress-fill" style="width:0%"></span></div><p class="instructions">Choose a word on the left, then its natural partner on the right — or drag one tile onto the other.</p><div class="match-grid"><div class="match-column" aria-label="First parts">${left.map((item, index) => tile(item, 'first', index)).join('')}</div><div class="match-column" aria-label="Second parts">${right.map((item, index) => tile(item, 'second', index + 1)).join('')}</div></div>`;
  $$('.match-card.first').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.suppressClick) { delete button.dataset.suppressClick; return; }
    if (button.disabled) return; state.selectedFirst = Number(button.dataset.id);
    $$('.match-card.first').forEach(card => card.classList.toggle('selected', card === button));
    announce(`${button.textContent} selected. Now choose its partner.`);
  }));
  $$('.match-card.second').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.suppressClick) { delete button.dataset.suppressClick; return; }
    matchPair(button);
  }));
  $$('.match-card').forEach(enablePointerDrag);
}
function matchPair(secondButton) {
  if (!state.selectedFirst || secondButton.disabled) { announce('Choose a word from the left first.'); return; }
  const firstButton = $(`.match-card.first[data-id="${state.selectedFirst}"]`);
  const correct = state.selectedFirst === Number(secondButton.dataset.id);
  if (!correct) {
    [firstButton, secondButton].forEach(button => { button.classList.add('incorrect'); setTimeout(() => button.classList.remove('incorrect'), 450); });
    state.missed.add(state.selectedFirst); state.selectedFirst = null; firstButton.classList.remove('selected'); setFeedback('✕ Not quite — try another partner.', 'wrong'); announce('Not quite. Try another partner.'); return;
  }
  [firstButton, secondButton].forEach(button => { button.disabled = true; button.classList.remove('selected'); button.classList.add('matched'); });
  const matches = $$('.match-card.first:disabled').length;
  if (!state.missed.has(Number(secondButton.dataset.id))) state.score += 1;
  state.selectedFirst = null; $('#easy-progress').textContent = `${matches} / ${state.session.length}`;
  $('#progress-fill').style.width = `${matches / state.session.length * 100}%`;
  setFeedback(`✓ Correct — ${firstButton.textContent} ${secondButton.textContent}.`, 'correct'); announce($('#feedback').textContent);
  if (matches === state.session.length) renderComplete();
}

function completeDraggedPair(dragged, target) {
  const firstButton = dragged.classList.contains('first') ? dragged : target;
  const secondButton = dragged.classList.contains('second') ? dragged : target;
  state.selectedFirst = Number(firstButton.dataset.id);
  matchPair(secondButton);
  if (firstButton.disabled) [firstButton, secondButton].forEach(button => {
    button.classList.add('pairing');
    setTimeout(() => button.classList.remove('pairing'), 360);
  });
}

function enablePointerDrag(button) {
  let startX = 0; let startY = 0; let dragging = false; let target = null;
  button.addEventListener('pointerdown', event => {
    if (button.disabled || event.button > 0) return;
    startX = event.clientX; startY = event.clientY; dragging = false;
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!button.hasPointerCapture(event.pointerId)) return;
    const x = event.clientX - startX; const y = event.clientY - startY;
    if (!dragging && Math.hypot(x, y) < 6) return;
    dragging = true; button.classList.add('dragging'); button.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.025)`;
    $$('.match-card').forEach(card => card.classList.remove('drop-target'));
    const candidate = document.elementFromPoint(event.clientX, event.clientY)?.closest('.match-card');
    const opposite = candidate && candidate !== button && !candidate.disabled && candidate.classList.contains(button.classList.contains('first') ? 'second' : 'first');
    target = opposite ? candidate : null;
    target?.classList.add('drop-target');
  });
  const finish = event => {
    if (!button.hasPointerCapture(event.pointerId)) return;
    button.releasePointerCapture(event.pointerId); button.classList.remove('dragging'); button.style.transform = '';
    target?.classList.remove('drop-target');
    if (dragging) button.dataset.suppressClick = 'true';
    if (dragging && target) completeDraggedPair(button, target);
    target = null; dragging = false;
  };
  button.addEventListener('pointerup', finish);
  button.addEventListener('pointercancel', finish);
}

function renderQuestion() {
  const item = state.session[state.index];
  const hard = state.mode === 'hard';
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">${hard ? 'Active recall' : 'Choose the partner'}</span><h2>${hard ? 'Complete the collocation' : 'Which words go together?'}</h2></div><strong>${progress()}</strong></div><div class="progress-track" aria-hidden="true"><span style="width:${state.index / state.session.length * 100}%"></span></div><p class="instructions">${hard ? 'Use the context to type the word or phrase that completes the collocation.' : 'Choose the word or phrase that naturally completes the collocation.'}</p><div class="prompt"><span>${item.first}</span><span class="blank" aria-hidden="true"></span></div>${hard ? `<p class="context-sentence">“${item.example}”</p><form id="answer-form"><label for="answer">Your answer</label><div class="answer-row"><input id="answer" aria-describedby="feedback" placeholder="Type the missing words…" autocomplete="off" spellcheck="false"><button class="primary" type="submit">Check</button></div></form>` : `<div class="choices">${mediumChoices(item).map(choice => `<button type="button" data-answer="${choice.second}" class="choice">${choice.second}</button>`).join('')}</div>`}<button id="next" type="button" class="primary next" hidden>Continue →</button>`;
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
  if (!ok) state.missed.add(item.id);
  setFeedback(ok ? `✓ Correct — ${item.full}.` : `✕ Not quite. Correct answer: ${item.full}.`, ok ? 'correct' : 'wrong');
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
  setFeedback('');
  const percent = Math.round(state.score / state.session.length * 100);
  const missedItems = state.session.filter(item => state.missed.has(item.id));
  $('#exercise').innerHTML = `<div class="success-state"><span class="success-mark">✓</span><span class="eyebrow">Set complete</span><h2>${state.score} / ${state.session.length}</h2><p class="completion-percent">${percent}% correct</p>${missedItems.length ? `<div class="review"><strong>Review these collocations</strong><ul>${missedItems.map(item => `<li>${item.full}</li>`).join('')}</ul></div>` : '<p>Excellent — every collocation was correct.</p>'}<button id="another-set" type="button" class="primary">Practice another set</button></div>`;
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
