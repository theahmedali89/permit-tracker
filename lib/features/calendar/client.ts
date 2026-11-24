// Google Calendar token client — moved verbatim from
// `app/api/calendar/lib.ts` (pass 2 modularity). Only the import paths
// changed (OAuth client now comes from `./oauth`, crypto from
// `@/lib/shared/calendar-crypto`).

import { google } from "googleapis";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getOAuthClient } from "@/lib/features/calendar/oauth";
import { decryptToken, encryptToken } from "@/lib/shared/calendar-crypto";

// Tokens are stored ENCRYPTED (AES-256-GCM, see lib/shared/calendar-crypto.ts)
// in access_token_encrypted / refresh_token_encrypted. Legacy rows that
// still carry plaintext access_token/refresh_token are read as a
// fallback and re-saved encrypted. Token values are never logged.

// Returns an authenticated calendar client for the org, refreshing tokens as needed
export async function getCalendarClient(organizationId: string) {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tokenRow, error } = await serviceClient
    .from("google_calendar_tokens")
    .select("*")
    .eq("organization_id", organizationId)
    .single();

  if (error || !tokenRow) {
    throw new Error("Google Calendar not connected for this organization");
  }

  // Decrypt (with plaintext fallback for legacy rows only).
  let accessToken: string;
  let refreshToken: string | undefined;
  if (tokenRow.access_token_encrypted) {
    accessToken = await decryptToken(tokenRow.access_token_encrypted);
  } else if (tokenRow.access_token) {
    accessToken = tokenRow.access_token;
  } else {
    throw new Error("Google Calendar not connected for this organization");
  }
  if (tokenRow.refresh_token_encrypted) {
    refreshToken = await decryptToken(tokenRow.refresh_token_encrypted);
  } else {
    refreshToken = tokenRow.refresh_token || undefined;
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: tokenRow.expiry_date ? Number(tokenRow.expiry_date) : undefined,
  });

  // Refresh if expired
  if (tokenRow.expiry_date && Number(tokenRow.expiry_date) < Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      // Save the refreshed tokens encrypted; clear plaintext columns.
      const updates: Record<string, unknown> = {
        expiry_date: credentials.expiry_date,
        updated_at: new Date().toISOString(),
        access_token: null,
        refresh_token: null,
      };
      if (credentials.access_token) {
        updates.access_token_encrypted = await encryptToken(credentials.access_token);
      }
      if (credentials.refresh_token) {
        updates.refresh_token_encrypted = await encryptToken(credentials.refresh_token);
      }
      await serviceClient
        .from("google_calendar_tokens")
        .update(updates)
        .eq("organization_id", organizationId);
      oauth2Client.setCredentials(credentials);
    } catch (err: any) {
      throw new Error("Failed to refresh Google token. Please reconnect. " + err.message);
    }
  }

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
