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
    .from("subcontractors")
    .select("*")
    .eq("organization_id", orgId)
    .order("name");

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
  const { name, trade, email, phone, license_number, license_expiration, coi_expiration, notes } = body;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("subcontractors")
    .insert({
      organization_id: orgId,
      name, trade, email, phone,
      license_number,
      license_expiration: license_expiration || null,
      coi_expiration: coi_expiration || null,
      notes,
      status: "active",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "subcontractor.created",
    entity_type: "subcontractor",
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
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const allowed = ["name", "trade", "email", "phone", "license_number", "license_expiration", "coi_expiration", "notes", "status"];
  const filtered: Record<string, any> = {};
  for (const f of allowed) {
    if (updates[f] !== undefined) filtered[f] = updates[f] || null;
  }

  const { data, error } = await supabase
    .from("subcontractors")
    .update(filtered)
    .eq("id", id)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
