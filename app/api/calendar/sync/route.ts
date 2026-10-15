import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getCalendarClient, getServiceClient } from "../lib";

async function getOrgId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.organization_id;
}

// POST /api/calendar/sync — push upcoming deadlines to Google Calendar
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  let calendar;
  try {
    calendar = await getCalendarClient(orgId);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const d of deadlines || []) {
    // Resolve a human-readable title
    let title = `${d.deadline_type} deadline`;
    let description = `Permit Tracker deadline (${d.resource_type})`;
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

      // Google Calendar treats end.date as EXCLUSIVE for all-day events,
      // so a same-day start/end is a zero-duration event that may not render.
      // End on the following day to make it a proper 1-day all-day event.
      const endDate = new Date(`${d.due_date}T00:00:00Z`);
      endDate.setUTCDate(endDate.getUTCDate() + 1);
      const endDateStr = endDate.toISOString().split("T")[0];

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
    actor_id: user.id,
    action: "google_calendar.synced",
    entity_type: "integration",
    entity_id: orgId,
  });

  return NextResponse.json({ created, skipped, errors: errors.slice(0, 10) });
}

// DELETE /api/calendar/sync — disconnect Google Calendar
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const serviceClient = getServiceClient();
  const { error } = await serviceClient
    .from("google_calendar_tokens")
    .delete()
    .eq("organization_id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ disconnected: true });
}
