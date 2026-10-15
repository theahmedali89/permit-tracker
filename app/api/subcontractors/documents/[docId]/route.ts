import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function getDoc(supabase: any, orgId: string, docId: string) {
  const { data, error } = await supabase
    .from("subcontractor_documents")
    .select("id, storage_path")
    .eq("id", docId)
    .eq("organization_id", orgId)
    .single();
  if (error || !data) return null;
  return data;
}

// GET /api/subcontractors/documents/[docId] — signed download URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const doc = await getDoc(supabase, membership.organization_id, docId);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(doc.storage_path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}

// DELETE /api/subcontractors/documents/[docId] — delete doc + storage file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const doc = await getDoc(supabase, membership.organization_id, docId);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.storage.from("documents").remove([doc.storage_path]);

  const { error } = await supabase
    .from("subcontractor_documents")
    .delete()
    .eq("id", docId)
    .eq("organization_id", membership.organization_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: membership.organization_id,
    actor_id: user.id,
    action: "subcontractor_document.deleted",
    entity_type: "subcontractor_document",
    entity_id: docId,
  });

  return NextResponse.json({ ok: true });
}
