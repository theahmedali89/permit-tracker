import { createClient } from "@/lib/supabase/server";
import { calculatePermitStatus } from "@/lib/permit-status";
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
    .from("licenses")
    .select("*")
    .eq("organization_id", orgId)
    .order("expiration_date", { ascending: true });

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
  const { license_name, license_number, issuing_authority, state, issue_date, expiration_date, renewal_date, notes } = body;

  if (!license_name) return NextResponse.json({ error: "License name required" }, { status: 400 });

  const status = calculatePermitStatus(expiration_date, renewal_date);

  const { data, error } = await supabase
    .from("licenses")
    .insert({
      organization_id: orgId,
      license_name, license_number, issuing_authority, state,
      issue_date: issue_date || null,
      expiration_date: expiration_date || null,
      renewal_date: renewal_date || null,
      status, notes,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (expiration_date) {
    await supabase.from("deadlines").insert({
      organization_id: orgId,
      resource_type: "license",
      resource_id: data.id,
      deadline_type: "expiration",
      due_date: expiration_date,
    });
  }

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "license.created",
    entity_type: "license",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}
