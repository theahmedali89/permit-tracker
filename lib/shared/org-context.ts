// Single source of truth for "which organization is this request acting
// on". Multi-org users pick an active org (cookie `pw_active_org`, set by
// POST /api/organization/switch); the cookie is only honoured when the
// user is actually a member of that org. Otherwise the earliest-created
// membership wins deterministically (ordered by created_at).

import { cookies } from "next/headers";

export const ACTIVE_ORG_COOKIE = "pw_active_org";

/**
 * Resolve the active organization id for a user, or null when the user
 * belongs to no organization.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getActiveOrgId(supabase: any, userId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const activeOrg = cookieStore.get(ACTIVE_ORG_COOKIE)?.value;
  if (activeOrg) {
    const { data } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("organization_id", activeOrg)
      .limit(1)
      .single();
    if (data?.organization_id) return data.organization_id;
    // Cookie points at an org the user is not a member of: ignore it and
    // fall through to the deterministic default below.
  }

  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data?.organization_id ?? null;
}

/** True when `userId` is a member of `organizationId`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isOrgMember(supabase: any, userId: string, organizationId: string): Promise<boolean> {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .limit(1)
    .single();
  return !!data;
}

/**
 * Cross-tenant FK guard: true when the parent row (`table`/`id`) belongs
 * to `organizationId`. Returns false when the row is missing or belongs
 * to another org — callers answer 403/404.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyParentOrg(
  supabase: any,
  table: string,
  id: string,
  organizationId: string
): Promise<boolean> {
  const { data } = await supabase
    .from(table)
    .select("organization_id")
    .eq("id", id)
    .single();
  return !!data && data.organization_id === organizationId;
}
