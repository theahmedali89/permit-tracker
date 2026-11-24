// Auth — core feature (pass 2 modularity).
//
// The five `app/auth/*` route handlers moved here: each function does
// the rate-limit check, the Supabase auth call, and returns the redirect
// target the route then passes to `redirect()`. The routes are now
// thin wrappers. Behaviour is identical: same rate limits (signin 10,
// signup 10, reset 5 per IP per 15 min), same error query params, same
// redirect targets, same open-redirect guard on the callback `next`
// param (only in-app paths starting with a single "/").
//
// The functions take the Supabase client as a parameter so tests can
// pass a fake; the route passes the real cookie client.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any;

import { checkRateLimit } from "@/lib/shared/rate-limit";

/** Thrown when the per-IP auth rate limit is hit; the route turns it into a 429. */
export class AuthRateLimitedError extends Error {
  readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super("Too many requests. Please try again later.");
    this.name = "AuthRateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function checkAuthLimit(kind: string, ip: string, limit: number): void {
  const result = checkRateLimit(`auth:${kind}:${ip}`, limit, 15 * 60 * 1000);
  if (!result.allowed) throw new AuthRateLimitedError(result.retryAfterSeconds);
}

/**
 * Open-redirect guard: only allow in-app paths starting with a single
 * "/" (rejects "//evil.com", absolute URLs, and backslash tricks).
 */
export function safeNextPath(rawNext: string | null | undefined): string {
  const next = rawNext ?? "/dashboard";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/dashboard";
}

/** POST /auth/signin — returns the redirect target. */
export async function signInWithPassword(
  supabase: AnyClient,
  ip: string,
  email: string,
  password: string
): Promise<string> {
  // Brute-force guard: 10 sign-in attempts per IP per 15 minutes.
  checkAuthLimit("signin", ip, 10);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return `/signin?error=${encodeURIComponent(error.message)}`;
  }
  return "/dashboard";
}

/** POST /auth/signup — returns the redirect target. */
export async function signUp(
  supabase: AnyClient,
  ip: string,
  email: string,
  password: string
): Promise<string> {
  // Abuse guard: 10 sign-ups per IP per 15 minutes.
  checkAuthLimit("signup", ip, 10);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  if (error) {
    return `/signup?error=${encodeURIComponent(error.message)}`;
  }
  return "/signin?message=Check your email to verify your account";
}

/** POST /auth/reset-password — returns the redirect target. */
export async function requestPasswordReset(
  supabase: AnyClient,
  ip: string,
  email: string
): Promise<string> {
  // Abuse guard: 5 reset requests per IP per 15 minutes.
  checkAuthLimit("reset", ip, 5);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password/confirm`,
  });
  if (error) {
    return `/reset-password?error=${encodeURIComponent(error.message)}`;
  }
  return "/signin?message=Password reset email sent. Check your inbox.";
}

/** GET /auth/callback — returns the redirect target. */
export async function exchangeCodeForSession(
  supabase: AnyClient,
  code: string | null,
  rawNext: string | null
): Promise<string> {
  const next = safeNextPath(rawNext);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return next;
    }
  }
  return "/signin?error=Could not verify email";
}

/** POST /auth/signout — returns the redirect target. */
export async function signOut(supabase: AnyClient): Promise<string> {
  await supabase.auth.signOut();
  return "/signin";
}
