/**
 * Inspection fail → correction workflow (pure logic).
 *
 * Lives in the `inspections` feature folder (pass 2 modularity) so the
 * inspections CRUD module can use it without a cross-feature import —
 * features never import each other. `lib/features/inspection-workflow`
 * is a thin re-export shim for the same code (its registry entry and
 * tests are unchanged). Originally extracted from `PATCH /api/inspections`
 * (2026-11-24 modularity fix). Behaviour is unchanged:
 * same allowed fields, same `|| null` coercion of falsy values, same
 * status / correction_notes / reinspection_date handling, and the route
 * still makes the same `syncDeadline` calls with the values returned
 * here.
 *
 * Rules:
 * - Only the allow-listed fields may be updated.
 * - `finalStatus` is the patched status, or the inspection's existing
 *   status when the PATCH does not set one.
 * - The reinspection deadline is due ONLY when the final status is
 *   "failed", and then it is the `reinspection_date` from the request
 *   (null when the request omits it). Any other final status clears
 *   the reinspection deadline (due_date null).
 * - `newScheduledDate` is the patched scheduled date, or the existing
 *   one when the PATCH does not set it.
 */

export const INSPECTION_UPDATE_FIELDS = [
  "inspection_type",
  "scheduled_date",
  "inspector_name",
  "notes",
  "project_id",
  "permit_id",
  "status",
  "correction_notes",
  "reinspection_date",
] as const;

export interface InspectionExisting {
  id: string;
  status: string;
  scheduled_date: string | null;
}

export interface InspectionPatchResult {
  /** Fields to pass to the Supabase update (falsy values coerced to null, as before). */
  filtered: Record<string, unknown>;
  /** Effective status after the patch (patched value, else existing). */
  finalStatus: string;
  /** Effective scheduled date after the patch (patched value, else existing). */
  newScheduledDate: string | null;
  /**
   * Due date for the "reinspection" deadline sync: the request's
   * `reinspection_date` (or null) when the final status is "failed",
   * otherwise null (clears the deadline).
   */
  reinspectionDueDate: string | null;
}

/** Effective status after a patch: the patched value, else the existing one. */
export function computeFinalStatus(
  patchedStatus: unknown,
  existingStatus: string
): string {
  return (patchedStatus as string | undefined) ?? existingStatus;
}

/**
 * Reinspection deadline due date for the final status: the request's
 * `reinspection_date` when the inspection failed, otherwise null.
 * Note: the raw request value is used (not the `|| null`-coerced
 * filtered value), exactly as the route did before extraction — so an
 * empty-string `reinspection_date` on a failed inspection passes
 * through as "" rather than null.
 */
export function reinspectionDueDate(
  finalStatus: string,
  reinspectionDate: unknown
): string | null {
  return finalStatus === "failed" ? ((reinspectionDate as string | null) ?? null) : null;
}

/**
 * Apply a PATCH body to an existing inspection: filter to the allowed
 * fields and derive the values the route's `syncDeadline` calls need.
 * `allUpdates` is the merged body (`{ ...updates, status,
 * correction_notes, reinspection_date }`) — the same shape the route
 * built before extraction.
 */
export function applyInspectionFailUpdate(
  existing: InspectionExisting,
  allUpdates: Record<string, unknown>
): InspectionPatchResult {
  const filtered: Record<string, unknown> = {};
  for (const f of INSPECTION_UPDATE_FIELDS) {
    if (allUpdates[f] !== undefined) filtered[f] = allUpdates[f] || null;
  }

  const finalStatus = computeFinalStatus(filtered.status, existing.status);
  const newScheduledDate = (filtered.scheduled_date !== undefined
    ? filtered.scheduled_date
    : existing.scheduled_date) as string | null;
  return {
    filtered,
    finalStatus,
    newScheduledDate,
    reinspectionDueDate: reinspectionDueDate(finalStatus, allUpdates.reinspection_date),
  };
}
