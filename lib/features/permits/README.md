# Permits

Core permit CRUD (the heart of Permit Warden).

## Purpose

- `index.ts` — `listPermits`, `createPermit`, `updatePermit`,
  `deletePermit`, moved verbatim from `app/api/permits/route.ts`
  (pass 2 modularity). The route is now thin: auth/org resolution,
  then one feature call.
- `validatePermitCreate` — create-body validation (required
  `permit_type`, date checks, `source_type` enum).
- `sanitizeCustomFields` — the custom-fields sanitiser, previously
  duplicated in POST and PATCH (AUDIT_REPORT.md §4.4(b)); now one
  helper used by both.

## Behaviour (unchanged)

- Plan-limit enforcement in grace mode via
  `lib/features/billing` (402 + `upgrade: true` when over limit).
- Status is (re)computed from dates with
  `lib/shared/permit-status` `calculatePermitStatus`.
- Deadline rows are kept in sync via `syncDeadline`
  (idempotent with the DB triggers).
- Every write inserts an `audit_events` row.
- Cross-tenant FK checks: a permit's project must belong to the org
  (403 otherwise).

## Routes

- `GET /api/permits`, `POST /api/permits`, `PATCH /api/permits`,
  `DELETE /api/permits`

## Tables

- `permits`, `projects` (read, FK check), `deadlines`, `audit_events`

## Env

- None directly (plan limits via Stripe keys, see `billing`).

## Registry

Entry `permits` in `lib/features/registry.ts`.
