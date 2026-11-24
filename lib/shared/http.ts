// Shared HTTP plumbing for thin API routes (pass 2 modularity).
//
// Feature functions never touch NextResponse: they return a
// `FeatureResult` ({ status, body }) or throw an `ApiError`. The route
// only resolves auth/org context, calls one feature function, and
// converts the result with `toResponse` / `errorResponse` below.
// This keeps the status codes and JSON shapes identical to the old
// inline handlers (which returned `NextResponse.json({ error }, …)`).

import { NextResponse } from "next/server";

export interface FeatureResult<T = unknown> {
  status: number;
  body: T;
}

/** Success result — mirrors `NextResponse.json(body, { status })`. */
export function result<T>(status: number, body: T): FeatureResult<T> {
  return { status, body };
}

/**
 * Error thrown by feature functions. `extra` is merged into the JSON
 * error body (e.g. `{ upgrade: true }` on 402 plan-limit responses),
 * exactly as the old handlers did.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly extra?: Record<string, unknown>;
  constructor(status: number, message: string, extra?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.extra = extra;
  }
  body(): Record<string, unknown> {
    return { error: this.message, ...(this.extra ?? {}) };
  }
}

/** Convert a feature result into the HTTP response. */
export function toResponse<T>(r: FeatureResult<T>): NextResponse {
  return NextResponse.json(r.body, { status: r.status });
}

/**
 * Convert a thrown error into the HTTP response. Returns null for
 * unexpected errors so the route can rethrow (Next.js then returns its
 * own 500, as before).
 */
export function errorResponse(err: unknown): NextResponse | null {
  if (err instanceof ApiError) {
    return NextResponse.json(err.body(), { status: err.status });
  }
  return null;
}

/** Route wrapper: run a feature call and translate its outcome. */
export async function runFeature<T>(
  fn: () => Promise<FeatureResult<T>>
): Promise<NextResponse> {
  try {
    return toResponse(await fn());
  } catch (err) {
    const res = errorResponse(err);
    if (res) return res;
    throw err;
  }
}
