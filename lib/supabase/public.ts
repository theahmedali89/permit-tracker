import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for PUBLIC data fetches (blog posts, AHJ
 * directory, sitemap). Unlike lib/supabase/server it never touches cookies,
 * so pages that use it stay static/ISR instead of becoming dynamic on every
 * request — which is what the audit flagged on the public SEO pages.
 *
 * Only use it for data that is public under RLS (published blog_posts,
 * ahj_directory, jurisdiction_regulations). Never use it where the query
 * depends on the signed-in user — those pages keep the cookie client.
 * Keep `revalidate = 3600` on pages that use it.
 */
export function createPublicClient() {
  // Build-time resilience: without env vars (e.g. a fresh checkout) the
  // Supabase client constructor throws "supabaseUrl is required" and the
  // whole `next build` fails at prerender time. Fall back to inert
  // placeholders so pages render their empty/404 states instead. The
  // custom fetch rejects immediately — a real network call to a
  // placeholder host would hang until Next's 60s prerender timeout
  // (that exact failure was seen on 24 Nov 2026). Every query then
  // fails fast and callers handle empty data. In production
  // NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are always
  // set (see .env.example) and this fallback never runs.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return createClient(url, anonKey, {
    global: configured
      ? undefined
      : {
          fetch: () =>
            Promise.reject(
              new Error("Supabase is not configured (missing env vars)")
            ),
        },
  });
}
