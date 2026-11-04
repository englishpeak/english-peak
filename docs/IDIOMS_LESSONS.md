# Idioms Lessons

`/idioms` is a standalone section using the existing Supabase project and
`ep-auth-token` session. The main dashboard opens it from New Practice.
Collocations Practice, Listen and Write, and Word Families keep their original
handlers and routes and are now listed once under General English.

## Files and content

- `idioms/index.html` and `idioms/styles.css`: approved prototype layout and
  colours and typography (Inter/system interface text and Georgia idioms and
  display headings). Shared brand tokens are imported; the explicitly approved
  prototype values take precedence over the general branding defaults.
- `idioms/catalog.js`: public lesson metadata (`id`, title, subtitle, kicker,
  `access`, `published`). Lessons 2–6 are reserved, unpublished premium lessons.
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
index, four `examples`, and optional `spanish`. Omit `spanish` when there is no
natural equivalent; the UI omits that reveal button. Never place learning
content in a public static file. Unpublished lessons return `COMING_SOON` to
eligible accounts and never return quiz items.

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
refresh, visible-page return and history restoration. Login links open the
existing `/?auth=login` flow. Locked lessons use `/?upgrade=idioms`, which opens
the existing dashboard subscription dialog. After signing in, return to Idioms
Lessons from the dashboard.

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
  **359 individual tests passed**.
- **11 Chromium browser checks passed** using intercepted requests and simulated
  Supabase account responses with the real API handler. These covered free,
  premium, visitor and failed-verification flows; optional Spanish omission;
  reveal/hide controls; feedback, first-answer locking, scoring and restarting;
  account changes; delayed responses; upgrade navigation; and modal focus.
- Layout checks passed at 320, 375, 768 and 1440 pixels without horizontal
  overflow. Desktop and mobile screenshots were visually inspected.
- `git diff --check` and new JavaScript syntax checks passed.
- `package.json` defines no build script. No dependency or migration was added.
- Live production Supabase/Stripe account checks and deployment were not run.
