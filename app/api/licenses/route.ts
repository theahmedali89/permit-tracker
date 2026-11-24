// Thin route: license logic lives in lib/features/licenses.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import {
  createLicense,
  listLicenses,
  updateLicense,
} from "@/lib/features/licenses";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    return listLicenses(supabase, orgId, new URL(request.url).searchParams);
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return createLicense(supabase, orgId, user.id, body);
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return updateLicense(supabase, orgId, user.id, body);
  });
}
