# Project Gate

Stop-work risk alert: if a subcontractor linked to a project has an
expired license or COI, the project page shows a red banner naming the
sub and what expired.

## How linking works

The repo previously had **no project ↔ subcontractor link** — subs were
org-wide only. This feature adds the join table:

```sql
project_subcontractors (organization_id, project_id, subcontractor_id)
-- unique (project_id, subcontractor_id)
```

added by `supabase/migration-compliance-passport.sql` (with RLS). The
gate only evaluates **linked** subs, so an unrelated project's subs
never trigger a false alarm.

### Linking flow (2026-11-24 — complete)

- **API:** `POST /api/projects/[id]/subcontractors`
  (`{ subcontractor_id }`) links a sub; `DELETE` on the same route
  (same body, or `?subcontractor_id=`) unlinks. Both handlers verify
  the project AND the subcontractor belong to the caller's org
  (`verifyParentOrg` / `getActiveOrgId`) — a cross-org link attempt
  gets 403. Linking an already-linked sub returns 409; unlinking a
  sub that was never linked returns 404. Linking writes an audit event
  (`project.subcontractor_linked`).
- **UI:** `app/(app)/projects/[id]/page.tsx` has a "Subcontractors on
  this project" section (`./subcontractor-links.tsx`, client component)
  listing linked subs with Unlink buttons and a dropdown to link any
  other org subcontractor. When nothing is linked it shows
  "No subcontractors linked yet — link one to enable the stop-work
  check", so an empty gate is distinguishable from a safe project.
- **Validation:** `parseLinkBody()` in `index.ts` (pure, unit-tested)
  validates the link/unlink body — `subcontractor_id` required.

## API

- `evaluateProjectGate(supabase, orgId, projectId)` →
  `{ atRisk, risks: [{ subcontractorId, name, trade, expiredItems }], checked }`.
  Fails open (not at-risk) when the table has no rows or the migration
  has not run yet — it never breaks the project page.
- `expiredItems(sub, docs)` — human-readable list of expired license /
  COI dates (legacy fields + uploaded documents).
- Compliance itself reuses `lib/subcontractor-compliance.ts`
  (`complianceStatus`).

## Where it is surfaced

`app/(app)/projects/[id]/page.tsx` — red "Stop-work risk" banner above
the project details when `atRisk` is true.
