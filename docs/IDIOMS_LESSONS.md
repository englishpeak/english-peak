# Idioms Lessons

`/idioms` opens the shared platform shell, including the sidebar and global
header, and mounts `/idioms/index.html?embedded=1` in its exercise iframe.
The main dashboard opens it from New Practice without leaving the app.
The lesson document has no separate top bar. Direct lesson links such as
`/idioms?lesson=1` also open in this shell. Authentication continues to use the
existing Supabase project and `ep-auth-token` session.
Collocations Practice, Listen and Write, and Word Families keep their original
handlers and routes and are now listed once under General English.

## Files and content

- `idioms/index.html` and `idioms/styles.css`: approved prototype layout and
  colours and typography (Inter/system interface text and Georgia idioms and
  display headings). Shared brand tokens are imported; the explicitly approved
  prototype values take precedence over the general branding defaults.
- `idioms/catalog.js`: public lesson metadata (`id`, title, subtitle, kicker,
  `access`, `published`). Lessons 2–5 are published for ePeak+; Lesson 6 remains an unpublished premium lesson.
- `api/idioms.js`: server-only `IDIOM_LESSON_CONTENT`, keyed by lesson ID, and
  protected catalog/lesson endpoint. Lesson 1 preserves all ten original idioms,
  choices, correct answers, examples and Spanish equivalents verbatim.
- `idioms/quiz.js`: shuffled options, immutable first answers, navigation,
  scoring and restart state. `practice.js` renders the approved lesson UI;
  `app.js` handles lesson selection, access checks and account changes.

To add a lesson, put exactly ten records in `IDIOM_LESSON_CONTENT[lessonId]`
and mark its catalog entry `published: true`. Add another catalog entry to
extend the index beyond six lessons; no UI or routing changes are needed.
Each record has a unique `id`, `idiom`, four `options`, a zero-based `correct`
index, an optional exact `question`, four `examples`, and optional `spanish`. Omit `spanish` when there is no
natural equivalent; the UI omits that reveal button. Never place learning
content in a public static file. Unpublished lessons return `COMING_SOON` to
eligible accounts and never return quiz items.

For Lesson 4 and future lessons, distribute correct answers as evenly as
mathematically possible across A, B, C and D. Ten questions require a 3/3/2/2
distribution. Vary the sequence between lessons; avoid long runs of one answer
and repeating A-B-C-D patterns. The existing quiz shuffles options per round
while preserving exactly one correct answer, so the balanced distribution
applies to the source data rather than the displayed letters.

Before publishing, check against all earlier idioms and within the new lesson,
including pronoun and verb variants. The tests in `idioms/lesson4.test.js`
normalise pronouns and known inflections across all published lessons and
enforce balanced answer counts and varied sequences for Lesson 4 onward.
Extend the known inflections for new verbs and review variants editorially;
automated normalisation does not identify every possible paraphrase.

## Access and deployment

`GET /api/idioms` returns verified account entitlement and catalog metadata.
`GET /api/idioms?lesson=1` returns learning content only after the bearer token
is verified by Supabase `auth.getUser`. Lesson 1 allows any authenticated
account. Premium lessons require the existing `hasFullAccessTier` policy from
`businesscases/access.js` and a server-read `profiles.tier` or strict
`profiles.is_admin === true` override. This preserves premium, teacher, student,
courtesy and admin grants. The existing Stripe webhook/confirm-payment flow
maintains subscription entitlements in `profiles.tier`; no new payment logic or
authentication system is introduced.

The client never supplies authoritative tier information. Every response
disables browser and CDN caching. Invalid/missing tokens, profile failures,
and backend errors return no learning content. The browser discards the round
on sign-out/account change, ignores stale requests, and revalidates on token
refresh, visible-page return and history restoration. Sign-in and upgrade requests use same-origin messages to open the existing
platform dialogs in place. Returning to a visible page and platform auth
notifications recheck the protected API. Navigation messages synchronize
`/idioms?lesson=…` in the parent URL and are accepted only from the active
Idioms frame at the same origin. The internal document keeps its own
`/idioms/index.html?embedded=1` URL so reloading it never nests the shell.
Opening that internal document as a top-level page redirects to `/idioms`.

Deployment requires the existing `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` server environment variables, as for Word Families.
No migration, new dependency, or build step is required. Deploy the static
section, updated Vercel rewrite, dashboard, and API together.

## Checks

Run `node --test` for repository checks, or the focused checks:

```sh
node --test api/idioms.test.js idioms/*.test.js collocations/collocations.test.js word-families/*.test.js
```

The content test pins a SHA-256 digest of all Lesson 1 content excluding the
new IDs. Access tests cover forged claims, each membership tier, future lesson
publication, backend failures, unpublished lessons and cache prevention. Quiz
tests cover shuffling, all four options, first-answer locking, mixed scoring,
navigation and reset. Live Supabase/Stripe checks require configured deployment
credentials and real test accounts.

## Implementation verification

- All 48 repository test files passed; running each file directly confirmed
  **362 individual tests passed**.
