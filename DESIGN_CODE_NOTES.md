# Permit Warden — Merged Design as Real Next.js Code

The approved merged preview (`permit-warden-complete.html`, 66 KB
fixed version) built as real project code. The user confirmed:
"ab code bana do bss" — just build the code. This is that build.

## Base

Apply onto the **pass-2 tree** (v2 + audit-fix pass 1 + pass 2).
The zip contains ONLY the files created/changed here (23 files +
this note), with repo-relative paths, zip root = repo root.

```bash
# from the project root, with the pass-2 tree in place:
unzip -o permit-warden-design-code.zip
```

No migrations, no new env vars, no new dependencies.

## What changed per file

### New feature — `lib/features/landing-redesign/` (13 files)

One feature folder per `ARCHITECTURE.md` (logic + tests + README),
registry entry `landing-redesign` added in `lib/features/registry.ts`.

| File | What it is |
| --- | --- |
| `README.md` | Feature docs, routes/tables/env, data rules |
| `index.ts` | Barrel — pages import from here only |
| `lib.ts` | Pure logic: pipeline stages, journey steps, monthly bar totals, compliance tone |
| `landing-redesign.test.ts` | 12 tests for `lib.ts` |
| `landing-redesign.module.css` | 3D scene + login-art styles (CSS Modules, no global CSS) |
| `components/ThemeToggle.tsx` | Icon-only white circular day/night button (blue sun/moon, no text, no yellow) wired to the existing `ThemeProvider` |
| `components/HeroScene.tsx` | Merged 3D hero: skyline (back) + orbit (middle) + permit deck (front); one mousemove parallax handler (lerped rAF); disabled under `prefers-reduced-motion` / coarse pointers |
| `components/DashboardMockup.tsx` | High-contrast glass mockup (same sample data as before, stronger glass, vivid solid pills) |
| `components/ComplianceDial.tsx` | Conic-gradient score dial |
| `components/DashboardBento.tsx` | Bento grid — props-driven, real data only |
| `components/PipelineStages.tsx` | 4-stage pipeline — props-driven |
| `components/JourneyTimeline.tsx` | Permit journey — props-driven |
| `components/LoginArt.tsx` | Mini orbit + skyline motif for the sign-in brand panel |

### Thin page edits (10 files)

| File | Change |
| --- | --- |
| `app/(public)/_components/LandingPage.tsx` | Header gains `ThemeToggle`; hero gains `HeroScene` below the copy/mockup grid; local `DashboardMockup` replaced by the feature one. All copy, CTAs, FineStats, How/Features/FAQ/CTA/footer unchanged |
| `app/(app)/dashboard/page.tsx` | New sections after the stat cards: `DashboardBento`, `PipelineStages`, `JourneyTimeline` (assembled from `getDashboardData()` + `smartBufferForPermit()`). The old "Requires attention", "Upcoming deadlines" and "Renewal forecast" sections were removed because their content now lives in the bento cards — nothing is duplicated or lost. Stat cards, quick actions, donut chart, recent activity, documents note unchanged |
| `app/(public)/signin/page.tsx` | Heading/copy from the preview ("Sign in to your dashboard"), mail icon in the email input, lock icon on the password field, `eyebrow="Secure sign in"`. Form action (`/auth/signin`), validation and redirects unchanged |
| `app/(public)/signin/password-field.tsx` | Optional `lockIcon` prop (sign-in only; signup unaffected) |
| `components/auth-layout.tsx` | Gradient top border on the form card, optional `eyebrow` pill, `LoginArt` in the brand panel, trust line ("186 AHJ portals · All 50 states") |
| `components/app-shell.tsx` | Sidebar theme `<select>` replaced by `ThemeToggle` (Appearance row); sign-out unchanged |
| `lib/features/registry.ts` | Added `landing-redesign` entry (routes `/`, `/dashboard`, `/signin`; no tables; no env keys) |
| `lib/features/dashboard/index.ts` | Additive-only extension for the pipeline/journey: status query also selects `permit_type`/`permit_number`/`jurisdiction`/`expiration_date`/`created_at`; `actionItems` carries `created_at`; `upcoming` carries `resource_id`; head-count `inspectionCount`; new pure helper `pickStageExamples()` |
| `lib/features/dashboard/index.test.ts` | 3 tests for `pickStageExamples()` |
| `lib/features/dashboard/README.md` | Documents the extension |

