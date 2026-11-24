import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { seedSampleData } from "@/lib/features/onboarding-sample";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const trade = formData.get("trade") as string;
  const state = formData.get("state") as string;
  const team_size = formData.get("team_size") as string || null;
  const wantSampleData = formData.get("sample_data") === "1";

  if (!name || !trade || !state) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Use service role for onboarding — bypasses RLS for the bootstrap flow
  // (user is authenticated; this is a trusted server-side operation)
  const admin = createServiceClient();

  // Create organization
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name, trade, state, team_size })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // Add user as owner
  const { error: memberError } = await admin
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Optional sample data (checkbox on the onboarding form, on by default):
  // 1 sample project + 3 sample permits in Austin, TX. A failure here
  // must not block onboarding — the org already exists.
  if (wantSampleData) {
    try {
      await seedSampleData(admin, org.id);
    } catch (err: any) {
      console.error("[onboarding] Sample data seeding failed:", err?.message);
    }
  }

  redirect("/dashboard");
}
