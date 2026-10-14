import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export function getOAuthClient() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth not configured");
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${appUrl}/api/auth/google-calendar/callback`
  );
}

export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
];

async function getOrgId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.organization_id;
}

// GET /api/auth/google-calendar — start OAuth flow
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  let oauth2Client;
  try {
    oauth2Client = getOAuthClient();
  } catch {
    return NextResponse.json(
      { error: "Google Calendar not configured. Add GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET env vars." },
      { status: 500 }
    );
  }

  // Pass orgId as state so callback knows which org to save tokens for
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: CALENDAR_SCOPES,
    state: orgId,
  });

  return NextResponse.redirect(url);
}
