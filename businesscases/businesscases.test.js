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
  const [case1, case2, case3, case4] = businessCases;
  assert.equal(canAccessBusinessCase(case1, 'visitor'), true);
  assert.equal(canAccessBusinessCase(case2, 'visitor'), false);
  assert.equal(canAccessBusinessCase(case2, 'free'), true);
  assert.equal(canAccessBusinessCase(case3, 'visitor'), false);
  assert.equal(canAccessBusinessCase(case3, 'free'), true);
  assert.equal(canAccessBusinessCase(case3, 'premium'), true);
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
  assert.equal(item.reading.paragraphs.length, 6);
  assert.equal(item.vocabulary.length, 8);
  assert.equal(item.reading.vocabulary, undefined);
  assert.equal(item.listening.transcript.length, 3);
  assert.equal(item.quizQuestions.length, 5);
  assert.ok(item.quizQuestions.every(question => question.options.length === 4));
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.audience, 'Marcus Bennett, CEO');
});


test('Case 2 contains the complete published lesson data and free-account access', () => {
  const item = businessCases[1];
  assert.equal(item.slug, 'case-2');
  assert.equal(item.placeholder, undefined);
  assert.equal(item.title, 'How Late Is Too Late?');
  assert.equal(item.accessTier, 'free');
  assert.equal(accessLabel(item, 'visitor'), 'Free account required');
  assert.equal(accessLabel(item, 'free'), 'Included with your account');
  assert.equal(
    getDropboxDirectUrl(item.imageSharingUrl),
    'https://www.dropbox.com/scl/fi/b9qw4znm145yqbdxon06b/case-2.png?rlkey=iez97dknev1up0mopb8e3cum6&st=38fpl416&raw=1'
  );
  assert.equal(
    dropboxAudioUrl(item.listening.audioSharingUrl),
    'https://www.dropbox.com/scl/fi/gv4d49y8k2e6c14gufpui/case-2.mp3?rlkey=0y764lzexww42ijet51a9nnlh&st=2ptu9h7c&raw=1'
  );
  assert.equal(item.vocabulary.length, 10);
  assert.equal(item.reading.paragraphs.length, 6);
  assert.equal(item.reading.vocabulary, undefined);
  assert.equal(item.listening.context, 'Listen to Ryan and Michael having an informal conversation at their desks after most of the office has gone home.');
  assert.equal(item.listening.transcript.length, 8);
  assert.equal(item.listening.transcript[5].stageDirection, true);
  assert.equal(item.quizQuestions.length, 5);
  assert.ok(item.quizQuestions.every(question => question.options.map(option => option.id).join('') === 'abcd'));
  assert.deepEqual(item.quizQuestions.map(question => question.correctAnswer), ['b', 'c', 'b', 'c', 'c']);
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.title, 'Set Professional Boundaries for the Team');
  assert.equal(item.takeaway.reminder, 'There is no universal rule for every deadline. The objective is to balance excellent work, responsible decision-making, and respect for life outside the office.');
});


test('Case 3 contains the complete published lesson data and free-account access', () => {
  const item = businessCases[2];
  assert.equal(item.slug, 'case-3');
  assert.equal(item.placeholder, undefined);
  assert.equal(item.title, 'Big Fish or Safer Bets?');
  assert.equal(item.accessTier, 'free');
  assert.equal(accessLabel(item, 'visitor'), 'Free account required');
  assert.equal(accessLabel(item, 'free'), 'Included with your account');
  assert.equal(accessLabel(item, 'premium'), 'Included with your account');
  assert.equal(
    getDropboxDirectUrl(item.imageSharingUrl),
    'https://www.dropbox.com/scl/fi/pghekk6h6cxiaj8ko8lzb/case-3.png?rlkey=eiua4p29n9hzfcaca6obqhx25&st=jvs3cso0&raw=1'
  );
  assert.equal(
    dropboxAudioUrl(item.listening.audioSharingUrl),
    'https://www.dropbox.com/scl/fi/snb42o4k9jrr20lf14b41/case-3.mp3?rlkey=qrw397mg31t1r75iy1bjtpqqi&st=thnttoac&raw=1'
  );
  assert.equal(item.vocabulary.length, 10);
  assert.equal(item.reading.paragraphs.length, 6);
  assert.equal(item.reading.vocabulary, undefined);
  assert.equal(item.listening.context, 'Listen to four members of the sales leadership team discussing how to allocate next month’s travel and client-development budget.');
  assert.deepEqual(item.listening.transcript.map(line => line.speaker), ['Victoria Chen', 'Danielle Brooks', 'Priya Shah', 'Laura Bennett', 'Danielle', 'Priya', 'Victoria']);
  assert.equal(item.quizQuestions.length, 5);
  assert.ok(item.quizQuestions.every(question => question.options.map(option => option.id).join('') === 'abcd'));
  assert.deepEqual(item.quizQuestions.map(question => question.correctAnswer), ['b', 'c', 'b', 'c', 'b']);
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.title, 'Propose Next Month’s Sales Strategy');
  assert.equal(item.writingTask.audience, 'Victoria Chen, Sales Director');
  assert.equal(item.takeaway.reminder, 'The strongest sales strategy is not necessarily the most aggressive one. It is the strategy that uses limited resources where they are most likely to create sustainable value.');
});

