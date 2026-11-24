# Licenses

Core license CRUD.

## Purpose

- `index.ts` — `listLicenses`, `createLicense`, `updateLicense`,
  moved verbatim from `app/api/licenses/route.ts` (pass 2 modularity).
  The route is now thin: auth/org resolution, then one feature call.
- `validateLicenseCreate` — create-body validation.

## Behaviour (unchanged)

- Plan-limit enforcement in grace mode via `lib/features/billing`
  (402 + `upgrade: true` when over limit).
- Status is (re)computed from dates with
  `lib/shared/permit-status` `calculatePermitStatus`.
- Deadline rows kept in sync via `syncDeadline` (idempotent with the
  DB triggers); every write inserts an `audit_events` row.
- PATCH refuses to blank the license name (400).

## Routes

- `GET /api/licenses`, `POST /api/licenses`, `PATCH /api/licenses`

## Tables

- `licenses`, `deadlines`, `audit_events`

## Registry

Entry `licenses` in `lib/features/registry.ts`.
