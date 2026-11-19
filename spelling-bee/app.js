import { createPronunciationPlayer } from '/toefl-dictionary/pronunciation.js';

const signInUrl = '/?auth=login&exercise=spelling-bee';
const accessStatus = document.getElementById('access-status');
const accessRetry = document.getElementById('retry-access');
const practice = document.getElementById('practice-content');
const client = window.supabase?.createClient(
  'https://jnqekougzmihjqffhuva.supabase.co',
  'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i',
  { auth: {
    storageKey: 'ep-auth-token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem(key) { try { return localStorage.getItem(key); } catch { try { return sessionStorage.getItem(key); } catch { return null; } } },
      setItem(key, value) { try { localStorage.setItem(key, value); } catch { try { sessionStorage.setItem(key, value); } catch {} } },
      removeItem(key) { try { localStorage.removeItem(key); } catch { try { sessionStorage.removeItem(key); } catch {} } },
    },
  } },
);
let activeUserId;
let dispose;
let leavingPage = false;

function signIn() {
  if (leavingPage) return;
  leavingPage = true;
  dispose?.();
  practice.replaceChildren();
  window.location.replace(signInUrl);
}

async function request(action, params = {}, signal) {
  if (!client) throw new Error('Sign-in is temporarily unavailable.');
  const { data, error } = await client.auth.getSession();
  if (error && error.status >= 500) throw new Error('Sign-in is temporarily unavailable.');
  const session = data?.session;
  if (!session?.access_token || (activeUserId && session.user.id !== activeUserId)) {
    signIn();
    return null;
  }

  activeUserId ??= session.user.id;
  const response = await fetch('/api/spelling-bee', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, ...params }),
  });
  if (response.status === 401) {
    signIn();
    return null;
  }
  return response;
}

async function readResponse(response) {
  if (!response) return null;
  if (response.ok) return response.json();
  const payload = await response.json().catch(() => ({}));
  const error = new Error(payload.error || 'Spelling Bee is temporarily unavailable. Please try again.');
  error.status = response.status;
  throw error;
}

