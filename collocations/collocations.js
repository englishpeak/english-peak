import { COLLOCATIONS, COLLOCATION_LEVELS } from './collocations-data.js';

export const SESSION_SIZE = 7;
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

export function acceptedPartners(item, catalogue = COLLOCATIONS) {
  return new Set([
    item.second,
    ...(item.acceptedAlternatives ?? []),
    ...catalogue.filter(candidate => candidate.first === item.first).map(candidate => candidate.second)
  ]);
}

export function isAcceptedPair(first, second, catalogue = COLLOCATIONS) {
  const records = catalogue.filter(item => item.first === first);
  return records.some(item => acceptedPartners(item, catalogue).has(second));
}

export function isUnambiguousEasyBoard(items, catalogue = COLLOCATIONS) {
  const seconds = items.map(item => item.second);
  return items.every(item => seconds.filter(second => isAcceptedPair(item.first, second, catalogue)).length === 1);
}

export function createEasySession(pool, count = SESSION_SIZE, random = Math.random) {
  if (!pool.length) return [];
  const groups = new Map();
  pool.forEach(item => groups.set(item.first, [...(groups.get(item.first) ?? []), item]));
  const wanted = Math.min(count, groups.size);
  // Greedy construction checks the whole partial board after every addition.
  // Multiple randomized passes avoid exposing a board unless all cross-pairs
  // have exactly one accepted partner.
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const selected = [];
    for (const group of shuffle([...groups.values()], random)) {
      const candidate = shuffle(group, random).find(item => isUnambiguousEasyBoard([...selected, item]));
      if (candidate) selected.push(candidate);
      if (selected.length === wanted) return selected;
    }
  }
  return [];
}

export function safeMediumDistractors(item, catalogue = COLLOCATIONS) {
  const accepted = acceptedPartners(item, catalogue);
  return [...new Set(item.distractors ?? [])].filter(distractor => distractor !== item.second && !accepted.has(distractor));
}

export function createMediumChoices(item, random = Math.random, catalogue = COLLOCATIONS) {
  const safe = safeMediumDistractors(item, catalogue);
  if (!safe.length) return [];
  const distractor = safe[Math.floor(random() * safe.length)];
  const choices = [item.second, distractor];
  return random() < 0.5 ? choices : choices.reverse();
}

export function createMediumSession(pool, count = SESSION_SIZE, random = Math.random) {
  return createSession(pool.filter(item => safeMediumDistractors(item).length), count, random);
}

export function reduceDragState(state, action) {
  if (action.type === 'start') return { active: true, candidate: null, result: null };
  if (!state.active) return state;
  if (action.type === 'candidate') return { ...state, candidate: action.id ?? null };
  if (action.type === 'drop') return { active: false, candidate: null, result: state.candidate ? 'attempt' : 'cancel' };
  if (action.type === 'cleanup') return { active: false, candidate: null, result: state.result };
  return state;
}

export function isCorrectAnswer(actual, expected) {
  return normalizeAnswer(actual) === normalizeAnswer(expected);
}

