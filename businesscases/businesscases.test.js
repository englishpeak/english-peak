import test from 'node:test';
import assert from 'node:assert/strict';
import { googleDriveImageUrl, dropboxAudioUrl } from './media-urls.js';
import { canAccessBusinessCase, accessLabel } from './access.js';
import { businessCases } from '../src/data/businessCases.js';

test('Google Drive sharing URLs become direct image URLs', () => {
  assert.equal(googleDriveImageUrl('https://drive.google.com/file/d/abc_123/view?usp=sharing'), 'https://drive.google.com/uc?export=view&id=abc_123');
  assert.equal(googleDriveImageUrl('not a url'), '');
});

test('Dropbox links request raw media while preserving share keys', () => {
  const result = new URL(dropboxAudioUrl('https://www.dropbox.com/scl/fi/id/audio.mp3?rlkey=secret&dl=0'));
  assert.equal(result.searchParams.get('raw'), '1');
  assert.equal(result.searchParams.get('dl'), null);
  assert.equal(result.searchParams.get('rlkey'), 'secret');
});

test('business-case access follows existing platform tiers', () => {
  const [case1, case2,, case4] = businessCases;
  assert.equal(canAccessBusinessCase(case1, 'visitor'), true);
  assert.equal(canAccessBusinessCase(case2, 'visitor'), false);
  assert.equal(canAccessBusinessCase(case2, 'free'), true);
  assert.equal(canAccessBusinessCase(case4, 'free'), false);
  assert.equal(canAccessBusinessCase(case4, 'premium'), true);
  assert.equal(canAccessBusinessCase(case4, 'teacher'), true);
  assert.equal(accessLabel(case1, 'visitor'), 'Open to everyone');
});

test('Case 1 has the complete reusable lesson data', () => {
  const item = businessCases[0];
  assert.equal(item.reading.paragraphs.length, 7);
  assert.equal(item.reading.vocabulary.length, 8);
  assert.equal(item.listening.transcript.length, 3);
  assert.equal(item.quizQuestions.length, 5);
  assert.ok(item.quizQuestions.every(question => question.options.length === 4));
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.audience, 'Marcus Bennett, CEO');
});
