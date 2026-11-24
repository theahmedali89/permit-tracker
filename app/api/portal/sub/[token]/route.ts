import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit, rateLimitResponse } from "@/lib/shared/rate-limit";
import {
  checkMagicBytes,
  extensionForMimeType,
  sanitizeFileName,
} from "@/lib/shared/sanitize-file";
import { isValidDateString } from "@/lib/shared/validate";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = ["license", "coi", "other"];
const MAX_UPLOADS_PER_TOKEN_PER_DAY = 10;

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

  // Public endpoint: per-token rate limit (30 attempts/hour) so one link
  // cannot be hammered, plus a DB-backed upload cap below.
  const limit = checkRateLimit(`portal:${token}`, 30, 60 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

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
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
  }
  if (expirationDate && !isValidDateString(expirationDate)) {
    return NextResponse.json({ error: "Invalid expiration_date. Use YYYY-MM-DD." }, { status: 400 });
  }

  // Never trust client-supplied MIME type or file name: the extension
  // must be allow-listed, the content must match it (magic bytes), and
  // the stored name is a fresh UUID (no traversal, no collisions).
  const expectedExt = extensionForMimeType(file.type);
  if (!expectedExt) {
    return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." }, { status: 400 });
  }
  let safeName: string;
  try {
    safeName = sanitizeFileName(file.name);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid file name" }, { status: 400 });
  }
  if (!(await checkMagicBytes(file, expectedExt))) {
    return NextResponse.json({ error: "File content does not match its type." }, { status: 400 });
  }

  const subId = (invite as any).subcontractors.id;
  const orgId = (invite as any).organizations.id;

  // Per-token upload cap: max 10 files per 24h, counted from the DB
  // (survives restarts, unlike the in-memory rate limiter).
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: recentUploads, error: countError } = await supabase
    .from("subcontractor_documents")
    .select("id", { count: "exact", head: true })
    .eq("subcontractor_id", subId)
    .gte("created_at", dayAgo);
  if (countError) {
    console.error("portal: upload-cap count failed", countError.message);
    return NextResponse.json({ error: "Upload check failed. Please try again." }, { status: 500 });
  }
  if ((recentUploads || 0) >= MAX_UPLOADS_PER_TOKEN_PER_DAY) {
    return NextResponse.json(
      { error: "Upload limit reached for this link (10 files per day). Contact the contractor for a new link." },
      { status: 429 }
    );
  }

  const storagePath = `${orgId}/subcontractors/${subId}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error } = await supabase.from("subcontractor_documents").insert({
    organization_id: orgId,
    subcontractor_id: subId,
    doc_type: docType,
    file_name: safeName,
    storage_path: storagePath,
    expiration_date: expirationDate || null,
    notes: notes || null,
    uploaded_by: "subcontractor",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Invite stays valid until expiry so the sub can upload multiple documents
  return NextResponse.json({ ok: true }, { status: 201 });
}
