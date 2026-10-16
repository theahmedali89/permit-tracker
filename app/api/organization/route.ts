import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function getOrgId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.organization_id;
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const allowed = ["name", "trade", "state"];
  const updates: Record<string, any> = {};
  for (const f of allowed) {
    if (body[f] !== undefined) updates[f] = body[f]?.trim() ? body[f].trim() : null;
  }

  if (!updates.name) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", orgId)
    .select("id, name, trade, state")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "organization.updated",
    entity_type: "organization",
    entity_id: orgId,
  });

  return NextResponse.json(data);
}