## What is wired to real data vs presentational

**Real data (live from Supabase via the existing dashboard queries):**
dashboard bento (compliance %, expiring permits with apply-by dates,
smart buffer, renewals-by-month, next inspections), pipeline counts
and examples, journey steps for the most urgent permit.

**Presentational (same precedent as the original hero mockup):**
the hero 3D scene's orbit chips and deck cards, and the hero glass
mockup, carry the preview's illustrative sample content — they are
aria-hidden and are not live data.

## Honest differences from the preview (deliberate)

1. **Pipeline stage 4 is "Renewal due", not "Done".** The codebase
   has no completed/closed permit status, so "Done" would be
   invented. Stage 4 = expiring soon + expired.
2. **Journey "Complete" is never marked done**, for the same reason.
   Steps with no backing date say so instead of inventing one.
3. **No "Continue with Google" button.** The app has no Google OAuth
   wiring; a dead button would be a useless feature. Add it only if
   Google OAuth is ever wired.
4. **No "Remember me" checkbox.** There is no remember-me backend;
   a checkbox that does nothing would be fake.
5. **Login-art chips use generic honest copy** ("Reminders before
   every deadline", "Apply-by dates built in"), not the preview's
   sample "2 permits expiring soon" line — that would present
   invented specifics as fact on a logged-out page.
6. **No "186 portals" change, no slug/URL/pricing/plan-limit change,
   no Stripe/Twilio change.** The 5 pending owner decisions were
   not touched.
7. **Deck-card fix:** in the preview the float animation overrode
   the 3D fan transforms; here the fan transform lives on a wrapper
   and the float animation on the inner card, so both work.

## Verification (all run in the working tree)

- `npx tsc --noEmit`: **PASS** (zero errors)
- `npm run test`: **PASS — 188 tests, 27 files** (baseline 173/26;
  +12 landing-redesign tests, +3 dashboard `pickStageExamples` tests)
- `npm run build` (placeholder Supabase env): **PASS — compiled
  successfully in 67s, 169/169 static pages in 51s** (run twice).
  The `fetch failed / SocketError` line during prerender is the
  unreachable placeholder Supabase host — expected with placeholder
  env; DB-backed pages prerender empty in the sandbox.
- No-env build: **fails fast in ~1.3s** with a clear error naming
  the missing vars (pass-2 fix still intact).

## Deploy (Contabo VPS — PM2 `permitwarden`, port 3002)

```bash
# on the VPS, in /root/permit-tracker (after applying this zip):
npm install          # only if package.json changed — it did not
npm run build        # with REAL env vars from .env (Supabase URL/keys)
pm2 delete permitwarden || true
pm2 start npm --name permitwarden -- start -- -p 3002
pm2 save
```

**A VPS build with real env is still mandatory before deploy** —
the sandbox build used placeholder env and cannot prove the
DB-backed pages render real data. No migrations to run for this
change (no schema changes). Rollback: restore the previous build
folder and `pm2` fresh start, as in `DEPLOY_NOTES.md` from pass 1.

## Remaining gaps / owner still owes

- The 5 pending owner decisions (Maryland slugs, `/signin`
  sitemap, free team limit, `verified_at` backfill, "186" copy)
  are untouched — deploy still needs decision #1 at minimum.
- Oklahoma City is still thin (noindex); Indianapolis §536-213
  still awaits a direct Municode check (HTTP 403 in pass 2).
- The design goes live only after this code is deployed — the
  standalone `design-preview/permit-warden-complete.html` is a
  mockup and is not served by Next.js.
