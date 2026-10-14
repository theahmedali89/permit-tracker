import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "../route";

// GET /api/auth/google-calendar/callback — handle OAuth callback
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/signin?error=auth_required`
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // organization_id
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/settings?calendar=error&reason=${error || "no_code"}`
    );
  }

  if (!state) {
    return NextResponse.redirect(`${appUrl}/settings?calendar=error&reason=no_state`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user's Google email for display
    let googleEmail: string | null = null;
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      googleEmail = data.email || null;
    } catch {
      // non-fatal
    }

    // Save tokens (use service role to bypass RLS for upsert reliability)
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await serviceClient
      .from("google_calendar_tokens")
      .upsert(
        {
          organization_id: state,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || null,
          expiry_date: tokens.expiry_date || null,
          google_email: googleEmail,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" }
      );

    if (dbError) throw dbError;

    await serviceClient.from("audit_events").insert({
      organization_id: state,
      actor_id: user.id,
      action: "google_calendar.connected",
      entity_type: "integration",
      entity_id: state,
    });

    return NextResponse.redirect(`${appUrl}/settings?calendar=connected`);
  } catch (err: any) {
    console.error("Google Calendar OAuth callback error:", err.message);
    return NextResponse.redirect(
      `${appUrl}/settings?calendar=error&reason=token_exchange_failed`
    );
  }
}
