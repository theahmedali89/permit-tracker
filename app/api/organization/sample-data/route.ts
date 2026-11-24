import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { removeSampleData } from "@/lib/features/onboarding-sample";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";

/** DELETE /api/organization/sample-data — remove the seeded SAMPLE rows. */
export async function DELETE() {
  try {
    requireFeatureEnabled("onboarding-sample");
  } catch (err) {
    if (err instanceof FeatureDisabledError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

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

  const result = await removeSampleData(supabase, membership.organization_id);
  return NextResponse.json({ ok: true, ...result });
}
