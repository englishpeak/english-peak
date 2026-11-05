# Test 35 implementation and QA

Test 35 is complete in UPDATED TOEFL PRACTICE, immediately after Test 34. Test 36 is unavailable. The existing design, section transitions, task renderers, navigation, audio controls, and access rules are retained.

## Files changed

- `ibt/index.html`: all 27 Test 35 tasks; catalog entry; optional preservation of the supplied mixed chunk order; real spaces between inline sentence chunks after selection/removal; updated-practice scoring explanation for Test 35.
- `index.html`: increase the existing library total to 35 so the existing full-access tiers receive Test 35.
- `ibt/index.test.js`: catalog and tier expectations updated to include Test 35.
- `ibt/test34.test.js`: catalog expectations updated; existing Test 34 content assertions retained.
- `ibt/test35.test.js`: nine automated checks covering content, reconstruction, distribution, audio paths, writing, speaking, scoring, and preservation of all earlier test data.
- `docs/TEST_35_QA.md`: this report.

## Content and scoring

The 27 tasks follow Reading → Listening → Writing → Speaking: 7 Reading tasks, 10 Listening tasks, 8 Writing tasks, and 2 Speaking tasks. All supplied passages, questions, choices, scripts, writing prompts, repeat sentences, and interview questions are included. The six sentence builders retain the specified mixed order, four correct chunks, and exactly one distractor each.

The distributions below were calculated from the actual correct-answer indices in the final Test 35 data, then checked against the supplied keys.

| Multiple-choice items | A | B | C | D | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Reading | 4 | 4 | 4 | 5 | 17 |
| Listening | 4 | 5 | 5 | 4 | 18 |
| Combined | 8 | 9 | 9 | 9 | 35 |

Practice Accuracy scores 61 objective subitems: 20 individual word blanks + 17 Reading MC questions + 18 Listening MC questions + 6 sentence builders. The email, academic discussion, Listen and Repeat, and interview are excluded. The browser flow finished at 61/61 (100%) at all three tested widths. An automated check also confirmed that one wrong blank and one wrong Reading subquestion produce 59/61 (97%), even when all four excluded task types have unsuccessful result flags. No /120 score or official TOEFL band is generated.

## Complete the Words

- All 20/20 locked prefix + suffix assertions pass.
- Both original first sentences remain intact; each passage has exactly 10 blanks.
- Both passages were filled with their exact suffixes in Chromium at viewport widths 1280, 390, and 320 pixels.
- Reconstructed DOM text, including input values, matches each exact source passage character for character at every width. No text normalization was needed.
- All 20 prefix/input boundaries per viewport have no intervening whitespace or extra text node, no nonbreaking or invisible characters, and zero input margin, padding, or border. Measured prefix-to-input separation is below 0.6 CSS pixels; the wrapper has no CSS gap.
- Inputs request only the suffix and have the exact suffix length as their maximum length. Punctuation stays with the completed word; normal spaces remain outside it.
- Full-page screenshots of both filled passages were visually inspected at desktop and narrow/mobile sizes. Words remain contiguous with correct characters, punctuation, and wrapping.
- The shared Complete the Words renderer required no changes.

## Audio and interaction checks

The exact relative audio directory is `../audio/ibt/test-35/`, resolving to repository directory `audio/ibt/test-35/`.

All 17 expected MP3s resolve: `task-8.mp3`, `task-9.mp3`, `task-10.mp3`, `task-11.mp3`, `task-15.mp3`, `task-16.mp3`, `task-18.mp3`, `task-19.mp3`, `task-20.mp3`, `task-21.mp3`, and `sentence-1.mp3` through `sentence-7.mp3`. All were decoded completely with FFmpeg without errors. Chromium loaded metadata and started playback for every file, with finite positive durations, advancing playback time, and no media errors. Uploaded audio bytes and filenames were not changed. No interview audio was added.

The complete browser flow checked:

- All 35 MC choices retain their supplied order and record each subquestion independently.
- All ten Listening tasks start with a hidden transcript, reveal the exact supplied script with Show Script, and display the existing helper note and audio/question spacing.
- All six sentence builders show the supplied mixed chunk order, construct the exact reply inline, allow chunk removal, and leave only the distractor unused.
- Email starts at 07:00 and academic discussion at 10:00, using the existing open-response interface.
- Listen and Repeat displays one sentence at a time, starts with hidden text, reveals the exact corresponding script, supports playback/replay, has no countdown, advances through all seven sentences, and exposes Submit & Next only on sentence 7.
- All four interview prompts start hidden, reveal the exact current question, and reset the next prompt to hidden. Each response window starts at 00:45; real timer advancement to 00:44 was verified for every question on desktop.
- All 27 tasks advance to the results page at widths 1280, 390, and 320 without horizontal overflow or JavaScript page errors.
- The guest catalog keeps Test 35 locked. Automated parent-tier checks retain the existing guest/free allowances and include Test 35 for admin, premium, teacher, student, and courtesy tiers. Test 36 is not enabled.

## Regression and automated results

- All Tests 1–34 retain exactly their original runtime content, verified by a SHA-256 comparison against the pre-change data: `9898c6e398f9427ecbedb75b27fab4129d660e69d924fa54b9c92cff2421b07d`.
- Existing automated checks render and traverse every task in Tests 1–30 with correct, incorrect, and unanswered inputs.
- Tests 31, 32, 33, and 34 were each completed in Chromium at mobile width, finishing at 61/61. Their inline sentence builders were also checked after removing middle, first, and last chunks, then rebuilding the correct reply. No JavaScript page errors occurred.
- `node --test ibt/*.test.js`: 59 passed, 0 failed.
- `node --test`: 395 passed, 0 failed.
- `git diff --check`: passed.

## Scope and limitations

The small shared renderer changes preserve Test 35's supplied bank order and insert actual spaces between inline sentence chunks, including after removal. Earlier tests keep their existing bank randomization. No Complete the Words renderer or styling changes were needed.

Browser checks ran locally in Chromium; no live account sign-in or production deployment was performed as part of QA. External font requests were blocked during the local browser checks, so screenshots use the existing fallback fonts; production font links remain unchanged. No known implementation issues or content deviations remain.
