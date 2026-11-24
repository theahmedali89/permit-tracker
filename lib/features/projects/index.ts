// Projects — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/projects/route.ts`: the route is now thin
// (auth/org resolution + one feature call). Behaviour is identical:
// same validation, same plan-limit grace-mode enforcement, same audit
// events, same status codes and error strings.

import {
  optionalDate,
  optionalEnum,
  optionalString,
  parsePagination,
  requireString,
} from "@/lib/shared/validate";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { enforcePlanLimitWithGraceMode } from "@/lib/features/billing";

export const PROJECT_STATUSES = ["active", "completed", "on_hold", "cancelled"] as const;

export function validateProjectCreate(body: Record<string, unknown>): Record<string, string | null> {
  return {
    name: requireString(body.name, "name", 200),
    customer: optionalString(body.customer, "customer", 200),
    address: optionalString(body.address, "address", 500),
    city: optionalString(body.city, "city", 200),
    state: optionalString(body.state, "state", 100),
    zip: optionalString(body.zip, "zip", 20),
    project_type: optionalString(body.project_type, "project_type", 200),
    start_date: optionalDate(body.start_date, "start_date"),
    expected_completion: optionalDate(body.expected_completion, "expected_completion"),
    notes: optionalString(body.notes, "notes", 5000),
    status: optionalEnum(body.status, PROJECT_STATUSES, "status") || "active",
  };
}

const PROJECT_UPDATE_FIELDS = [
  "name", "customer", "address", "city", "state", "zip",
  "project_type", "start_date", "expected_completion", "notes", "status",
];

function invalidInput(err: unknown): ApiError {
  return new ApiError(400, err instanceof Error ? err.message : "Invalid input");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listProjects(supabase: any, orgId: string, searchParams: URLSearchParams): Promise<FeatureResult> {
  const { from, to } = parsePagination(searchParams);
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw new ApiError(500, error.message);
  return result(200, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProject(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  let validated: Record<string, string | null>;
  try {
    validated = validateProjectCreate(body as Record<string, unknown>);
  } catch (err) {
    throw invalidInput(err);
  }

  // Plan-limit enforcement (grace mode: enforced only when Stripe is
  // configured; without keys the write is allowed and a warning is
  // logged — see lib/features/billing).
  const planCheck = await enforcePlanLimitWithGraceMode(supabase, orgId, "projects");
  if (!planCheck.allowed) {
    throw new ApiError(402, planCheck.message, { upgrade: true });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      organization_id: orgId,
      ...validated,
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  // Audit log
  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "project.created",
    entity_type: "project",
    entity_id: data.id,
  });

  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProject(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid JSON body");
  }
  const { id, ...updates } = body as Record<string, unknown>;
  if (!id || typeof id !== "string") throw new ApiError(400, "Project ID required");

  try {
    if (updates.name !== undefined) requireString(updates.name, "name", 200);
    if (updates.start_date !== undefined) optionalDate(updates.start_date, "start_date");
    if (updates.expected_completion !== undefined) optionalDate(updates.expected_completion, "expected_completion");
    if (updates.status !== undefined) optionalEnum(updates.status, PROJECT_STATUSES, "status");
    for (const f of ["customer", "address", "city", "state", "zip", "project_type", "notes"]) {
      if (updates[f] !== undefined) optionalString(updates[f], f, 5000);
    }
  } catch (err) {
    throw invalidInput(err);
  }

  const filtered: Record<string, unknown> = {};
  for (const f of PROJECT_UPDATE_FIELDS) {
    if (updates[f] !== undefined) filtered[f] = updates[f] || null;
  }

  const { data, error } = await supabase
    .from("projects")
    .update(filtered)
    .eq("id", id)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "project.updated",
    entity_type: "project",
    entity_id: id,
  });

  return result(200, data);
}
