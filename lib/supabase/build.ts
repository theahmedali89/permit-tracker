import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for build-time data fetching.
 * generateStaticParams runs at build time without an HTTP request, so the
 * cookie-based client in ./server cannot be used there. This uses the public
 * anon key directly (ahj_directory allows public read via RLS).
 */
export function createBuildClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
