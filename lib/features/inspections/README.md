# Inspections

Core inspection CRUD.

## Purpose

- `index.ts` — `listInspections`, `createInspection`,
  `updateInspection`, moved verbatim from `app/api/inspections/route.ts`
  (pass 2 modularity). The route is now thin: auth/org resolution,
  then one feature call.
- `fail-workflow.ts` — the fail → correction → reinspection derivation
  (`applyInspectionFailUpdate` et al.), moved here from
  `lib/features/inspection-workflow` so this module needs no
  cross-feature import. `inspection-workflow/index.ts` is now a thin
  re-export shim; its registry entry, README and tests are unchanged.

## Behaviour (unchanged)

- Cross-tenant FK checks: project / permit must belong to the org
  (403 otherwise).
- New inspections are `scheduled` when a `scheduled_date` is given,
  else `not_scheduled`.
- PATCH keeps deadlines in sync (inspection + reinspection) and logs
  `inspection.<status>` audit events. The PATCH route still checks the
  `inspection-workflow` feature flag first (503 when disabled).

## Routes

- `GET /api/inspections`, `POST /api/inspections`,
  `PATCH /api/inspections`

## Tables

- `inspections`, `deadlines`, `audit_events`

## Registry

Entry `inspections` in `lib/features/registry.ts` (plus the pre-existing
`inspection-workflow` entry, which the PATCH route enforces).
