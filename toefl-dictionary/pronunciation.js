const PLAYBACK_ERROR = 'Could not play pronunciation. Please try again.';
const RESPONSE_ERRORS = {
  401: 'Your session has expired. Sign in again to listen.',
  403: 'Pronunciation is included with ePeak+.',
  404: 'This pronunciation recording is unavailable.',
};

export function createPronunciationPlayer(fetchPronunciation) {
  let context;
  let current;

  function stop() {
    if (!current) return;
    const { controller, source, update } = current;
    current = null;
    controller.abort();
    if (source) {
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    update('idle', '');
  }

  async function play(id, update) {
    stop();
    const controller = new AbortController();
    const request = { controller, update };
    current = request;
    update('loading', 'Loading pronunciation…');
    try {
      // Resume within the click gesture so Safari can play after the authenticated fetch.
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context ??= new AudioContext();
      const [, response] = await Promise.all([context.resume(), fetchPronunciation(id, controller.signal)]);
      if (current !== request) return;
      if (!response?.ok) {
        stop();
        update('error', RESPONSE_ERRORS[response?.status ?? 401] ?? PLAYBACK_ERROR);
        return;
      }
      const bytes = await response.arrayBuffer();
      if (current !== request) return;
      const buffer = await context.decodeAudioData(bytes);
      if (current !== request) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.onended = () => { if (current === request) stop(); };
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

  return { play, stop, dispose };
}
