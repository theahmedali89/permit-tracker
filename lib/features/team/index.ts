// Team — core feature (pass 2 modularity).
//
// Moved verbatim from `app/api/team/route.ts` (list / invite / remove)
// and `app/api/team/accept/route.ts` (accept). The routes are now thin
// (auth resolution + one feature call). Behaviour is identical:
// same role checks, same plan-limit enforcement, same duplicate-invite
// 409, same best-effort invite email, same last-owner guard, same
// service-role accept flow (the "add yourself to an org" RLS policy
// was deliberately removed — see the old accept route).

import { Resend } from "resend";
import { randomUUID } from "crypto";
import { enforcePlanLimit } from "@/lib/features/billing";
import { escapeHtml } from "@/lib/shared/escape-html";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";

export const TEAM_ROLES = ["owner", "admin", "member"] as const;
export const INVITABLE_ROLES = ["admin", "member"] as const;

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

/** Validate an invite body. Returns the normalised email + role. */
export function validateInvite(body: Record<string, unknown>): { email: string; role: string } {
  const { email, role } = body;
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Valid email required");
  }
  if (!INVITABLE_ROLES.includes(role as "admin" | "member")) {
    throw new ApiError(400, "Role must be admin or member");
  }
  return { email: email.toLowerCase(), role: role as string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMembership(supabase: any, userId: string): Promise<{ organization_id: string; role: string } | null> {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listTeam(supabase: any, userId: string): Promise<FeatureResult> {
  const membership = await getMembership(supabase, userId);
  if (!membership) throw new ApiError(400, "No organization");

  const { data: members, error } = await supabase
    .from("organization_members")
    .select("id, role, created_at, user_id")
    .eq("organization_id", membership.organization_id)
    .order("created_at");

  if (error) throw new ApiError(500, error.message);

  const { data: invites } = await supabase
    .from("team_invites")
    .select("id, email, role, status, expires_at, created_at")
    .eq("organization_id", membership.organization_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return result(200, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    members: (members || []).map((m: any) => ({ ...m, is_self: m.user_id === userId })),
    invites: invites || [],
    my_role: membership.role,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function inviteMember(supabase: any, userId: string, body: unknown): Promise<FeatureResult> {
  const membership = await getMembership(supabase, userId);
  if (!membership || !isAdminRole(membership.role)) {
    throw new ApiError(403, "Only owners and admins can invite members");
  }

  const { email, role } = validateInvite((body ?? {}) as Record<string, unknown>);

  // Plan enforcement (before creating the invite)
  const planCheck = await enforcePlanLimit(supabase, membership.organization_id, "team");
  if (!planCheck.allowed) {
    throw new ApiError(402, planCheck.message, { upgrade: true });
  }

  // Prevent duplicate pending invite
  const { data: existing } = await supabase
    .from("team_invites")
    .select("id")
    .eq("organization_id", membership.organization_id)
    .eq("email", email)
    .eq("status", "pending")
    .limit(1);

  if (existing && existing.length > 0) {
    throw new ApiError(409, "An invite is already pending for this email");
  }

  const { data, error } = await supabase
    .from("team_invites")
    .insert({
      organization_id: membership.organization_id,
      email,
      role,
      status: "pending",
      token: randomUUID(),
      invited_by: userId,
    })
    .select("id, email, role, status, expires_at, token")
    .single();

  if (error) throw new ApiError(500, error.message);

  // Send the invite email (best-effort: the invite record already exists,
  // so a mail failure is reported, not fatal).
  let emailSent = false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const acceptUrl = `${appUrl}/signup?invite=${encodeURIComponent(data.token)}`;
    const { error: mailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "You've been invited to join a team on Permit Warden",
      html: `
        <h2>You're invited to Permit Warden</h2>
        <p>You've been invited to join a team as <strong>${escapeHtml(role)}</strong>.</p>
        <p>Sign up with this email address, then accept the invite from Settings → Team.</p>
        <p><a href="${escapeHtml(acceptUrl)}">Accept your invite</a></p>
        <p>This invite expires in 7 days.</p>
      `,
      text: `You've been invited to join a team on Permit Warden as ${role}.\nSign up with this email address, then accept the invite from Settings → Team.\nAccept your invite: ${acceptUrl}\nThis invite expires in 7 days.\n`,
    });
    if (mailError) {
      console.error("team invite email failed:", mailError);
    } else {
      emailSent = true;
    }
  } catch (err) {
    console.error("team invite email failed:", err instanceof Error ? err.message : err);
  }

  return result(201, {
    invite: data,
    email_sent: emailSent,
    message: emailSent
      ? `Invite sent to ${email}.`
      : `Invite created for ${email}, but the invite email could not be sent. Ask them to sign up with this email, then accept the invite from Settings → Team.`,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function removeTeamMember(supabase: any, userId: string, searchParams: URLSearchParams): Promise<FeatureResult> {
  const membership = await getMembership(supabase, userId);
  if (!membership || !isAdminRole(membership.role)) {
    throw new ApiError(403, "Only owners and admins can manage the team");
  }

  const inviteId = searchParams.get("invite_id");
  const memberId = searchParams.get("member_id");

  if (inviteId) {
    const { error } = await supabase
      .from("team_invites")
      .update({ status: "revoked" })
      .eq("id", inviteId)
      .eq("organization_id", membership.organization_id);
    if (error) throw new ApiError(500, error.message);
    return result(200, { ok: true });
  }

  if (memberId) {
    const { data: target } = await supabase
      .from("organization_members")
      .select("id, user_id, role")
      .eq("id", memberId)
      .eq("organization_id", membership.organization_id)
      .single();
    if (!target) throw new ApiError(404, "Member not found");
    if (target.user_id === userId) {
      throw new ApiError(400, "You cannot remove yourself");
    }
    if (target.role === "owner") {
      const { count } = await supabase
        .from("organization_members")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", membership.organization_id)
        .eq("role", "owner");
      if ((count || 0) <= 1) {
        throw new ApiError(400, "Cannot remove the last owner");
      }
    }
    const { data: deleted, error } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId)
      .eq("organization_id", membership.organization_id)
      .select("id");
    if (error) throw new ApiError(500, error.message);
    // A delete that matches 0 rows (e.g. RLS) must not report success.
    if (!deleted || deleted.length === 0) {
      throw new ApiError(400, "Member could not be removed");
    }
    return result(200, { ok: true });
  }

  throw new ApiError(400, "invite_id or member_id required");
}

/**
 * Accept a team invite. The invite token is verified server-side;
 * membership is inserted with the service-role client because the
 * "add yourself to an org" RLS policy was deliberately removed
 * (tenant-takeover risk).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function acceptInvite(service: any, userId: string, userEmail: string | undefined, token: unknown): Promise<FeatureResult> {
  if (!userEmail) throw new ApiError(400, "Your account has no email address");
  if (!token || typeof token !== "string") {
    throw new ApiError(400, "Invite token required");
  }

  const { data: invite, error } = await service
    .from("team_invites")
    .select("id, organization_id, email, role, status, expires_at")
    .eq("token", token)
    .single();
  if (error || !invite) {
    throw new ApiError(404, "Invite not found");
  }
  if (invite.status !== "pending") {
    throw new ApiError(400, `This invite is ${invite.status}`);
  }
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    throw new ApiError(400, "This invite has expired");
  }
  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new ApiError(403, "This invite was sent to a different email address. Sign in with the invited email.");
  }

  // Already a member? Just mark the invite accepted.
  const { data: existingMember } = await service
    .from("organization_members")
    .select("id")
    .eq("organization_id", invite.organization_id)
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (!existingMember) {
    const { error: insertError } = await service
      .from("organization_members")
      .insert({
        organization_id: invite.organization_id,
        user_id: userId,
        role: invite.role,
      });
    if (insertError) {
      throw new ApiError(500, insertError.message);
    }
  }

  const { error: updateError } = await service
    .from("team_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);
  if (updateError) {
    throw new ApiError(500, updateError.message);
  }

  return result(200, { ok: true, organization_id: invite.organization_id });
}
