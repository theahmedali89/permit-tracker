// Inspections — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/inspections/route.ts`: the route is now
// thin (auth/org resolution + one feature call). Behaviour is identical:
// same validation, same cross-tenant FK checks, same deadline syncs,
// same audit events. The PATCH fail → correction derivation lives in
// `./fail-workflow.ts` (moved here from `lib/features/inspection-workflow`
// so this module needs no cross-feature import); the feature-flag check
// for `inspection-workflow` stays in the route's PATCH handler.

import { verifyParentOrg } from "@/lib/shared/org-context";
import {
  enumValue,
  optionalDate,
  optionalString,
  parsePagination,
  requireString,
} from "@/lib/shared/validate";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { syncDeadline } from "@/lib/features/reminders/sync-deadlines";
import { applyInspectionFailUpdate } from "@/lib/features/inspections/fail-workflow";

export const INSPECTION_STATUSES = [
  "not_scheduled",
  "scheduled",
  "passed",
  "failed",
  "follow_up_required",
  "completed",
] as const;

export function validateInspectionCreate(body: Record<string, unknown>): Record<string, string | null> {
  return {
    project_id: optionalString(body.project_id, "project_id", 100),
    permit_id: optionalString(body.permit_id, "permit_id", 100),
    inspection_type: requireString(body.inspection_type, "inspection_type", 200),
    requested_date: optionalDate(body.requested_date, "requested_date"),
    scheduled_date: optionalDate(body.scheduled_date, "scheduled_date"),
    inspector_name: optionalString(body.inspector_name, "inspector_name", 200),
    notes: optionalString(body.notes, "notes", 5000),
  };
}

function invalidInput(err: unknown): ApiError {
  return new ApiError(400, err instanceof Error ? err.message : "Invalid input");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listInspections(supabase: any, orgId: string, searchParams: URLSearchParams): Promise<FeatureResult> {
  const { from, to } = parsePagination(searchParams);
  const { data, error } = await supabase
    .from("inspections")
    .select("*, projects(name), permits(permit_type)")
    .eq("organization_id", orgId)
    .order("scheduled_date", { ascending: true })
    .range(from, to);
  if (error) throw new ApiError(500, error.message);
  return result(200, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createInspection(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  let validated: Record<string, string | null>;
  try {
    validated = validateInspectionCreate(body as Record<string, unknown>);
  } catch (err) {
    throw invalidInput(err);
  }

  // Cross-tenant FK checks: project / permit must belong to this org.
  if (validated.project_id) {
    const ok = await verifyParentOrg(supabase, "projects", validated.project_id, orgId);
    if (!ok) throw new ApiError(403, "Project not found in this organization");
  }
  if (validated.permit_id) {
    const ok = await verifyParentOrg(supabase, "permits", validated.permit_id, orgId);
    if (!ok) throw new ApiError(403, "Permit not found in this organization");
  }

  const { data, error } = await supabase
    .from("inspections")
    .insert({
      organization_id: orgId,
      project_id: validated.project_id,
      permit_id: validated.permit_id,
      inspection_type: validated.inspection_type,
      requested_date: validated.requested_date,
      scheduled_date: validated.scheduled_date,
      inspector_name: validated.inspector_name,
      notes: validated.notes,
      status: validated.scheduled_date ? "scheduled" : "not_scheduled",
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "inspection",
    resource_id: data.id,
    deadline_type: "inspection",
    due_date: validated.scheduled_date,
  });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "inspection.created",
    entity_type: "inspection",
    entity_id: data.id,
  });

  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateInspection(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  const { id, status, correction_notes, reinspection_date, ...updates } = body as Record<string, unknown>;
  if (!id || typeof id !== "string") throw new ApiError(400, "Inspection ID required");

  const { data: existing } = await supabase
    .from("inspections")
    .select("id, scheduled_date, status")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();
  if (!existing) throw new ApiError(404, "Inspection not found");

  try {
    if (updates.inspection_type !== undefined) requireString(updates.inspection_type, "inspection_type", 200);
    if (updates.scheduled_date !== undefined) optionalDate(updates.scheduled_date, "scheduled_date");
    if (reinspection_date !== undefined) optionalDate(reinspection_date, "reinspection_date");
    if (status !== undefined) enumValue(status, INSPECTION_STATUSES, "status");
    for (const f of ["inspector_name", "notes", "correction_notes"]) {
      const v = f === "correction_notes" ? correction_notes : updates[f];
      if (v !== undefined) optionalString(v, f, 5000);
    }
  } catch (err) {
    throw invalidInput(err);
  }

  // Cross-tenant FK checks when project / permit are reassigned.
  if (typeof updates.project_id === "string" && updates.project_id) {
    const ok = await verifyParentOrg(supabase, "projects", updates.project_id, orgId);
    if (!ok) throw new ApiError(403, "Project not found in this organization");
  }
  if (typeof updates.permit_id === "string" && updates.permit_id) {
    const ok = await verifyParentOrg(supabase, "permits", updates.permit_id, orgId);
    if (!ok) throw new ApiError(403, "Permit not found in this organization");
  }

  // Fail → correction logic lives in the feature module (field
  // allow-list, final status, reinspection deadline derivation).
  const allUpdates: Record<string, unknown> = { ...updates, status, correction_notes, reinspection_date };
  const patch = applyInspectionFailUpdate(existing, allUpdates);
  const filtered = patch.filtered;

  const { data, error } = await supabase
    .from("inspections")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  // Keep deadlines in sync (idempotent with the DB triggers).
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "inspection",
    resource_id: id,
    deadline_type: "inspection",
    due_date: patch.newScheduledDate,
  });
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "inspection",
    resource_id: id,
    deadline_type: "reinspection",
    due_date: patch.reinspectionDueDate,
  });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: `inspection.${status || "updated"}`,
    entity_type: "inspection",
    entity_id: id,
  });

  return result(200, data);
}