const state = { mode: 'easy', levels: [], session: [], previousIds: '', index: 0, score: 0, answered: false, selectedFirst: null, missed: new Set(), completed: [], joining: false };
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
  const makeSession = () => state.mode === 'easy' ? createEasySession(available) : state.mode === 'medium' ? createMediumSession(available) : createSession(available);
  let nextSession = makeSession();
  // A refresh should visibly refresh, not occasionally reproduce the same set.
  for (let attempt = 0; attempt < 4 && nextSession.map(item => item.id).join(',') === state.previousIds; attempt += 1) nextSession = makeSession();
  state.session = nextSession; state.previousIds = nextSession.map(item => item.id).join(',');
  state.index = 0; state.score = 0; state.answered = false; state.selectedFirst = null; state.missed = new Set(); state.completed = []; state.joining = false;
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
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">Match the pairs</span><h2>Build ${SESSION_SIZE} collocations</h2></div><strong id="easy-progress">0 / ${state.session.length}</strong></div><div class="progress-track" aria-hidden="true"><span id="progress-fill" style="width:0%"></span></div><p class="instructions">Choose a word on the left, then its natural partner on the right — or drag one tile onto the other.</p><div class="match-grid"><div class="match-column" aria-label="First parts">${left.map((item, index) => tile(item, 'first', index)).join('')}</div><div class="match-column" aria-label="Second parts">${right.map((item, index) => tile(item, 'second', index + 1)).join('')}</div></div><section class="completed-area" aria-labelledby="completed-title"><div class="completed-heading"><span id="completed-title">Completed collocations</span><span id="completed-count">0 of ${state.session.length}</span></div><div id="completed-list" class="completed-list"><p class="completed-empty">Your completed expressions will join here.</p></div></section>`;
  $$('.match-card.first').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.suppressClick) { delete button.dataset.suppressClick; return; }
    if (button.disabled || state.joining) return; state.selectedFirst = Number(button.dataset.id);
    $$('.match-card.first').forEach(card => card.classList.toggle('selected', card === button));
    announce(`${button.textContent} selected. Now choose its partner.`);
  }));
  $$('.match-card.second').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.suppressClick) { delete button.dataset.suppressClick; return; }
    matchPair(button);
  }));
  $$('.match-card').forEach(enablePointerDrag);
}
async function matchPair(secondButton) {
  if (state.joining) return;
  if (!state.selectedFirst || secondButton.disabled) { announce('Choose a word from the left first.'); return; }
  const firstButton = $(`.match-card.first[data-id="${state.selectedFirst}"]`);
  const correct = state.selectedFirst === Number(secondButton.dataset.id);
  if (!correct) {
    if (isAcceptedPair(firstButton.textContent.trim(), secondButton.textContent.trim())) {
      state.selectedFirst = null; firstButton.classList.remove('selected');
      setFeedback('That is valid English, but this board has another intended partner. Try another tile.', 'valid');
      announce('That combination is valid English. Try another tile on this board.');
      return;
    }
    [firstButton, secondButton].forEach(button => { button.classList.add('incorrect'); setTimeout(() => button.classList.remove('incorrect'), 450); });
    state.missed.add(state.selectedFirst); state.selectedFirst = null; firstButton.classList.remove('selected'); setFeedback('✕ Not quite — try another partner.', 'wrong'); announce('Not quite. Try another partner.'); return;
  }
  state.joining = true;
  [firstButton, secondButton].forEach(button => { button.disabled = true; button.classList.remove('selected'); button.classList.add('joining'); });
  const item = state.session.find(entry => entry.id === Number(secondButton.dataset.id));
  const matches = state.completed.length + 1;
  if (!state.missed.has(Number(secondButton.dataset.id))) state.score += 1;
  state.selectedFirst = null; $('#easy-progress').textContent = `${matches} / ${state.session.length}`;
  $('#progress-fill').style.width = `${matches / state.session.length * 100}%`;
  setFeedback(`✓ Correct — ${firstButton.textContent} ${secondButton.textContent}.`, 'correct'); announce($('#feedback').textContent);
  await joinPair(firstButton, secondButton, item);
  state.joining = false;
  if (matches === state.session.length) renderEasyComplete();
}

function animateReflow(previousPositions) {
  $$('.match-card').forEach(card => {
    const before = previousPositions.get(card);
    if (!before) return;
    const after = card.getBoundingClientRect();
    const dx = before.left - after.left; const dy = before.top - after.top;
    if (dx || dy) card.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
      { duration: 360, easing: 'cubic-bezier(.2,.75,.25,1)' }
    );
  });
}

