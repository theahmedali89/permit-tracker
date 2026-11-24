// Thin route: inspection logic lives in lib/features/inspections.
// The PATCH feature-flag check for `inspection-workflow` stays here at
// the route boundary (a disabled feature answers 503 before any logic).
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";
import {
  createInspection,
  listInspections,
  updateInspection,
} from "@/lib/features/inspections";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    return listInspections(supabase, orgId, new URL(request.url).searchParams);
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return createInspection(supabase, orgId, user.id, body);
  });
}

export async function PATCH(request: NextRequest) {
  try {
    requireFeatureEnabled("inspection-workflow");
  } catch (err) {
    if (err instanceof FeatureDisabledError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const body = await request.json().catch(() => null);
    return updateInspection(supabase, orgId, user.id, body);
  });
}
