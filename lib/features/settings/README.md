# Settings

Organization settings (the mutation behind the Settings page).

## Purpose

- `index.ts` — `updateOrganization`, moved verbatim from
  `app/api/organization/route.ts` (PATCH, pass 2 modularity). The route
  is now thin: auth/org resolution, then one feature call.
- `buildOrganizationUpdates` — allow-listed text fields + boolean
  toggles (pure, unit-tested).

## Behaviour (unchanged)

- Company name is required only when it is being changed; empty update
  → 400 "Nothing to update".
- Enabling the Compliance Passport generates the public slug
  server-side (once — an existing slug is kept), with one retry on slug
  collision. The registry guard is scoped to that branch only: when
  `compliance-passport` is disabled, enabling it here is refused (503)
  while other org fields are unaffected.
- Every update inserts an `audit_events` row.

## Routes

- `PATCH /api/organization`

## Tables

- `organizations`, `audit_events`

## Registry

Entry `settings` in `lib/features/registry.ts`.
