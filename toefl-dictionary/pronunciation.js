const PLAYBACK_ERROR = 'Could not play pronunciation. Please try again.';
const RESPONSE_ERRORS = {
  401: 'Your session has expired. Sign in again to listen.',
  403: 'Pronunciation is included with ePeak+.',
  404: 'This pronunciation recording is unavailable.',
};

export function createPronunciationPlayer(fetchPronunciation) {
  let context;
  let current;
  // Keep only the open word's recording, and only in this player's memory.
  let clip;

  function stopPlayback() {
    if (!current) return;
    const { source, update } = current;
    current = null;
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    update('idle', '');
  }

  function stop() {
    clip?.controller.abort();
    clip = null;
    stopPlayback();
  }

  function preload(id) {
    if (clip?.id === id) return clip;
    stop();
    const controller = new AbortController();
    const pending = { id, controller };
    clip = pending;
    pending.download = (async () => {
      try {
        const response = await fetchPronunciation(id, controller.signal);
        if (response?.ok) return { bytes: await response.arrayBuffer() };
        return { error: RESPONSE_ERRORS[response?.status ?? 401] ?? PLAYBACK_ERROR };
      } catch {
        return { error: PLAYBACK_ERROR };
      }
    })().then(result => {
      if (result.error && clip === pending) clip = null;
      return result;
    });
    return pending;
  }

  async function play(id, update) {
    stopPlayback();
    const selected = preload(id);
    const request = { update };
    current = request;
    update('loading', 'Loading pronunciation…');
    try {
      // Resume within the click gesture so Safari can play after the authenticated fetch.
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context ??= new AudioContext();
      const [, { bytes, error }] = await Promise.all([context.resume(), selected.download]);
      if (current !== request) return;
      if (error) {
        stopPlayback();
        update('error', error);
        return;
      }
      selected.decoded ??= context.decodeAudioData(bytes);
      const buffer = await selected.decoded;
      if (current !== request) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => { if (current === request) stopPlayback(); };
      source.start();
      request.source = source;
      update('playing', 'Playing pronunciation…');
    } catch {
      if (current !== request) return;
      stop();
      update('error', PLAYBACK_ERROR);
    }
  }

  function dispose() {
    stop();
    context?.close().catch(() => {});
  }

  return { preload, play, stop, dispose };
}
