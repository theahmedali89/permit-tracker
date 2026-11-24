// Deadline CRUD (the `deadlines` table API) — part of the reminders
// feature (pass 2 modularity). Moved verbatim from
// `app/api/deadlines/route.ts`: the route is now thin (auth/org
// resolution + one feature call). Behaviour is identical: same
// required-field checks, same "other" default deadline_type, same
// completed_at stamping on completion.

import { ApiError, result, type FeatureResult } from "@/lib/shared/http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDeadline(supabase: any, orgId: string, body: unknown): Promise<FeatureResult> {
  const { resource_type, resource_id, deadline_type, due_date } = (body ?? {}) as Record<string, unknown>;

  if (!resource_type || !resource_id || !due_date) {
    throw new ApiError(400, "Missing required fields");
  }

  const { data, error } = await supabase
    .from("deadlines")
    .insert({
      organization_id: orgId,
      resource_type,
      resource_id,
      deadline_type: deadline_type || "other",
      due_date,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateDeadline(supabase: any, orgId: string, body: unknown): Promise<FeatureResult> {
  const { id, status } = (body ?? {}) as Record<string, unknown>;
  if (!id) throw new ApiError(400, "ID required");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {};
  if (status) {
    updates.status = status;
    if (status === "completed") updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("deadlines")
    .update(updates)
    .eq("id", id)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  return result(200, data);
}
