// Thin route: Google Calendar OAuth callback lives in
// lib/features/calendar/oauth.ts. This handler only resolves the
// signed-in user and the request's own origin, then redirects to the
// URL the feature returns.
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { handleGoogleCalendarCallback } from "@/lib/features/calendar";

// GET /api/auth/google-calendar/callback — handle OAuth callback
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  // Always redirect back to the same host the request came in on, so the
  // whole OAuth round-trip stays on one deployment URL (no build-time env
  // var, no old/new URL confusion).
  const origin = request.nextUrl.origin;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${origin}/signin?error=auth_required`
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = await handleGoogleCalendarCallback(supabase, {
    userId: user.id,
    origin,
    code: searchParams.get("code"),
    rawState: searchParams.get("state"),
    error: searchParams.get("error"),
  });
  return NextResponse.redirect(redirectUrl);
}