- **12 Chromium browser checks passed** using intercepted requests and simulated
  Supabase account responses with the real API handler. These covered free,
  premium, visitor and failed-verification flows; optional Spanish omission;
  reveal/hide controls; feedback, first-answer locking, scoring and restarting;
  shared sidebar navigation, in-place login/upgrade dialogs, direct lesson
  links, refresh, browser Back, iframe isolation, and modal focus.
- Layout checks passed at 320, 375, 768 and 1440 pixels without horizontal
  overflow. Desktop and mobile screenshots were visually inspected.
- `git diff --check` and new JavaScript syntax checks passed.
- `package.json` defines no build script. No dependency or migration was added.
- Live authenticated production Supabase/Stripe checks were not run.
  Deployment status is tracked through the repository’s Vercel integration.

## Lesson 2

Lesson 2 uses the ten supplied idioms, exact questions and choices, 40 examples,
and ten Spanish equivalents. Its content stays server-only and uses the existing
entitlement checks, shuffled choices, practice UI and independent quiz rounds.
No idiom repeats across the published lessons. A test normalises idiom text
to detect duplicate expressions across all published lessons. Lesson 1 is unchanged.
The Idioms index footer tagline is removed; the lesson footer is preserved.

Lesson 2 verification: all 49 repository test files pass. Focused checks cover
the exact supplied content, premium/free/visitor API access, unpublished lessons,
all reveal/hide controls, shuffled answers, scoring, navigation, restart and
lesson switching. Lesson 1's existing content digest remains unchanged. Syntax
and whitespace checks pass. There is no build script or new dependency. These
checks use simulated accounts and DOM elements; live Supabase/Stripe and browser
checks were not run for this addition.

## Lesson 3

Lesson 3 adds the ten supplied idioms, exact questions and choices, 40 examples,
and ten Spanish equivalents to the protected endpoint. No new runtime component,
authentication policy or dependency is needed. Lessons 1 and 2 are unchanged;
Lessons 4–6 remain unpublished. The normalised duplicate check covers all three
published lessons, and no duplicate expressions or grammatical variants were found.

Validation covers premium/free/visitor API access; exact content and shuffled
correct-answer mapping; rendering all questions and details; reveal/hide controls;
progress, previous/next, final scoring, restart and independent lesson state.
The existing Lesson 1 and Lesson 2 content digests remain pinned. All 49 repository
test files pass, alongside syntax and whitespace checks. There is no build script.
Checks use simulated accounts and DOM elements; live account and browser checks
were not run for this addition.

## Lesson 4

Lesson 4 adds the ten approved idioms, exact questions and four choices per
question, all 40 example sentences, and ten Spanish equivalents. The content
uses the existing protected endpoint and full-access entitlement policy.
The lesson UI, shuffled answers, reveal controls, navigation, progress,
scoring, restart and independent lesson state are reused unchanged.
Lessons 1–3 retain their original content; Lessons 5–6 remain unpublished.

No internal duplicates or grammatical variants of idioms in Lessons 1–3 were
found. The source answer sequence is C, A, D, B, A, C, B, D, A, B:
A:3, B:3, C:2, D:2. The duplicate checks now cover all 40 published idioms.

Focused automated checks cover exact content digests, server access checks
for visitors, free accounts and existing full-access tiers, forged claims,
direct Lesson 4 URLs, sign-in/upgrade delegation, all detail controls, answer
shuffling, navigation, progress, scoring, restart and lesson switching.
The existing Lesson 1–3 content digests remain pinned. All 50 repository test
files pass with `node --test`; all 30 focused checks pass with
`node --test --test-isolation=none api/idioms.test.js idioms/*.test.js`.
JavaScript syntax and `git diff --check` checks pass. Tests use simulated
accounts and DOM elements; live authenticated production checks are not run.
There is no build script or new dependency, and no migration is required.

## Lesson 5

Lesson 5 publishes the ten approved idioms with the exact questions, four
choices per question, 40 example sentences, and ten Spanish equivalents.
It reuses the protected API, Supabase verification, existing ePeak+ entitlement
policy, and the unchanged lesson components. Visitors must sign in; free
accounts use the existing upgrade flow, including on direct lesson links.
Lesson 6 remains unpublished. Lessons 1–4 retain their original content.

Editorial review and automated checks found no duplicate idioms or grammatical
variants among all 50 published expressions. Each new question has one correct
definition, four natural examples, and a natural Spanish equivalent. The exact
source answer sequence is D, C, A, B, D, A, C, B, C, D:
A:2, B:2, C:3, D:3. The two letters with three answers differ from Lesson 4.
The existing per-round option shuffle preserves the correct definitions.

All 50 repository test files pass with `node --test`. All 34 focused checks
pass with `node --test --test-isolation=none api/idioms.test.js idioms/*.test.js`.
Coverage includes exact-content digests, duplicate detection with pronoun and
verb variations, balanced answers, server access checks, direct Lesson 5 links,
index locks, all examples and Spanish reveals, shuffled answers, feedback,
progress, previous/next navigation, scoring, restart, and independent rounds.
Lessons 1–4 pass their original content digest checks. Syntax and whitespace
checks pass. No build script exists, and no dependency or migration is needed.
These checks use simulated accounts and DOM elements; live authenticated
production Supabase/Stripe checks were not run.
