# Permit Warden v2 — Pass 2 Changed Files

**Date:** 2026-11-24. **Base:** pass-1 output (`permit-warden-v2-audit-fix.zip`, 98 files) applied onto the v2 code (328 files). **This zip contains ONLY files created or changed in pass 2** — 134 files + this file + `PASS2_REPORT.md` (136 entries). Three files were **deleted** (listed at the end; delete them when applying). `tsconfig.tsbuildinfo` changed as a side effect of running `tsc` and is deliberately NOT included.

Conventions: **M** = modified, **A** = added, **D** = deleted. Blast radius = routes/features the change can affect. No slug, URL, price, or plan-limit change anywhere. No Stripe/Twilio activation. No real keys.

## 1. Enrichment — AHJ state pages (Worker A1)

| Path | Change | Why | Blast radius |
|---|---|---|---|
| M `app/(public)/ahj/[state]/page.tsx` | Renders new "About building permits in [State]" section (summary + official source link + "Verified November 24, 2026") above the untouched portal list | Per-state verified summaries (pass-1 gap) | `/ahj/[state]` ×50 |
| A `lib/shared/state-summaries.ts` | 50 structured entries: `code`, `summary` (2–4 sentences: adopted code, overseeing agency, effective dates), `sourceName`, `sourceUrl`, `verifiedDate: "2026-11-24"` | Single source of truth for state summaries | State pages; mirrored by the migration below |
| A `supabase/migration-state-summaries-2026-11-24.sql` | `state_summaries` table + all 50 rows (`ON CONFLICT DO NOTHING`); script-verified byte-identical to the TS file | DB mirror so live DB and code agree | DB only — run once in the SQL editor |

## 2. Enrichment — blog / noise / cities (Worker A2) + coordinator fix

