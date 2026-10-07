# Word Families integration QA

Executed locally against the actual vendored Supabase browser SDK and the actual
protected API handler with test-only Supabase identity/profile fixtures. No live
accounts, production data, RLS policies or deployment settings were changed.

## Automated tests

`node --test`: all 33 test files passed, including 12 new API/integration cases.
JavaScript syntax checks and `git diff --check` passed.

## Browser checks

- Direct loading and refreshing: visitor/free denied; premium/admin/teacher/
  student/courtesy allowed. Forged URL/profile claims and parent messages cannot
  release the bank. API tests verify only Supabase's authenticated identity and
  stored profile decide access.
- Dashboard: visitor login prompt, free account upgrade prompt, premium/admin
  iframe entry, existing Dashboard back navigation.
- Cross-tab sign-out removes the activity on both desktop and mobile. Errors and
  stale responses fail closed in regression tests. Private API responses disable
  browser and Vercel/CDN caching. No static vocabulary-bank URL exists.
- Desktop 1440px and touch viewport 390px: Easy/Hard, native desktop drag/drop,
  keyboard selection/Enter checks, mobile tap fallback, correct completion,
  reveal, Next, level-state preservation, 300-row idempotent Word Bank, and no
  horizontal page overflow. Existing horizontal table scrolling is retained.
- Both modes visually inspected. No JavaScript page errors occurred.

## Exhaustive real-browser DOM checks

The unchanged prototype logic was additionally run in an isolated Chromium DOM:

- 300 families; 533 representative rounds cover every stored alternative.
- 1,303 Hard family/clue cases and 5,624 accepted-form checks.
- 609 adjective-order swaps; duplicate adjective groups rejected.
- 300 distinct families in each deck before refill.
- Correct student spelling/case preserved on reveal; selected Easy alternatives
  stable through movement, checks, reveal and level switching.

The canonical bank's exact serialized SHA-256 matches the uploaded JSON. The
entire Easy/Hard script matches the uploaded HTML after removing its embedded
bank read, adding the initializer wrapper, and trimming trailing whitespace.

## Preview verification still needed

The initial automatic Vercel preview reported a deployment failure. Its
authenticated build logs were unavailable in this environment. Test files are
now excluded from deployment so API tests cannot become function entry points;
the latest PR check must succeed before live-account verification or merging.

Local security tests use mocked Supabase responses; they do not certify live
account entitlement or the production project's current RLS configuration.
Google Fonts were unavailable in this environment; fallback fonts were used.
Screen-reader attributes/live regions and reduced-motion rules were preserved;
no live screen-reader session was performed.

Review the PR's Vercel preview with actual visitor, free, ePeak+ and master-admin
accounts. Ensure the existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
enabled for Preview as well as Production. No new variable, RLS migration or
production deployment is required by this integration.
