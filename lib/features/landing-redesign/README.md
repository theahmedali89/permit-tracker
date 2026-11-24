# Landing redesign

Merged 3D hero + bento dashboard + modern sign-in, built from the
approved merged preview (`permit-warden-complete.html`, 66 KB fixed
version) as real project code — no demo pages, no new dependencies,
no images, no webfonts.

## What it is

- **Hero:** one CSS-only 3D scene — city skyline (back layer),
  deadline orbit with permit chips around a 92% compliance dial
  (middle), fanned permit deck (front) — plus the high-contrast
  glass dashboard mockup. One mousemove handler tilts the scene
  (lerped via `requestAnimationFrame`); disabled under
  `prefers-reduced-motion` and for coarse pointers. The orbit chips
  and deck cards are the preview's illustrative sample content (same
  precedent as the original `DashboardMockup`) — they are **not**
  live data, and the scene is `aria-hidden`.
- **Dashboard:** bento grid (compliance dial, expiring soon with
  apply-by dates + smart renewal buffer, renewals-by-month bars,
  next inspections), 4-stage pipeline, permit journey timeline —
  all wired to the real data the dashboard page already loads.
- **Sign-in:** modern card (gradient top border, "Secure sign in"
  eyebrow, mail/lock icons, gradient button, trust line) and the
  brand panel gains the mini orbit + skyline motif. Auth logic
  untouched.
- **Theme toggle:** icon-only white circular button with a blue
  sun/moon icon (no text, no yellow), wired to the existing
  `ThemeProvider`. Used in the landing header and the app sidebar.

## Routes / tables / env keys

- Routes: `/` (hero), `/dashboard`, `/signin`
- Tables: none (reads the dashboard feature's data; writes nothing)
- Env keys: none

## Files

```
lib/features/landing-redesign/
  README.md                         — this file
  index.ts                          — barrel (pages import from here)
  lib.ts                            — pure mapping logic (pipeline,
                                      journey, bar totals, dial tone)
  landing-redesign.test.ts          — tests for lib.ts
  landing-redesign.module.css       — 3D scene + login art styles
  components/
    ThemeToggle.tsx                 — icon-only day/night button
    HeroScene.tsx                   — merged 3D scene + parallax
    DashboardMockup.tsx             — high-contrast glass mockup
    ComplianceDial.tsx              — conic-gradient score dial
    DashboardBento.tsx              — bento grid (props-driven)
    PipelineStages.tsx              — 4-stage pipeline (props-driven)
    JourneyTimeline.tsx             — permit journey (props-driven)
    LoginArt.tsx                    — mini orbit/skyline for sign-in
```

## Data rules (honesty)

- The dashboard sections take **props** assembled by
  `app/(app)/dashboard/page.tsx` from `getDashboardData()` (dashboard
  feature) and `smartBufferForPermit()` (smart-buffer feature).
  This feature never imports another feature.
- The pipeline's 4th stage is honestly **"Renewal due"**
  (expiring soon + expired) — the codebase has no completed/closed
  permit status, so it is never labelled "Done".
- The journey's "Complete" step is never marked done for the same
  reason. Steps with no backing date say so instead of inventing one.
- The login art chips use generic honest copy, not the preview's
  sample "2 permits expiring soon" line (that would present invented
  specifics as fact on a logged-out page).
- No "Continue with Google" button: the app has no Google OAuth
  wiring, and a dead button would be a useless feature. If Google
  OAuth is ever added, the button belongs on the sign-in form then.

## Pages that use it (thin edits only)

- `app/(public)/_components/LandingPage.tsx` — hero scene +
  mockup + header toggle (copy, CTAs, FineStats, sections unchanged)
- `app/(app)/dashboard/page.tsx` — bento + pipeline + journey
  sections (existing stat cards, quick actions, donut chart, recent
  activity kept; the old "Requires attention" / "Upcoming deadlines"
  lists and the "Renewal forecast" chart moved into the bento cards
  so nothing is duplicated)
- `app/(public)/signin/page.tsx` — heading/copy + input icons
  (form action, validation and redirects unchanged)
- `components/auth-layout.tsx` — gradient card border, optional
  eyebrow, login art in the brand panel
- `components/app-shell.tsx` — theme `<select>` replaced by
  `ThemeToggle` in the sidebar footer
- `lib/features/dashboard/index.ts` — additive-only data extension
  for the pipeline/journey (stage examples, inspection count,
  `created_at` / `resource_id` on existing selects; see its README)

## Verify

```bash
npx tsc --noEmit
npm run test        # landing-redesign.test.ts + dashboard tests
npm run build       # placeholder Supabase env in the sandbox;
                    # a VPS build with real env is still required
                    # before deploy
```
