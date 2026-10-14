import { google } from "googleapis";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getOAuthClient } from "../auth/google-calendar/route";

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

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: tokenRow.access_token,
    refresh_token: tokenRow.refresh_token,
    expiry_date: tokenRow.expiry_date ? Number(tokenRow.expiry_date) : undefined,
  });

  // Refresh if expired
  if (tokenRow.expiry_date && Number(tokenRow.expiry_date) < Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      await serviceClient
        .from("google_calendar_tokens")
        .update({
          access_token: credentials.access_token,
          expiry_date: credentials.expiry_date,
          refresh_token: credentials.refresh_token || tokenRow.refresh_token,
          updated_at: new Date().toISOString(),
        })
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
