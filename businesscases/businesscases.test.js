import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { googleDriveImageUrl, getDropboxDirectUrl, dropboxAudioUrl } from './media-urls.js';
import { canAccessBusinessCase, accessLabel } from './access.js';
import { businessCases } from '../src/data/businessCases.js';

test('Google Drive sharing URLs become direct image URLs', () => {
  assert.equal(googleDriveImageUrl('https://drive.google.com/file/d/abc_123/view?usp=sharing'), 'https://drive.google.com/uc?export=view&id=abc_123');
  assert.equal(googleDriveImageUrl('not a url'), '');
});

test('Dropbox links request raw media while preserving share keys', () => {
  const sharingUrl = 'https://www.dropbox.com/scl/fi/id/image.png?rlkey=secret&st=token&dl=0';
  const result = new URL(getDropboxDirectUrl(sharingUrl));
  assert.equal(result.searchParams.get('raw'), '1');
  assert.equal(result.searchParams.get('dl'), null);
  assert.equal(result.searchParams.get('rlkey'), 'secret');
  assert.equal(result.searchParams.get('st'), 'token');
  assert.equal(getDropboxDirectUrl('https://example.com/image.png?dl=0'), 'https://example.com/image.png?dl=0');
  assert.equal(getDropboxDirectUrl('not a url'), 'not a url');
  assert.equal(dropboxAudioUrl(sharingUrl), getDropboxDirectUrl(sharingUrl));
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
  assert.equal(
    getDropboxDirectUrl(item.imageSharingUrl),
    'https://www.dropbox.com/scl/fi/tzqyklndjwksy1o57zjak/case-1.png?rlkey=4szm8ecgrqwdh1geoz5pyft62&st=ky8ii7ql&raw=1'
  );
  assert.equal(item.reading.paragraphs.length, 7);
  assert.equal(item.reading.vocabulary.length, 8);
  assert.equal(item.listening.transcript.length, 3);
  assert.equal(item.quizQuestions.length, 5);
  assert.ok(item.quizQuestions.every(question => question.options.length === 4));
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.audience, 'Marcus Bennett, CEO');
});

test('lesson photos fill their responsive 3:2 frame without distortion', async () => {
  const styles = await readFile(new URL('./styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.case-photo\{[^}]*width:100%[^}]*aspect-ratio:3\/2[^}]*overflow:hidden[^}]*padding:0/);
  assert.match(styles, /\.case-photo img\{[^}]*width:100%[^}]*height:100%[^}]*display:block[^}]*object-fit:cover[^}]*object-position:center[^}]*margin:0/);
  assert.doesNotMatch(styles, /\.case-photo img\{[^}]*object-fit:contain/);
});

test('all lesson accordions render closed and do not persist expanded state', async () => {
  const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
  assert.match(app, /aria-expanded="false"/);
  assert.match(app, /section-content closed/);
  assert.doesNotMatch(app, /data-default-open|businessCase:\$\{c\.slug\}:section/);
  assert.doesNotMatch(app, /readingMarkup\(c\),true/);
});
