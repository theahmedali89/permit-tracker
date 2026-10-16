import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
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

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const permitId = formData.get("permit_id") as string;
  const projectId = formData.get("project_id") as string;
  const expiryDate = formData.get("expiry_date") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }
  if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    return NextResponse.json({ error: "Invalid expiry_date. Use YYYY-MM-DD." }, { status: 400 });
  }

  const storagePath = `${membership.organization_id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: membership.organization_id,
      project_id: projectId || null,
      permit_id: permitId || null,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      uploaded_by: user.id,
      expiry_date: expiryDate || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("audit_events").insert({
    organization_id: membership.organization_id,
    actor_id: user.id,
    action: "document.uploaded",
    entity_type: "document",
    entity_id: data.id,
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
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

  const body = await request.json().catch(() => null);
  const id = body?.id as string;
  const expiryDate = body?.expiry_date as string | null;

  if (!id) return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    return NextResponse.json({ error: "Invalid expiry_date. Use YYYY-MM-DD." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .update({ expiry_date: expiryDate || null })
    .eq("id", id)
    .eq("organization_id", membership.organization_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  return NextResponse.json(data);
}
