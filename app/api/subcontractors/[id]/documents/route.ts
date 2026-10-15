import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ["license", "coi", "other"];

async function getSubcontractor(supabase: any, orgId: string, subId: string) {
  const { data, error } = await supabase
    .from("subcontractors")
    .select("id")
    .eq("id", subId)
    .eq("organization_id", orgId)
    .single();
  if (error || !data) return null;
  return data;
}

// GET /api/subcontractors/[id]/documents — list documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (!(await getSubcontractor(supabase, membership.organization_id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("subcontractor_documents")
    .select("*")
    .eq("subcontractor_id", id)
    .eq("organization_id", membership.organization_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/subcontractors/[id]/documents — upload (multipart: file, doc_type, expiration_date, notes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (!(await getSubcontractor(supabase, membership.organization_id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const docType = (formData.get("doc_type") as string) || "other";
  const expirationDate = (formData.get("expiration_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_DOC_TYPES.includes(docType)) {
    return NextResponse.json({ error: "Invalid doc_type" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }

  const storagePath = `${membership.organization_id}/subcontractors/${id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabase
    .from("subcontractor_documents")
    .insert({
      organization_id: membership.organization_id,
      subcontractor_id: id,
      doc_type: docType,
      file_name: file.name,
      storage_path: storagePath,
      expiration_date: expirationDate || null,
      notes: notes || null,
      uploaded_by: "contractor",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: membership.organization_id,
    actor_id: user.id,
    action: "subcontractor_document.uploaded",
    entity_type: "subcontractor_document",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}
