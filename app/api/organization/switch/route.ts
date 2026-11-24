// POST /api/organization/switch — set the active organization cookie
// (pw_active_org) after verifying the user is a member of that org.
// lib/shared/org-context.ts honours this cookie in getActiveOrgId().
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE, isOrgMember } from "@/lib/shared/org-context";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const organizationId = body?.organization_id as string | undefined;
  if (!organizationId || typeof organizationId !== "string") {
    return NextResponse.json({ error: "organization_id required" }, { status: 400 });
  }

  const member = await isOrgMember(supabase, user.id, organizationId);
  if (!member) {
    return NextResponse.json({ error: "You are not a member of this organization" }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return NextResponse.json({ ok: true, organization_id: organizationId });
}
