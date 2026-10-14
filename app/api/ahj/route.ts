import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const state = searchParams.get("state");

  let query = supabase
    .from("ahj_directory")
    .select("*")
    .order("state", { ascending: true })
    .order("city", { ascending: true });

  if (state) query = query.eq("state", state.toUpperCase());
  if (search) {
    query = query.or(
      `authority_name.ilike.%${search}%,city.ilike.%${search}%,county.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Distinct states for the filter dropdown
  const { data: states } = await supabase
    .from("ahj_directory")
    .select("state")
    .order("state");
  const distinctStates = [...new Set((states || []).map((s: any) => s.state))];

  return NextResponse.json({ entries: data, states: distinctStates });
}
