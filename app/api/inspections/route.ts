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

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data, error } = await supabase
    .from("inspections")
    .select("*, projects(name), permits(permit_type)")
    .eq("organization_id", orgId)
    .order("scheduled_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { project_id, permit_id, inspection_type, requested_date, scheduled_date, inspector_name, notes } = body;

  if (!inspection_type) return NextResponse.json({ error: "Inspection type required" }, { status: 400 });

  const { data, error } = await supabase
    .from("inspections")
    .insert({
      organization_id: orgId,
      project_id: project_id || null,
      permit_id: permit_id || null,
      inspection_type,
      requested_date: requested_date || null,
      scheduled_date: scheduled_date || null,
      inspector_name, notes,
      status: scheduled_date ? "scheduled" : "not_scheduled",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (scheduled_date) {
    await supabase.from("deadlines").insert({
      organization_id: orgId,
      resource_type: "inspection",
      resource_id: data.id,
      deadline_type: "inspection",
      due_date: scheduled_date,
    });
  }

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "inspection.created",
    entity_type: "inspection",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { id, status, correction_notes, reinspection_date, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Inspection ID required" }, { status: 400 });

  const { data: existing } = await supabase
    .from("inspections")
    .select("id")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();
  if (!existing) return NextResponse.json({ error: "Inspection not found" }, { status: 404 });

  const allowedFields = [
    "inspection_type", "scheduled_date", "inspector_name", "notes",
    "project_id", "permit_id", "status", "correction_notes", "reinspection_date",
  ];
  const filtered: Record<string, any> = {};
  for (const f of allowedFields) {
    if (body[f] !== undefined) filtered[f] = body[f] || null;
  }

  const { data, error } = await supabase
    .from("inspections")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If failed, create reinspection deadline
  if (status === "failed" && body.reinspection_date) {
    await supabase.from("deadlines").insert({
      organization_id: orgId,
      resource_type: "inspection",
      resource_id: id,
      deadline_type: "reinspection",
      due_date: body.reinspection_date,
    });
  }

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: `inspection.${status || "updated"}`,
    entity_type: "inspection",
    entity_id: id,
  });

  return NextResponse.json(data);
}
