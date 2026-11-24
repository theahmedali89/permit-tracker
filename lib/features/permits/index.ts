// Permits — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/permits/route.ts`: the route is now thin
// (auth/org resolution + one feature call). Behaviour is identical:
// same validation, same plan-limit grace-mode enforcement, same
// status recomputation, same deadline syncs, same audit events, same
// status codes and error strings.
//
// The custom-fields sanitisation loop used to be duplicated in POST and
// PATCH (flagged in AUDIT_REPORT.md §4.4(b)); it is now the single
// `sanitizeCustomFields` helper below, used by both.

import { calculatePermitStatus, type PermitStatus } from "@/lib/shared/permit-status";
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
import { enforcePlanLimitWithGraceMode } from "@/lib/features/billing";

export const PERMIT_STATUSES: readonly PermitStatus[] = [
  "pending",
  "active",
  "expiring_soon",
  "renewal_overdue",
  "expired",
  "renewal_required",
  "closed",
];

export interface PermitCreateInput {
  project_id: string | null;
  permit_type: string;
  permit_number: string | null;
  issuing_authority: string | null;
  jurisdiction: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  renewal_deadline: string | null;
  notes: string | null;
  source_type: string;
}

/**
 * Sanitize custom fields: plain string key-value object only.
 * Keys trimmed to 64 chars, values to 500 chars; non-string values
 * dropped. (Was duplicated in POST and PATCH of the old route.)
 */
export function sanitizeCustomFields(input: unknown): Record<string, string> {
  const clean: Record<string, string> = {};
  if (input && typeof input === "object" && !Array.isArray(input)) {
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof k === "string" && k.trim() && typeof v === "string") {
        clean[k.trim().slice(0, 64)] = v.slice(0, 500);
      }
    }
  }
  return clean;
}

export function validatePermitCreate(body: Record<string, unknown>): PermitCreateInput {
  const validated: PermitCreateInput = {
    project_id: optionalString(body.project_id, "project_id", 100),
    permit_type: requireString(body.permit_type, "permit_type", 200),
    permit_number: optionalString(body.permit_number, "permit_number", 200),
    issuing_authority: optionalString(body.issuing_authority, "issuing_authority", 200),
    jurisdiction: optionalString(body.jurisdiction, "jurisdiction", 500),
    issue_date: optionalDate(body.issue_date, "issue_date"),
    expiration_date: optionalDate(body.expiration_date, "expiration_date"),
    renewal_deadline: optionalDate(body.renewal_deadline, "renewal_deadline"),
    notes: optionalString(body.notes, "notes", 5000),
    source_type: optionalString(body.source_type, "source_type", 50) || "user_provided",
  };
  if (!["user_provided", "verified", "unverified", "outdated"].includes(validated.source_type)) {
    throw new Error("source_type must be one of: user_provided, verified, unverified, outdated");
  }
  return validated;
}

