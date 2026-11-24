// Documents — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/documents/route.ts`: the route is now
// thin (auth/org resolution + one feature call). Behaviour is identical:
// same 10MB limit, same allow-listed MIME types with magic-byte check,
// same UUID storage names, same cross-tenant FK checks, same
// plan-limit enforcement BEFORE the storage upload (so a rejected
// upload leaves no orphan file), same audit events.

import { verifyParentOrg } from "@/lib/shared/org-context";
import {
  checkMagicBytes,
  extensionForMimeType,
  sanitizeFileName,
} from "@/lib/shared/sanitize-file";
import { isValidDateString } from "@/lib/shared/validate";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { enforcePlanLimitWithGraceMode } from "@/lib/features/billing";

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

export interface DocumentUploadInput {
  file: File | null;
  permitId: string | null;
  projectId: string | null;
  expiryDate: string | null;
}

export function validateUploadInput(input: DocumentUploadInput): void {
  const { file, expiryDate } = input;
  if (!file) throw new ApiError(400, "No file");
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new ApiError(400, "File too large. Max 10MB.");
  }
  if (expiryDate && !isValidDateString(expiryDate)) {
    throw new ApiError(400, "Invalid expiry_date. Use YYYY-MM-DD.");
  }
  // Never trust client-supplied MIME type or file name: the extension
  // must be allow-listed, the content must match it (magic bytes), and
  // the stored name is a fresh UUID (no traversal, no collisions).
  if (!extensionForMimeType(file.type)) {
    throw new ApiError(400, "Invalid file type. Only PDF, JPG, PNG allowed.");
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadDocument(supabase: any, orgId: string, userId: string, input: DocumentUploadInput): Promise<FeatureResult> {
  validateUploadInput(input);
  // validateUploadInput throws when the file is missing.
  const file = input.file as File;
  const { permitId, projectId, expiryDate } = input;
  const expectedExt = extensionForMimeType(file.type)!;

  let safeName: string;
  try {
    safeName = sanitizeFileName(file.name);
  } catch (err) {
    throw new ApiError(400, err instanceof Error ? err.message : "Invalid file name");
  }
  if (!(await checkMagicBytes(file, expectedExt))) {
    throw new ApiError(400, "File content does not match its type.");
  }

  // Cross-tenant FK checks for the optional parents.
  if (permitId) {
    const ok = await verifyParentOrg(supabase, "permits", permitId, orgId);
    if (!ok) throw new ApiError(403, "Permit not found in this organization");
  }
  if (projectId) {
    const ok = await verifyParentOrg(supabase, "projects", projectId, orgId);
    if (!ok) throw new ApiError(403, "Project not found in this organization");
  }

  // Plan-limit enforcement, BEFORE the storage upload so a rejected
  // upload leaves no orphan file (grace mode: enforced only when
  // Stripe is configured; without keys the write is allowed and a
  // warning is logged — see lib/features/billing).
  const planCheck = await enforcePlanLimitWithGraceMode(supabase, orgId, "documents");
  if (!planCheck.allowed) {
    throw new ApiError(402, planCheck.message, { upgrade: true });
  }

  const storagePath = `${orgId}/${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, file);

  if (uploadError) throw new ApiError(500, uploadError.message);

  const { data, error } = await supabase
    .from("documents")
    .insert({
      organization_id: orgId,
      project_id: projectId,
      permit_id: permitId,
      file_name: safeName,
      file_size: file.size,
      mime_type: file.type,
      storage_path: storagePath,
      uploaded_by: userId,
      expiry_date: expiryDate,
    })
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "document.uploaded",
    entity_type: "document",
    entity_id: data.id,
  });

  return result(201, data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateDocumentExpiry(supabase: any, orgId: string, body: unknown): Promise<FeatureResult> {
  const record = (body ?? {}) as Record<string, unknown>;
  const id = record.id as string;
  const expiryDate = record.expiry_date as string | null;

  if (!id) throw new ApiError(400, "Missing document id");
  if (expiryDate && !isValidDateString(expiryDate)) {
    throw new ApiError(400, "Invalid expiry_date. Use YYYY-MM-DD.");
  }

  const { data, error } = await supabase
    .from("documents")
    .update({ expiry_date: expiryDate || null })
    .eq("id", id)
    .eq("organization_id", orgId)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message);
  if (!data) throw new ApiError(404, "Document not found");

  return result(200, data);
}
