# Permit Warden v2 — Audit Report

**Date:** 24 November 2026
**Auditor:** external audit + fix pass (coordinated; five audit sections fanned out to separate auditors, fixes applied in the same pass)
**Input:** `permit-warden-v2.zip` (flat-root zip), verified against the working copy
**Code as audited:** Next.js 16.4.3, React 19, TypeScript strict, Tailwind 4, Supabase, Resend
**Live site:** https://permitwarden.com runs PRE-v2 code; v2 is NOT live and NOT on GitHub yet.
**Deploy target:** Contabo VPS, PM2 app `permitwarden`, port 3002, nginx, `/root/permit-tracker`. Vercel is a fallback only; the Vercel cron is DISABLED; reminders run from the VPS crontab (`0 9 * * *` → `/api/cron/reminders`).

## The two rules

1. **No page may be THIN.** A page is thin if it has no verified, page-specific fact; its content is mostly template text shared with siblings; it has no cited official source; or it has no `Last verified` date. A page that cannot be enriched with verified data must be `noindex` + excluded from the sitemap, with a visible "Data coming soon" note — never filled with invented data.
2. **No feature may be USELESS.** A feature is useless if it does not complete a real job for a US contractor; it is half-wired (UI missing, not connected to the cron/API it depends on, or dead without keys and no graceful fallback); or it duplicates another feature. A useless feature must be fixed until it genuinely works, or disabled via the registry — never left half-working.

## 0. Input verification — the file-count discrepancy

The brief said both zips contain identical code (328 files, diff zero). The parent's last counts were 475 files (v2 zip) and 476 (updated zip). **Verified by direct listing:**

| Source | Files (excluding directory entries) |
|---|---|
| `permit-warden-v2.zip` | **328 files** |
| `permit-tracker-main-updated.zip` | **328 files** |
| Working copy `~/workspace/work/permit-warden-v2/` | **328 files** |

The 475/476 counts **included 147 directory entries each** (`unzip -l` counts directories). The file lists of the two zips are **identical** (diff zero after stripping the `permit-tracker-main/` prefix), and the working copy matches the zip exactly (0 differing files). The brief's "328 files, diff zero" is correct; the 475/476 numbers were the counting artefact. No files were missing from the audit input.

**Baseline before fixes (audit copy, `npm install` then):** `npx tsc --noEmit` PASS (zero errors); `npm run test` (vitest) 49/49 PASS in 5 files. After fixes: tsc PASS, vitest **108/108 PASS in 12 files**. Build result is recorded in §8.

**Audit method note.** All counts are from code and seed/migration files in the repo. No live database, live site, or search-engine check was possible from the repo alone. Where a fact could not be established from code/data, that is stated instead of guessed. Two audit findings were later proven wrong by re-check and are corrected here rather than silently kept (see §0.1).

### 0.1 Corrections to the audit itself (found during the fix pass)

1. **"21 noise cities" is wrong — the cluster has 20.** §4.5 originally reported 21 records in `app/(public)/tools/_data/noise-shed.ts` (20 seed cities + Washington DC). Direct recount: the file has exactly **20** `city: "..."` records (Austin … Washington DC, slug `washington-dc`); the "21st" hit was the `city: string;` type declaration on line 43. The file's own header says "(20 seed cities)". The "20 cities" copy on the site is **correct**; no change was made, and §4.5 finding 19 is withdrawn. The sitemap emits 20 noise-city URLs, not 21.
2. **Auth rate limits DO exist.** §4.3 originally marked the changelog's "rate limits on signin/signup/reset-password" claim PARTIAL (not found — the auditor searched only `app/api/`). Re-check found them in `app/auth/signin/route.ts:8` (10/IP/15 min), `app/auth/signup/route.ts:8` (10/IP/15 min), `app/auth/reset-password/route.ts:8` (5/IP/15 min), all via `checkRateLimit` from `lib/shared/rate-limit.ts`. That sub-claim is **VERIFIED**. Corrected §4.3 totals: **VERIFIED 31 / PARTIAL 8 / NOT FOUND 1** (the CI file was NOT FOUND at audit time; it was created during this fix pass — see §6.4).

---

## 4.1 Thin-page audit — 318 public routes

**Verified data is small (counted from the repo):** AHJ directory 192 rows (6 + 186) → 190 distinct city URLs; AHJ regulation data 20 cities, only 17 with any substantive field, only 3 with a processing time, only 1 with a fee; license boards 10 states; noise/shed/fence 20 cities; fine schedules 4 cities; county assessors ~50 counties (no verification date anywhere); blog 16 published posts.

### Verdicts

