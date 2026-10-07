# Word Families integration

`/word-families` follows the project's standalone directory-page convention and
explicit Vercel rewrite. The dashboard adds the existing iframe/topbar shell under
**New Practice**, with the same login and ePeak+ upgrade dialogs and access badges.
Direct-page links use the established `/?auth=login` entry point and the same
upgrade dialog through `/?upgrade=word-families`.

## Access boundary

The static page is a loading/access shell without vocabulary data. It uses the
same Supabase project, publishable key, `ep-auth-token` session storage and browser
storage fallback as the dashboard. Neither parent messages, URL tier parameters,
nor cached profile/session user metadata can grant access.

`GET /api/word-families` verifies the session bearer token with Supabase
`auth.getUser(token)`, following the existing payment/account API pattern. It then
reads `profiles.tier,is_admin` for that verified user and applies the existing
`hasFullAccessTier` rule from `businesscases/access.js`. This preserves access for
premium, teacher, student and courtesy accounts, and the master-admin override.
Missing/invalid tokens return 401, free/unknown/missing profiles return 403, and
verification/configuration failures deny access with 503. Every response disables
browser/CDN caching. No RLS policy, profile data or account-management behavior is
changed.

Existing premium practice pages mostly gate public content in browser JavaScript;
that is insufficient to protect the new vocabulary bank. Word Families therefore
uses the existing server authentication pattern for its actual content boundary,
without changing those other activities. Authorized content already downloaded
by a member cannot be made secret again; logout/account changes remove the
rendered activity and subsequent API requests recheck access.

## Canonical data and supplied files

The supplied HTML's embedded bank and `word-families-data.json` were byte-identical
(after trimming the surrounding newline), with 300 records. The exact bank now
lives once in `api/word-families.js` as `WORD_FAMILIES`. This prevents a static JSON
URL from bypassing authorization and avoids two production copies. The public
HTML and practice script contain no bank. The uploaded JSON is intentionally not
copied to a publicly served file. The values, groups, variants and order are
unchanged; the bank's SHA-256 is
`961511019e50e21c127c2f0237238ffe37a04c0215dadfca50c106a3e9073c27`.

The prototype's exercise code is wrapped in `initializeWordFamilies(families)`
and receives only the server-returned bank. Easy/Hard selection, randomization,
independent decks, keyboard interaction, alternative answers and feedback are
otherwise preserved. Its styles and markup are preserved, with the project's
font tokens and existing topbar/member-gate treatment added.

The supplied audit/validation reports are retained here as development history,
not current claims of integration QA. `.vercelignore` excludes this directory
from deployment. Nothing links these reports from the student interface.

## Vercel

The existing static-page and Node serverless deployment handles the route. The
only `vercel.json` change is the clean-route rewrite. `.vercelignore` also excludes
development reports and test files, preventing API tests from becoming function
entry points. No build system, project,
domain or production deployment is changed.

No **new** environment variables are introduced. The endpoint needs the existing
server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` variables in both
**Preview** and **Production**. If they are already configured there for the
payment/account APIs, no environment action is required. If either is missing
from Preview, enable the existing variable for Preview and redeploy the PR
preview. Never put the service-role key in client code. No Stripe secret is
needed by this activity.

The GitHub-linked Vercel project should create a PR preview when its integration
is enabled. Look for the Vercel bot comment or the deployment URL on the PR's
Vercel check. If none appears, open the existing Vercel project, check that this
repository/branch is connected and Preview deployments are enabled, then deploy
the PR branch as a **Preview**. Review visitor/free/premium/admin access and both
modes there before merging. This task does not merge or deploy to production.
