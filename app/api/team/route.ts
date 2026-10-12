import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Invite a team member (owner/admin only)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user is owner/admin
  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role required" }, { status: 400 });
  }

  if (!["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Check if user exists by email - we can't query auth.users directly
  // For MVP, we'll create a pending invite record
  // In production, use Supabase Auth Admin API to invite

  // For now, return instructions
  // TODO: Implement with Supabase Auth Admin inviteUserByEmail

  return NextResponse.json({
    message: "Invite functionality requires Supabase Auth Admin API. Use Supabase dashboard to invite users, then add them to the organization.",
    email,
    role,
    organization_id: membership.organization_id,
  });
}

// List team members
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

  const { data, error } = await supabase
    .from("organization_members")
    .select("id, role, created_at, user_id")
    .eq("organization_id", membership.organization_id)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
