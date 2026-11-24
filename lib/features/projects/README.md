# Projects

Core project CRUD.

## Purpose

- `index.ts` — `listProjects`, `createProject`, `updateProject`,
  moved verbatim from `app/api/projects/route.ts` (pass 2 modularity).
  The route is now thin: auth/org resolution, then one feature call.
- `validateProjectCreate` — create-body validation (status defaults
  to `active`).

## Behaviour (unchanged)

- Plan-limit enforcement in grace mode via `lib/features/billing`
  (402 + `upgrade: true` when over limit).
- Every write inserts an `audit_events` row.

## Routes

- `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects`

## Tables

- `projects`, `audit_events`

## Registry

Entry `projects` in `lib/features/registry.ts`.