function invalidInput(err: unknown): ApiError {
  return new ApiError(400, err instanceof Error ? err.message : "Invalid input");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listPermits(supabase: any, orgId: string, searchParams: URLSearchParams): Promise<FeatureResult> {
  const { from, to } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const projectId = searchParams.get("project_id");
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  let query = supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", orgId)
    .order("expiration_date", { ascending: true })
    .range(from, to);

  if (id) query = query.eq("id", id);
  if (status) query = query.eq("status", status);
  if (projectId) query = query.eq("project_id", projectId);
  if (search) query = query.or(`permit_number.ilike.%${search}%,permit_type.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message);
  return result(200, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createPermit(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  const raw = body as Record<string, unknown>;
  let validated: PermitCreateInput;
  try {
    validated = validatePermitCreate(raw);
  } catch (err) {
    throw invalidInput(err);
  }

  // Cross-tenant FK check: the project must belong to this org.
  if (validated.project_id) {
    const ok = await verifyParentOrg(supabase, "projects", validated.project_id, orgId);
    if (!ok) throw new ApiError(403, "Project not found in this organization");
  }

  // Plan-limit enforcement (grace mode: enforced only when Stripe is
  // configured; without keys the write is allowed and a warning is
  // logged — see lib/features/billing).
  const planCheck = await enforcePlanLimitWithGraceMode(supabase, orgId, "permits");
  if (!planCheck.allowed) {
    throw new ApiError(402, planCheck.message, { upgrade: true });
  }

  const status = calculatePermitStatus(validated.expiration_date, validated.renewal_deadline);
  const cleanCustomFields = sanitizeCustomFields(raw.custom_fields);

  const { data, error } = await supabase
    .from("permits")
    .insert({
      organization_id: orgId,
      project_id: validated.project_id,
      permit_type: validated.permit_type,
      permit_number: validated.permit_number,
      issuing_authority: validated.issuing_authority,
      jurisdiction: validated.jurisdiction,
      issue_date: validated.issue_date,
      expiration_date: validated.expiration_date,
      renewal_deadline: validated.renewal_deadline,
      status,
      notes: validated.notes,
      source_type: validated.source_type,
      custom_fields: cleanCustomFields,
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  // Deadline rows (also kept in sync by DB triggers — this is idempotent).
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "permit",
    resource_id: data.id,
    deadline_type: "expiration",
    due_date: validated.expiration_date,
  });
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "permit",
    resource_id: data.id,
    deadline_type: "renewal",
    due_date: validated.renewal_deadline,
  });

  // Audit log
  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "permit.created",
    entity_type: "permit",
    entity_id: data.id,
  });

  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updatePermit(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  const { id, ...updates } = body as Record<string, unknown>;
  if (!id || typeof id !== "string") throw new ApiError(400, "Permit ID required");

  // Only allow updating own org's permit
  const { data: existing } = await supabase
    .from("permits")
    .select("id, expiration_date, renewal_deadline")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();
  if (!existing) throw new ApiError(404, "Permit not found");

  // Validate incoming fields (manual status must be a known enum value).
  try {
    if (updates.permit_type !== undefined) requireString(updates.permit_type, "permit_type", 200);
    if (updates.issue_date !== undefined) optionalDate(updates.issue_date, "issue_date");
    if (updates.expiration_date !== undefined) optionalDate(updates.expiration_date, "expiration_date");
    if (updates.renewal_deadline !== undefined) optionalDate(updates.renewal_deadline, "renewal_deadline");
    if (updates.status !== undefined) enumValue(updates.status, PERMIT_STATUSES, "status");
    for (const f of ["permit_number", "issuing_authority", "jurisdiction", "notes"]) {
      if (updates[f] !== undefined) optionalString(updates[f], f, 5000);
    }
  } catch (err) {
    throw invalidInput(err);
  }

  // Cross-tenant FK check when the project is reassigned.
  if (typeof updates.project_id === "string" && updates.project_id) {
    const ok = await verifyParentOrg(supabase, "projects", updates.project_id, orgId);
    if (!ok) throw new ApiError(403, "Project not found in this organization");
  }

  // Recalculate status if dates changed
  if (updates.expiration_date !== undefined || updates.renewal_deadline !== undefined) {
    updates.status = calculatePermitStatus(
      updates.expiration_date !== undefined ? (updates.expiration_date as string | null) : existing.expiration_date,
      updates.renewal_deadline !== undefined ? (updates.renewal_deadline as string | null) : existing.renewal_deadline
    );
  }

  // Allow manual status override (validated above against the enum).
  const allowedFields = [
    "project_id", "permit_type", "permit_number", "issuing_authority",
    "jurisdiction", "issue_date", "expiration_date", "renewal_deadline",
    "notes", "status",
  ];
  const filtered: Record<string, unknown> = {};
  for (const f of allowedFields) {
    if (updates[f] !== undefined) filtered[f] = updates[f] || null;
  }
  if (updates.status) filtered.status = updates.status;
  // Sanitize custom fields: plain string key-value object only
  if (updates.custom_fields !== undefined) {
    filtered.custom_fields = sanitizeCustomFields(updates.custom_fields);
  }

  const { data, error } = await supabase
    .from("permits")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  // Keep deadlines in sync with the new dates (idempotent with triggers).
  const newExpiration = (filtered.expiration_date !== undefined
    ? filtered.expiration_date
    : existing.expiration_date) as string | null;
  const newRenewal = (filtered.renewal_deadline !== undefined
    ? filtered.renewal_deadline
    : existing.renewal_deadline) as string | null;
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "permit",
    resource_id: id,
    deadline_type: "expiration",
    due_date: newExpiration,
  });
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "permit",
    resource_id: id,
    deadline_type: "renewal",
    due_date: newRenewal,
  });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "permit.updated",
    entity_type: "permit",
    entity_id: id,
  });

  return result(200, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deletePermit(supabase: any, orgId: string, userId: string, id: string | null): Promise<FeatureResult> {
  if (!id) throw new ApiError(400, "ID required");

  const { error } = await supabase
    .from("permits")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) throw new ApiError(500, error.message);

  // Deadline rows are removed by the DB trigger on permits DELETE.
  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "permit.deleted",
    entity_type: "permit",
    entity_id: id,
  });

  return result(200, { ok: true });
}
