// Shared auth/org resolution for thin API routes (pass 2 modularity).
//
// Before this pass every route repeated the same three lines:
// create the Supabase client, `getUser()`, `getActiveOrgId()`. That
// boilerplate is now one call. Behaviour is identical: 401 when there
// is no signed-in user, 400 when the user belongs to no organization.

import { getActiveOrgId } from "@/lib/shared/org-context";
import { ApiError } from "@/lib/shared/http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthOrgContext {
  user: { id: string; email?: string | null };
  orgId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
}

/**
 * Resolve the signed-in user + active org for a route handler.
 * Throws ApiError(401) with "Unauthorized" or ApiError(400) with
 * "No organization", exactly as the inline handlers returned.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireAuthOrg(supabase: any): Promise<AuthOrgContext> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError(401, "Unauthorized");
  const orgId = await getActiveOrgId(supabase, user.id);
  if (!orgId) throw new ApiError(400, "No organization");
  return { user, orgId, supabase };
}

/**
 * Resolve the signed-in user only (routes that do not act on an org,
 * e.g. team-invite accept). Throws ApiError(401) when anonymous.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requireAuthUser(supabase: any): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new ApiError(401, "Unauthorized");
  return { user, supabase };
}
