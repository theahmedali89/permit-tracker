# Architecture — Permit Warden

## The modularity rule (core rule)

**One feature = one `lib/features/<feature>/` folder.**

Each feature folder owns its logic, its tests, and its README:

```
lib/features/<feature>/
  README.md        — what the feature does, its routes, tables, env keys
  <logic>.ts       — the feature's pure logic (no cross-feature imports)
  <logic>.test.ts  — tests for that logic
```

**Shared code lives ONLY in `lib/shared/`.** If two features need the same
helper, it goes in `lib/shared/` — it is never copied into a second feature
folder, and a feature never imports another feature's folder.

**Features never import each other.** A feature may import from
`lib/shared/` and from its own folder. If feature A needs something from
feature B, that something is either shared code (move it to `lib/shared/`)
or a route-level composition (do it in the page/API route, not in the
feature).

**API routes are thin.** A route handler validates input, resolves the
organization/user context, calls one feature function, and returns the
result. Business logic does not live in `app/api/`.

**The feature registry is the single list.** `lib/features/registry.ts`
lists every feature with `{ id, name, routes[], tables[], envKeys[],
enabled }`. If a feature is not in the registry, it does not exist as far
as the codebase is concerned. New features add one entry; removed features
delete theirs.

**The `enabled` flag is enforced, not decorative.** `isFeatureEnabled(id)`
reads the registry entry (unknown ids default to enabled, so existing
unregistered code keeps working) and `requireFeatureEnabled(id)` throws a
`FeatureDisabledError` (HTTP 503) when the feature is disabled. Every
feature with an API route wires the guard into that route — checkout and
webhook check `billing`, the cron checks `reminders`, PATCH
`/api/inspections` checks `inspection-workflow`, DELETE
`/api/organization/sample-data` checks `onboarding-sample`, and the
passport-enable branch of PATCH `/api/organization` checks
`compliance-passport` (scoped to that branch so other org updates still
work). A disabled feature's route answers 503 and never runs its logic.
To disable a feature, set `enabled: false` on its entry — no route code
changes needed. (`sms-escalation` is disabled this way: the feature is
unwired — no cron caller, no phone storage.)

**Shared data lives in `lib/shared/`, not in page files.** The verified
regulation data (`REGULATION_DATA`, `getRegulation`,
`hasRegulationContent`) lives in `lib/shared/jurisdiction-data.ts` and
the fine schedules (`FINES`) in `lib/shared/fine-schedules.ts`; the old
locations under `app/(public)/` are thin re-export shims (regulations)
or import from shared (FineStats). Shared date/jurisdiction helpers
(`parseDate`, `toDateString`, `daysUntil`, `applyByDate`,
`parseJurisdiction`) live in `lib/shared/dates.ts` /
`lib/shared/jurisdiction.ts`. Features import from `lib/shared/` —
never from another feature and never from `app/(public)/`.

## How to add a feature

1. Create `lib/features/<feature>/` with a README, the logic, and tests.
2. Add one entry to `lib/features/registry.ts`.
3. Add the thin API route(s) and/or page(s) that call it — nothing else.
4. Add the migration (if it needs tables) under `supabase/` and list the
   tables in the registry entry.
5. Run `npx tsc --noEmit` and the full build; verify the new routes only.

## How to change one feature safely

1. Read that feature's `README.md` in `lib/features/<feature>/` first —
   it lists the feature's routes, tables, and env keys.
2. Read the registry entry for the feature. Note the routes and tables:
   those are the blast radius. Nothing outside that list should change.
3. Change only files inside `lib/features/<feature>/` plus the thin
   routes listed in its registry entry. Do not touch another feature's
   folder, and do not add shared code to the feature folder — new shared
   code goes in `lib/shared/`.
4. Run the feature's tests, then `npx tsc --noEmit`.
5. Verify only the feature's own routes (and the pages that link to them).

### Checklist before merging a feature change

- [ ] Only the feature's own folder + its listed routes changed
- [ ] No new import from another `lib/features/*` folder
- [ ] New shared helpers (if any) live in `lib/shared/`, not in the feature
- [ ] Registry entry updated (routes/tables/env keys) if any of those changed
- [ ] Feature README updated if behaviour changed
- [ ] `npx tsc --noEmit` passes

## How to disable / remove a feature

1. Set `enabled: false` on its entry in `lib/features/registry.ts`
   (one-liner; routes that check the registry stop serving it).
2. Delete `lib/features/<feature>/`.
3. Remove its routes (pages under `app/` and handlers under `app/api/`)
   and its registry entry.
4. Leave its tables in place until a migration drops them — never drop a
   table in the same change that removes the code that reads it.
5. Run `npx tsc --noEmit` and the full build.

## Public data & performance

Public SEO pages (AHJ directory, blog, sitemap) fetch data with the
cookie-free client in `lib/supabase/public.ts` — never the cookie client —
so they stay static/ISR instead of rendering dynamically on every request.
Pages keep `revalidate = 3600` where present.

AHJ city pages without verified regulation data are `noindex` and are
excluded from the sitemap (see `app/(public)/ahj/[state]/[city]/page.tsx`
and `app/sitemap.ts`). Regulation data is never invented: a field with no
verified source stays empty, and the page says so.
