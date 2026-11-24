// Thin route: Google Calendar OAuth start lives in
// lib/features/calendar/oauth.ts. This handler only resolves auth/org
// and redirects to the authorize URL the feature returns.
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getActiveOrgId } from "@/lib/shared/org-context";
import { errorResponse } from "@/lib/shared/http";
import { startGoogleCalendarOAuth } from "@/lib/features/calendar";

// GET /api/auth/google-calendar — start OAuth flow
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Shared org context (was a local getOrgId duplicate): the active org
  // (cookie pw_active_org, else earliest membership).
  const orgId = await getActiveOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  try {
    const { body } = await startGoogleCalendarOAuth(
      supabase,
      orgId,
      user.id,
      request.nextUrl.origin
    );
    return NextResponse.redirect((body as { redirectUrl: string }).redirectUrl);
  } catch (err) {
    const res = errorResponse(err);
    if (res) return res;
    throw err;
  }
}
