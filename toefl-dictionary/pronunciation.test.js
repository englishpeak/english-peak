import assert from 'node:assert/strict';
import test from 'node:test';
import { createPronunciationPlayer } from './pronunciation.js';

function fixture(t, fetchPronunciation) {
  const starts = [];
  const decodes = [];
  const requests = [];
  const states = [];
  class AudioContext {
    destination = {};
    async resume() {}
    async decodeAudioData(bytes) {
      decodes.push(bytes);
      return { bytes };
    }
    createBufferSource() {
      return {
        connect() {},
        disconnect() {},
        start() { starts.push(this); },
        stop() {},
      };
    }
    async close() {}
  }
  const originalWindow = globalThis.window;
  globalThis.window = { AudioContext };
  const player = createPronunciationPlayer((id, signal) => {
    requests.push({ id, signal });
    return fetchPronunciation(id, signal);
  });
  t.after(() => {
    player.dispose();
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });
  return {
    player, starts, decodes, requests, states,
    play: id => player.play(id, (state, message) => states.push([state, message])),
  };
}

const audioResponse = () => ({ ok: true, async arrayBuffer() { return new ArrayBuffer(4); } });

function deferred() {
  let resolve, reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

test('the click shares the preload and replay uses the decoded clip', async t => {
  const { promise, resolve } = deferred();
  const { player, play, starts, decodes, requests } = fixture(t, () => promise);
  player.preload('first');
  assert.equal(starts.length, 0);
  assert.equal(requests.length, 1);

  const playing = play('first');
  assert.equal(requests.length, 1);
  resolve(audioResponse());
  await playing;
  starts[0].onended();
  await play('first');

  assert.equal(requests.length, 1);
  assert.equal(decodes.length, 1);
  assert.equal(starts.length, 2);
  assert.equal(starts[0].buffer, starts[1].buffer);
});

test('switching words or leaving the dictionary discards pending audio', async t => {
  const first = deferred();
  const last = deferred();
  const { player, play, requests, starts } = fixture(t, id => {
    if (id === 'first') return first.promise;
    if (id === 'last') return last.promise;
    return audioResponse();
  });
  player.preload('first');
  const oldPlay = play('first');
  player.preload('second');
  assert.equal(requests[0].signal.aborted, true);
  first.resolve(audioResponse());
  await oldPlay;
  assert.equal(starts.length, 0);
  await play('second');
  assert.equal(starts.length, 1);

  player.preload('last');
  const pendingPlay = play('last');
  player.dispose();
  assert.equal(requests[2].signal.aborted, true);
  last.resolve(audioResponse());
  await pendingPlay;
  assert.equal(starts.length, 1);
});

test('a failed preload is retried and a failed click still reports its access error', async t => {
  const first = deferred();
  const responses = [first.promise, { ok: false, status: 403 }, audioResponse()];
  const { player, play, requests, starts, states } = fixture(t, () => responses.shift());
  player.preload('first');
  first.reject(new Error('Network error'));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(states.length, 0);

  await play('first');
  assert.deepEqual(states.at(-1), ['error', 'Pronunciation is included with ePeak+.']);
  await play('first');
  assert.equal(requests.length, 3);
  assert.equal(starts.length, 1);
});
