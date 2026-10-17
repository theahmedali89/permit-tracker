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
  const id = searchParams.get("id");

  let query = supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", orgId)
    .order("expiration_date", { ascending: true });

  if (id) query = query.eq("id", id);
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
    notes, source_type, custom_fields,
  } = body;

  if (!permit_type) return NextResponse.json({ error: "Permit type required" }, { status: 400 });

  const status = calculatePermitStatus(expiration_date, renewal_deadline);

  // Sanitize custom fields: plain string key-value object only
  let cleanCustomFields: Record<string, string> = {};
  if (custom_fields && typeof custom_fields === "object" && !Array.isArray(custom_fields)) {
    for (const [k, v] of Object.entries(custom_fields)) {
      if (typeof k === "string" && k.trim() && typeof v === "string") {
        cleanCustomFields[k.trim().slice(0, 64)] = v.slice(0, 500);
      }
    }
  }

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
      custom_fields: cleanCustomFields,
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

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Permit ID required" }, { status: 400 });

  // Only allow updating own org's permit
  const { data: existing } = await supabase
    .from("permits")
    .select("id")
    .eq("id", id)
    .eq("organization_id", orgId)
    .single();
  if (!existing) return NextResponse.json({ error: "Permit not found" }, { status: 404 });

  // Recalculate status if dates changed
  if (updates.expiration_date !== undefined || updates.renewal_deadline !== undefined) {
    const { data: current } = await supabase
      .from("permits")
      .select("expiration_date, renewal_deadline")
      .eq("id", id)
      .single();
    updates.status = calculatePermitStatus(
      updates.expiration_date !== undefined ? updates.expiration_date : current?.expiration_date,
      updates.renewal_deadline !== undefined ? updates.renewal_deadline : current?.renewal_deadline
    );
  }

  // Allow manual status override
  const allowedFields = [
    "project_id", "permit_type", "permit_number", "issuing_authority",
    "jurisdiction", "issue_date", "expiration_date", "renewal_deadline",
    "notes", "status",
  ];
  const filtered: Record<string, any> = {};
  for (const f of allowedFields) {
    if (updates[f] !== undefined) filtered[f] = updates[f] || null;
  }
  if (updates.status) filtered.status = updates.status;
  // Sanitize custom fields: plain string key-value object only
  if (updates.custom_fields !== undefined) {
    const clean: Record<string, string> = {};
    if (updates.custom_fields && typeof updates.custom_fields === "object" && !Array.isArray(updates.custom_fields)) {
      for (const [k, v] of Object.entries(updates.custom_fields)) {
        if (typeof k === "string" && k.trim() && typeof v === "string") {
          clean[k.trim().slice(0, 64)] = v.slice(0, 500);
        }
      }
    }
    filtered.custom_fields = clean;
  }

  const { data, error } = await supabase
    .from("permits")
    .update(filtered)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "permit.updated",
    entity_type: "permit",
    entity_id: id,
  });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const { error } = await supabase
    .from("permits")
    .delete()
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "permit.deleted",
    entity_type: "permit",
    entity_id: id,
  });

  return NextResponse.json({ ok: true });
}
