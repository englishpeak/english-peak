# Final refinement validation — 6 October 2026

Only `word-families.html` and this validation report changed. The JSON export and editorial audit are unchanged copies of the supplied files. The embedded 300-family bank is byte-identical to the supplied HTML bank; Hard's inline implementation is also byte-identical.

## Changes

- Easy inherits ePeak blue `#0D3B6F`, including its primary/Next buttons, selection outline, drop border and family number. The level selector uses that same blue; purple `#470074` remains a focus accent. Old prototype blue/hover overrides were removed. Existing pastel cards, rounded surfaces, floating animation, spacious targets, green correct states and completion pulse/checkmarks remain.
- Main Easy instruction: “Sort the words by their part of speech.” A small “Drag, or click/tap a word, then a category.” hint remains linked through `aria-describedby`. Removed the floating word-bank label and repeated round-start instructions; accessibility labels and the live status region remain.
- Each non-null answer array generates exactly one randomly chosen representative when `newEasyFamily()` runs. Separate adjective groups produce separate cards. Identical words in separate grammatical groups also remain separate cards, and shared words still accept every valid category. No card is forced for a blocked category.
- The chosen representatives live in `easyWords` until Next family. Rendering, movement, Check answers, Show answers and level switching reuse those objects without selecting new alternatives.

## Executed checks

The actual inline application JavaScript passed Node VM tests using a minimal DOM fixture:

- All 300 Easy families: exact available-group card count, sorting, incorrect/unplaced/correct states, checking, reveal and disabled reveal state. Separate adjective groups, sparse categories and words shared by categories were checked explicitly.
- 533 additional representative-generation rounds exposed every stored alternative across repeated encounters, including British/American spellings. Card multisets matched one representative per non-null group. No database alternative was removed.
- Active-round stability: replaced the random source with a throwing function and exercised selection, movement, redraw, check, reveal and repeated level switches. No reroll occurred; selected words, placements and revealed state remained stable. Hard state also remained intact.
- Native dragstart/drop event handlers and click-selection/category handlers passed. Completion-state activation/reset, reveal exclusion, existing checkmark/pulse CSS, and reduced-motion rules passed code/static checks.
- Easy and Hard each traversed 300 distinct families before deck refill. Word Bank rendering remained idempotent with all 300 rows and full alternatives.
- Hard: 1,303 family/clue render-and-reveal cases and 5,624 accepted-alternative checks passed, including adjective-order flexibility, duplicate-group rejection, preservation of student spelling/case, Enter checking and Next focus.
- Palette inheritance, shorter copy, retained accessibility labels, unchanged responsive breakpoints/card layout rules and unchanged animation rules passed static assertions. No JavaScript syntax errors or runtime exceptions occurred in the application tests.

## Browser verification limitation

Desktop/mobile rendering, real pointer drag/drop, touch input, browser keyboard navigation, screen-reader output and actual animation playback were not verified. The isolated Chrome launch failed in this environment, and the browser tool then rejected the local `file:` URL because its security policy permits only HTTP/HTTPS and prohibits workarounds. The interaction results above are code-level tests, not browser automation.

---

The earlier validation notes below are retained as project history.

# Validation notes

- Exactly 300 unique records; five category slots each; nonempty, distinct answer groups; at least one answer per clue; no overlapping adjective groups.
- Executed the actual inline JavaScript in a Node VM with a minimal DOM fixture: 1,303 family/clue combinations rendered and revealed successfully.
- Checked 5,624 accepted-answer alternatives, adjective swaps, duplicate groups (including spelling variants), and reuse of the revealed adjective.
- Checked blank/incorrect/correct states, editing invalid answers, Enter handlers, Next Family focus with preventScroll, reveal buttons and readonly state, preserved student spelling/case, and revealed/correct visual classes.
- Checked 300 distinct families before deck refill, single-family rendering, blocked cells, word-bank idempotence, and malformed-bank rejection.
- Syntax check passed; no JavaScript exceptions during these application tests. Embedded data matches the JSON export.
- Static layout checks: desktop table retained, 800px minimum with horizontal scrolling, 16px inputs, 44px buttons, mobile rules, reduced motion and visible focus styles.

## Verification limitation

These are code-level tests, not browser automation. The browser tool prohibits inspecting this local file URL and explicitly disallows alternate routes around that restriction. Desktop/mobile visual rendering, real drag-free keyboard navigation, and the actual browser console were therefore not inspected. The current file should be refreshed and reviewed in the user’s browser before platform integration.

## Easy level restored

Restored the original Easy markup, pastel floating cards, native drag/drop handlers, click/tap selection fallback, and level selector. Both modes use the corrected 300-family bank. Hard layout and exercise logic remain unchanged. Additional code-level checks passed for sorting, checking and revealing all 300 families, drag/drop and click handlers, level switching with independent state, and the Easy non-repeating deck. All existing Hard checks passed again. The browser verification limitation above still applies.

## Easy layout and success feedback

Category boxes now precede the floating word bank on a shared background without a divider. Correct cards use light green. A fully correct check adds one staggered 650ms pulse and visible check marks; reduced-motion disables the pulse. Code checks confirm success clears on movement and the next family, and Show Answers does not trigger it. Full existing interaction checks passed again; visual browser verification remains unavailable.
