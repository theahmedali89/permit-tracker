# Permit Warden v2 — Merged Audit Fixes, Security & New Features

Date: 24 November 2026
Update: 24 November 2026 (afternoon) — blog images WebP + 13 new images (see § "Blog images — WebP conversion" below).
Update: 24 November 2026 (evening) — design preview fixes (see § "Design preview fixes — toggle, login, mockup" below).

## Corrections — 24 November 2026 (audit fix pass)

The original claims below are kept as written (not deleted); each is
marked corrected here with what the code actually shows as of
2026-11-24. Fixes for the underlying issues are in the same pass
(see the changed-files notes in `/tmp/audit-drafts/fix-billing-changed.md`).

- **(a) Plan-limit enforcement (Security §15 / Features §4) — CORRECTED
  2026-11-24.** The claim that `checkLimit()` was enforced in POST
  permits/licenses/projects/documents was false: only team invites
  (`app/api/team/route.ts`) enforced it. Enforcement has now been added
  to POST `/api/permits`, `/api/licenses`, `/api/projects`,
  `/api/documents` and the CSV import (`app/api/permits/import/route.ts`),
  all via `enforcePlanLimitWithGraceMode()` / `enforceBulkPlanLimitWithGraceMode()`
  from `lib/features/billing` (402 + upgrade hint when over limit).
  **Grace mode:** limits are enforced ONLY when Stripe is configured
  (`STRIPE_SECRET_KEY` present); without keys the write is allowed and
  a warning is logged, because every org defaults to plan `"free"` and
  there is no working upgrade path without keys. See
  `lib/features/billing/README.md`.
- **(b) "$49/$99/$199 from `lib/plans.ts`" (Features §4) — CORRECTED
  2026-11-24.** `lib/plans.ts` holds plan *limits* only; it contains no
  dollar prices. The $49/$99/$199 prices live only in
  `app/(public)/pricing/page.tsx` (and are duplicated in `PLAN_PRICES`
  in `lib/features/billing/index.ts` for display).
- **(c) "No `USING (true)` for writes remains" (Security §2) — CORRECTED
  2026-11-24.** False as written: `supabase/migration-jurisdiction-regulations.sql`
  still contains `USING (true)` / `WITH CHECK (true)` write policies
  (INSERT/UPDATE/DELETE, lines 32–51). They are neutralised only if
  `supabase/migration-security-fixes.sql` runs AFTER it (its DROP POLICY
  statements replace them with admin-only policies) — migration order
  matters. The old file itself was not edited.
- **(d) Rate limits on signin/signup/reset-password (Security §10) —
  NOT corrected — claim verified TRUE on re-check, 2026-11-24.** The
  audit draft reported "no trace" of these limits because it searched
  only `app/api/`. Re-checking the whole repo: rate limits DO exist —
  `app/auth/signin/route.ts` (10 attempts/IP/15 min),
  `app/auth/signup/route.ts` (10/IP/15 min) and
  `app/auth/reset-password/route.ts` (5/IP/15 min), all via
  `checkRateLimit` from `lib/shared/rate-limit.ts`. Rate limiting also
  exists on the portal route (30/hr/token) and parcel-lookup, as claimed.
- **(e) CI workflow (Quality gates §21) — CORRECTED 2026-11-24.** The
  file `.github/workflows/ci.yml` did not exist when claimed. It now
  exists (install, typecheck `npx tsc --noEmit`, test `npm run test`,
  build; Node 20; push/pull_request).
- **(f) "Duplicated `getOrgId` deleted" (Security §14) — CORRECTED
  2026-11-24.** True only for the four originally migrated routes
  (permits/projects/licenses/inspections). Local `getOrgId` duplicates
  also survived in five more routes; they have now been replaced with
  the shared `getActiveOrgId()` from `lib/shared/org-context.ts` in
  `app/api/auth/google-calendar/route.ts`,
  `app/api/calendar/sync/route.ts`, `app/api/deadlines/route.ts`,
  `app/api/export/route.ts` and `app/api/organization/route.ts`
  (behaviour unchanged, except the google-calendar route now honours
  the active-org cookie like the other routes). Note: other routes
  outside this list (`app/api/reports/*`, `app/api/subcontractors/*`)
  still carry their own local `getOrgId` — out of scope for this pass.
