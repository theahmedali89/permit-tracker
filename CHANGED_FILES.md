# Changed files — Permit Warden v2 audit fix pass (24 November 2026)

Every file created or changed in this pass, with its full repo-relative path. Zip root = repo root; no extra top folder. Files not listed here did not change. Binary files (`.webp`) are included complete. `tsconfig.tsbuildinfo`, `node_modules/` and `.next/` are build artefacts and are NOT included.

## New files

| Path | What changed | Why | Blast radius |
|---|---|---|---|
| `.github/workflows/ci.yml` | Created: install (`--legacy-peer-deps`), `tsc --noEmit`, `npm run test`, build; Node 20; push/PR | Changelog claimed a CI workflow that did not exist (§4.3-21) | CI only; no runtime effect |
| `AUDIT_REPORT.md` | Created: full §4 audit + fixes + owner decisions | Required deliverable (§9) | Docs only |
| `CHANGED_FILES.md` | Created: this file | Required deliverable (§9) | Docs only |
| `DEPLOY_NOTES.md` | Created: migrations, env vars, VPS build/verify/rollback, approvals needed | Required deliverable (§9) | Docs only |
| `app/(app)/projects/[id]/subcontractor-links.tsx` | Created: link/unlink controls + "No subcontractors linked yet" empty state | Project Gate could never fire — no linking UI existed (§4.2) | Project detail page only |
| `app/(public)/pricing/checkout-button.tsx` | Created: client CTA posting `{plan}` to `/api/billing/checkout`, redirects to Stripe URL; 501 → "Billing is not configured yet" | No UI ever called checkout (§4.2 billing) | Pricing page CTAs |
| `app/(public)/reset-password/layout.tsx` | Created: `metadata` with title + `robots: { index: false, follow: true }` | Both reset-password pages inherited indexable defaults (§4.5-1) | Reset-password pages only |
| `app/api/projects/[id]/subcontractors/route.ts` | Created: POST link / DELETE unlink (same-org checks, 409 duplicate, 404 never-linked, audit event) | Project Gate had no API to create `project_subcontractors` rows (§4.2) | New route; project detail + gate evaluation |
| `lib/features/billing/billing.test.ts` | Created: 15 tests (grace mode, enforcement, webhook dispatch) | Tests for every logic change (§6/§8) | Tests only |
| `lib/features/inspection-workflow/README.md` | Created: documents the fail→correction flow | New feature folder (§4.4) | Docs only |
| `lib/features/inspection-workflow/index.test.ts` | Created: 10 tests (final status, reinspection derivation, allow-list) | Tests for the extracted logic | Tests only |
| `lib/features/inspection-workflow/index.ts` | Created: `applyInspectionFailUpdate` / `computeFinalStatus` / `reinspectionDueDate` moved out of the inspections route | Registry entry had no folder; logic lived in the route (§4.4c/e) | Inspections PATCH only |
| `lib/features/project-gate/project-gate.test.ts` | Created: 5 tests (`parseLinkBody`, `expiredItems`) | Tests for the new linking validation | Tests only |
| `lib/features/registry.test.ts` | Created: 8 tests (`isFeatureEnabled`, `requireFeatureEnabled`, no duplicate ids, new entries) | Tests for the enforcement helper (§5) | Tests only |
| `lib/platform-admin.test.ts` | Created: 5 tests (env allow-list parsing, fail-closed) | Tests for the blog admin check | Tests only |
| `lib/shared/README.md` | Created: documents the shared modules and their provenance | New shared home needs documentation (§5) | Docs only |
| `lib/shared/dates.test.ts` | Created: 7 tests (round-trip, `daysUntil` cross-check vs `permit-status.ts`, `applyByDate`) | Tests for deduplicated helpers | Tests only |
| `lib/shared/dates.ts` | Created: `parseDate`, `toDateString`, `daysUntil` (local-noon), `applyByDate` (renewal − processing − 7) | Deduplicates helpers copied across 3 features (§4.4b) | smart-buffer, timeline-calculator, compliance-passport |
| `lib/shared/fine-schedules.ts` | Created: `FINES` moved verbatim from `FineStats.tsx` | Features imported fine data from a React component file (§4.4a2) | fee-calculator, risk-report, FineStats |
| `lib/shared/jurisdiction-data.ts` | Created: `REGULATION_DATA` + `getRegulation` + `hasRegulationContent` moved verbatim from `app/(public)/ahj/_regulations.ts`; includes the 2026-11-24 corrections (LA 730, SA/JAX/IND sources + IND 365) | Features imported regulation data from a public page file (§4.4a2); official-source corrections (§6.1) | AHJ pages, sitemap, smart-buffer, timeline/fee calculators, risk-report, cron |
| `lib/shared/jurisdiction.test.ts` | Created: 9 tests (`parseJurisdiction`, `getRegulation`, `hasRegulationContent`) | Tests for the shared data module | Tests only |
| `lib/shared/jurisdiction.ts` | Created: `parseJurisdiction` (single copy) | Deduplicates the helper copied in 2 features (§4.4b) | smart-buffer, risk-report |
| `supabase/migration-regulation-corrections-2026-11-24.sql` | Created: UPDATEs for LA/SA/JAX/IND regulation rows + `REPLACE()` updates to the validity-by-city blog post | Seeds use `ON CONFLICT DO NOTHING`, so corrections need a migration for live DBs (§6.1) | `jurisdiction_regulations` (4 rows), `blog_posts` (1 post) |