test('Case 4 contains the complete ePeak+ lesson data', () => {
  const item = businessCases[3];
  assert.equal(item.slug, 'case-4');
  assert.equal(item.placeholder, undefined);
  assert.equal(item.title, 'The Opportunity of a Lifetime');
  assert.equal(item.accessTier, 'premium');
  assert.equal(accessLabel(item, 'free'), 'ePeak+ required');
  assert.equal(accessLabel(item, 'premium'), 'Included with ePeak+');
  assert.equal(getDropboxDirectUrl(item.imageSharingUrl), 'https://www.dropbox.com/scl/fi/38l76qci1o7qw2baoa3cc/case-4.png?rlkey=4zee2tw3h32ynpd1lfjarkcab&st=5hu8dtvs&raw=1');
  assert.equal(dropboxAudioUrl(item.listening.audioSharingUrl), 'https://www.dropbox.com/scl/fi/zgx1rrggocitgszxa0c9y/case-4.mp3?rlkey=2s0mcjwb9ri741qhjms43vgga&st=uu71172g&raw=1');
  assert.equal(item.vocabulary.length, 10);
  assert.equal(item.reading.paragraphs.length, 6);
  assert.equal(item.reading.vocabulary, undefined);
  assert.equal(item.listening.transcript.length, 1);
  assert.equal(item.quizQuestions.length, 5);
  assert.deepEqual(item.quizQuestions.map(question => question.source), ['Reading', 'Reading', 'Listening', 'Listening', 'Combined']);
  assert.deepEqual(item.quizQuestions.map(question => question.correctAnswer), ['b', 'b', 'c', 'd', 'b']);
  assert.ok(item.quizQuestions.every(question => question.options.map(option => option.id).join('') === 'abcd'));
  assert.equal(item.speaking.questions.length, 5);
  assert.equal(item.writingTask.title, 'Advise Eva');
  assert.equal(item.takeaway.reminder, 'Sometimes the hardest career decision is choosing between two excellent opportunities rather than between a good one and a bad one.');
  const brief = item.reading.paragraphs.join(' ');
  for (const spoiler of ['Meridian Global', 'Chief Marketing Officer', 'stock options', 'relocation package', 'executive committee']) assert.doesNotMatch(brief, new RegExp(spoiler, 'i'));
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


test('case route enforces business-case access before rendering lessons', async () => {
  const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
  assert.match(app, /resolveExistingUserTier\(\)\.then\(tier => \{/);
  assert.match(app, /if \(canAccessBusinessCase\(current, tier\)\) renderCase\(current\);/);
  assert.match(app, /else app\.innerHTML = lockedCaseMarkup\(current, tier\);/);
  assert.match(app, /Sign in or create an account to continue/);
  assert.match(app, /Get ePeak\+ to unlock this case/);
});

test('vocabulary is a top-level lesson accordion before the background brief', async () => {
  const app = await readFile(new URL('./app.js', import.meta.url), 'utf8');
  const vocabularySection = "section('vocabulary','Useful Vocabulary','Vocabulary',vocabularyMarkup(c))";
  const backgroundSection = "section('background','Background Brief','Reading',readingMarkup(c))";
  assert.ok(app.includes(vocabularySection));
  assert.ok(app.indexOf(vocabularySection) < app.indexOf(backgroundSection));
  assert.doesNotMatch(app, /<details class="vocabulary"/);
  assert.doesNotMatch(app, /reading\.vocabulary/);
});
