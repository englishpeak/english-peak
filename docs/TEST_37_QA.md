# Updated TOEFL Practice Test 37 — integration and QA

Validated on November 13, 2026 against main commit `951f433`.

## Scope and files

The complete supplied Test 37 is integrated as 27 tasks: Reading (7), Listening
(10), Writing (8), and Speaking (2), in that order. The updated collection lists
Test 37 immediately after Test 36. Test 38 has no content and is not enabled.

- `ibt/index.html`: Test 37 content and updated collection entry.
- `index.html`: iBT total increased to 37 so existing full-access tiers receive it.
- `ibt/test37.test.js`: locked content, reconstruction, answer keys, objective
  scoring, timers, repeat/interview behavior, and historical-data regression checks.
- `ibt/index.test.js`: updated catalog and parent access expectations; Test 37
  unlocked/locked control coverage.
- `ibt/test34.test.js`, `ibt/test35.test.js`, `ibt/test36.test.js`: current catalog
  expectations, with Test 38 still unavailable. Historical test content is unchanged.
- `docs/TEST_37_QA.md`: this report.

No shared renderer, style, timer, scoring, authentication, or access-policy changes
were required. No audio was generated, renamed, or changed.

## Audio

The implemented URL convention is `../audio/ibt/test-37/<filename>` relative to
`ibt/index.html`. All 17 paths were verified as nonempty files, returned HTTP 200
from the local application server, loaded metadata in Chromium, and advanced
playback successfully:

- `task-8.mp3`, `task-9.mp3`, `task-10.mp3`, `task-11.mp3`
- `task-15.mp3`, `task-16.mp3`
- `task-18.mp3`, `task-19.mp3`
- `task-20.mp3`, `task-21.mp3`
- `sentence-1.mp3` through `sentence-7.mp3`

All ten Listening scripts and all seven repeat transcripts match the supplied
locked text. Every Listening task has an initially hidden script and the existing
last-resource note. Interview requires no audio.

## Complete the Words

All 20 locked prefix + suffix assertions pass, with ten inputs per passage.
Both first sentences remain intact. Only the first occurrence of `conditions`
is incomplete; `its storage conditions.` remains intact.

Chromium checks at 1440 × 1000 and 390 × 844 filled every input with its correct
suffix and reconstructed each passage from text nodes and input values. Both
passages matched the supplied source character for character at both viewports,
without whitespace normalization. All forty inspected boundaries across the two
viewports had zero geometric gap, zero input margin/padding, no whitespace text
node between prefix and input, and the required suffix-only maximum length.
Punctuation and ordinary word spaces were preserved. Screenshots of both filled
passages at both viewports were visually inspected; there was no horizontal
overflow.

## Keys and scoring

The following counts were computed from the implemented `correct` indices, with
exact question/option-order regression checks for all 35 multiple-choice items:

| Section | Items | A | B | C | D |
| --- | ---: | ---: | ---: | ---: | ---: |
| Reading | 17 | 4 | 4 | 5 | 4 |
| Listening | 18 | 4 | 5 | 4 | 5 |
| Combined | 35 | 8 | 9 | 9 | 9 |

Practice Accuracy counts 61 individual objective subitems: 20 word suffixes,
17 Reading MC questions, 18 Listening MC questions, and six Build a Sentence
tasks. Email, academic discussion, repeat, and interview are excluded. A partial
answer regression verifies 59/61 gives 97%; the browser completion gives 61/61
and 100%. No /120 result or official TOEFL band is displayed.

## Browser flow and regression results

The complete 27-task Test 37 flow passed in Chromium at both viewport sizes:

- Reading/Listening choices submit and advance correctly.
- All six supplied chunk orders render correctly. Chunks build the reply inline,
  can be removed, and produce each exact completed sentence, leaving one distractor.
- Email starts at 07:00 and discussion at 10:00; both timers tick correctly.
- Repeat presents one sentence at a time, with hidden text, exact reveal text,
  working play/replay, progress 1/7 through 7/7, no timer, and Submit & Next
  visible only at sentence 7.
- All four interview questions start hidden, reveal correctly, and start a fresh
  45-second timer. Advancement resets the question to hidden.
- Every task fits the viewport, final results show Practice Accuracy, and no
  JavaScript page errors occurred.
- A direct Test 37 request without an allowed entitlement remains on the locked
  catalog. Automated parent tests verify all existing full-access tiers include
  Test 37 while visitor/free access stays restricted to 2/5 tests.

Tests 1–36 retain byte-equivalent serialized content (SHA-256
`901a356e789d8008b83e43b651c0caea14a4fe9351d53d3e1a06c9f10111743e`).
All 36 opened and advanced through their first task in Chromium. Existing
automated regression coverage for Tests 31–36 also passes. These historical
browser checks were smoke checks, not complete reruns of every historical test.

Automated results:

- `node --test ibt/*.test.js`: **87 passed, 0 failed**.
- `node --test`: **471 passed, 0 failed** across the repository.
- `git diff --check`: passed.

No unresolved implementation issues or content deviations were found. Audio and
browser verification used the local application server; production CDN delivery
and a live authenticated production session were not tested.
