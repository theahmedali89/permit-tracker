// Thin route: calendar status logic lives in lib/features/calendar.
import { createClient } from "@/lib/supabase/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthUser } from "@/lib/shared/route-helpers";
import { getCalendarStatus } from "@/lib/features/calendar";

// GET /api/calendar/status — is Google Calendar connected?
export async function GET() {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    return getCalendarStatus(supabase, user.id);
  });
}
