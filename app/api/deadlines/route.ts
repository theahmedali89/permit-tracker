// Thin route: deadline logic lives in lib/features/reminders.
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import { createDeadline, updateDeadline } from "@/lib/features/reminders";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    const body = await request.json();
    return createDeadline(supabase, orgId, body);
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    const body = await request.json();
    return updateDeadline(supabase, orgId, body);
  });
}
