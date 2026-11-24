// Platform-admin check: the people allowed to manage public content
// (blog posts, jurisdiction regulations). Two sources, either is enough:
//  1. PLATFORM_ADMIN_EMAILS env var (comma-separated emails), and
//  2. the `platform_admins` table (see supabase/migration-security-fixes.sql),
//     checked with the service-role client so RLS cannot hide rows.
//
// NOTE: SQL policies cannot read env vars, so the `is_platform_admin()`
// Postgres helper only consults the table. Keep env-listed admins in the
// table too (or rely on the API-layer check here, which consults both).

import { createServiceClient } from "@/lib/supabase/service";

/** Admin emails from the PLATFORM_ADMIN_EMAILS env var, lower-cased. */
export function getPlatformAdminEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * True when `email` belongs to a platform admin (env allow-list or
 * platform_admins table). Never throws — returns false on DB errors.
 */
export async function isPlatformAdmin(
  email: string | null | undefined
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (getPlatformAdminEmails().includes(normalized)) return true;
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("platform_admins")
      .select("user_id")
      .eq("email", normalized)
      .limit(1);
    if (error) return false;
    return !!data && data.length > 0;
  } catch {
    return false;
  }
}

/**
 * True when `userId` has a row in platform_admins (or the user's email is
 * in the env allow-list). Prefer this when only a user id is at hand.
 */
export async function isPlatformAdminUser(
  userId: string | null | undefined,
  email?: string | null
): Promise<boolean> {
  if (email && (await isPlatformAdmin(email))) return true;
  if (!userId) return false;
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("platform_admins")
      .select("user_id")
      .eq("user_id", userId)
      .limit(1);
    if (error) return false;
    return !!data && data.length > 0;
  } catch {
    return false;
  }
}