- **Blog admin check (Security §2) — CORRECTED 2026-11-24.** The claim
  "Same check enforced in `app/api/blog/*`" was false: both blog API
  routes checked only org membership. `POST /api/blog` and
  `PATCH`/`DELETE /api/blog/[id]` now enforce `isPlatformAdmin()` from
  `lib/platform-admin.ts` (401 unauthenticated, 403 non-admin); GET is
  unchanged.
- **SMS escalation toggle (Features §9) — REMOVED 2026-11-24.** The
  settings toggle claimed there is gone: SMS escalation is DISABLED
  pending Twilio keys, phone-number storage, and inbound ACK handling
  (see `lib/features/sms-escalation/README.md`). The helpers are kept;
  nothing in production calls them.

## Design preview fixes — toggle, login, mockup (24 Nov 2026 evening)

- Merged preview `design-preview/permit-warden-complete.html` (hero + dashboard + login, one file) fixed after Sidra's screenshot review:
  * Day/night toggle: was a yellow pill with "Day mode"/"Night mode" text — now a white circular icon-only button (blue sun/moon SVG, no text, no yellow), matching the other header icons. Still switches the whole page day/night.
  * Login section redesigned modern: gradient top border, "Secure sign in" eyebrow, bolder heading, inputs with mail/lock icons and focus glow, gradient Sign in button, "or continue with" divider, Google button, trust line "186 AHJ portals · SOC 2-ready infrastructure", floating stat chips on the left 3D panel.
  * Hero dashboard mockup contrast fixed: glass panel much less see-through, stronger borders, brighter/bolder white text, vivid solid status pills (teal "45 days left", amber "3 days left", dark "Expired 2d ago"), crisp amber alert banner — no longer dull/faded.
- Verified by screenshots (desktop + mobile, day + night): toggle is a white circle with a blue icon, login looks premium, mockup is sharp and readable, 0px mobile horizontal overflow.

## Blog images — WebP conversion (24 Nov 2026 update)

- All 38 original blog images converted JPG → WebP, same filenames, every file
  verified < 100KB (largest 99KB; total 3.2MB → ~3.1MB for the originals).
  Old .jpg files deleted from public/blog/.
- 13 NEW images added — 51 WebP images total, all < 100KB:
  * 4 AI-generated photos in the same 3D-title / blueprint style as the
    originals: building-permit-expired-1, permit-validity-city-1,
    permit-reinstate-1, contractor-missed-deadline-3.
  * 9 branded Permit Warden title cards (navy blueprint grid, 1280×720,
    18–24KB each): building-permit-expired-2/-3, permit-validity-city-2/-3,
    permit-reinstate-2/-3, extend-permit-3, permit-expired-inspection-3,
    permit-validity-3.
- The 3 batch-3 posts had ZERO images; they now have 3 each. The 4 batch-2
  posts had 2 each; they now have 3 each. Every blog post now has a
  featured_image (blog index cards + OG image).
- Wiring: seed/add SQL files updated (.jpg → .webp); new migration
  `supabase/migration-blog-images-webp.sql` converts LIVE databases
  (content + featured_image), inserts the 13 new images after the right H2
  headings (idempotent NOT LIKE guards), and sets featured images.
  Run it AFTER all seed files.
- Blog post pages now render markdown images via next/image with real
  dimensions from `lib/blog-images.ts` (51 entries) — no layout shift (CLS).
  Blog index already used next/image for featured images.
- Verified: 51 .webp files, 0 over 100KB, 0 .jpg references left in
  app/supabase for /blog/ images; `npx tsc --noEmit` PASS; `npx vitest run`
  PASS (49 tests, 5 files).
- Note: a few very detailed photos (aerial parcel maps, Florida) needed
  quality 40–60 and/or 1024px width to stay under 100KB; quality is still
  good at blog display sizes, but they are the first candidates to replace
  with fresh photos if you ever reshoot blog art.

Source: original `permit-tracker-main.zip` (unchanged) + merged findings from two
independent audit reports:
- Report 1 — `permit-tracker-audit-report.md` (code / SEO / product audit)
- Report 2 — `Permit_Warden___Deep_Code_Analysis___Growth_Report.md` (security-first
  deep code analysis, incl. the critical tenant-takeover, blog-RLS and cron findings)

## The core rule — modularity / feature isolation (user requirement)

One feature = one folder under `lib/features/<feature>/` (logic + tests + README).
Shared code lives ONLY in `lib/shared/` (escapeHtml, validation, rate-limit,
sanitise-file, org-context). Features import shared code, never each other.
API routes are thin — they call the feature module, they contain no business
logic. `lib/features/registry.ts` lists every feature (routes, tables, env
keys); disabling/removing a feature is a one-line registry change + deleting
its folder and routes. Full rules: `ARCHITECTURE.md`. Short version appended
to `README.md` ("How to change one feature").