## Modified files

| Path | What changed | Why | Blast radius |
|---|---|---|---|
| `ARCHITECTURE.md` | Added registry-enforcement paragraph + shared-data paragraph | The documented disable procedure is now real (§4.4f) | Docs only |
| `CHANGELOG_MERGED.md` | Added "Corrections — 24 November 2026" section + inline `[CORRECTED]` pointers; original claims kept, not deleted | Claims proven false/overstated must not stand (§6.4/§4.3) | Docs only |
| `app/(app)/projects/[id]/page.tsx` | Renders the new "Subcontractors on this project" section | Project Gate linking UI (§4.2) | Project detail page |
| `app/(app)/settings/page.tsx` | Added Billing card (plan + limits, "Upgrade / Manage billing" → `/pricing`); removed `SmsSettings` usage | No billing section existed; SMS toggle removed (§4.2) | Settings page |
| `app/(app)/settings/passport-settings.tsx` | `SmsSettings` toggle deleted entirely (comment explains why) | Toggle promised a feature that can never fire (§4.2) | Settings page |
| `app/(public)/_components/FineStats.tsx` | Imports `FINES` from `@/lib/shared/fine-schedules`; component otherwise identical | Data now lives in shared, not in a component file (§4.4a2) | Homepage/pricing fine stats |
| `app/(public)/_components/LandingPage.tsx` | "Every 5 days" → "with follow-ups until it's handled" (2 places) | Claim contradicted the cron (§4.5-17) | Homepage copy only |
| `app/(public)/about/page.tsx` | "Every 5 days" wording fixed; meta description trimmed to 148 chars; title brand suffix removed | §4.5-17, §4.5-3, §4.5-2 | About page |
| `app/(public)/ahj/[state]/[city]/page.tsx` | Visible FAQ section rendering `faqQuestions`; "Regulation data researched October 17, 2026" added; `hasRegulationContent` imported from shared (local duplicate deleted); title brand suffix removed | Schema-only FAQPage (§4.5-8); missing verification date (§4.1); dedup (§4.4b) | AHJ city pages |
| `app/(public)/ahj/[state]/page.tsx` | "Portal links last verified October 16, 2026" added; title brand suffix removed | Missing verification date (§4.1/§4.5-18); title doubling (§4.5-2) | AHJ state pages |
| `app/(public)/ahj/_regulations.ts` | Rewritten as a thin re-export shim (`export * from "@/lib/shared/jurisdiction-data"`) | Data moved to shared; existing imports keep working (§4.4a2) | All importers (unchanged behaviour) |
| `app/(public)/ahj/page.tsx` | Title brand suffix removed | Title doubling (§4.5-2) | AHJ hub |
| `app/(public)/blog/page.tsx` | Featured image `alt=""` → `alt={post.title}` | Alt text (§4.5-13) | Blog index |
| `app/(public)/building-permit/page.tsx` | New sourced "What skipping a permit can cost" section (FineStats figures + sources) + "Last updated November 24, 2026"; description trimmed to 145 chars | ENRICH verdict — guide had no verifiable figure (§4.1) | Building-permit guide |
| `app/(public)/certificate-of-occupancy/page.tsx` | "Last updated November 24, 2026" + `/tools` cross-link; description trimmed to 143 chars | ENRICH verdict (§4.1); orphaned from navigation (§4.5-7) | COO guide |
| `app/(public)/changelog/page.tsx` | Title brand suffix removed; description trimmed (139 chars, was already ≤160 — title only) | Title doubling (§4.5-2) | Changelog page |
| `app/(public)/faq/page.tsx` | "Every 5 days" wording fixed; title brand suffix removed | §4.5-17, §4.5-2 | FAQ page |
| `app/(public)/features/page.tsx` | "Every 5 days" wording fixed; description trimmed to 150 chars | §4.5-17, §4.5-3 | Features page |
| `app/(public)/glossary/page.tsx` | Title brand suffix removed; description trimmed to 158 chars | §4.5-2, §4.5-3 | Glossary page |
| `app/(public)/pricing/page.tsx` | Paid-tier CTAs now use `CheckoutButton` (POST to checkout); "every 5 days" wording fixed in the same file | No UI called checkout (§4.2); claim contradicted the cron (§4.5-17) | Pricing page |
| `app/(public)/privacy/page.tsx` | Title brand suffix removed | Title doubling (§4.5-2) | Privacy page |
| `app/(public)/templates/construction-permit-tracking-spreadsheet/page.tsx` | Visible numbered "How to use the template" list from `HOW_TO_JSON_LD.step` | HowTo was only partly visible in schema (§4.5-10) | Template page |
| `app/(public)/terms/page.tsx` | Title brand suffix removed | Title doubling (§4.5-2) | Terms page |
| `app/(public)/tools/_data/noise-shed.ts` | Chicago noise source → official MCC §8-32-140 (amlegal); dB limits re-attributed to §8-32-090; DC shed source → DCOZ ZC 20-19 Exhibit 12, `strictLessThan` true→false (≤50 sq ft), detail reworded | Third-party sources cited as official (§4.5-16); official sources found 2026-11-24 (§6.1) | Noise-ordinance + shed-permit-checker pages (Chicago, DC) |
| `app/(public)/tools/license-lookup/[state]/page.tsx` | "Lookup links verified October 20, 2026" rendered | Date existed only in a code comment (§4.1/§4.5-18) | License state pages |
| `app/(public)/tools/license-lookup/page.tsx` | Description trimmed to 152 chars | SERP truncation (§4.5-3) | License hub |
| `app/(public)/tools/page.tsx` | Title brand suffix removed; description trimmed to 151 chars (shed checker no longer listed, cut for length) | Title doubling + description length (§4.5-2/3) | Tools hub |
| `app/(public)/tools/permit-fee-calculator/page.tsx` | "Fine schedules verified October 17, 2026" rendered; description trimmed to 154 chars | Date existed only in a code comment (§4.1) | Fee calculator |
| `app/(public)/tools/permit-timeline-calculator/page.tsx` | Visible numbered "How it works" list from `HOWTO_JSON_LD.step`; description trimmed to 157 chars | HowTo was schema-only (§4.5-9) | Timeline calculator |
| `app/(public)/verified-sources/page.tsx` | Title brand suffix removed; description trimmed to 154 chars | Title doubling + description length (§4.5-2/3) | Verified-sources page |
| `app/api/auth/google-calendar/route.ts` | Local `getOrgId` deleted; uses shared `getActiveOrgId()` (now honours the active-org cookie) | Duplication (§4.3-14) | Google Calendar connect flow |
| `app/api/billing/checkout/route.ts` | `requireFeatureEnabled("billing")` guard at top of POST | Registry enforcement (§5) | Checkout route |
| `app/api/billing/webhook/route.ts` | Rewritten as a thin route: registry check → 501 without keys → **501 without `STRIPE_WEBHOOK_SECRET` (fail-closed, no unsigned parsing)** → signature verify → `handleWebhookEvent` | Webhook trusted unsigned payloads (§4.2); logic belonged in the feature (§4.4c) | Stripe webhook |
| `app/api/blog/[id]/route.ts` | PATCH/DELETE now require `isPlatformAdmin()` (401/403); GET unchanged | Changelog claim was false at the API layer (§4.3-2) | Blog admin API |
| `app/api/blog/route.ts` | POST now requires `isPlatformAdmin()` (401/403); GET unchanged | Same as above | Blog admin API |
| `app/api/calendar/sync/route.ts` | Local `getOrgId` deleted (POST); uses shared `getActiveOrgId()` | Duplication (§4.3-14) | Calendar sync |
| `app/api/cron/reminders/route.ts` | `requireFeatureEnabled("reminders")` guard at top of GET (503 before any cron auth/sending) | Registry enforcement (§5) | Reminder cron (VPS crontab) |
| `app/api/deadlines/route.ts` | Local `getOrgId` deleted; uses shared `getActiveOrgId()` | Duplication (§4.3-14) | Deadlines API |
| `app/api/documents/route.ts` | POST enforces documents plan limit via grace-mode helper **before** the storage upload | Limits unenforced (§4.2/§4.3-15) | Document upload |
| `app/api/export/route.ts` | Local `getOrgId` deleted; uses shared `getActiveOrgId()` | Duplication (§4.3-14) | CSV export |
| `app/api/inspections/route.ts` | PATCH thinned to call `applyInspectionFailUpdate` from the new feature folder; PATCH wires `requireFeatureEnabled("inspection-workflow")` | Logic lived in the route; registry entry had no folder (§4.4c/e) | Inspection fail workflow |
| `app/api/licenses/route.ts` | POST enforces licenses plan limit via grace-mode helper | Limits unenforced (§4.2/§4.3-15) | License creation |
| `app/api/organization/route.ts` | Local `getOrgId` deleted; PATCH refuses to *enable* the Compliance Passport (503) when that feature is disabled (other updates unaffected) | Duplication (§4.3-14); registry enforcement (§5) | Org settings / passport toggle |
| `app/api/organization/sample-data/route.ts` | DELETE wires `requireFeatureEnabled("onboarding-sample")` | Registry enforcement (§5) | Sample-data removal |
| `app/api/permits/import/route.ts` | POST enforces bulk permits limit (current + valid rows, whole-batch reject) via grace-mode helper; `requireFeatureEnabled("import")` guard added | Limits bypassed by CSV import (§4.2); registry guard was unwired | CSV import |
| `app/api/permits/route.ts` | POST enforces permits plan limit via grace-mode helper before insert | Limits unenforced (§4.2/§4.3-15) | Permit creation |
| `app/api/projects/route.ts` | POST enforces projects plan limit via grace-mode helper | Limits unenforced (§4.2/§4.3-15) | Project creation |
| `app/sitemap.ts` | Imports shared `hasRegulationContent`; local duplicate deleted; unused `RegulationData` import removed | Dedup (§4.4b) | Sitemap generation |
| `lib/features/billing/README.md` | Grace-mode rule, enforced-routes list, live team-invite lockout note, webhook section rewritten, `STRIPE_PUBLISHABLE_KEY` dropped | Behaviour changed; docs must match (§5) | Docs only |
| `lib/features/billing/index.ts` | Added `enforcePlanLimitWithGraceMode()`, `enforceBulkPlanLimitWithGraceMode()`, pure `wouldExceedLimit()`, `graceMode` flag; added `handleWebhookEvent()` (+ `planFromPrice`); corrected header (prices NOT in `lib/plans.ts`) | Limits enforcement + webhook delegation + fail-closed (§4.2/§4.4c) | Billing, checkout, webhook, all POST routes |
| `lib/features/compliance-passport/README.md` | Shared `daysUntil` note; registry-enforcement note for PATCH /api/organization | Behaviour changed (§5) | Docs only |
| `lib/features/compliance-passport/index.ts` | Local `daysUntil` (local-midnight + `Math.ceil`) deleted; uses shared `daysUntil` (local-noon + `Math.round`) | Dedup (§4.4b) | Passport page dates |
| `lib/features/fee-calculator/README.md` | Fine/extension-fee sources now `lib/shared/fine-schedules.ts` / `lib/shared/jurisdiction-data.ts` | Data moved (§4.4a2) | Docs only |
| `lib/features/fee-calculator/index.ts` | `FINES` from `@/lib/shared/fine-schedules`; `REGULATION_DATA` from `@/lib/shared/jurisdiction-data` | Inverted dependency fixed (§4.4a2) | Fee calculator |
| `lib/features/import/README.md` | Registry entry + guard note | Entry added (§4.4e) | Docs only |
| `lib/features/project-gate/README.md` | Documents the complete linking flow (API + UI + validation) | Linking built (§4.2) | Docs only |
| `lib/features/project-gate/index.ts` | Added pure tested `parseLinkBody()`; header comment corrected (linking is no longer "a follow-up") | Linking built (§4.2) | Project Gate evaluation |
| `lib/features/registry.ts` | Added `isFeatureEnabled()`, `FeatureDisabledError` (503), `requireFeatureEnabled()`; `sms-escalation` set to `enabled: false`; added `reminders` + `import` entries; corrected 9 inaccurate entries (tables/env/routes); added `notes` field | Registry was decorative (§4.4f/d/e) | Every route that checks a flag; SMS disabled |
| `lib/features/reminders/README.md` | Registry entry + 503 note | Entry added (§4.4e) | Docs only |
| `lib/features/risk-report/README.md` | Fine source now shared; `parseJurisdiction` shared note | Data moved (§4.4a2) | Docs only |
| `lib/features/risk-report/index.ts` | `FINES` + `getRegulation` + `parseJurisdiction` from shared; local `parseJurisdiction` deleted | Inverted dependency + dedup (§4.4a2/b) | Risk report |
| `lib/features/smart-buffer/README.md` | Data source now shared; shared `applyByDate` note; corrected stale timeline-calculator line | Data moved (§4.4a2) | Docs only |
| `lib/features/smart-buffer/index.ts` | Imports regulation data + `applyByDate`/`daysUntil`/`parseDate`/`toDateString`/`parseJurisdiction` from shared; local copies deleted; re-exports helpers for compatibility | Inverted dependency + dedup (§4.4a2/b) | Permit detail + dashboard smart-buffer |
| `lib/features/sms-escalation/README.md` | States DISABLED pending Twilio keys, phone storage, ACK handling; notes toggle removal + registry flag | Feature disabled (§6.3) | Docs only |
| `lib/features/timeline-calculator/README.md` | Source/shared-helper updates | Data moved (§4.4a2) | Docs only |
| `lib/features/timeline-calculator/index.ts` | Imports `REGULATION_DATA` from shared; local `parseDate`/`toDateString`/`applyByFor` deleted, uses shared `parseDate`/`toDateString`/`applyByDate` | Inverted dependency + dedup (§4.4a2/b) | Timeline calculator |
| `public/blog/ahj-guide-1.webp` | Recompressed 101,862 → 83,892 bytes (same dimensions) | Over a strict 100,000-byte limit (§4.5-14) | Blog post images |
| `public/blog/assessors-parcel-number-guide-2.webp` | Recompressed 101,746 → 97,236 bytes (same dimensions) | Same as above | Blog post images |
| `public/blog/certificate-of-occupancy-guide-3.webp` | Recompressed 100,652 → 99,138 bytes (same dimensions) | Same as above | Blog post images |
| `public/blog/florida-permit-1.webp` | Recompressed 100,108 → 96,964 bytes (same dimensions) | Same as above | Blog post images |
| `public/blog/permit-renewal-2.webp` | Recompressed 100,854 → 99,762 bytes (same dimensions) | Same as above | Blog post images |
| `public/blog/permit-types-explained-1.webp` | Recompressed 101,404 → 99,816 bytes (same dimensions) | Same as above | Blog post images |
| `public/blog/what-is-ahj-construction-1.webp` | Recompressed 100,368 → 96,050 bytes (same dimensions) | Same as above | Blog post images |
| `supabase/seed-blog-posts-batch3.sql` | Validity-by-city post corrected: LA row (730 days + extension), SA row (extensions), IND row (365 days), "ten" → "nine", "four varies" → "three varies", extension summary | LA figure was wrong; SA/IND extension processes now verified (§6.1) | 1 blog post (fresh DBs) |
| `supabase/seed-jurisdiction-regulations.sql` | LA (730 + extension + LAMC source), SA (sa.gov source + extension process), JAX (jacksonville.gov source), IND (365 + extension + City form source); header PARTIAL list updated | Official-source corrections (§6.1) | Fresh DBs (ON CONFLICT DO NOTHING — live DBs need the migration) |

## Files deliberately NOT changed

- `lib/plans.ts` — prices and plan limits unchanged (brief §7). The free `maxTeamMembers = 1` live lockout is flagged for the owner instead.
- `design-preview/` — mockup only, untouched.
- `app/sitemap.ts` membership for `/signin` — not changed (owner decision needed, §7-1).
- Slugs/URLs — none changed (Maryland county collision flagged, §7-2).
- `lib/permit-status.ts` — behaviour unchanged (shared `daysUntil` cross-checked against it instead).
- `app/api/team/route.ts` — still calls `enforcePlanLimit()` directly (pre-existing unconditional enforcement; deliberately left unchanged so the live team-invite lockout stays visible as a pricing decision).
- `app/robots.ts` — `/signin` allow entry left as is (harmless; touches the open `/signin` question).
