# Course foundation

`/course` is a standalone static catalogue using the existing Vercel rewrite
convention. It is intentionally absent from the homepage/navigation and has
`noindex, nofollow` while in development. It contains curriculum metadata only.

## Source of truth

`course/curriculum.js` owns course copy, ordered CEFR levels, ordered modules,
access/status labels, and the reserved module areas. There is no fixed module
limit. Level counts and display numbers are computed from the arrays.

Each module has:

| Field | Meaning |
| --- | --- |
| `id` | Stable identity; preserve when renaming, reordering or moving levels. |
| `level` | Reference to a level ID (`a1`–`c1`). |
| `slug` | Explicit URL segment, independent of the display title. |
| `title` | Display name. |
| `access` | `public`, `account`, or `epeak-plus`. |
| `status` | `coming-soon`, `future`, or `available`. |

Module array order determines order within each level. Add/split modules by
adding records with new stable IDs and unique level/slug pairs. Rename by editing
`title`; move by changing `level`; reorder records to reorder the catalogue.
Changing a published level/slug will need an explicit redirect for old links.
Additional metadata can be added to a record without changing the catalogue.
No learning content or content format is prescribed by this public manifest.

## Release and access are independent

All 13 A1 modules are `coming-soon`. All 39 A2–C1 modules are `future`.
A1's first three modules are `public`, the other ten are `account`, and every
A2–C1 module is `epeak-plus`. Availability always takes precedence, even for
administrators. Unreleased catalogue rows have no link/click handler and carry
`aria-disabled`; direct URLs display an unavailable notice, not an empty lesson.

`course/model.js` imports `hasFullAccessTier` and `resolveExistingUserTier` from
the existing `businesscases/access.js`. It does not introduce a new user store or
Supabase client configuration. The existing resolver uses `ep-auth-token` and
reads `profiles.tier,is_admin` from the same Supabase project as the dashboard.
It is called only for released, non-public modules; the current catalogue and
unreleased routes work without Supabase/network availability.

Assumption: ePeak+ means the existing full-access policy, including `premium`,
`teacher`, `student`, `courtesy`, and the admin override. The course does not
independently reinterpret Stripe subscription dates/status. Existing billing
handlers maintain the profile tier. Account access needs an authenticated
session and does not need a paid tier.

Sign-in uses the dashboard's existing `/?auth=login` entry point. Its shared
ePeak+ modal currently recognizes only `/?upgrade=word-families`, so the course
reuses that entry point as well; the homepage is not modified to add a new one.

The browser resolver is **presentation only**, never proof of authorization.
For future protected content, follow `api/word-families.js`: verify the bearer
token with `supabase.auth.getUser`, obtain `profiles.tier,is_admin` server-side,
apply the shared full-access policy, and send private/no-store responses.
Account-only content must also verify the token server-side. Check release
status before returning any material. Never trust tier/user data supplied by the
browser, and never publish restricted content in a static JS/JSON/HTML file.
There is no content API or new backend in this foundation.

## Future areas and activation

Predictable routes are reserved and handled now:

- `/course/a1/verb-to-be` (defaults to Study)
- `/course/a1/verb-to-be/study`
- `/course/a1/verb-to-be/review`
- `/course/a1/verb-to-be/test`

`moduleAreas` reserves Study, Review Exercises and Take Test (20 questions).
These are identifiers and metadata only: there are no tabs, activity engines,
question banks, lessons or media yet. Each area can later load its own content
schema/renderer without changing curriculum records or URL conventions.
Unknown level/module/area URLs show a useful not-found page with a course link.

To release a module later:

1. Implement its area renderers and content delivery. Keep unreleased areas
   closed if releasing areas in stages. Add per-area availability metadata then.
2. For account/ePeak+ material, implement server authorization as described above
   before wiring the renderer. Clear rendered protected content on sign-out and
   revalidate access on session changes, following `word-families/access.js`.
3. Connect the authorized content response to `renderModuleRoute`'s allowed
   branch. Until a renderer exists, it deliberately says the module is not ready.
4. Change that record's `status` to `available`. Keep or change `access`
   independently. The catalogue automatically renders its link and updates the
   level's availability summary; no catalogue UI rewrite is required.
5. Verify visitor, free-account, full-access, sign-out, error and direct-URL
   behavior, including server responses that cannot leak restricted content.

Changing status alone cannot create content or open an empty learning interface.
The first real module necessarily adds learning renderers and secure delivery;
these are deliberately outside this foundation task.

## Validation

Run `node --test course/course.test.js` for curriculum, route and access-policy
coverage and `node --test` for the repository's existing tests. This static
project has no build, lint or test scripts in `package.json`; no dependencies
have been added. Preview through a server that honors Vercel rewrites to check
direct module URLs as well as the catalogue.
