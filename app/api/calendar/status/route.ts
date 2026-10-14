import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/calendar/status — is Google Calendar connected?
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data } = await supabase
    .from("google_calendar_tokens")
    .select("google_email, created_at")
    .eq("organization_id", membership.organization_id)
    .single();

  return NextResponse.json({
    connected: !!data,
    google_email: data?.google_email || null,
    connected_at: data?.created_at || null,
    configured: !!(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET),
  });
}
