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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { resource_type, resource_id, deadline_type, due_date } = body;

  if (!resource_type || !resource_id || !due_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { id, status } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