| Verdict | Count | Composition |
|---|---|---|
| **KEEP** | **57** | AHJ city 12 · AHJ hub 1 · blog hub 1 · blog posts 5 · tools hub 1 · noise hub 1 · shed checker 1 · license hub 1 · noise cities 15 · home 1 · pricing 1 · features 1 · about 1 · FAQ 1 · glossary 1 · changelog 1 · verified-sources 1 · solutions 3 · compare 1 · templates 1 · contact 1 · privacy 1 · terms 1 · signup 1 · reset-password 2 |
| **ENRICH** | **86** | AHJ state pages 50 · AHJ city (partial) 5 · blog posts 11 · license state pages 10 · noise cities 5 · timeline calculator 1 · fee calculator 1 · parcel lookup 1 · building-permit 1 · certificate-of-occupancy 1 |
| **NOINDEX** | **175** | AHJ city portal-only 170 · AHJ city empty-regulation 3 · sign-in 1 · verify/[slug] 1 — **all 175 are already noindex in code** (AHJ via `generateMetadata` + sitemap exclusion; sign-in/verify via `robots` meta), so this verdict confirms existing behaviour |
| **MERGE** | **0** | None. The 6 blog posts in the 3 repo-admitted cannibalisation pairs are ENRICH (narrow + cross-link per the repo's own plan in `seed-blog-posts-batch4.sql`); no analytics were available to justify a merge, and the repo explicitly defers merging. |
| **Total** | **318** | 286 dynamic (AHJ city 190 + AHJ state 50 + blog 16 + license 10 + noise 20) + 32 static/tool/auth routes |

### By pattern

| Route pattern | Verified facts | Last verified? | Verdict |
|---|---|---|---|
| `/ahj/[state]/[city]` — 12 rich cities (NY, Chicago, Philadelphia, Houston, Phoenix, San Diego, San Jose, Austin, Fort Worth, Columbus, San Francisco, Seattle) | Validity + extension process (+ processing for NY/Chicago/Philadelphia; + $130 fee for NY only), each with a source URL | No — renders only for Austin (`verified_at` NULL on all other rows) | **KEEP ×12** |
| `/ahj/[state]/[city]` — 5 partial cities (LA, San Antonio, Jacksonville, Charlotte, Indianapolis) | Validity-only (4) or extension-flag-only (Indianapolis); 3 sources weak/non-city-domain | No | **ENRICH ×5** |
| `/ahj/[state]/[city]` — Dallas, Denver, Oklahoma City | None (all regulation fields NULL) | No | **NOINDEX ×3 (already)** |
| `/ahj/[state]/[city]` — other 170 cities | Portal link + authority name only | No | **NOINDEX ×170 (already)** |
| `/ahj` hub | Per-state portal counts, 50-state grid | No | **KEEP ×1** |
| `/ahj/[state]` ×50 | 2–6 verified portal links per state (the list is the content); no source/date shown | No | **ENRICH ×50** (add a state-level verified summary/date; do not noindex — they are the directory index) |
| `/tools/license-lookup` hub | Links to all 10 verified boards | No on page (2026-10-20 only in code comment) | **KEEP ×1** |
| `/tools/license-lookup/[state]` ×10 | Board name, verified lookup URL, coverage list, state-specific summary/FAQs | No on page | **ENRICH ×10** (render the 2026-10-20 verification date) |
| `/tools/noise-ordinance/[city]` — 15 cities with all 3 noise fields | Weekday + weekend hours + dB limits, each sourced | **Yes — "November 3, 2026" rendered** | **KEEP ×15** |
| `/tools/noise-ordinance/[city]` — Columbus, Indianapolis, Seattle, Phoenix, San Antonio | 2 of 3 noise fields verified; 1 renders "not verified yet" | Yes | **ENRICH ×5** (fill the one missing field from an official source) |
| `/tools` hub, `/tools/noise-ordinance-lookup` hub, `/tools/shed-permit-checker` | Links / full city lists / thresholds, dates rendered | Yes (noise/shed) | **KEEP ×3** |
| `/tools/permit-timeline-calculator` | Interactive calculator over 20 regulation cities; per-result source link | No date rendered | **ENRICH ×1** |
| `/tools/permit-fee-calculator` | 4 verified fine schedules (NYC $800–$4,000, Baltimore $500/day, Chicago $1,000/day, Palo Alto $200→$800/day) | No date rendered (2026-10-17 only in code comment) | **ENRICH ×1** |
| `/tools/parcel-lookup` | 50 curated county assessor deep links; labelled Google fallback for others | **No date anywhere** | **ENRICH ×1** |
| `/blog` hub | Lists all 16 posts | — | **KEEP ×1** |
| `/blog/[slug]` — 4 state guides + validity-by-city | State-specific portal lists / 20-city comparison table | No | **KEEP ×5** |
| `/blog/[slug]` — remaining 11 | Generic prose; batch-2 and batch-3 files contain **zero external URLs** | No | **ENRICH ×11** (add cited official sources + verification date) |
| `/`, `/pricing`, `/features`, `/about`, `/faq`, `/glossary`, `/changelog`, `/verified-sources`, `/solutions/*` ×3, `/compare/*`, `/templates/*`, `/contact`, `/privacy`, `/terms`, `/signup` | Page-specific product/trust content of their own | N/A (product pages) | **KEEP** |
| `/building-permit` (282 lines), `/certificate-of-occupancy` (290 lines) | Long generic guides — **no city figure, no fee, no validity, no external link, no source, no date** | No | **ENRICH ×2** |
| `/signin` | Sign-in form; already `robots: { index: false }` | N/A | **NOINDEX ×1 (already — correct)** |
| `/verify/[slug]` | Per-org passport page; already noindex; renders per-passport "Verified {date}" | Per-record date rendered | **NOINDEX ×1 (already — correct)** |
| `/reset-password`, `/reset-password/confirm` | Auth utility pages; not in sitemap; no `robots` meta found | N/A | **KEEP ×2** (utility pages) |

### Worst offenders

1. **173 AHJ city pages with no regulation data at all** — `app/(public)/ahj/[state]/[city]/page.tsx` + `supabase/migration-ahj.sql` + `supabase/migration-ahj-all-states.sql`. Portal link + authority name only. Already noindex (correct), but 54% of all audited routes.
2. **Maryland county collision — 3 rows, 1 URL.** Baltimore City, Montgomery County and Prince George's County (all `city = NULL`) all slug to `county` via `citySlug()` (`app/(public)/ahj/_lib.ts`), so all three map to `/ahj/maryland/county`; `getEntry()` (`.find`) returns only the first. Two jurisdictions are effectively unreachable. Same pattern (single row) for Kenosha County, WI → `/ahj/wisconsin/county`. **Not fixed in this pass** — fixing it requires new slugs, and the brief forbids slug changes. Owner decision needed (see §7).
3. **`verified_at` is NULL on 191 of 192 AHJ rows.** Only Austin, TX has one (`supabase/fix-austin-portal-link.sql`, 2026-10-17). The city template's "Last verified" line therefore cannot render on 189 of 190 city pages, including all 17 enriched ones. **Not fixed in this pass** — setting `verified_at` for rows whose portal verification date is not in the repo would be inventing a date. The fix applied instead: enriched city pages now render "Regulation data researched October 17, 2026" (the date in the regulation file header), and state pages render "Portal links last verified October 16, 2026" (the coverage-report research date).
4. **Dallas, Denver, Oklahoma City** — in the flagship 20-city set yet every regulation field is NULL. Already noindex. No official data was found for them in this pass; they stay "Data coming soon".
5. **Batch-2 and batch-3 blog posts: zero external links** (`supabase/seed-blog-posts-batch2.sql`, `seed-blog-posts-batch3.sql`) — 7 substantive guides with no cited official source and no verification date. Batch 4 is little better (only internal URLs).
6. **Weak sources presented as official.** San Antonio's regulation source was a Constant Contact newsletter; Jacksonville's a Spark Platform-hosted PDF; Indianapolis's an S3-hosted PDF; Los Angeles's a `staging.testladbs.org` URL; Chicago's noise source was `decibelshield.app` (third-party). **Fixed in this pass for 6 items — see §6.1** (official sources found and cited, access date 2026-11-24).
7. **Verification dates that exist only in code comments, never on the page.** License boards verified 2026-10-20 (`lib/license-boards.ts:6`) and fine schedules verified 2026-10-17 (`app/(public)/_components/FineStats.tsx`) — neither rendered anywhere. **Fixed in this pass** (dates now rendered on the license state pages and fee calculator).
8. **"186" portals vs 192 rows vs 190 URLs.** Site copy repeats "186" everywhere; migrations insert 192 rows, collapsing to 190 distinct city URLs (Maryland collision). "186" matches neither. The hub page computes the total live from the DB; the hardcoded "186" in metadata/about/FAQ/verified-sources will go stale if the DB count drifts. **Not changed in this pass** — the correct live number needs a DB check; flagged for the owner (see §7). The changelog's "186 AHJ portals" claim is likewise stale, not verified.

---

## 4.2 Useless-feature audit — 30 features

| Feature | Real job | Wired end-to-end? | Verdict |
|---|---|---|---|
| tools-hub, trust-pages, blog-batch4, ahj-thin-pages, public-performance, cookie-consent, service-worker, smart-buffer, timeline-calculator, fee-calculator, compliance-passport, inspection-workflow, pdf-ocr, risk-report, onboarding-sample | (as documented in the registry — each completes its job; see notes below) | Yes | **KEEP** |
| permits, projects, licenses, documents, dashboard, calendar, team, settings, auth, subcontractors, reminders (unregistered folder), CSV import (unregistered folder) | Core CRUD / dashboard / calendar / team / auth / portal | Yes (with the billing caveat below) | **KEEP** |
| **Billing & Plan Enforcement** | Collect payment (Stripe) + enforce plan limits | **No — half-wired in three places.** (1) Stripe code is sound (501 without keys, never fakes a payment). (2) **No UI ever called checkout** — pricing CTAs linked only to `/signup`; settings had no billing section. (3) **Plan limits enforced on 1 of 5 resources** — `enforcePlanLimit()` ran only in `app/api/team/route.ts:73`; permits/licenses/projects/documents POSTs and the 1,000-row CSV import were unenforced. Secondary: the webhook **trusted unsigned payloads** without `STRIPE_WEBHOOK_SECRET` (warning logged) — a forged webhook could flip `organizations.plan`. | **FIX-TO-MAKE-USEFUL** |
| **Project Gate / Stop-Work Risk** | Warn a PM that a sub on this project has an expired license/COI | **No — evaluation wired, input missing.** Banner + `evaluateProjectGate()` wired, but **no UI and no API** to create a `project_subcontractors` link; the gate could only fire for rows inserted by hand in SQL, so for every real user it silently returned `{ atRisk: false, checked: 0 }`. | **FIX-TO-MAKE-USEFUL** |
| **SMS Escalation Chain** | Text site engineer → PM → owner when a deadline goes unacknowledged | **No — helpers only, nothing calls them.** The reminder cron never imports them; **nowhere to put a phone number** (no column/table, no UI field; default chain phones all `""`, so `nextEscalationStep()` always returns `null`); no inbound webhook for "Reply ACK". The Settings toggle was live and promised paying Pro/Business users a feature that can never happen. | **FIX-TO-MAKE-USEFUL** |

**Totals: KEEP 27 / FIX-TO-MAKE-USEFUL 3 / DISABLE 0 / REMOVE 0.**

**Fixes applied (see §6.2–6.3):** Billing — checkout UI added, limits enforced on all four POST routes + CSV import (grace mode, see below), webhook fail-closed. Project Gate — linking API + UI built. SMS — **DISABLED** via the registry (`enabled: false`) + toggle removed, because completing it needs Twilio keys, phone-number storage and ACK handling, none of which exist (the brief's sanctioned alternative to fixing).

**Free-plan lockout — could existing users be locked out by a limit they never agreed to?** Not locked out today except for team invites; at high risk the moment enforcement is switched on as written. `getOrgPlan()` falls back to `"free"` whenever the plan column is missing/null, and the migration adds the column as `plan TEXT NOT NULL DEFAULT 'free'` — **every pre-existing org retroactively becomes a free org**, with no grandfathering, grace period, or notice. If `enforcePlanLimit()` were added to the POST routes as the registry implied, any org already holding >10 permits / >5 licenses / >5 projects would immediately be unable to add more — 402 + "Upgrade to add more" — while the only upgrade path (Stripe checkout) had **no UI**. Sample data (3 permits, 1 project) counts against the limit. CSV import (1,000 rows) bypassed limits entirely. **Mitigation applied:** enforcement is now grace-mode — it activates only when Stripe is configured (`stripeConfigured()`); without keys the write is allowed with a logged warning. The live narrow lockout that remains: free `maxTeamMembers: 1` counts the creator, so a free org inviting its *first* teammate gets a 402 today. Changing that limit is a pricing decision — **not changed**; flagged for the owner (see §7).

**Smaller correctness notes (fixed or flagged):** Compliance Passport's COI count reads `subcontractor_documents` (subs' COIs), not the org's own COI — page labels it "Insurance (COI)" for the org, so the number can mislead a verifier (**not fixed** — relabelling needs a product decision; flagged in §7). Cookie consent ships a hardcoded fallback GA ID (`components/cookie-consent.tsx:11`) — analytics can load without the env var ever being set (flagged, not fixed). `aiExtraction` is advertised as a Pro/Business feature but enforced nowhere, and free browser OCR does the same job (flagged, not fixed). The registry omitted the working reminders engine and CSV import (fixed — entries added), and listed 9 entries with no `lib/features/` folder.

---

## 4.3 Changelog-claim verification — 40 claims

**Corrected totals (see §0.1): VERIFIED 31 / PARTIAL 8 / NOT FOUND 1.** The CI file was NOT FOUND at audit time and was created during this fix pass.

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Tenant-takeover RLS policy removed | VERIFIED | `supabase/migration-security-fixes.sql:21` drops the policy; it existed in `migration-org-insert.sql:9`; replacement invite flow in `app/api/team/accept/route.ts` |
| 2 | Blog/regulations admin-only writes | PARTIAL | RLS layer verified (`migration-security-fixes.sql:24-55`, `platform_admins`, `is_platform_admin()`). **But:** `app/api/blog/*` never called `isPlatformAdmin` (only org membership) — **fixed in this pass** (403 for non-admins). Also "No `USING (true)` for writes remains" is literally false: `supabase/migration-jurisdiction-regulations.sql:32,38,44-45,51` still contains `USING (true)`/`WITH CHECK (true)` write policies, neutralised only if `migration-security-fixes.sql` runs after it (migration order matters — see DEPLOY_NOTES.md). |
| 3 | Cross-tenant FK checks (`verifyParentOrg`) | PARTIAL | Exists in `lib/shared/org-context.ts`; used in permits/inspections/documents routes. **Not** in licenses/projects routes — but those have no parent FK in the same sense (parent is the org itself), so this is a wording overstatement, not a hole. |
| 4 | Open-redirect fix in auth callback | VERIFIED | `app/auth/callback/route.ts:10-14` — `next` accepted only when it starts with a single `/` |
| 5 | Password-reset confirm page | VERIFIED | `app/(public)/reset-password/confirm/page.tsx` exists (password + confirm, min-8, mismatch check, `updateUser`) |
| 6 | Middleware covers all 11 app sections | VERIFIED | `middleware.ts` lists exactly 11 protected paths; `app/(app)/layout.tsx` second guard |
| 7 | Calendar-token encryption (AES-256-GCM) | VERIFIED | `lib/calendar-crypto.ts` (`encryptToken`/`decryptToken`, 32-byte key, fresh 12-byte IV); columns in `migration-security-fixes.sql` §5b; encrypt-on-save/decrypt-on-read in `app/api/calendar/lib.ts` |
| 8 | Security headers + env hygiene | VERIFIED | `next.config.ts` headers (CSP, DENY, nosniff, referrer, permissions); `.gitignore` ignores `.env*`; `.env.example` has all keys, no real secrets |
| 9 | Email HTML injection | VERIFIED | `lib/shared/escape-html.ts`; cron calls `escapeHtml` 15 times; `List-Unsubscribe` header + plain-text part |
| 10 | Upload hardening (magic bytes, storage policies, rate limits) | VERIFIED (corrected) | Magic-byte check, storage policies, portal caps verified. Auth rate limits **do** exist (`app/auth/signin|signup|reset-password/route.ts` via `checkRateLimit`) — the original PARTIAL was an auditor error (see §0.1). |
| 11 | Team invites | VERIFIED | Invite email via Resend; remove-member delete checked; accept flow server-side |
| 12 | CSV import/export | PARTIAL | RFC-4180 parser, 5 MB cap, formula-injection escaping verified. Per-row date validation / single bulk insert not spot-checked in the audit. |
| 13 | Input validation | VERIFIED | `lib/shared/validate.ts`; status enum enforced in permits PATCH |
| 14 | Central org context | PARTIAL | `getActiveOrgId`/`isOrgMember` exist; used by permits/projects/licenses/inspections. "Duplicated `getOrgId` deleted" was true only for four routes — duplicates survived in five others; **fixed in this pass** (all five now use shared `getActiveOrgId`). |
| 15 | Billing enforcement (Stripe-ready, plan limits) | PARTIAL | 501s, `subscriptions` table, `/pricing` with $49/$99/$199 verified. **But:** `enforcePlanLimit` ran only on team (not permits/licenses/projects/documents) — **fixed in this pass** (grace mode). "$49/$99/$199 from `lib/plans.ts`" is false — prices live only in the pricing page; `lib/plans.ts` holds limits only (changelog corrected). |
| 16 | Cron reminders rewrite | VERIFIED | No FK join (deadlines query only, batch-fetch by resource type); `DEFAULT_REMINDER_OFFSETS = [90, 60, 30, 14, 7, 1]` honoured via `reminder_rules`; window logic replaces exact-day match; errors fail loudly (500s); delivery-insert checked; `listUsers` paginated; `maxDuration = 300`; daily status recompute present |
| 17 | Deadline-sync triggers | VERIFIED | `supabase/migration-deadline-sync.sql` (permit/license/inspection triggers) + `syncDeadline` calls in the API routes |
| 18 | Permit status (timezone + `renewal_overdue`) | VERIFIED | `lib/permit-status.ts` local-noon parsing; `renewal_overdue` in type + CHECK constraints re-added in `migration-security-fixes.sql` §6 |
| 19 | Pagination | VERIFIED | `parsePagination()` (default 50, max 200); `.range()` in GET handlers; dashboard single-query tally |
| 20 | Error/loading/not-found pages | VERIFIED | `app/error.tsx`, `app/not-found.tsx`, `app/(app)/loading.tsx` exist |
| 21 | Quality gates (scripts, tests, vitest) + CI file | NOT FOUND (at audit) | Scripts, vitest config and 5 test files verified. **`.github/workflows/ci.yml` did not exist** (no `.github/` directory at all). **Created during this fix pass** (install, typecheck, test, build; Node 20). |
| 22 | Smart renewal buffer | VERIFIED | `lib/features/smart-buffer/index.ts` (`renewal_deadline − processing_days − 7`); surfaced on permit detail + dashboard |
| 23 | Permit Timeline Predictor | VERIFIED | Tool exists; copy says "20 verified US cities", FAQ + HowTo schema present |
| 24 | Fee & Cost-of-Delay Calculator | VERIFIED | Tool exists; cites NYC $130 extension fee; labels other figures as estimates |
| 25 | Compliance Passport | VERIFIED | `/verify/[slug]` + `getPublicPassport()` gated on `compliance_passport_public = true` |
| 26 | Project Gate | VERIFIED | Evaluation + join table + banner wired; changelog's own "no linking UI" note was accurate — **linking UI/API built in this pass** |
| 27 | Inspection-fail workflow | VERIFIED | Correction notes + reinspection date + correction-photo upload; `migration-inspection-fail.sql` exists |
| 28 | PDF OCR | VERIFIED | pdfjs-dist + Tesseract in-browser, max 3 pages, never uploads the file |
| 29 | SMS/WhatsApp escalation (Twilio-ready) | PARTIAL | `sendSms` no-op with logged warning without `TWILIO_*` verified; 4h→12h→24h chain verified. **Not wired to the cron** (admitted in the changelog). Settings toggle existed (the audit's "not located" was wrong — §4.2 found it). **Feature disabled in this pass** (see §6.3). |
| 30 | Risk report | VERIFIED | `/reports/risk` + `buildRiskReport()` + print button |
| 31 | Onboarding sample data | PARTIAL | Seeding (1 project + 3 SAMPLE permits, Austin TX), removal endpoint + dashboard button, onboarding checkbox verified. "Checkbox on by default" not verified from page source. |
| 32 | Trust/public pages | VERIFIED | All claimed pages exist; `/api/contact` returns honest 503 without Resend keys |
| 33 | Blog batch 4 published, columns, related posts | VERIFIED | Batch-4 inserts with `published = TRUE`, 3 WebP images + `featured_image` each; AHJ draft merged into the live post; `migration-blog-columns.sql`; related-posts block + per-post OG image |
| 34 | AHJ thin pages noindex | VERIFIED | `generateMetadata` noindex when no regulation data; sitemap exclusion by the same rule |
| 35 | Sitemap | VERIFIED | `lastModified` from DB (`updated_at`/`verified_at`, never `new Date()`); `/signin` intentionally absent (see §4.5 conflict); DB failure falls back to static entries |
| 36 | Public performance | PARTIAL | Cookie-free anon client + fail-fast fetch in `lib/supabase/public.ts` verified; `sw.js`, cookie consent, `themeColor` verified. `revalidate = 3600` and GA-only-after-consent wiring not spot-checked. |
| 37 | Modularity structure + ARCHITECTURE.md + registry | VERIFIED (structure) | `ARCHITECTURE.md`, 11 feature folders, `registry.ts` (18 entries), `lib/shared/` (5 modules) all exist; no cross-feature imports found. **But the registry was decorative** — see §4.4(f); **enforcement implemented in this pass**. |
| 38 | Blog images — WebP conversion | VERIFIED | 51 `.webp` files, 0 over 100 KiB, 0 `.jpg`; `lib/blog-images.ts` 51 entries; idempotent migration. **Footnote:** 7 files were 100,108–101,862 bytes — over a strict 100,000-byte limit. **Recompressed in this pass — all 51 now <100,000 bytes.** |
| 39 | Design-preview fixes (toggle, login, mockup) | VERIFIED | `design-preview/permit-warden-complete.html` (66 KB); white circular icon-only toggle, no "Day mode"/"Night mode" text; modern login; mockup contrast raised. Screenshot re-verification was not possible from code alone. |

**Claimed but not in the code (summary):** (1) `.github/workflows/ci.yml` — did not exist; **created in this pass**. (2) `isPlatformAdmin` in `app/api/blog/*` — **fixed in this pass**. (3) Plan-limit enforcement on POST permits/licenses/projects/documents — **fixed in this pass** (grace mode). (4) Rate limits on auth routes — **actually present** (auditor error, see §0.1). (5) "$49/$99/$199 from `lib/plans.ts`" — false; prices live only in the pricing page (changelog corrected).

---

## 4.4 Modularity audit — 90 violations (99 counting folder-less entries' missing READMEs/tests)

| Category | Count | What was counted |
|---|---|---|
| (a) Cross-feature imports (literal) | **0** | No feature imports another feature's folder. |
| (a2) Feature imports outside the allowed set (`app/` or top-level `lib/`) | **11** | 11 import lines in 7 of 11 folders |
| (b) Duplicated shared helpers / rules | **10** | b1–b10 (see below) |
| (c) Business logic in `app/api/` (fat routes) | **31** | 31 of 33 route files contain direct Supabase queries (302 `.from(` sites); worst: cron 724 lines, permits 317, inspections 213, team 205, licenses 198 |
| (d) Registry entries with wrong/missing routes, tables or env keys | **9** | 9 of 18 entries inaccurate |
| (e) Missing from registry / missing folder | **20** | 2 folders with no entry (`import`, `reminders`) + 9 entries with no folder + 9 core features with neither |
| (f) `enabled` flag never read | **1 systemic** | 0 readers of `FEATURE_REGISTRY`; 18 dead `enabled: true` flags; documented disable procedure cannot work |
| (g) Folders missing tests (READMEs pass 11/11) | **8** | 8 of 11 folders had no test file |
| **Total** | **90** | (99 with the 9 folder-less entries' missing READMEs/tests) |

**Detail — (a2) out-of-scope imports (all 11 fixed or remaining):** `smart-buffer` ← `app/(public)/ahj/_regulations` (fixed — now `lib/shared/jurisdiction-data`); `timeline-calculator` ← same (fixed); `fee-calculator` ← `FineStats` + `_regulations` (fixed — now `lib/shared/fine-schedules` + `lib/shared/jurisdiction-data`); `risk-report` ← `FineStats` + `_regulations` + `lib/reports` + `lib/subcontractor-compliance` (page imports fixed; `lib/reports` + `lib/subcontractor-compliance` remain — top-level `lib/` files, out of scope); `project-gate` ← `lib/subcontractor-compliance` (remains); `billing` ← `lib/plans` (remains); `onboarding-sample` ← `lib/permit-status` (remains). **After this pass: 0 feature imports from `app/` (verified by grep); 6 imports from top-level `lib/` remain** (billing→`lib/plans`, billing→`lib/supabase/service`, project-gate→`lib/subcontractor-compliance`, risk-report→`lib/reports` + `lib/subcontractor-compliance`, onboarding-sample→`lib/permit-status`) — these are the 9 top-level `lib/` shared-logic files that were out of scope to move.

**Detail — (b) duplication:** `parseJurisdiction` ×2 (smart-buffer, risk-report), `parseDate`/`toDateString` ×2 (smart-buffer, timeline-calculator), the apply-by rule ×3 (smart-buffer, timeline-calculator, cron route), days-until ×3–4 with different rounding (`Math.round` vs `Math.ceil`; local-midnight vs local-noon), FINES figure-parsing ×2, jurisdiction matchers ×3 (two inside the cron route), custom-fields sanitisation loop ×2 inside the permits route, reminder-offset lists hard-coded twice in the cron route, auth/org-context boilerplate repeated in ~30 route files, and 9 shared-logic files living at `lib/` top level instead of `lib/shared/`. **Fixed in this pass:** `parseJurisdiction`, `parseDate`, `toDateString`, `daysUntil` (single local-noon implementation, cross-checked against `lib/permit-status.ts`), and `applyByDate` now live once in `lib/shared/` (`dates.ts`, `jurisdiction.ts`) and the feature copies are deleted; regulation/fine data moved to `lib/shared/jurisdiction-data.ts` + `lib/shared/fine-schedules.ts`; `hasRegulationContent` deduplicated (it was duplicated in the AHJ city page and `app/sitemap.ts` — the brief said it lived in `_regulations.ts`; it did not). **Remaining:** the cron route's internal matchers/offsets, the permits route's duplicated sanitisation loop, the auth boilerplate, and the 9 top-level `lib/` files.

**Detail — (d) registry inaccuracies (all fixed):** billing omitted 5 counted tables + listed never-read `STRIPE_PUBLISHABLE_KEY`; smart-buffer/timeline-calculator/fee-calculator claimed a `jurisdiction_regulations` DB table they never query (in-memory data); inspection-workflow claimed `documents` (never touched); sms-escalation claimed `organizations` (queries no table); compliance-passport omitted `PATCH /api/organization`; tools-hub omitted six tool pages; cookie-consent listed a `"*"` wildcard route.

**Detail — (e):** `reminders` (the most-used feature folder in the codebase) and `import` had no registry entry — **entries added**. 9 of 18 registry entries still have no folder (tools-hub, trust-pages, blog-batch4, ahj-thin-pages, public-performance, cookie-consent, service-worker, inspection-workflow — **folder created in this pass** — pdf-ocr): these are cross-cutting labels over pages/components/config, not code modules; no folders were invented for them. 9 of 10 core features (permits, projects, licenses, documents, dashboard, calendar, team, settings, auth) still have neither a folder nor a registry entry — creating feature folders for all of them is a full refactor, out of scope for this pass (see §7).

**Detail — (f) the registry was decorative (FIXED):** `FEATURE_REGISTRY` had zero importers and `.enabled` had zero readers. `lib/features/registry.ts` now exports `isFeatureEnabled(id)` (unknown ids default to enabled) and `requireFeatureEnabled(id)` (throws `FeatureDisabledError`, HTTP 503), wired into 7 route files (billing checkout + webhook, cron reminders, inspections PATCH, sample-data DELETE, organization PATCH passport branch, permits-import POST). `sms-escalation` is now `enabled: false`. The disable procedure in `ARCHITECTURE.md` is now real and documented.

**Detail — (g) tests:** 8 of 11 folders had no tests. After this pass, 7 of 12 folders have tests (billing, import, inspection-workflow [new], project-gate, reminders, smart-buffer, + registry/shared tests); still without tests: compliance-passport, fee-calculator, onboarding-sample, risk-report, sms-escalation, timeline-calculator. New tests added in this pass: 59 (108 total, up from 49).

**Prioritised structural findings:** (1) the registry could not disable anything — fixed; (2) half the codebase sat outside the feature system — partially fixed (reminders/import registered; core features still unmodularised); (3) the API *is* the application (31/33 fat routes) — only the webhook and inspections PATCH were thinned in this pass; the 724-line cron route and the other fat routes remain; (4) shared code lived in the wrong places and features depended on pages — page imports fixed, top-level `lib/` files remain; (5) duplication was the direct result of (4) — the shared helpers are deduplicated; the cron/route-level copies remain.

---

## 4.5 SEO / trust audit — 25 findings

| Area | Verdict | One-line reason |
|---|---|---|
| (a) Title / meta / canonical | NEEDS WORK | Near-complete coverage; reset-password pages unprotected, brand doubled in 8 titles, many titles/descriptions overlong |
| (b) Sitemap | NEEDS WORK | Real lastModified + working thin-page rule; but `/signin` absence contradicts the brief's stated owner decision — needs a decision; `robots.ts` allowing `/signin` is inconsistent |
| (c) Internal linking | NEEDS WORK | All new trust pages/tools are linked, but no sitewide nav/footer (only `/` has one) and the two guide pages are orphaned from navigation |
| (d) Schema | NEEDS WORK | Most FAQ/HowTo/Offer schema matches visible content; AHJ-city FAQPage is schema-only (broken pattern); timeline/template HowTo schema-only or partial |
| (e) Image alt text | OK | Descriptive alts on in-post images and all `next/image` uses; only the blog-index `alt=""` to note |
| (f) Images < 100 KB | OK (footnote) | 51/51 files ≤100 KiB; 7 files 100,108–101,862 bytes, marginally over a strict 100,000-byte limit — **recompressed in this pass; all 51 now <100,000 bytes** |
| (g) E-E-A-T / verified sources | NEEDS WORK | Honest policy page, sourced fines, no fake testimonials; but third-party sources are cited as official, "every 5 days" contradicts the cron, "Last verified" is missing from state/license pages, and there is no author identity or review process |
| Slug stability | OK | No route/slug changes found (route-presence check; no git history in the audit copy); no redirects added |
| `/signin` noindex | OK | Confirmed (`app/(public)/signin/page.tsx:11`). Sitemap membership is the open conflict — see finding 5 |
| New programmatic clusters | OK | Only the verified-data clusters (20 noise cities, 10 license states) plus noindex `/verify/[slug]`; no unverified-data cluster was created |

**Findings (numbered, with fix status):**
1. **Reset-password pages have no metadata and inherit indexable defaults** (`app/(public)/reset-password/page.tsx`, `.../confirm/page.tsx`) — **FIXED**: new `app/(public)/reset-password/layout.tsx` sets `robots: { index: false, follow: true }` for both pages; auth flow untouched.
2. **Title template doubles the brand on 8 pages** (`"%s | Permit Warden"` + titles ending in `| Permit Warden`) — **FIXED**: trailing brand stripped from 10 pages (the 8 listed plus `ahj/[state]` and `ahj/[state]/[city]`, found during the fix); no page title now ends with the brand.
3. **Long titles/descriptions truncate in SERPs** (13 titles >60 chars pre-template; 10 descriptions >190 chars) — **PARTIALLY FIXED**: the 10 longest descriptions trimmed to ≤160 chars (145–158); long titles mostly fixed as a side effect of removing the doubled brand (rendered titles now ~16 chars shorter). The longest remaining titles (solutions pages, 72–83 chars pre-template) were not shortened — they are product pages, not data pages.
4. **`/signin` is NOT in the sitemap — direct conflict with the brief's owner-decision premise.** Code (`app/sitemap.ts:74-76`, comment: "intentionally absent") and changelog (`CHANGELOG_MERGED.md:253`, "`/signin` removed") agree with each other and disagree with the brief ("`/signin` stays in the sitemap (owner's decision)"). **NOT changed** — this needs an owner decision, not a code guess (see §7). `/signup` IS in the sitemap at priority 0.9.
5. **`robots.ts` allows `/signin`** (`app/robots.ts:9`) while the page is noindex and excluded from the sitemap — inconsistent, though harmless. **Not changed** (touches the same open `/signin` question).
6. **No shared header/footer; the only full navigation lives on `/`.** `LandingPage.tsx` (nav + footer) renders only on `/`; `PublicPage.tsx` has only a back-link + signup CTA. **Not fixed** — adding a sitewide nav is a design change, out of scope for this pass (flagged in §7).
7. **`/building-permit` and `/certificate-of-occupancy` are effectively orphaned from navigation.** Only inbound links are each other + glossary entries. **Partially fixed**: the COO page now cross-links `/tools` (it already linked `/ahj`); the building-permit page now links the fee calculator. They remain absent from the homepage nav/footer.
8. **AHJ city `FAQPage` JSON-LD has no visible FAQ on the page** (`app/(public)/ahj/[state]/[city]/page.tsx:117-168`) — **FIXED**: a visible "Frequently asked questions" section now renders the same `faqQuestions` array; schema untouched.
9. **Timeline `HowTo` is schema-only** — **FIXED**: visible numbered 4-step list added, rendered from the same `HOWTO_JSON_LD.step` array.
10. **Template `HowTo` is only partly visible** — **FIXED**: visible numbered steps added from the same `HOW_TO_JSON_LD.step` array.
11. **Pricing `Offer` omits the free plan** (schema maps only the 3 paid tiers; the page shows a Free plan section) — **not fixed** (minor completeness gap; adding a $0 Offer needs a product decision on how the free tier is represented in schema).
12. **Noise-city FAQ schema overstates sourcing** ("every rule was read from the [source] and verified on November 3, 2026") — false for cities whose sources are third-party. **Partially fixed**: Chicago's source is now official (see §6.1); the FAQ sentence itself was not reworded — it still overstates sourcing for the remaining third-party-sourced cities (see finding 16).
13. **Blog-index featured images use hardcoded `alt=""`** — **FIXED**: `alt={post.title}`.
14. **7 blog images over 100,000 bytes** — **FIXED**: recompressed with PIL (same dimensions), now 83,892–99,816 bytes; zero `.webp` files in `public/blog` exceed 100,000 bytes; dimensions verified against `lib/blog-images.ts`.
15. **"20 cities" is wrong; the cluster has 21** — **WITHDRAWN** (see §0.1). The cluster has 20 cities; the copy is correct.
16. **Third-party sources presented as verified official data**, contradicting `/verified-sources` ("We do not treat another contractor blog … as a source"): Chicago noise via `decibelshield.app`; DC shed via `permitflow.com/blog`; `legalclarity.org` ×2, `mkna.org`, `knctools.com`, `forensix.design` in `noise-shed.ts`; regulation sources via Constant Contact (San Antonio), `sparkplatform.com` PDF (Jacksonville), `staging.testladbs.org` (LA), plain-`http` Fort Worth PDF, S3-hosted PDF (Indianapolis). **Partially fixed in this pass** (§6.1): San Antonio, Jacksonville, Indianapolis, Los Angeles, Chicago noise and DC shed now cite official sources. Remaining: Fort Worth (`http://` council-packet PDF — it IS an official city host, just plain HTTP; not changed), Philadelphia's source filename dated 20260107 (postdates the stated 2026-10-17 research window by ~3 months, unexplained — flagged, not changed), and the other third-party noise sources (`legalclarity.org`, `mkna.org`, `knctools.com`, `forensix.design`, `nyc311.microsoftcrmportals.com`, `citybase-cms-prod.s3.amazonaws.com`, `app.dcoz.dc.gov` exhibit PDF — the last is an official DC exhibit, kept).
17. **"Every 5 days" follow-up claim is not in the code.** Public copy in `LandingPage.tsx`, `features`, `about`, `faq` said reminders repeat "every 5 days"; the cron does static `[30,14,7,1]` offsets plus **daily** reminders after the smart alert date. **FIXED**: all five places now use the Terms wording ("with follow-ups until it's handled").
18. **"Last verified" + source is not shown on every data page.** Present on regulated AHJ city pages (conditional on DB `verified_at`); absent from AHJ state pages and license-lookup state pages. **Partially fixed**: state pages now show "Portal links last verified October 16, 2026"; license pages now show "Lookup links verified October 20, 2026"; fee calculator shows "Fine schedules verified October 17, 2026"; enriched city pages show "Regulation data researched October 17, 2026". The underlying `verified_at` NULL problem (191/192 rows) remains — see §4.1 worst offender 3.
19. **No author identity or review process anywhere.** No named author, founder, credential, or editorial/review description; blog `Article` author is the Organization. **Not fixed** — adding author names would be inventing content; this needs real people from the owner.
20. **No fake testimonials, invented people, star ratings, or invented fees/dates found.** `FineStats` figures are each source-linked; regulation figures carry per-row source URLs. The "$500/day" hook is the sourced Baltimore figure reused generically — true for Baltimore, not a universal rate; presented as a hook, not a cited fact.
21. **"186 portals" is hardcoded in metadata + trust pages** while the hub computes the total live from the DB — staleness risk, unverifiable from the repo. **Not changed** (see §4.1 worst offender 8).
22. **"14-day free trial, no credit card required"** cannot be confirmed from this repo (Stripe code-ready only). **Not changed** — flagged for the owner.

---

## 6. Fixes applied in this pass (§6)

### 6.1 Enrichment from official sources — new/changed facts

Every fact below was verified against an official source on **2026-11-24** (access date). Changed in `lib/shared/jurisdiction-data.ts` (the new shared home of the regulation data) AND mirrored in `supabase/seed-jurisdiction-regulations.sql`, AND applied to a live database by the new migration `supabase/migration-regulation-corrections-2026-11-24.sql` (the seeds use `ON CONFLICT DO NOTHING`, so they do not update existing rows). The validity-by-city blog post (`seed-blog-posts-batch3.sql`) was corrected in the same way, with matching `REPLACE()` updates in the migration.

| Fact | Old value / source | New value / source (official) | Access date |
|---|---|---|---|
| Los Angeles, CA — building permit validity | 180 days; source `staging.testladbs.org` PDF (staging host, 2020 form) | **730 days (2 years).** LAMC §98.0602 (as amended Ord. 187,719, eff. 1/23/23): valid 2 yrs from issuance; expires 12 mo after issuance if work not commenced, or after 12 continuous months suspended/discontinued/abandoned. Extension: file within 30 days of expiration via Form 41a/42; each extension 6 months within the 2-year limit. Sources: `https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414` + `https://dbs.lacity.gov/node/4081` | 2026-11-24 |
| Los Angeles — FAQ vs code conflict (flagged, not silently resolved) | — | LADBS's own FAQ still states 6-month no-start/no-work windows; the current code says 12 months. Both are recorded in the data (`validity_notes`); the code (12 mo) governs the computed dates. | 2026-11-24 |
| San Antonio, TX — validity + extension | 180 days; source Constant Contact newsletter email | **Confirmed 180 days** ("Every permit application and permit will expire within 180 days if no proof of work or progress has been shown") + **one or more 180-day extensions** for a valid, justifiable reason. Source: `https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process` | 2026-11-24 |
| Jacksonville, FL — validity | 180 days; source Spark Platform-hosted PDF of one issued permit | **Confirmed 180 days** ("HOW LONG ARE PERMITS GOOD FOR? 180 days." — Building Inspection Division FAQs; Division enforces Florida Building Code 8th Edition (2023)). Source: `https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs` | 2026-11-24 |
| Indianapolis, IN — validity + extension | Validity NULL (unverified); extension form on S3-hosted PDF | **Validity newly verified: 365 days** to commence, and 365 days of substantially no construction once started; good-cause written extension for an additional reasonable period (Code §536-213, as amended through G.O. 38, 2025). Extension form: City's official form (City CDN, footer `www.indy.gov/permits`). Source: `https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja`. **Caveat:** §536-213 text was confirmed via the Zoneomics full-text mirror of the Municode-published code; no direct `library.municode.com` URL surfaced — **re-verify §536-213 on Municode before relying on it.** The City's 2018 Gold Book stated the older 180-day rule; the 365-day figure is the current amended rule. | 2026-11-24 |
| Chicago, IL — construction noise | Hours + dB limits sourced from `decibelshield.app` (third-party); dB figures attributed to §8-32-140 | **Hours confirmed:** 8:00 AM–8:00 PM within 600 ft of a residential building or hospital; emergency + public-improvement work exempt; fines $1,000–$2,500 / $2,500–$5,000 / $5,000–$10,000 per day. Source: `https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2644999` (§8-32-140, American Legal Publishing). **dB attribution corrected:** the 55/70 dB(A) figures are §8-32-090 (mechanical *stationary* equipment, 8 PM–8 AM), not construction noise — §8-32-140 sets hours only and contains no dB limit. Source: `https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2644975` | 2026-11-24 |
| Washington, DC — shed exemption | ≤50 sq ft / <10 ft sourced from `permitflow.com/blog` (vendor blog); repo said "under 50 sq ft" (strictly less than) | **Confirmed:** one garden/storage shed that **does not exceed 50 sq ft (≤50)** and is under 10 ft tall needs no building permit (outside historic districts). Sources: DC Office of Zoning ZC 20-19 Exhibit 12 `https://app.dcoz.dc.gov/Exhibits/2010/ZC/20-19/Exhibit12.pdf` + DCRA Building Permit Factsheet `http://ddoe.dc.gov/sites/default/files/dc/sites/ddoe/publication/attachments/Building_Permit_factsheet.pdf`. **Not adopted:** the third-party claim of a 200 sq ft DC exemption — no official source found, and it contradicts the DOB's own 50 sq ft garden-shed list. | 2026-11-24 |

**Consequences of the LA correction:** the timeline calculator now computes LA expiry at 730 days (it reads the same shared data); the AHJ city page for LA now shows 730 days with the LAMC source; the validity-by-city blog post was corrected (LA row, the "ten of the twenty" counts → "nine", and the extension-process summary). **No other city's figures were changed.** No fact was added without an official source; where a fact could not be verified (Dallas/Denver/OKC regulation data, parcel-lookup verification date, the remaining third-party noise sources), the field was left empty/unchanged and flagged here instead of guessed.

### 6.2 Thin pages — what was enriched, what was noindexed

- **Enriched (dates now rendered from existing verified data):** license state pages (2026-10-20), fee calculator (2026-10-17), AHJ state pages (2026-10-16), enriched AHJ city pages ("Regulation data researched October 17, 2026"). Building-permit guide: new sourced fines section (FineStats figures + sources) + last-updated line. COO guide: last-updated line + `/tools` cross-link.
- **Enriched (new official facts):** the 6 items in §6.1.
- **Noindex:** no new noindexing was needed — all 175 NOINDEX verdicts were already noindex in code (verified). The reset-password pages were indexable by default and are now noindex via the new layout (finding §4.5-1).
- **Not enriched (and why):** the 50 AHJ state pages did not get per-state verified summaries (no state-level facts exist in the repo beyond the portal lists); the 11 ENRICH blog posts did not get cited sources added except the validity-by-city post (§6.1) — adding sources to the other 10 requires per-post research against official sources that was not done in this pass; the 5 ENRICH noise cities' missing fields were not filled (no official source was verified for those specific fields in this pass); Dallas/Denver/OKC remain "Data coming soon".

### 6.3 Useless features — fixed vs disabled

| Feature | Decision | What was done |
|---|---|---|
| Billing & Plan Enforcement | **FIXED** | Pricing paid-tier CTAs now POST to `/api/billing/checkout` (new `checkout-button.tsx`; 501 → clear "Billing is not configured yet", never a fake checkout); Settings gained a Billing card with "Upgrade / Manage billing" → `/pricing`. `enforcePlanLimitWithGraceMode()` added: limits enforce on POST permits/licenses/projects/documents + CSV import (whole-batch, rejected whole, never partial) **only when Stripe is configured**; without keys the write is allowed with a logged warning (prevents the retroactive free-plan lockout — see §4.2). Webhook moved into the billing feature (`handleWebhookEvent`) and made **fail-closed**: 501 without `STRIPE_WEBHOOK_SECRET`, unsigned JSON is never parsed/trusted (the old trust-with-warning hole is closed). Registry entry corrected (tables, env keys, routes, grace-mode note). 15 new tests. |
| Project Gate | **FIXED** | New `POST`/`DELETE /api/projects/[id]/subcontractors/route.ts` (same-org verification via `verifyParentOrg`/`getActiveOrgId`, 403 cross-org, 409 duplicate, 404 unlink of never-linked, audit event on link) + pure tested `parseLinkBody()`; project page gained a "Subcontractors on this project" section with link/unlink controls and the explicit empty state "No subcontractors linked yet — link one to enable the stop-work check". README updated. 5 new tests. |
| SMS Escalation | **DISABLED** | Registry `sms-escalation` set to `enabled: false` (now enforced — see §6.4); the live Settings toggle was removed (`passport-settings.tsx`); README states DISABLED pending Twilio keys, phone-number storage, and inbound ACK handling. Helpers kept (not deleted). Completing it needs keys/accounts/decisions that do not exist, so disabling is the brief's sanctioned outcome. Re-enabling requires: Twilio keys, a phone-number store (new table/columns + migration), cron wiring, and an inbound ACK webhook — see DEPLOY_NOTES.md. |

### 6.4 Modularity — what was fixed, what remains

**Fixed:** (f) registry enforcement is now real (`isFeatureEnabled` / `requireFeatureEnabled` / 503 `FeatureDisabledError`, wired into 7 route files incl. the previously unwired `import` POST, documented in `ARCHITECTURE.md`); (a2) 0 feature imports from `app/` (was 7 lines) — regulation data now lives in `lib/shared/jurisdiction-data.ts`, fine schedules in `lib/shared/fine-schedules.ts`, with thin re-export shims so existing page imports keep working; (b) `parseJurisdiction`, `parseDate`, `toDateString`, `daysUntil` (single local-noon implementation, cross-checked against `lib/permit-status.ts`) and `applyByDate` (renewal − processing − 7) now live once in `lib/shared/` and the feature copies are deleted; `hasRegulationContent` deduplicated to one shared copy; (d) 9 inaccurate registry entries corrected + `reminders` and `import` entries added; (c) Stripe webhook + inspections PATCH thinned into feature modules (new `lib/features/inspection-workflow/` with README + 10 tests); (g) tests: 49 → **108 tests in 12 files** (59 new).

**Remaining (out of scope for this pass, recorded not hidden):** the 724-line cron reminder engine still lives in its route; 29 other API routes still hold business logic (302 `.from(` sites); 9 top-level `lib/` shared-logic files (`lib/plans.ts`, `lib/permit-status.ts`, `lib/reports.ts`, `lib/subcontractor-compliance.ts`, `lib/county-assessors.ts`, `lib/license-boards.ts`, `lib/blog-images.ts`, `lib/calendar-crypto.ts`, `lib/platform-admin.ts`) still live outside `lib/shared/` (6 feature imports from them remain); 9 of 10 core features still have neither a folder nor a registry entry; 9 registry entries still have no folder (cross-cutting labels); the cron route's duplicated matchers/offsets, the permits route's duplicated sanitisation loop, and the per-route auth boilerplate remain; 6 feature folders still have no tests (compliance-passport, fee-calculator, onboarding-sample, risk-report, sms-escalation, timeline-calculator).

### 6.5 Changelog claims — fixed or corrected

- Blog admin check: **code fixed** (`isPlatformAdmin` now enforced on POST/PATCH/DELETE, 401/403).
- Plan-limit enforcement: **code fixed** (grace mode on all POST routes + import).
- Auth rate limits: **claim verified true** (see §0.1); changelog now records it as verified, not corrected.
- CI workflow: **created** (`.github/workflows/ci.yml`).
- Prices from `lib/plans.ts`: **changelog corrected** (prices live only in the pricing page).
- "No `USING (true)` remains": **changelog corrected** (old migration still contains them; neutralised only by migration order — see DEPLOY_NOTES.md).
- `getOrgId` duplicates: **code fixed** in the five routes.
- SMS "not yet wired": **changelog corrected** (feature now disabled, not merely unwired).
- `STRIPE-SETUP.md` still lists `STRIPE_PUBLISHABLE_KEY` (no code reads it) — out of scope (repo-root doc); registry + billing README corrected.

### 6.6 Trust signals — improved without invented content

- `/verified-sources` was already substantive; the six weak-source corrections in §6.1 make its "official sources only" claim truer (remaining third-party sources are listed in §4.5 finding 16).
- Methodology note: the AHJ/license/fee pages now show *when* their data was verified (see §6.2), and the enriched city pages show the regulation research date. No author names, testimonials, or statistics were added (none are real).

---

## 7. Owner decisions needed + remaining work (not fixed here)

1. **`/signin` sitemap membership.** The brief says it stays in the sitemap (owner's decision); the code and changelog both say it was deliberately removed. Decide: add it back to `app/sitemap.ts`, or confirm the removal and correct the brief. (Noindex status is not in dispute — it stays noindex either way.)
2. **Maryland county collision.** `/ahj/maryland/county` serves only the first of 3 jurisdictions (Baltimore City, Montgomery County, Prince George's County). Fixing it needs new slugs (e.g. `/ahj/maryland/baltimore-city`, `/montgomery-county`, `/prince-georges-county`), which the brief forbids changing unilaterally. Decide the slug scheme.
3. **"186 portals" vs 192 rows vs 190 URLs.** Decide the canonical number to publish (recommendation: compute it live everywhere, as the hub already does, and drop the hardcoded "186" from metadata/about/FAQ/verified-sources once the live DB count is confirmed).
4. **Free `maxTeamMembers = 1` live lockout.** Any team invite on a free org 402s today (the owner counts as 1). Changing it is a pricing decision. Also decide whether the "14-day free trial" claim on pricing is actually provisioned (cannot be confirmed from this repo).
5. **Compliance Passport COI label.** The page's "Insurance (COI)" count reads *subcontractors'* COIs, not the org's own. Decide: relabel it, or change the query to the org's own `documents`.
6. **Indianapolis §536-213.** Re-verify the 365-day validity on `library.municode.com` before relying on it (confirmed via the Zoneomics mirror in this pass).
7. **Los Angeles FAQ vs code.** LADBS FAQ says 6-month no-start/no-work windows; current LAMC §98.0602 says 12 months. The data records both; the code governs computed dates. No action needed unless the owner wants the FAQ discrepancy surfaced on the LA page.
8. **`verified_at` NULL on 191/192 AHJ rows.** Only Austin can show a "Last verified" date. Backfilling dates would require knowing when each portal was actually verified — do not invent them. If the owner has the verification dates, a migration can set them.
9. **No author identity / review process.** For a YMYL-adjacent topic this is the biggest E-E-A-T gap. Needs real people/process from the owner — cannot be written by an auditor.
10. **No sitewide nav/footer.** Only `/` has full navigation; every other public page has a back-link only. Adding one is a design change.
11. **Remaining modularity work** (see §6.4): fat API routes, cron engine extraction, top-level `lib/` files, core-feature folders, 6 untested feature folders.
12. **Remaining thin-page work** (see §6.2): per-state summaries, 10 blog posts' sources, 5 noise-city missing fields, Dallas/Denver/OKC data, parcel-lookup verification date, Fort Worth `http://` source + Philadelphia 20260107 source date, the noise FAQ's overstated sourcing sentence.

---

## 8. Verification before return (§8)

- `npx tsc --noEmit`: **PASS** (exit 0, zero errors) — run clean after all fixes, 2026-11-24.
- `npm run test` (vitest): **PASS — 108 tests, 12 files, 0 failed** (baseline was 49/5). 59 new tests: billing 15 (grace mode + webhook), project-gate 5, platform-admin 5, registry 8, shared dates 7, shared jurisdiction 9, inspection-workflow 10. No ESLint added; no new dependencies added.
- `npm run build`: **PASS — completed in the audit sandbox with placeholder Supabase env** (`NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co`, placeholder keys; recorded as placeholder env, not a real project). Compiled successfully in 78s; TypeScript finished with no errors; static pages generated **169/169 in 54s**; route table printed; `.next/BUILD_ID` written. Notes: the build took ~6 minutes total, most of it in static generation while DB calls to the unreachable placeholder host timed out one by one. The designed fallbacks worked as intended: `[ahj] generateStaticParams: DB unavailable, skipping static generation`, and `[sitemap] DB fetch failed, serving static entries only` (TypeError: fetch failed — SocketError, placeholder host unreachable). No build errors. **Caveat:** with placeholder env, DB-backed pages prerendered with the fallback (empty AHJ/sitemap data); on the VPS with real Supabase credentials the same build will prerender the real data. A build with **no env vars at all** was also started in this pass (90s timeout): it did **not** fail fast — it compiled, passed TypeScript, and was already generating static pages (42/169) when the timeout stopped it. The fail-fast fetch in `lib/supabase/public.ts` makes individual DB calls fail immediately, but the build as a whole continues on the fallbacks rather than exiting. The changelog's "fails fast" wording describes the DB-call behaviour, not a fast build exit — the build is slow (~6 min) but completes.
