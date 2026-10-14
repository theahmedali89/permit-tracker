import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

async function getMembership(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data;
}

// List team members + pending invites
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(supabase, user.id);
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data: members, error } = await supabase
    .from("organization_members")
    .select("id, role, created_at, user_id")
    .eq("organization_id", membership.organization_id)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: invites } = await supabase
    .from("team_invites")
    .select("id, email, role, status, expires_at, created_at")
    .eq("organization_id", membership.organization_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return NextResponse.json({
    members: (members || []).map((m: any) => ({ ...m, is_self: m.user_id === user.id })),
    invites: invites || [],
    my_role: membership.role,
  });
}

// Invite a team member (owner/admin only)
// Creates a pending invite record; the invited user signs up with the
// invited email and an admin links them to the org.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(supabase, user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
  }

  const body = await request.json();
  const { email, role } = body;

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!["admin", "member"].includes(role)) {
    return NextResponse.json({ error: "Role must be admin or member" }, { status: 400 });
  }

  // Prevent duplicate pending invite
  const { data: existing } = await supabase
    .from("team_invites")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .eq("email", email.toLowerCase())
    .eq("status", "pending")
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "An invite is already pending for this email" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("team_invites")
    .insert({
      organization_id: membership.organization_id,
      email: email.toLowerCase(),
      role,
      status: "pending",
      token: randomUUID(),
      invited_by: user.id,
    })
    .select("id, email, role, status, expires_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    invite: data,
    message: `Invite created for ${email}. Ask them to sign up with this email, then accept the invite from this page.`,
  }, { status: 201 });
}

// Revoke an invite or remove a member (owner/admin only)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await getMembership(supabase, user.id);
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Only owners and admins can manage the team" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get("invite_id");
  const memberId = searchParams.get("member_id");

  if (inviteId) {
    const { error } = await supabase
      .from("team_invites")
      .update({ status: "revoked" })
      .eq("id", inviteId)
      .eq("organization_id", membership.organization_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (memberId) {
    const { data: target } = await supabase
      .from("organization_members")
      .select("id, user_id, role")
      .eq("id", memberId)
      .eq("organization_id", membership.organization_id)
      .single();
    if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 });
    if (target.user_id === user.id) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }
    if (target.role === "owner") {
      const { count } = await supabase
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id)
        .eq("role", "owner");
      if ((count || 0) <= 1) {
        return NextResponse.json({ error: "Cannot remove the last owner" }, { status: 400 });
      }
    }
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId)
      .eq("organization_id", membership.organization_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invite_id or member_id required" }, { status: 400 });
}