## Verification (honest status)

Commands run in `~/workspace/work/permit-warden-v2`:
- `npm install --legacy-peer-deps` — OK (258 packages; added `pdfjs-dist@6.5.438`
  and `stripe@23.2.0`, both installed cleanly, no fallback needed).
- `npx tsc --noEmit` — **PASS, zero errors** (fixed the last pre-existing
  `LayoutProps` error in `app/layout.tsx` by using `{ children: React.ReactNode }`).
- `npx vitest run` — **PASS: 49 tests, 5 files** (permit-status 12, smart-buffer 12,
  reminder-window 11, csv-parser 9, escape-html 5). Added `vitest.config.ts`
  so the `@/` alias resolves in tests.
- `npm run build` — **NOT YET GREEN in this sandbox, and this is environmental,
  not a code error.** Compile + TypeScript stages pass. Prerender fails because
  there is no Supabase project configured here: the public client first threw
  "supabaseUrl is required", then (with a placeholder host) each AHJ/sitemap
  page hung until Next's 60s prerender timeout. Fix applied after the last
  build attempt: `lib/supabase/public.ts` now fail-fasts with an immediately
  rejecting fetch when env vars are absent, so pages render empty/404 states
  instead of hanging. **A fresh `npm run build` retry is still required** —
  ideally with real `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  set (Vercel env), which is how the live site builds. The original project
  would fail the same way without env vars.

## Security fixes (both reports)

1. **Tenant takeover (Report 2, C1) — FIXED.** `supabase/migration-security-fixes.sql`
   drops the "Users can add themselves to organizations" INSERT policy.
   Team invites now go through `POST /api/team/accept`, which verifies the
   invite token server-side and inserts via service role.
2. **Blog / jurisdiction_regulations open to any customer (C2) — FIXED.**
   New `platform_admins` table + `is_platform_admin()` SECURITY DEFINER
   function; write policies on `blog_posts` and `jurisdiction_regulations`
   are admin-only (authenticated read unchanged). `lib/platform-admin.ts`
   checks `PLATFORM_ADMIN_EMAILS` env as fallback. Same check enforced in
   `app/api/blog/*`. [CORRECTED 2026-11-24 — see "Corrections" at the top:
   the API check did not exist (only org membership); `isPlatformAdmin()`
   is now enforced on blog POST/PATCH/DELETE.] No `USING (true)` for writes remains.
   [CORRECTED 2026-11-24 — see "Corrections" §(c): the old
   `migration-jurisdiction-regulations.sql` still contains `USING (true)`
   write policies; neutralised only if `migration-security-fixes.sql` runs after it.]
3. **Cross-tenant FK (Report 2, §3.12) — FIXED (server-side).** Permit/project/
   inspection/document create routes verify the parent's `organization_id`
   matches the caller's org, else 403 (`lib/shared/org-context.ts`
   `verifyParentOrg`).
4. **Open redirect — FIXED.** `app/auth/callback/route.ts` only allows `next`
   paths starting with a single `/`; anything else → `/dashboard`.
5. **Password reset — FIXED.** New `app/(public)/reset-password/confirm/page.tsx`
   (password + confirm, `supabase.auth.updateUser`) — the redirect target the
   reset email already pointed at now exists.
6. **Middleware — FIXED.** All 11 app sections protected in `middleware.ts`
   (kept as `middleware.ts`; Next 16 `proxy.ts` deprecation noted in a comment)
   + new `app/(app)/layout.tsx` single `getUser()` guard.
7. **Google Calendar tokens — FIXED.** `lib/calendar-crypto.ts` (AES-256-GCM,
   WebCrypto, key from `CALENDAR_TOKEN_KEY`); migration adds `*_encrypted`
   columns; encrypt on save / decrypt on read in `app/api/calendar/lib.ts`
   (plaintext fallback for legacy rows only). Tokens are never logged.
8. **Security headers + env hygiene — FIXED.** `next.config.ts` `headers()`
   (CSP incl. Supabase/Resend/GA, X-Frame-Options DENY, nosniff,
   Referrer-Policy, Permissions-Policy). `.gitignore` now ignores `.env*`.
   `.env.example` completed (CRON_SECRET, GOOGLE_CALENDAR_*, STRIPE_*,
   TWILIO_*, CALENDAR_TOKEN_KEY, PLATFORM_ADMIN_EMAILS, RESEND_API_KEY,
   NEXT_PUBLIC_GA_ID). No real values anywhere.
9. **Email HTML injection — FIXED.** `lib/shared/escape-html.ts`, used in the
   cron for all org/permit/sub/file names; plain-text part + `List-Unsubscribe`
   header added.
10. **Upload hardening — FIXED.** `lib/shared/sanitize-file.ts` (UUID +
    allow-listed extension, traversal stripped) + magic-byte check
    (PDF/JPG/PNG) in documents + portal routes. `supabase/storage-policies.sql`
    (documents bucket + `storage.objects` policies scoped by org path prefix).
    Portal: per-token cap 10 uploads/24h (DB-counted) + in-memory rate limit
    (`lib/shared/rate-limit.ts`, 30/hr/token, 429 + Retry-After). Rate limits
    also on signin/signup/reset-password and parcel-lookup.
    [Verified TRUE on re-check 2026-11-24 — see "Corrections" §(d):
    the limits live in `app/auth/signin|signup|reset-password/route.ts`,
    not under `app/api/`.]
11. **Team invites — FIXED.** Invite email actually sent via Resend;
    remove-member checks the delete result (0 rows → 400); accept flow in (1).
12. **CSV import/export — FIXED.** `lib/features/import/csv-parser.ts`
    (proper quoted-field parser: "Austin, TX", escaped quotes, CRLF, embedded
    newlines; 1000-row cap, 5MB cap, date validation, single bulk insert).
    Export escapes formula-injection prefixes (=,+,-,@).
13. **Input validation — FIXED.** `lib/shared/validate.ts` used in POST/PATCH
    permits/projects/licenses/inspections; manual `status` rejected unless in
    the allowed enum.
14. **Central org context — FIXED.** `lib/shared/org-context.ts`
    `getActiveOrgId()` (cookie `pw_active_org` + membership check, deterministic
    fallback by `created_at`) + `POST /api/organization/switch`. Permits/
    projects/licenses/inspections routes migrated; duplicated `getOrgId`
    deleted in those routes. [CORRECTED 2026-11-24 — see "Corrections"
    §(f): duplicates also survived in five more routes; now replaced
    with shared `getActiveOrgId()` there too.]
15. **Billing enforcement — FIXED (Stripe-ready, not live).** See Features §4.

## Correctness / reliability fixes

16. **Cron reminders — CRITICAL FIX (Report 2, C3).** The old query joined
    `deadlines` to `permits!inner`, but there is NO FK deadlines→permits, so
    standard 90/60/30/14/7/1 reminders almost certainly never sent.
    Rewritten `app/api/cron/reminders/route.ts`: loads deadlines with NO joins,
    batch-fetches details per resource_type; ANY query error is logged and
    returns 500 (never silently continues); delivery-insert errors checked
    before using `delivery.id`; failures marked `failed` and retried next day;
    exact-day match replaced by window logic (missed runs still fire); honours
    `reminder_rules.days_before` else default [90,60,30,14,7,1];
    `listUsers()` paginated once per run into a cached email map; broken
    `/documents` email link fixed to `/dashboard`; `maxDuration = 300`;
    daily permit-status recompute step added. Smart-alert logic
    (`renewal_deadline − processing_days − 7`) kept intact.
    **Verify live:** check Vercel cron logs + `reminder_deliveries` after the
    first run — old deliveries (renewal/doc only) vs new standard reminders.
17. **Deadline sync — FIXED.** `supabase/migration-deadline-sync.sql`
    (triggers on permits/licenses/inspections INSERT/UPDATE/DELETE) AND
    defence-in-depth sync in PATCH/DELETE handlers via
    `lib/features/reminders/sync-deadlines.ts`.
18. **Permit status — FIXED.** `lib/permit-status.ts` rewritten: timezone-safe
    (local-noon parsing, never `new Date("YYYY-MM-DD")` UTC midnight), honours
    `renewal_deadline` (new `renewal_overdue` status; never plain "active"
    once the renewal window passed). Status CHECK widened in migration.
19. **Pagination — FIXED.** `?page&limit` (default 50, max 200) + `.range()` on
    GET permits/projects/licenses/inspections/subcontractors. Dashboard's 4
    count queries replaced by one status query + JS tally.
20. **Error/loading/not-found — FIXED.** `app/error.tsx`, `app/not-found.tsx`,
    `app/(app)/loading.tsx` added.
21. **Quality gates — FIXED.** `package.json` scripts `test` + `typecheck`;
    `.github/workflows/ci.yml` (install, typecheck, test, build); `vitest.config.ts`;
    [CORRECTED 2026-11-24 — see "Corrections" §(e): the CI file did not
    exist when claimed; it now exists.]
    49 tests passing. (No ESLint installed — no lint script added; documented
    as TODO.) `globals.css` Arial override fixed (Geist variables now used);
    logo `<img>` → `next/image` (LandingPage, auth-layout, app-shell).

## New features (built on existing data/logic; no invented data)

1. **Smart renewal buffer** (`lib/features/smart-buffer/`, 12 tests) —
   apply-by = renewal − processing_days − 7, from the 20 verified cities only.
   Surfaced on permit detail ("Renewal buffer" card + source link) and
   dashboard "Requires attention".
2. **Permit Timeline Predictor** — `app/(public)/tools/permit-timeline-calculator/`
   (20 regulated cities, permit type, issue date → expiry, first-inspection
   deadline, renewal window, apply-by date; FAQ + HowTo schema; "estimate
   only — verify with your AHJ").
3. **Permit Fee & Cost-of-Delay Calculator** —
   `app/(public)/tools/permit-fee-calculator/` — ONLY repo data (FineStats
   fines + NYC $130 extension fee); everything else labelled estimate.
4. **Pricing + billing (Stripe-ready, NOT live).** `lib/features/billing/`;
   `checkLimit()` enforced in POST permits/licenses/projects/documents/team
   (402 + upgrade message over limit); [CORRECTED 2026-11-24 — see
   "Corrections" §(a): only team was enforced; the other POST routes +
   CSV import are now enforced via grace-mode helpers.] `subscriptions` table migration;
   `/api/billing/checkout` + `/api/billing/webhook` return clear 501
   "Stripe keys not configured" without keys (never fake a payment);
   public `/pricing` ($49/$99/$199 from `lib/plans.ts`, Offer schema).
   [CORRECTED 2026-11-24 — see "Corrections" §(b): prices are NOT in
   `lib/plans.ts` (limits only); they live in the pricing page.]
5. **Compliance Passport** (`lib/features/compliance-passport/`) —
   public `/verify/[slug]` (statuses/counts/expiry only, opt-in via
   `compliance_passport_public`, settings toggle + server-generated slug).
   Never exposes doc contents.
6. **Project Gate** (`lib/features/project-gate/`) — red "Stop-work risk"
   banner on project detail when a linked sub is non-compliant/expired.
   New `project_subcontractors` join table (no linking UI yet — follow-up).
7. **Inspection fail workflow** — failed inspections show correction checklist
   (notes + re-inspection date via existing PATCH, photo upload for
   `correction_photo_url`, re-inspection reminder note).
8. **PDF OCR** — `components/permit-ocr-upload.tsx` now accepts PDFs
   (pdfjs-dist, dynamic import, first 3 pages rendered to canvas in-browser,
   Tesseract per page; extracts permit no., expiry, jurisdiction, issue date,
   fee, with per-field confidence). Image OCR untouched; document never
   leaves the browser.
9. **SMS/WhatsApp escalation (Twilio-ready, gated)** —
   `lib/features/sms-escalation/` (`sendSms` via Twilio REST/fetch; no-op with
   logged warning without TWILIO_* env), escalation chain (engineer 4h → PM
   12h → owner 24h), settings toggle (Pro/Business only). `SMS-SETUP.md`.
   **Not yet wired to the reminder cron** — helpers ready for it.
10. **Risk report** (`lib/features/risk-report/`) — printable HTML report at
    `app/(app)/reports/risk` (at-risk permits with $ exposure only where fee
    data exists, failed inspections, non-compliant subs), Print/PDF via
    `window.print()` + print CSS.
11. **Onboarding sample data** (`lib/features/onboarding-sample/`) —
    onboarding checkbox (on by default) seeds 1 sample project + 3 SAMPLE-*
    permits (fictional Austin, TX); dashboard "Remove sample data" button
    (`DELETE /api/organization/sample-data`).

## SEO / trust / public pages

- New pages (metadata + canonical, linked from header/footer): `/pricing`,
  `/features`, `/about`, `/contact` (+ `/api/contact`, Resend-gated, honest
  503 without keys), `/privacy`, `/terms`, `/faq` (FAQPage schema),
  `/glossary`, `/tools` hub (all 6 tools), `/changelog`, `/verified-sources`.
- Signup Terms/Privacy now link to `/terms` + `/privacy`. `/ahj` added to
  header/footer. Homepage keeps the "$500/day" H1 hook + new subhead
  "Permit tracking software for contractors: …".
- **Blog:** `supabase/seed-blog-posts-batch4.sql` publishes 3 drafts
  (`assessors-parcel-number-guide`, `certificate-of-occupancy-guide`,
  `permit-types-explained`) and MERGES the AHJ draft into the live
  `what-is-ahj-authority-having-jurisdiction` post (no duplicate slug).
  The formerly broken `/blog/certificate-of-occupancy-guide` link now
  resolves. `migration-blog-columns.sql` adds author/category/tags/
  featured_image (run BEFORE batch4). Related-posts block + per-post OG
  image on blog pages. The 3 cannibalised expiry/validity pairs are
  documented in the seed header with a consolidation plan — no live posts
  deleted, no unverified redirects added.
- **AHJ thin pages:** city pages WITHOUT regulation data are now `noindex`
  + excluded from the sitemap, with a visible "Data coming soon" note;
  pages WITH data show "Last verified: [date] · Source" prominently.
- **Sitemap:** real `lastModified` from DB (`updated_at`/`verified_at`),
  never `new Date()`; `/signin` removed; DB failure logged, static entries
  still served.
- **Public performance:** `lib/supabase/public.ts` (anon, cookie-free client)
  for AHJ/blog/sitemap; `revalidate = 3600` kept; minimal `public/sw.js`
  (app shell only, never `/api/*` or `/auth/*`); cookie-consent banner
  (GA only after consent, `NEXT_PUBLIC_GA_ID` env, fallback to existing ID
  with TODO); `themeColor` via `viewport` export.
- `ARCHITECTURE.md` + `lib/features/registry.ts` (all features registered).

## What was NOT done (and why)

- **Stripe is NOT live.** Code + webhook + pricing page are ready; it needs
  the user's Stripe account + keys (`STRIPE_SECRET_KEY`,
  `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs in env).
  Follow `STRIPE-SETUP.md`.
- **Twilio is NOT live.** Same pattern — needs `TWILIO_*` keys; see `SMS-SETUP.md`.
  SMS is also not yet triggered by the reminder cron (helpers ready).
- **No live DB migrations run.** All new SQL files must be run in the Supabase
  SQL editor, in this order: `migration-security-fixes.sql` →
  `migration-deadline-sync.sql` → `migration-compliance-passport.sql` →
  `migration-blog-columns.sql` → `storage-policies.sql` → then
  `seed-blog-posts-batch4.sql` → then `migration-blog-images-webp.sql`
  (after ALL seed files — it converts live .jpg references and inserts the
  13 new blog images). The deadline-sync trigger + `renewal_overdue`
  CHECK depend on the first two. Code fails safe without them (plan defaults
  to free, passport/project-gate fail open).
- **No invented data.** No new AHJ regulation data (still 20 verified cities),
  no new license-board states (still 10 verified), no competitor prices,
  no fake testimonials/people. License lookup 10→50 states and AHJ
  regulations 20→50 metros remain research tasks.
- **Project↔subcontractor linking UI** not built (join table exists).
- **No `next build` green in this sandbox** — see Verification above; retry
  with real Supabase env on Vercel.
- Rate limiter is in-memory per instance (documented); multi-instance
  deploys need a shared store for strict enforcement.

## How to deploy

1. Set env vars in Vercel from `.env.example` (Supabase URL/anon/service keys,
   `RESEND_API_KEY`, `CRON_SECRET`, Google Calendar keys, `CALENDAR_TOKEN_KEY`
   (generate: `openssl rand -base64 32`), `PLATFORM_ADMIN_EMAILS` (your email),
   `NEXT_PUBLIC_GA_ID`; Stripe/Twilio when ready).
2. Run the SQL migrations in Supabase in the order above.
3. Add your email to `platform_admins` (or `PLATFORM_ADMIN_EMAILS`) so you
   can manage the blog/regulations.
4. `npm install && npm run typecheck && npm test && npm run build`, then
   deploy on Vercel. The daily cron (`vercel.json`, 09:00 UTC) now sends the
   fixed standard reminders — check `reminder_deliveries` after the first run.
5. Verify the reset-password email flow end-to-end (new confirm page).
