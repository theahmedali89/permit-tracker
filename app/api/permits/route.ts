// Thin route: permit logic lives in lib/features/permits.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import {
  createPermit,
  deletePermit,
  listPermits,
  updatePermit,
} from "@/lib/features/permits";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    return listPermits(supabase, orgId, new URL(request.url).searchParams);
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return createPermit(supabase, orgId, user.id, body);
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return updatePermit(supabase, orgId, user.id, body);
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const id = new URL(request.url).searchParams.get("id");
    return deletePermit(supabase, orgId, user.id, id);
  });
}