function mountPractice() {
  const elements = Object.fromEntries(
    ['question', 'round-status', 'audio-status', 'play', 'skip', 'answer-form', 'answer',
      'check', 'feedback', 'reveal', 'next', 'restart'].map(id => [id, document.getElementById(id)])
  );
  const levels = [...practice.querySelectorAll('[data-level]')];
  const rounds = new Map();
  const player = createPronunciationPlayer((questionId, signal) => request('audio', { questionId }, signal));
  let difficulty = 'easy';
  let controller;
  let audioId;
  let questionId;
  let pendingAnswer = false;

  function showRoundStatus(message, label, onClick, focus) {
    elements['round-status'].textContent = message;
    elements.restart.hidden = !label;
    elements.restart.textContent = label || '';
    elements.restart.onclick = onClick || null;
    if (label && focus) elements.restart.focus();
  }

  function updateAudio(state, message) {
    elements.play.dataset.state = state;
    elements['audio-status'].dataset.state = state;
    elements['audio-status'].textContent = message;
    elements.skip.hidden = state !== 'error' || !elements.next.hidden;
  }

  function feedback(state, message) {
    elements.feedback.dataset.state = state;
    elements.feedback.textContent = message;
  }

  async function loadWord(action, previousId, focus = false) {
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    player.stop();
    pendingAnswer = false;
    audioId = questionId = null;
    updateAudio('idle', '');
    feedback('', '');
    elements.question.hidden = true;
    elements.answer.disabled = elements.answer.readOnly = false;
    elements.answer.value = '';
    elements.check.hidden = elements.reveal.hidden = elements.next.hidden = true;
    elements.check.disabled = elements.reveal.disabled = false;
    showRoundStatus('Loading a word…');

    const selected = difficulty;
    try {
      let round = action === 'resume' ? rounds.get(selected) : null;
      if (round?.state !== 'complete') {
        let requestAction = action;
        let from = previousId;
        if (action === 'resume') {
          requestAction = round?.state === 'question' ? 'skip' : 'start';
          from = round?.questionId;
        }
        const response = await request(requestAction, { difficulty: selected, questionId: from }, signal);
        round = await readResponse(response);
      }
      if (signal.aborted || !round) return;
      rounds.set(selected, round);

      if (round.state === 'complete') {
        showRoundStatus('Round complete! You’ve reached the end of this word list.', 'Start a new round',
          () => loadWord('start', undefined, true), focus);
        return;
      }
      if (round.state === 'empty') {
        showRoundStatus('There are no recordings available for this difficulty yet.', 'Check again',
          () => loadWord('start', undefined, true), focus);
        return;
      }

      audioId = questionId = round.questionId;
      elements.question.hidden = false;
      elements.check.hidden = false;
      showRoundStatus('');
      if (focus) elements.play.focus();
      const { error } = await player.preload(audioId).download;
      if (!signal.aborted && error && elements.play.dataset.state === 'idle') updateAudio('error', error);
    } catch (error) {
      if (signal.aborted) return;
      showRoundStatus(error.message, error.status === 409 ? 'Start a new round' : 'Try again',
        () => error.status === 409 ? loadWord('start', undefined, true) : loadWord(action, previousId, true), focus);
    }
  }

  async function answer(action) {
    if (!questionId || pendingAnswer || elements.answer.disabled) return;
    const { signal } = controller;
    const guess = elements.answer.value.trim();
    if (action === 'check' && !guess) {
      feedback('error', 'Enter a spelling to check.');
      elements.answer.focus();
      return;
    }

    pendingAnswer = elements.answer.readOnly = elements.check.disabled = elements.reveal.disabled = true;
    try {
      const response = await request(action, { questionId, answer: action === 'check' ? guess : undefined }, signal);
      const result = await readResponse(response);
      if (signal.aborted || !result) return;
      questionId = result.questionId;
      rounds.set(difficulty, { state: 'question', questionId });

      if (result.state === 'incorrect') {
        feedback('incorrect', 'Not quite. Try again!');
        elements.reveal.hidden = false;
        elements.answer.focus();
        return;
      }
      if (result.state === 'correct') {
        feedback('correct', 'Correct! Well done!');
      } else {
        feedback('revealed', 'The correct spelling is: ');
        const word = document.createElement('strong');
        word.textContent = result.word;
        elements.feedback.append(word);
      }
      elements.answer.disabled = true;
      elements.check.hidden = elements.reveal.hidden = true;
      elements.skip.hidden = true;
      elements.next.hidden = false;
      elements.next.focus();
    } catch (error) {
      if (signal.aborted) return;
      if (error.status === 409) {
        await loadWord('resume', undefined, true);
      } else {
        feedback('error', error.message);
      }
    } finally {
      if (!signal.aborted) {
        pendingAnswer = elements.answer.readOnly = elements.check.disabled = elements.reveal.disabled = false;
      }
    }
  }

  for (const level of levels) {
    level.addEventListener('click', () => {
      if (level.dataset.level === difficulty) return;
      difficulty = level.dataset.level;
      for (const button of levels) button.setAttribute('aria-pressed', String(button === level));
      loadWord('resume');
    });
  }
  elements.play.addEventListener('click', () => player.play(audioId, updateAudio));
  elements.skip.addEventListener('click', () => loadWord('skip', questionId, true));
  elements.next.addEventListener('click', () => loadWord('next', questionId, true));
  elements['answer-form'].addEventListener('submit', event => {
    event.preventDefault();
    answer('check');
  });
  elements.reveal.addEventListener('click', () => answer('reveal'));
  window.addEventListener('pagehide', player.stop);
  loadWord('start');

  return () => {
    controller?.abort();
    player.dispose();
    window.removeEventListener('pagehide', player.stop);
  };
}

async function openPractice() {
  accessStatus.textContent = 'Opening Spelling Bee…';
  accessRetry.hidden = true;
  try {
    const payload = await readResponse(await request('page'));
    if (!payload || leavingPage) return;

    // The authenticated endpoint supplies a fixed template with no vocabulary.
    practice.innerHTML = payload.html;
    dispose = mountPractice();
    accessStatus.hidden = true;
  } catch {
    accessStatus.textContent = 'Spelling Bee could not be opened. Please try again.';
    accessRetry.hidden = false;
  }
}

accessRetry.addEventListener('click', openPractice);
client?.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (activeUserId && session?.user?.id && session.user.id !== activeUserId)) signIn();
});
openPractice();
