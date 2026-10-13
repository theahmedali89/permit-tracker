import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service role client — bypasses RLS.
 * Use ONLY in trusted server-side operations (e.g. onboarding).
 * Never expose to the client.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
