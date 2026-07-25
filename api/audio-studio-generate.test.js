import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ATTITUDE_INSTRUCTIONS,
  TURN_PAUSE_MS,
  createSilentMp3,
  instructionsForSpeaker,
  mergeMp3
} from './audio-studio-generate.js';

test('maps different attitude presets to their complete TTS instructions', () => {
  const settings = {
    Alex: { attitude: 'Friendly Teacher' },
    Sam: { attitude: 'Corporate Executive' }
  };

  assert.equal(instructionsForSpeaker('Alex', settings), ATTITUDE_INSTRUCTIONS['Friendly Teacher']);
  assert.equal(instructionsForSpeaker('Sam', settings), ATTITUDE_INSTRUCTIONS['Corporate Executive']);
});

test('uses custom instructions only for Other and preserves preset fallback behavior', () => {
  const settings = { Alex: { attitude: 'Other', customInstructions: '  Calm, curious, and unhurried.  ' } };
  assert.equal(instructionsForSpeaker('Alex', settings), 'Calm, curious, and unhurried.');

  settings.Alex.attitude = 'Natural Professional';
  assert.equal(instructionsForSpeaker('Alex', settings), ATTITUDE_INSTRUCTIONS['Natural Professional']);
  settings.Alex.attitude = 'Other';
  assert.equal(instructionsForSpeaker('Alex', settings), 'Calm, curious, and unhurried.');
});

test('inserts one fixed 1.2-second pause segment between every turn', () => {
  assert.equal(TURN_PAUSE_MS, 1200);
  const clips = [Buffer.from('first'), Buffer.from('second'), Buffer.from('third'), Buffer.from('fourth')];
  const pause = createSilentMp3(TURN_PAUSE_MS);
  const merged = mergeMp3(clips);

  assert.equal(merged.length, clips.reduce((total, clip) => total + clip.length, 0) + (pause.length * 3));
  assert.deepEqual(merged, Buffer.concat([clips[0], pause, clips[1], pause, clips[2], pause, clips[3]]));
});
