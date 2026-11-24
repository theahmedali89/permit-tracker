// Thin route: team logic lives in lib/features/team.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthUser } from "@/lib/shared/route-helpers";
import {
  inviteMember,
  listTeam,
  removeTeamMember,
} from "@/lib/features/team";

export async function GET() {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    return listTeam(supabase, user.id);
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    const body = await request.json();
    return inviteMember(supabase, user.id, body);
  });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { user } = await requireAuthUser(supabase);
    return removeTeamMember(supabase, user.id, new URL(request.url).searchParams);
  });
}
