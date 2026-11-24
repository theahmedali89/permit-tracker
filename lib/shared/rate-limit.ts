// Tiny in-memory per-key rate limiter (fixed window).
// NOTE: state lives in the server process, so on multi-instance deploys
// each instance enforces its own budget. That is enough to blunt abuse of
// public endpoints; a shared store (e.g. Upstash) is the upgrade path.

import { NextRequest, NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfterSeconds: number;
  remaining: number;
};

/**
 * Check (and consume) one hit for `key` against `limit` per `windowMs`.
 * Returns `{ allowed: false }` when the budget is exhausted.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
      remaining: 0,
    };
  }
  entry.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: limit - entry.count,
  };
}

/** 429 JSON response with a Retry-After header. */
export function rateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/** Remove expired windows so the map does not grow unboundedly. */
export function pruneRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}
