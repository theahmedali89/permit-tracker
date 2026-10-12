import { createClient } from "@/lib/supabase/server";
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

  if (!name || !trade || !state) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name, trade, state, team_size })
    .select()
    .single();

  if (orgError) {
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  // Add user as owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  redirect("/dashboard");
}
