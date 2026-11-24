// Licenses — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/licenses/route.ts`: the route is now thin
// (auth/org resolution + one feature call). Behaviour is identical:
// same validation, same plan-limit grace-mode enforcement, same status
// recomputation from dates, same deadline syncs, same audit events.

import { calculatePermitStatus } from "@/lib/shared/permit-status";
import {
  optionalDate,
  optionalString,
  parsePagination,
  requireString,
} from "@/lib/shared/validate";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { syncDeadline } from "@/lib/features/reminders/sync-deadlines";
import { enforcePlanLimitWithGraceMode } from "@/lib/features/billing";

export function validateLicenseCreate(body: Record<string, unknown>): Record<string, string | null> {
  return {
    license_name: requireString(body.license_name, "license_name", 200),
    license_number: optionalString(body.license_number, "license_number", 200),
    issuing_authority: optionalString(body.issuing_authority, "issuing_authority", 200),
    state: optionalString(body.state, "state", 100),
    issue_date: optionalDate(body.issue_date, "issue_date"),
    expiration_date: optionalDate(body.expiration_date, "expiration_date"),
    renewal_date: optionalDate(body.renewal_date, "renewal_date"),
    notes: optionalString(body.notes, "notes", 5000),
  };
}

const LICENSE_UPDATE_FIELDS = [
  "license_name", "license_number", "issuing_authority", "state",
  "issue_date", "expiration_date", "renewal_date", "notes",
];

function invalidInput(err: unknown): ApiError {
  return new ApiError(400, err instanceof Error ? err.message : "Invalid input");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listLicenses(supabase: any, orgId: string, searchParams: URLSearchParams): Promise<FeatureResult> {
  const { from, to } = parsePagination(searchParams);
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("organization_id", orgId)
    .order("expiration_date", { ascending: true })
    .range(from, to);
  if (error) throw new ApiError(500, error.message);
  return result(200, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createLicense(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  let validated: Record<string, string | null>;
  try {
    validated = validateLicenseCreate(body as Record<string, unknown>);
  } catch (err) {
    throw invalidInput(err);
  }

  // Plan-limit enforcement (grace mode: enforced only when Stripe is
  // configured; without keys the write is allowed and a warning is
  // logged — see lib/features/billing).
  const planCheck = await enforcePlanLimitWithGraceMode(supabase, orgId, "licenses");
  if (!planCheck.allowed) {
    throw new ApiError(402, planCheck.message, { upgrade: true });
  }

  const status = calculatePermitStatus(validated.expiration_date, validated.renewal_date);

  const { data, error } = await supabase
    .from("licenses")
    .insert({
      organization_id: orgId,
      ...validated,
      status,
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "license",
    resource_id: data.id,
    deadline_type: "expiration",
    due_date: validated.expiration_date,
  });
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "license",
    resource_id: data.id,
    deadline_type: "renewal",
    due_date: validated.renewal_date,
  });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "license.created",
    entity_type: "license",
    entity_id: data.id,
  });

  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateLicense(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  const { id, ...updates } = body as Record<string, unknown>;
  if (!id || typeof id !== "string") throw new ApiError(400, "License ID required");

  const { data: existing } = await supabase
    .from("licenses")
    .select("id, expiration_date, renewal_date")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();
  if (!existing) throw new ApiError(404, "License not found");

  try {
    if (updates.license_name !== undefined) requireString(updates.license_name, "license_name", 200);
    if (updates.issue_date !== undefined) optionalDate(updates.issue_date, "issue_date");
    if (updates.expiration_date !== undefined) optionalDate(updates.expiration_date, "expiration_date");
    if (updates.renewal_date !== undefined) optionalDate(updates.renewal_date, "renewal_date");
    for (const f of ["license_number", "issuing_authority", "state", "notes"]) {
      if (updates[f] !== undefined) optionalString(updates[f], f, 5000);
    }
  } catch (err) {
    throw invalidInput(err);
  }

  const filtered: Record<string, unknown> = {};
  for (const f of LICENSE_UPDATE_FIELDS) {
    if (updates[f] !== undefined) filtered[f] = updates[f] || null;
  }

  if (filtered.license_name !== undefined && !filtered.license_name) {
    throw new ApiError(400, "License name is required");
  }

  // Recalculate status when dates change
  if (filtered.expiration_date !== undefined || filtered.renewal_date !== undefined) {
    const exp = filtered.expiration_date !== undefined ? (filtered.expiration_date as string | null) : existing.expiration_date;
    const ren = filtered.renewal_date !== undefined ? (filtered.renewal_date as string | null) : existing.renewal_date;
    filtered.status = calculatePermitStatus(exp, ren);
  }
  const { data, error } = await supabase
    .from("licenses")
    .update(filtered)
    .eq("id", id)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  const newExpiration = (filtered.expiration_date !== undefined
    ? filtered.expiration_date
    : existing.expiration_date) as string | null;
  const newRenewal = (filtered.renewal_date !== undefined
    ? filtered.renewal_date
    : existing.renewal_date) as string | null;
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "license",
    resource_id: id,
    deadline_type: "expiration",
    due_date: newExpiration,
  });
  await syncDeadline(supabase, {
    organization_id: orgId,
    resource_type: "license",
    resource_id: id,
    deadline_type: "renewal",
    due_date: newRenewal,
  });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "license.updated",
    entity_type: "license",
    entity_id: id,
  });

  return result(200, data);
}
