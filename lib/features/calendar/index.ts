// Calendar — core feature (pass 2 modularity).
//
// Google Calendar sync/status/disconnect moved verbatim from
// `app/api/calendar/sync/route.ts` and `app/api/calendar/status/route.ts`.
// The routes are now thin (auth/org resolution + one feature call).
// OAuth helpers live in `./oauth.ts`, the token client in `./client.ts`.
// Behaviour is identical: same 90-day window, same dedup via
// `permitTrackerDeadlineId`, same all-day end-date rule (end is
// exclusive, so +1 day), same audit events.

import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { getCalendarClient, getServiceClient } from "@/lib/features/calendar/client";

export { getCalendarClient, getServiceClient } from "@/lib/features/calendar/client";
export {
  CALENDAR_SCOPES,
  getOAuthClient,
  handleGoogleCalendarCallback,
  isCalendarAdminRole,
  signState,
  startGoogleCalendarOAuth,
  verifyState,
} from "@/lib/features/calendar/oauth";

/**
 * All-day end date for a deadline: Google Calendar treats end.date as
 * EXCLUSIVE, so a same-day start/end is a zero-duration event that may
 * not render. End on the following day to make it a proper 1-day event.
 */
export function allDayEndDate(dueDate: string): string {
  const endDate = new Date(`${dueDate}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  return endDate.toISOString().split("T")[0];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncCalendar(supabase: any, orgId: string, userId: string): Promise<FeatureResult> {
  let calendar;
  try {
    calendar = await getCalendarClient(orgId);
  } catch (err: any) {
    throw new ApiError(400, err.message);
  }

  const serviceClient = getServiceClient();

  // Get pending deadlines for the next 90 days
  const today = new Date().toISOString().split("T")[0];
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: deadlines, error } = await serviceClient
    .from("deadlines")
    .select("id, deadline_type, due_date, resource_type, resource_id")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .gte("due_date", today)
    .lte("due_date", in90)
    .order("due_date");

  if (error) throw new ApiError(500, error.message);

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const d of deadlines || []) {
    // Resolve a human-readable title
    let title = `${d.deadline_type} deadline`;
    let description = `Permit Warden deadline (${d.resource_type})`;
    try {
      if (d.resource_type === "permit") {
        const { data: p } = await serviceClient
          .from("permits")
          .select("permit_type, permit_number, projects(name)")
          .eq("id", d.resource_id)
          .single();
        if (p) {
          title = `${p.permit_type || "Permit"} ${d.deadline_type}`.trim();
          if (p.permit_number) title += ` — ${p.permit_number}`;
          const projName = (p.projects as any)?.name;
          if (projName) description = `Project: ${projName}\n${description}`;
        }
      } else if (d.resource_type === "inspection") {
        const { data: i } = await serviceClient
          .from("inspections")
          .select("inspection_type")
          .eq("id", d.resource_id)
          .single();
        if (i) title = `${i.inspection_type} inspection — ${d.deadline_type}`;
      } else if (d.resource_type === "license") {
        const { data: l } = await serviceClient
          .from("licenses")
          .select("license_type, license_number")
          .eq("id", d.resource_id)
          .single();
        if (l) title = `${l.license_type || "License"} ${d.deadline_type}`.trim();
      }
    } catch {
      // keep generic title
    }

    // Avoid duplicates: check if an event with this deadline id already exists
    // We store the deadline id in extendedProperties.private
    try {
      const existing = await calendar.events.list({
        calendarId: "primary",
        privateExtendedProperty: [`permitTrackerDeadlineId=${d.id}`],
        maxResults: 1,
        singleEvents: true,
      });
      if (existing.data.items && existing.data.items.length > 0) {
        skipped++;
        continue;
      }

      const endDateStr = allDayEndDate(d.due_date);

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: `🔔 ${title}`,
          description,
          start: { date: d.due_date },
          end: { date: endDateStr },
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 24 * 60 },
              { method: "popup", minutes: 60 },
            ],
          },
          extendedProperties: {
            private: { permitTrackerDeadlineId: d.id },
          },
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`${d.id}: ${err.message}`);
    }
  }

  await serviceClient.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "google_calendar.synced",
    entity_type: "integration",
    entity_id: orgId,
  });

  return result(200, { created, skipped, errors: errors.slice(0, 10) });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function disconnectCalendar(supabase: any, userId: string): Promise<FeatureResult> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .limit(1)
    .single();
  const orgId = membership?.organization_id;
  if (!orgId) throw new ApiError(400, "No organization");
  if (membership?.role !== "owner" && membership?.role !== "admin")
    throw new ApiError(403, "Only workspace admins can disconnect Google Calendar");

  const serviceClient = getServiceClient();
  const { error } = await serviceClient
    .from("google_calendar_tokens")
    .delete()
    .eq("organization_id", orgId);

  if (error) throw new ApiError(500, error.message);
  return result(200, { disconnected: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCalendarStatus(supabase: any, userId: string): Promise<FeatureResult> {
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  if (!membership) throw new ApiError(400, "No organization");

  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("google_email, created_at")
    .eq("organization_id", membership.organization_id)
    .single();

  return result(200, {
    connected: !!data,
    google_email: data?.google_email || null,
    connected_at: data?.created_at || null,
    configured: !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET),
  });
}
