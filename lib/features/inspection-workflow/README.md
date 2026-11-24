# Inspection Fail → Correction Workflow

When an inspection fails, the correction loop is: fail → correction notes
→ reinspection date → reinspection deadline tracked until it passes.

## Logic

> Pass 2 note: the implementation moved into the `inspections` core
> feature folder (`lib/features/inspections/fail-workflow.ts`) so the
> inspections CRUD module can use it without a cross-feature import.
> `lib/features/inspection-workflow/index.ts` is now a thin re-export
> shim; this README, the registry entry and the tests are unchanged.

`lib/features/inspections/fail-workflow.ts` (pure, unit-tested) — extracted
from `PATCH /api/inspections` so the route stays thin:

- `applyInspectionFailUpdate(existing, allUpdates)` — filters the PATCH
  body to the allow-listed fields (`inspection_type`, `scheduled_date`,
  `inspector_name`, `notes`, `project_id`, `permit_id`, `status`,
  `correction_notes`, `reinspection_date`; falsy values coerced to
  `null`) and derives:
  - `finalStatus` — patched status, or the existing status when the
    PATCH does not set one.
  - `newScheduledDate` — patched scheduled date, or the existing one.
  - `reinspectionDueDate` — the request's `reinspection_date` when the
    final status is `"failed"`, otherwise `null` (clears the
    reinspection deadline).
- `computeFinalStatus(patchedStatus, existingStatus)` and
  `reinspectionDueDate(finalStatus, reinspectionDate)` — the two
  derivations on their own.

## Route

`PATCH /api/inspections` — auth, org scoping, input validation and the
cross-tenant project/permit checks stay in the route; it calls
`applyInspectionFailUpdate`, runs the Supabase update, then makes the
same two `syncDeadline` calls as before (inspection deadline with
`newScheduledDate`, reinspection deadline with `reinspectionDueDate`)
and the audit insert.

## Registry

Entry `inspection-workflow` in `lib/features/registry.ts`. Tables:
`inspections`, `deadlines` — the workflow never touches `documents`.
The route checks the registry flag first: when the feature is disabled
it answers 503.

## Tests

`lib/features/inspection-workflow/index.test.ts`
