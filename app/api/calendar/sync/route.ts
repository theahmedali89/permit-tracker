// Thin route: calendar sync logic lives in lib/features/calendar.
import { createClient } from "@/lib/supabase/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg, requireAuthUser } from "@/lib/shared/route-helpers";
import { disconnectCalendar, syncCalendar } from "@/lib/features/calendar";

// POST /api/calendar/sync — push upcoming deadlines to Google Calendar
export async function POST() {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    return syncCalendar(supabase, orgId, user.id);
  });
}

// DELETE /api/calendar/sync — disconnect Google Calendar
export async function DELETE() {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    return disconnectCalendar(supabase, user.id);
  });
}
