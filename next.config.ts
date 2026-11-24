import type { NextConfig } from "next";

// Fail fast at build time (pass 2 modularity fix).
//
// Pass 1 found a no-env `next build` did NOT fail fast: it compiled and
// prerendered pages against the placeholder fallbacks in
// `lib/supabase/public.ts` (each DB call failing only after the fact),
// so a build with no Supabase credentials at all looked like a success
// and served empty data. Throw here — before compilation — with a clear
// message when the required public env vars are absent.
//
// Detection: `NEXT_PHASE` is only set to `phase-production-build` AFTER
// the config is loaded (it is set just before static generation), so it
// cannot gate this check on its own — the CLI argv is the reliable
// signal (`next build` → argv contains "build"; `next dev` / `next
// start` do not). The check therefore runs only for builds: dev, start
// and type-checking are unaffected, and a build WITH env vars
// (including the placeholder env used for smoke-test builds) is
// unaffected. The `lib/supabase/public.ts` fallback is kept for runtime
// resilience; this check only stops a credential-less *build*.
const isProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.slice(2).includes("build");
if (isProductionBuild) {
  const missingEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter((key) => !process.env[key]);
  if (missingEnv.length > 0) {
    throw new Error(
      `Permit Warden build failed fast: missing required env var(s): ${missingEnv.join(", ")}. ` +
        `Set them (see .env.example) before running \`next build\`. ` +
        `Without them the build would prerender every page against dead placeholder data.`
    );
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.resend.com https://www.google-analytics.com https://region1.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
