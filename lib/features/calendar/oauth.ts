// Google Calendar OAuth — moved verbatim from
// `app/api/auth/google-calendar/route.ts` (helpers + authorize step) and
// `app/api/auth/google-calendar/callback/route.ts` (callback step) in
// pass 2 modularity. The routes are now thin: they resolve auth/org and
// call these functions, then redirect to the URL returned here.
// Behaviour is identical: same HMAC-signed state (10 min expiry), same
// admin-only guard, same encrypted token storage, same redirect targets.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

import { google } from "googleapis";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { encryptToken } from "@/lib/shared/calendar-crypto";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";

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

export function isCalendarAdminRole(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Start the OAuth flow (GET /api/auth/google-calendar). Returns the
 * Google authorize URL to redirect to. Throws ApiError(403) for
 * non-admins and ApiError(500) when OAuth is not configured.
 */
export async function startGoogleCalendarOAuth(
  supabase: AnyClient,
  orgId: string,
  userId: string,
  origin: string
): Promise<FeatureResult> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", orgId)
    .limit(1)
    .single();
  if (!isCalendarAdminRole(membership?.role))
    throw new ApiError(403, "Only workspace admins can connect Google Calendar");

  let oauth2Client;
  try {
    // Derive the callback URL from the request's own host so the
    // redirect_uri matches whichever deployment URL the user is on
    // (production alias, preview URL, etc.) — no build-time env drift.
    oauth2Client = getOAuthClient(
      `${origin}/api/auth/google-calendar/callback`
    );
  } catch {
    throw new ApiError(
      500,
      "Google Calendar not configured. Add GOOGLE_CALENDAR_CLIENT_ID and GOOGLE_CALENDAR_CLIENT_SECRET env vars."
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

  // The route turns this into a redirect response.
  return result(200, { redirectUrl: url });
}

export interface OAuthCallbackInput {
  userId: string;
  origin: string;
  code: string | null;
  rawState: string | null;
  error: string | null;
}

/**
 * Handle the OAuth callback (GET /api/auth/google-calendar/callback).
 * Returns the URL the route redirects to (`/settings?calendar=…`).
 * The `supabase` client is the cookie client (for the membership /
 * admin check); token storage uses the service-role client.
 */
export async function handleGoogleCalendarCallback(
  supabase: AnyClient,
  input: OAuthCallbackInput
): Promise<string> {
  const { userId, origin, code, rawState, error } = input;
  const appUrl = origin;

  if (error || !code) {
    return `${appUrl}/settings?calendar=error&reason=${error || "no_code"}`;
  }

  // Verify the signed state — rejects tampered, expired or missing state
  const orgId = rawState ? verifyState(rawState) : null;
  if (!orgId) {
    return `${appUrl}/settings?calendar=error&reason=invalid_state`;
  }

  // Only workspace admins may connect (or replace) the org's Google account
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", userId)
    .eq("organization_id", orgId)
    .limit(1)
    .single();
  if (membership?.role !== "owner" && membership?.role !== "admin") {
    return `${appUrl}/settings?calendar=error&reason=not_admin`;
  }

  try {
    // Must use the SAME redirect_uri that was sent to Google in the
    // authorize step — derived from this request's host, matching exactly.
    const oauth2Client = getOAuthClient(
      `${origin}/api/auth/google-calendar/callback`
    );
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

    // Save tokens encrypted (AES-256-GCM); plaintext columns stay NULL.
    // Throws a clear error when CALENDAR_TOKEN_KEY is not configured.
    // (Service role bypasses RLS for upsert reliability.)
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await serviceClient
      .from("google_calendar_tokens")
      .upsert(
        {
          organization_id: orgId,
          access_token: null,
          access_token_encrypted: tokens.access_token
            ? await encryptToken(tokens.access_token)
            : null,
          refresh_token: null,
          refresh_token_encrypted: tokens.refresh_token
            ? await encryptToken(tokens.refresh_token)
            : null,
          expiry_date: tokens.expiry_date || null,
          google_email: googleEmail,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id" }
      );

    if (dbError) throw dbError;

    await serviceClient.from("audit_events").insert({
      organization_id: orgId,
      actor_id: userId,
      action: "google_calendar.connected",
      entity_type: "integration",
      entity_id: orgId,
    });

    return `${appUrl}/settings?calendar=connected`;
  } catch (err: AnyClient) {
    console.error("Google Calendar OAuth callback error:", err.message);
    return `${appUrl}/settings?calendar=error&reason=token_exchange_failed`;
  }
}
