// Keep a deadline row in sync with its source resource (permit, license,
// inspection, document). Used by API handlers after create/update/delete;
// the Postgres triggers in supabase/migration-deadline-sync.sql are the
// backstop for writes that bypass the API. Upsert is select-then-write so
// it stays idempotent even if both the handler and the trigger run.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = any;

export type DeadlineResourceType = "permit" | "license" | "inspection" | "document";

export type SyncDeadlineInput = {
  organization_id: string;
  resource_type: DeadlineResourceType;
  resource_id: string;
  deadline_type: string;
  /** Null clears the deadline (e.g. the date was removed). */
  due_date: string | null;
};

/** Upsert the pending deadline for one resource, or delete it when due_date is null. */
export async function syncDeadline(supabase: Client, input: SyncDeadlineInput): Promise<void> {
  const { organization_id, resource_type, resource_id, deadline_type, due_date } = input;

  if (!due_date) {
    await supabase
      .from("deadlines")
      .delete()
      .eq("resource_type", resource_type)
      .eq("resource_id", resource_id)
      .eq("deadline_type", deadline_type)
      .eq("status", "pending");
    return;
  }

  const { data: existing } = await supabase
    .from("deadlines")
    .select("id")
    .eq("resource_type", resource_type)
    .eq("resource_id", resource_id)
    .eq("deadline_type", deadline_type)
    .eq("status", "pending")
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase
      .from("deadlines")
      .update({ due_date, organization_id })
      .eq("id", existing[0].id);
  } else {
    await supabase.from("deadlines").insert({
      organization_id,
      resource_type,
      resource_id,
      deadline_type,
      due_date,
      status: "pending",
    });
  }
}

/** Delete every deadline row (any status/type) for one resource. */
export async function deleteDeadlinesForResource(
  supabase: Client,
  resource_type: DeadlineResourceType,
  resource_id: string
): Promise<void> {
  await supabase
    .from("deadlines")
    .delete()
    .eq("resource_type", resource_type)
    .eq("resource_id", resource_id);
}
