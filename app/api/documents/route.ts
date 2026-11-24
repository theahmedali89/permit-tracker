// Thin route: document logic lives in lib/features/documents.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import {
  updateDocumentExpiry,
  uploadDocument,
} from "@/lib/features/documents";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const formData = await request.formData();
    return uploadDocument(supabase, orgId, user.id, {
      file: formData.get("file") as File | null,
      permitId: (formData.get("permit_id") as string) || null,
      projectId: (formData.get("project_id") as string) || null,
      expiryDate: (formData.get("expiry_date") as string) || null,
    });
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return updateDocumentExpiry(supabase, orgId, body);
  });
}
