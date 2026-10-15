import { google } from "googleapis";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export function getOAuthClient(redirectUri?: string) {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth not configured");
  }
  // Use request origin when provided (works on any deployment URL),
  // fall back to env var for backwards compatibility
  const callbackUrl = redirectUri
    || (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-calendar/callback`
      : null);
  if (!callbackUrl) {
    throw new Error("Google Calendar OAuth not configured");
  }
  return new google.auth.OAuth2(clientId, clientSecret, callbackUrl);
}

export const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
];

// --- Signed OAuth state -------------------------------------------------
// The `state` param carries the organization_id through Google's redirect.
// It must be tamper-proof: HMAC-SHA256 signed with a server-only secret,
// timestamped (10 min expiry). Replay is additionally blocked because Google
// authorization codes are single-use — a replayed callback fails token exchange.
const STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret(): string {
  return (
    process.env.OAUTH_STATE_SECRET ||
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET ||
    ""
  );
}

export function signState(orgId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      orgId,
      nonce: randomBytes(16).toString("hex"),
      ts: Date.now(),
    })
  ).toString("base64url");
  const sig = createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

/** Returns the orgId if the state is valid, otherwise null. */
export function verifyState(state: string): string | null {
  try {
    const [payload, sig] = state.split(".");
    if (!payload || !sig || !getStateSecret()) return null;
    const expected = createHmac("sha256", getStateSecret())
      .update(payload)
      .digest("base64url");
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expected, "base64url");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf))
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.orgId || typeof data.ts !== "number") return null;
    if (Date.now() - data.ts > STATE_TTL_MS) return null;
    return data.orgId;
  } catch {
    return null;
  }
}

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
    // Derive the callback URL from the request's own host so the
    // redirect_uri matches whichever deployment URL the user is on
    // (production alias, preview URL, etc.) — no build-time env drift.
    oauth2Client = getOAuthClient(
      `${request.nextUrl.origin}/api/auth/google-calendar/callback`
    );
  } catch {
    return NextResponse.json(
      { error: "Google Calendar not configured. Add GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET env vars." },
      { status: 500 }
    );
  }

  // Pass a signed, timestamped state so the callback can verify which org
  // the tokens belong to (tamper-proof, 10 min expiry)
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: CALENDAR_SCOPES,
    state: signState(orgId),
  });

  return NextResponse.redirect(url);
}