| Path | Change | Why | Blast radius |
|---|---|---|---|
| M `app/(public)/tools/_data/noise-shed.ts` | All 5 missing noise fields filled from official sources; San Antonio weekday hours corrected (clock hours WERE adopted Feb 17, 2022, eff. Feb 27, 2022 — the repo's "adoption not verified" note was wrong) | Pass-1 ENRICH ×5 | 5 noise-city pages; `hasRegulationContent` unaffected |
| M `app/(public)/tools/noise-ordinance-lookup/page.tsx` | Intro / "Cities covered" / "not verified yet" FAQ reworded to stop overstating sourcing | Pass-1 §4.5-12 + leftover | Noise hub page |
| M `app/(public)/tools/noise-ordinance/[city]/page.tsx` | "Where does this data come from?" FAQ reworded (dates + secondary-copy warning) | Same | Noise city pages |
| M `lib/shared/jurisdiction-data.ts` | Dallas data added (730d, 120-day rule, $200 extension); Denver §131.7 voiding rule added; Indianapolis amendment corrected G.O. 38 → G.O. 40, 2025 §6; Fort Worth `http` → `https`; Philadelphia source → current July 2026 P_052 revision; new optional `researched_date` field | Pass-1 ENRICH (Dallas/Denver/OKC) + leftovers + Indianapolis caveat | AHJ city pages, timeline/fee calculators |
| M `lib/shared/jurisdiction.test.ts` | Dallas/Denver assertions updated; OKC-still-no-data assertion added | Tests for the new data | Tests only |
| A `supabase/migration-content-enrichment-2026-11-24.sql` | Idempotent guarded UPDATEs applying all §2 changes to a live DB (seeds use `ON CONFLICT DO NOTHING`, so they don't update existing rows) | Live-DB mirror | DB only — run after the state-summaries migration |
| M `supabase/seed-blog-posts.sql` | `## Sources` sections (official URLs, "Sources verified November 24, 2026") added to 2 posts | Pass-1 ENRICH blog posts | Blog posts |
| M `supabase/seed-blog-posts-batch2.sql` | Same, 4 posts (incl. validity-periods post; validity-by-city post untouched — done in pass 1) | Same | Blog posts |
| M `supabase/seed-blog-posts-batch3.sql` | Same, 2 posts | Same | Blog posts |
| M `supabase/seed-blog-posts-batch4.sql` | Same, 3 posts | Same | Blog posts |
| M `supabase/seed-jurisdiction-regulations.sql` | Mirror of the jurisdiction-data changes (Dallas/Denver/Indianapolis/Fort Worth/Philadelphia); seed header now lists only OKC under "no data could be verified" | DB seed mirrors code data | DB seed |
| M `app/(public)/ahj/[state]/[city]/page.tsx` | "Regulation data researched October 17, 2026" is now data-driven: renders `reg.researched_date` (Dallas/Denver = November 24, 2026), falls back to October 17, 2026 | Coordinator fix — the hardcoded date was wrong for the pass-2 Dallas/Denver facts (flagged by Worker A2) | AHJ city pages |

## 3. Code — routes thinned (Worker B)

Thin = auth/org resolution in the route, then one feature call; DB logic lives in `lib/features/<feature>/`. Behaviour identical (same validation, status codes, error strings, audit events, plan-limit grace mode). `.from(` sites in `app/api/` routes: 144 → 47.

| Path | Change | Why | Blast radius |
|---|---|---|---|
| M `app/api/cron/reminders/route.ts` | 737 → 53 lines; engine moved to `lib/features/reminders/run-reminder-cron.ts` | Pass-1 leftover: 724-line fat route | Reminder cron (`0 9 * * *`) |
| M `app/api/permits/route.ts` | 326 → 46 lines; CRUD → `lib/features/permits/`; duplicated sanitisation loop → single `sanitizeCustomFields` | Fat-route thinning | Permits API |
| M `app/api/inspections/route.ts` | 221 → 51 lines; CRUD → `lib/features/inspections/` (+ `fail-workflow.ts`) | Same | Inspections API |
| M `app/api/licenses/route.ts` | 207 → 36 lines; CRUD → `lib/features/licenses/` | Same | Licenses API |
| M `app/api/team/route.ts` | 205 → 35 lines; list/invite/remove → `lib/features/team/` | Same | Team API |
| M `app/api/calendar/sync/route.ts` | 161 → 23 lines; sync → `lib/features/calendar/` | Same | Google Calendar sync |
| M `app/api/projects/route.ts` | 155 → 36 lines; CRUD → `lib/features/projects/` | Same | Projects API |
| M `app/api/permits/import/route.ts` | 145 → 42 lines; import → `lib/features/import/` | Same | CSV import |
| M `app/api/documents/route.ts` | 137 → 32 lines; upload/expiry → `lib/features/documents/` | Same | Documents API |
| M `app/api/auth/google-calendar/route.ts` | 129 → 34 lines; OAuth start → `lib/features/calendar/oauth.ts` | Same | Calendar OAuth |
| M `app/api/auth/google-calendar/callback/route.ts` | 122 → 33 lines; OAuth callback → `lib/features/calendar/oauth.ts` | Same | Calendar OAuth |
| M `app/api/reports/route.ts` | 70 → 30 lines; reports → `lib/features/reports/` | Same | Reports API |
| M `app/api/deadlines/route.ts` | 65 → 24 lines; deadlines → `lib/features/reminders/` | Same | Deadlines API |
| M `app/api/organization/route.ts` | 87 → 15 lines; org PATCH → `lib/features/settings/` | Same | Org settings API |
| M `app/api/team/accept/route.ts` | 75 → 20 lines; accept → `lib/features/team/` (`acceptInvite`) | Same | Team invites |
| M `app/api/export/route.ts` | 73 → 36 lines; export → `lib/features/export/` | Same | CSV export |
| M `app/api/reports/summary/route.ts` | 39 → 44 lines (grew: CSV branch now explicit; duplicate local `getOrgId` removed) | Same | Reports summary |
| M `app/api/calendar/status/route.ts` | 30 → 14 lines; status → `lib/features/calendar/` | Same | Calendar status |
| M `app/auth/signin/route.ts` | 26 → 24 lines; handler → `lib/features/auth/` | Same | Sign-in flow |
| M `app/auth/signup/route.ts` | 29 → 24 lines; handler → `lib/features/auth/` | Same | Sign-up flow |
| M `app/auth/reset-password/route.ts` | 26 → 23 lines; handler → `lib/features/auth/` | Same | Password reset |
| M `app/auth/callback/route.ts` | 25 → 15 lines; handler → `lib/features/auth/` (`safeNextPath` open-redirect guard exported) | Same | Auth callback |
| M `app/auth/signout/route.ts` | 8 → 9 lines; handler → `lib/features/auth/` | Same | Sign-out flow |
| D `app/api/calendar/lib.ts` | **DELETED** — moved verbatim to `lib/features/calendar/client.ts` (no other importers; verified by grep) | Calendar feature owns the client | Calendar API (delete this file when applying) |

## 4. Code — core features registered (Worker B)

Each: folder with `index.ts` logic + `index.test.ts` + `README.md`, plus a registry entry (`routes`, `tables`, `envKeys`, `enabled: true`). Registry total: 20 → 31 entries (9 core + `export` + `reports` extra).

| Path | Change | Why | Blast radius |
|---|---|---|---|
| A `lib/features/permits/{index.ts,index.test.ts,README.md}` | Full CRUD moved from `app/api/permits/route.ts` | Core feature had no folder/registry entry | Permits API |
| A `lib/features/projects/{index.ts,index.test.ts,README.md}` | Full CRUD moved from `app/api/projects/route.ts` | Same | Projects API |
| A `lib/features/licenses/{index.ts,index.test.ts,README.md}` | Full CRUD moved from `app/api/licenses/route.ts` | Same | Licenses API |
| A `lib/features/documents/{index.ts,index.test.ts,README.md}` | Upload + expiry PATCH moved from `app/api/documents/route.ts` | Same | Documents API |
| A `lib/features/dashboard/{index.ts,index.test.ts,README.md}` | Data fetching moved from `app/(app)/dashboard/page.tsx` (`getDashboardData`, `tallyStatusCounts`, `computeCompliance`, `buildForecast`) | Same | Dashboard page |
| A `lib/features/calendar/{index.ts,index.test.ts,README.md,client.ts,oauth.ts}` | Sync/status/disconnect + OAuth start/callback + token client | Same | Calendar sync/OAuth |
| A `lib/features/team/{index.ts,index.test.ts,README.md}` | List/invite/remove/accept moved from `app/api/team/*` | Same | Team API |
| A `lib/features/settings/{index.ts,index.test.ts,README.md}` | Org PATCH moved from `app/api/organization/route.ts` (page still reads org/plan for display) | Same | Org settings API |
| A `lib/features/auth/{index.ts,index.test.ts,README.md}` | 5 handlers moved from `app/auth/*/route.ts`; rate-limit → 429 via `AuthRateLimitedError` | Same | Auth flows |
| A `lib/features/export/{index.ts,index.test.ts,README.md}` | CSV export feature (extra entry) | Route thinning | Export API |
| A `lib/features/reports/{index.ts,README.md}` | Reports feature (extra entry; no new test file — logic already covered by shared reports tests) | Route thinning | Reports API |
| A `lib/features/import/{index.ts,index.test.ts}` | Import feature index (CSV import logic moved from route) | Route thinning | CSV import |
| A `lib/features/inspections/{index.ts,index.test.ts,README.md,fail-workflow.ts}` | Inspections CRUD + fail→correction workflow | Route thinning | Inspections API |
| A `lib/features/reminders/{index.ts,run-reminder-cron.ts,run-reminder-cron.test.ts}` | Cron engine (`runReminderCron`, same offsets/rules/errors) + index; 9 new cron tests | Cron thinning | Reminder cron |
| M `lib/features/registry.ts` | 11 new entries (9 core + export + reports); 31 entries total | Single list of every feature | Registry enforcement |
| M `lib/features/billing/index.ts` | Import path updates (`@/lib/*` → `@/lib/shared/*`) | Lib move | Billing (no behaviour change) |
| M `lib/features/compliance-passport/index.ts` | Import path updates; `generateSlug` now re-exported from shared (`generatePassportSlug`) | Lib move | Passport (no behaviour change) |
| M `lib/features/project-gate/index.ts` | Import path updates | Lib move | Project Gate |
| M `lib/features/risk-report/index.ts` | Import path updates | Lib move | Risk report |
| M `lib/features/onboarding-sample/index.ts` | Import path updates | Lib move | Onboarding |
| M `lib/features/inspection-workflow/index.ts` | Now a thin re-export shim over `lib/features/inspections/fail-workflow.ts` (registry entry, README, tests unchanged) | Avoid cross-feature import | Inspection workflow |
| M `lib/features/inspection-workflow/README.md` | Notes the shim | Same | Docs only |
| M `lib/features/import/README.md` | Updated for the new index | Same | Docs only |
| M `lib/features/reminders/README.md` | Updated for the cron engine move | Same | Docs only |

## 5. Code — shared lib move + helpers + config (Worker B)

| Path | Change | Why | Blast radius |
|---|---|---|---|
| A `lib/shared/plans.ts` / M `lib/plans.ts` | Moved; old path is a thin re-export shim. Plan-limit values UNCHANGED | Top-level shared logic belongs in `lib/shared/` | Pricing, billing, settings |
| A `lib/shared/permit-status.ts` / M `lib/permit-status.ts` | Moved; shim at old path | Same | Permits/licenses/import/cron |
| A `lib/shared/reports.ts` / M `lib/reports.ts` | Moved; shim at old path | Same | Reports |
| A `lib/shared/subcontractor-compliance.ts` / M `lib/subcontractor-compliance.ts` | Moved; shim at old path | Same | Subcontractors, Project Gate, risk report |
| A `lib/shared/county-assessors.ts` / M `lib/county-assessors.ts` | Moved; shim at old path | Same | Parcel lookup |
| A `lib/shared/license-boards.ts` / M `lib/license-boards.ts` | Moved; shim at old path | Same | License lookup, sitemap |
| A `lib/shared/blog-images.ts` / M `lib/blog-images.ts` | Moved; shim at old path | Same | Blog pages |
| A `lib/shared/calendar-crypto.ts` / M `lib/calendar-crypto.ts` | Moved; shim at old path | Same | Calendar OAuth |
| A `lib/shared/platform-admin.ts` / M `lib/platform-admin.ts` | Moved; shim at old path | Same | Blog admin |
| A `lib/shared/http.ts` | New: `ApiError` + `runFeature`/`errorResponse` (thin-route plumbing) | Route thinning | All thinned routes |
| A `lib/shared/route-helpers.ts` | New: `requireAuthOrg`/`requireAuthUser` (shared auth/org boilerplate) | Route thinning | All thinned routes |
| A `lib/shared/slug.ts` + A `lib/shared/slug.test.ts` | New: `generateSlug` moved out of compliance-passport (Settings uses it too; features never import each other) | Modularity | Passport, settings |
| A `lib/shared/permit-status.test.ts` / A `lib/shared/platform-admin.test.ts` | Test suites moved with their modules | Lib move | Tests only |
| M `lib/shared/README.md` | Documents all shared modules incl. new helpers | Docs | Docs only |
| M `lib/shared/dates.test.ts` | Import now `@/lib/shared/permit-status` | Lib move | Tests only |
| M `app/(app)/dashboard/page.tsx` | Data fetching moved to `lib/features/dashboard/` (`getDashboardData`); page now resolves auth/membership + renders | Dashboard feature | Dashboard page |
| M `app/(app)/reports/page.tsx` | Import `@/lib/reports` → `@/lib/shared/reports` | Lib move | Reports page |
| M `app/(app)/settings/page.tsx` | Import `@/lib/plans` → `@/lib/shared/plans` | Lib move | Settings page |
| M `app/(app)/subcontractors/page.tsx` | Import path update | Lib move | Subcontractors page |
| M `app/(app)/subcontractors/[id]/page.tsx` | Import path update | Lib move | Subcontractor detail |
| M `app/(public)/pricing/page.tsx` | Import `@/lib/plans` → `@/lib/shared/plans` (no price change) | Lib move | Pricing page |
| M `app/(public)/blog/[slug]/page.tsx` | Import `@/lib/blog-images` → `@/lib/shared/blog-images` | Lib move | Blog posts |
| M `app/sitemap.ts` | Import `@/lib/license-boards` → `@/lib/shared/license-boards` (no URL/list change; `/signin` untouched) | Lib move | Sitemap |
| M `app/(public)/tools/license-lookup/page.tsx` | Import path update | Lib move | License hub |
| M `app/(public)/tools/license-lookup/_picker.tsx` | Import path update | Lib move | License picker |
| M `app/(public)/tools/license-lookup/[state]/page.tsx` | Import path update | Lib move | License state pages |
| M `app/api/tools/parcel-lookup/route.ts` | Import path update | Lib move | Parcel lookup |
| M `app/api/blog/route.ts` | Import path update | Lib move | Blog admin |
| M `app/api/blog/[id]/route.ts` | Import path update | Lib move | Blog admin |
| M `next.config.ts` | Build-time fail-fast: throws before compilation when `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent on `next build` (gated on CLI argv, since `NEXT_PHASE` is only set after config load) | Pass 1 found the no-env build did NOT fail fast | `next build` only; dev/start/tsc unaffected |
| M `package.json` | Added devDependency `server-only@^0.0.1` (4 files already imported it; absent from a fresh install, breaking test collection) | Justified in PASS2_REPORT.md §5 | Install only |
| M `package-lock.json` | Lockfile for the above | Same | Install only |

## Deleted files

| Path | Action |
|---|---|
| `app/api/calendar/lib.ts` | DELETE — moved verbatim to `lib/features/calendar/client.ts`; no other importers (verified by grep). Not included in this zip (it no longer exists). |
| `lib/permit-status.test.ts` | DELETE — test suite moved with its module to `lib/shared/permit-status.test.ts`; the old-path file only re-tested the re-export shim. Not included in this zip. |
| `lib/platform-admin.test.ts` | DELETE — test suite moved with its module to `lib/shared/platform-admin.test.ts`; same reason. Not included in this zip. |
