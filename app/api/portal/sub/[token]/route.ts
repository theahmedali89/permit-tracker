import { createServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ["license", "coi", "other"];

async function validateToken(supabase: any, token: string) {
  if (!token || token.length < 16) return null;
  const { data, error } = await supabase
    .from("subcontractor_invites")
    .select(`
      id, email, expires_at, used_at,
      subcontractors!inner(id, name, trade),
      organizations!inner(id, name)
    `)
    .eq("token", token)
    .single();
  if (error || !data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;
  if (data.used_at) return null; // revoked
  return data;
}

// GET /api/portal/sub/[token] — public: validate token, return context
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();
  const invite = await validateToken(supabase, token);
  if (!invite) {
    return NextResponse.json(
      { error: "This link is invalid, expired, or has been revoked." },
      { status: 404 }
    );
  }
  return NextResponse.json({
    subcontractor: {
      name: (invite as any).subcontractors.name,
      trade: (invite as any).subcontractors.trade,
    },
    organization: { name: (invite as any).organizations.name },
    email: invite.email,
  });
}

// POST /api/portal/sub/[token] — public: upload (multipart: file, doc_type, expiration_date, notes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();
  const invite = await validateToken(supabase, token);
  if (!invite) {
    return NextResponse.json(
      { error: "This link is invalid, expired, or has been revoked." },
      { status: 404 }
    );
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

  const subId = (invite as any).subcontractors.id;
  const orgId = (invite as any).organizations.id;
  const storagePath = `${orgId}/subcontractors/${subId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error } = await supabase.from("subcontractor_documents").insert({
    organization_id: orgId,
    subcontractor_id: subId,
    doc_type: docType,
    file_name: file.name,
    storage_path: storagePath,
    expiration_date: expirationDate || null,
    notes: notes || null,
    uploaded_by: "subcontractor",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invite stays valid until expiry so the sub can upload multiple documents
  return NextResponse.json({ ok: true }, { status: 201 });
}
