import { createPronunciationPlayer } from '/toefl-dictionary/pronunciation.js';

const signInUrl = '/?auth=login&exercise=spelling-bee';
const accessStatus = document.getElementById('access-status');
const accessRetry = document.getElementById('retry-access');
const practice = document.getElementById('practice-content');
const embedded = window.frameElement?.id === 'frame-spelling-bee';
if (embedded) {
  document.body.classList.add('embedded');
  document.getElementById('dashboard-link').hidden = true;
}
const client = embedded ? window.parent.sb : window.supabase?.createClient(
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
  if (embedded) window.parent.postMessage({ type: 'spellingBeeSignIn' }, window.location.origin);
  else window.location.replace(signInUrl);
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

function mountPractice(initialRound) {
  const elements = Object.fromEntries(
    ['question', 'round-status', 'audio-status', 'play', 'skip', 'answer-form', 'answer',
      'check', 'feedback', 'reveal', 'next', 'restart'].map(id => [id, document.getElementById(id)])
  );
  const levels = [...practice.querySelectorAll('[data-level]')];
  const player = createPronunciationPlayer((questionId, signal) => request('audio', { questionId }, signal));
  const selected = new Set(levels.map(button => button.dataset.level));
  let round;
  let pendingLoad;
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

  function showRoundEnd(focus) {
    const restart = () => loadWord('start', undefined, true);
    if (round.state === 'complete') {
      showRoundStatus('Round complete! You’ve reached the end of this word list.', 'Start a new round', restart, focus);
    } else if (round.state === 'filtered') {
      showRoundStatus('No more words in the selected levels.', 'Start a new round', restart, focus);
    } else {
      showRoundStatus('There are no recordings available yet.', 'Check again', restart, focus);
    }
  }

  async function loadWord(action, previousId, focus = false, preparedRound) {
    pendingLoad = { action, previousId };
    if (!selected.size) return;
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

    try {
      const result = preparedRound ?? await readResponse(
        await request(action, { difficulties: [...selected], questionId: previousId }, signal)
      );
      if (signal.aborted || !result) return;
      round = result;
      pendingLoad = null;

      if (round.state !== 'question') {
        showRoundEnd(focus);
        return;
      }

      audioId = questionId = round.questionId;
      elements.question.hidden = false;
      elements.check.hidden = false;
      showRoundStatus('');
      if (focus) elements.play.focus();
      const clip = player.preload(audioId);
      const { error } = await clip.download;
      if (!signal.aborted && !clip.controller.signal.aborted && error &&
          !elements.question.hidden && elements.play.dataset.state === 'idle') updateAudio('error', error);
    } catch (error) {
      if (signal.aborted) return;
      if (error.status === 409) pendingLoad = { action: 'start' };
      showRoundStatus(error.message, error.status === 409 ? 'Start a new round' : 'Try again',
        () => loadWord(pendingLoad.action, pendingLoad.previousId, true), focus);
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
    if (action === 'check') feedback('', 'Checking…');
    try {
      const response = await request(action, { questionId, answer: action === 'check' ? guess : undefined }, signal);
      const result = await readResponse(response);
      if (signal.aborted || !result) return;
      questionId = result.questionId;
      round.questionId = questionId;

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
        await loadWord('start', undefined, true);
      } else {
        feedback('error', error.message);
      }
    } finally {
      if (!signal.aborted) {
        pendingAnswer = elements.answer.readOnly = elements.check.disabled = elements.reveal.disabled = false;
      }
    }
  }

  for (const button of levels) {
    button.addEventListener('click', () => {
      const level = button.dataset.level;
      if (!selected.delete(level)) selected.add(level);
      button.setAttribute('aria-pressed', String(selected.has(level)));

      if (!selected.size) {
        if (pendingLoad) controller?.abort();
        player.stop();
        updateAudio('idle', '');
        elements.question.hidden = true;
        showRoundStatus('Select at least one difficulty level to practice.');
      } else if (pendingLoad) {
        loadWord(pendingLoad.action, pendingLoad.previousId);
      } else if (round.state === 'question') {
        if (selected.has(round.difficulty)) {
          elements.question.hidden = false;
          showRoundStatus('');
        } else {
          loadWord('skip', round.questionId);
        }
      } else if (round.state === 'filtered') {
        loadWord('resume', round.questionId);
      } else {
        showRoundEnd(false);
      }
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
  loadWord('start', undefined, false, initialRound);

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
    const payload = await readResponse(await request('page', { includeRound: true }));
    if (!payload || leavingPage) return;

    // The authenticated endpoint supplies a fixed template with no vocabulary.
    practice.innerHTML = payload.html;
    dispose = mountPractice(payload.round);
    accessStatus.hidden = true;
  } catch {
    accessStatus.textContent = 'Spelling Bee could not be opened. Please try again.';
    accessRetry.hidden = false;
  }
}

accessRetry.addEventListener('click', openPractice);
const authListener = client?.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (activeUserId && session?.user?.id && session.user.id !== activeUserId)) signIn();
});
if (embedded) {
  window.addEventListener('pagehide', event => {
    if (!event.persisted) authListener?.data?.subscription?.unsubscribe();
  });
}
openPractice();