async function joinPair(firstButton, secondButton, item) {
  const remaining = $$('.match-card:not(.joining)');
  const previousPositions = new Map(remaining.map(card => [card, card.getBoundingClientRect()]));
  const firstRect = firstButton.getBoundingClientRect(); const secondRect = secondButton.getBoundingClientRect();
  const meetingX = (firstRect.right + secondRect.left) / 2;
  const firstShift = meetingX - firstRect.right; const secondShift = meetingX - secondRect.left;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const options = { duration: reduceMotion ? 0 : 340, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'forwards' };
  const animations = [
    firstButton.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${firstShift}px,0)`, opacity: .15 }], options),
    secondButton.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${secondShift}px,0)`, opacity: .15 }], options)
  ];
  await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
  firstButton.remove(); secondButton.remove();
  state.completed.push(item);
  const list = $('#completed-list'); list.querySelector('.completed-empty')?.remove();
  list.insertAdjacentHTML('beforeend', completedCard(item));
  list.lastElementChild.animate(
    [{ opacity: 0, transform: 'translateY(-10px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
    { duration: reduceMotion ? 0 : 320, easing: 'cubic-bezier(.2,.8,.25,1)' }
  );
  $('#completed-count').textContent = `${state.completed.length} of ${state.session.length}`;
  animateReflow(previousPositions);
}

function completedCard(item) {
  return `<div class="completed-collocation"><span>${item.first}</span><span>${item.second}</span><strong aria-label="Correct">✓</strong></div>`;
}

function renderEasyComplete() {
  setFeedback('');
  const percent = Math.round(state.score / state.session.length * 100);
  $('#exercise').innerHTML = `<div class="easy-complete"><div class="easy-complete-summary"><span class="success-mark">✓</span><div><span class="eyebrow">Set complete</span><h2>${state.score} / ${state.session.length}</h2><p>${percent}% correct</p></div></div><section class="completed-area complete" aria-labelledby="completed-title"><div class="completed-heading"><span id="completed-title">Your completed collocations</span><span>${state.completed.length} of ${state.session.length}</span></div><div class="completed-list">${state.completed.map(completedCard).join('')}</div></section><button id="another-set" type="button" class="primary">Practice another set</button></div>`;
  $('#another-set').addEventListener('click', startSession);
  announce(`Session complete. Score ${state.score} out of ${state.session.length}.`);
}

function completeDraggedPair(dragged, target) {
  const firstButton = dragged.classList.contains('first') ? dragged : target;
  const secondButton = dragged.classList.contains('second') ? dragged : target;
  state.selectedFirst = Number(firstButton.dataset.id);
  matchPair(secondButton);
}

function enablePointerDrag(button) {
  let startX = 0; let startY = 0; let dragging = false; let target = null; let ghost = null;
  const updateTarget = (x, y) => {
    const oppositeClass = button.classList.contains('first') ? 'second' : 'first';
    const candidates = $$(`.match-card.${oppositeClass}:not(:disabled)`);
    // Use pointer geometry rather than hover events. The small inset tolerance
    // makes edge drops forgiving while nearest-distance selection guarantees
    // that no more than one tile can be active.
    const hits = candidates.map(card => {
      const rect = card.getBoundingClientRect(); const tolerance = 8;
      const inside = x >= rect.left - tolerance && x <= rect.right + tolerance && y >= rect.top - tolerance && y <= rect.bottom + tolerance;
      return { card, inside, distance: Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2)) };
    }).filter(hit => hit.inside).sort((a, b) => a.distance - b.distance);
    target?.classList.remove('drop-target'); target = hits[0]?.card ?? null; target?.classList.add('drop-target');
  };
  const moveGhost = (x, y) => { if (ghost) ghost.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.02)`; };
  button.addEventListener('pointerdown', event => {
    if (button.disabled || state.joining || event.button > 0) return;
    startX = event.clientX; startY = event.clientY; dragging = false;
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!button.hasPointerCapture(event.pointerId)) return;
    const x = event.clientX - startX; const y = event.clientY - startY;
    if (!dragging && Math.hypot(x, y) < 6) return;
    if (!dragging) {
      dragging = true; button.classList.add('drag-source'); $('.match-grid').classList.add('is-dragging');
      const rect = button.getBoundingClientRect();
      ghost = button.cloneNode(true); ghost.removeAttribute('id'); ghost.classList.remove('drag-source'); ghost.classList.add('drag-ghost');
      Object.assign(ghost.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: '0', animation: 'none' });
      document.body.append(ghost);
    }
    moveGhost(x, y); updateTarget(event.clientX, event.clientY);
  });
  const finish = async (event, cancelled = false) => {
    if (!button.hasPointerCapture(event.pointerId)) return;
    button.releasePointerCapture(event.pointerId);
    const droppedTarget = cancelled ? null : target; target?.classList.remove('drop-target'); target = null;
    if (dragging) button.dataset.suppressClick = 'true';
    if (dragging && ghost && !droppedTarget) {
      const rect = button.getBoundingClientRect();
      const animation = ghost.animate(
        [{ transform: ghost.style.transform }, { transform: `translate3d(${rect.left - parseFloat(ghost.style.left)}px, ${rect.top - parseFloat(ghost.style.top)}px, 0) scale(1)` }],
        { duration: 180, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'forwards' }
      );
      await animation.finished.catch(() => {});
    }
    ghost?.remove(); ghost = null; button.classList.remove('drag-source'); $('.match-grid')?.classList.remove('is-dragging');
    dragging = false;
    if (droppedTarget) completeDraggedPair(button, droppedTarget);
  };
  button.addEventListener('pointerup', finish);
  button.addEventListener('pointercancel', event => finish(event, true));
}

function renderQuestion() {
  const item = state.session[state.index];
  const hard = state.mode === 'hard';
  $('#exercise').innerHTML = `<div class="exercise-heading"><div><span class="eyebrow">${hard ? 'Active recall' : 'Choose the partner'}</span><h2>${hard ? 'Complete the collocation' : 'Which words go together?'}</h2></div><strong>${progress()}</strong></div><div class="progress-track" aria-hidden="true"><span style="width:${state.index / state.session.length * 100}%"></span></div><p class="instructions">${hard ? 'Use the context to type the word or phrase that completes the collocation.' : 'Choose the word or phrase that naturally completes the collocation.'}</p><div class="prompt"><span>${item.first}</span><span class="blank" aria-hidden="true"></span></div>${hard ? `<p class="context-sentence">“${item.example}”</p><form id="answer-form"><label for="answer">Your answer</label><div class="answer-row"><input id="answer" aria-describedby="feedback" placeholder="Type the missing words…" autocomplete="off" spellcheck="false"><button class="primary" type="submit">Check</button></div></form>` : `<div class="choices">${createMediumChoices(item).map(choice => `<button type="button" data-answer="${choice}" class="choice">${choice}</button>`).join('')}</div>`}<button id="next" type="button" class="primary next" hidden>Continue →</button>`;
  if (hard) { $('#answer-form').addEventListener('submit', event => { event.preventDefault(); checkTyped(item); }); $('#answer').focus(); }
  else $$('.choice').forEach(button => button.addEventListener('click', () => checkChoice(button, item)));
  $('#next').addEventListener('click', nextQuestion);
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

const SUPABASE_URL = 'https://jnqekougzmihjqffhuva.supabase.co';
const SUPABASE_KEY = 'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i';
let exerciseInitialized = false;
let collocationsClient = null;

function renderAccessState(authenticated) {
  const loading = $('#auth-loading');
  const lock = $('#member-lock');
  const practice = $('#practice-content');
  if (!loading || !lock || !practice) return;
  loading.hidden = true;
  lock.hidden = authenticated;
  practice.hidden = !authenticated;
  if (authenticated && !exerciseInitialized) {
    exerciseInitialized = true;
    startSession();
  }
}

function requestParentAuth(action) {
  if (window.parent === window) return;
  window.parent.postMessage({ type: 'showAuthModal', tab: action }, window.location.origin);
}

async function initializeMemberAccess() {
  $$('.mode-button').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $$('.level-button').forEach(button => button.addEventListener('click', () => setLevel(button.dataset.level)));
  $('#new-set').addEventListener('click', startSession);
  $$('[data-auth-action]').forEach(link => link.addEventListener('click', event => {
    if (window.parent === window) return;
    event.preventDefault();
    requestParentAuth(link.dataset.authAction);
  }));

  window.addEventListener('message', event => {
    if (event.origin !== window.location.origin || !event.data || event.data.type !== 'collocationsAccess') return;
    renderAccessState(Boolean(event.data.authenticated));
  });

  if (window.parent !== window) {
    window.parent.postMessage({ type: 'collocationsAccessRequest' }, window.location.origin);
  }

  if (!window.supabase?.createClient) {
    renderAccessState(false);
    return;
  }
  collocationsClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'ep-auth-token',
      storage: {
        getItem(key) { try { return localStorage.getItem(key); } catch { try { return sessionStorage.getItem(key); } catch { return null; } } },
        setItem(key, value) { try { localStorage.setItem(key, value); } catch { try { sessionStorage.setItem(key, value); } catch {} } },
        removeItem(key) { try { localStorage.removeItem(key); } catch { try { sessionStorage.removeItem(key); } catch {} } }
      }
    }
  });
  try {
    const { data } = await collocationsClient.auth.getSession();
    renderAccessState(Boolean(data?.session?.user));
  } catch {
    renderAccessState(false);
  }
  collocationsClient.auth.onAuthStateChange((_event, session) => renderAccessState(Boolean(session?.user)));
}

if (typeof document !== 'undefined') initializeMemberAccess();

export { COLLOCATIONS, COLLOCATION_LEVELS };
