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

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const projectId = searchParams.get("project_id");
  const search = searchParams.get("search");

  let query = supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", orgId)
    .order("expiration_date", { ascending: true });

  if (status) query = query.eq("status", status);
  if (projectId) query = query.eq("project_id", projectId);
  if (search) query = query.or(`permit_number.ilike.%${search}%,permit_type.ilike.%${search}%`);

  const { data, error } = await query;
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
  const {
    project_id, permit_type, permit_number, issuing_authority,
    jurisdiction, issue_date, expiration_date, renewal_deadline,
    notes, source_type,
  } = body;

  if (!permit_type) return NextResponse.json({ error: "Permit type required" }, { status: 400 });

  const status = calculatePermitStatus(expiration_date, renewal_deadline);

  const { data, error } = await supabase
    .from("permits")
    .insert({
      organization_id: orgId,
      project_id: project_id || null,
      permit_type, permit_number, issuing_authority, jurisdiction,
      issue_date: issue_date || null,
      expiration_date: expiration_date || null,
      renewal_deadline: renewal_deadline || null,
      status, notes,
      source_type: source_type || "user_provided",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create deadline record
  if (expiration_date) {
    await supabase.from("deadlines").insert({
      organization_id: orgId,
      resource_type: "permit",
      resource_id: data.id,
      deadline_type: "expiration",
      due_date: expiration_date,
    });
  }

  // Audit log
  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "permit.created",
    entity_type: "permit",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}
