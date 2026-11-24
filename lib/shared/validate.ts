// Shared request validation helpers for API routes.
// Every helper throws a plain Error with a human-readable message; route
// handlers catch it and return 400. No Zod dependency is introduced.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
}

/** Required non-empty string (trimmed). Throws on missing/empty/wrong type. */
export function requireString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  if (value.trim().length > maxLength) {
    throw new Error(`${field} is too long (max ${maxLength} characters)`);
  }
  return value.trim();
}

/** Optional string; null/undefined/"" become null. Throws on wrong type. */
export function optionalString(value: unknown, field: string, maxLength = 500): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  if (value.length > maxLength) {
    throw new Error(`${field} is too long (max ${maxLength} characters)`);
  }
  return value;
}

/** Optional YYYY-MM-DD date; null/undefined/"" become null. Throws if invalid. */
export function optionalDate(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (!isValidDateString(value)) {
    throw new Error(`${field} must be a valid date in YYYY-MM-DD format`);
  }
  return value;
}

/** Required YYYY-MM-DD date. Throws if missing or invalid. */
export function requireDate(value: unknown, field: string): string {
  const date = optionalDate(value, field);
  if (!date) throw new Error(`${field} is required`);
  return date;
}

/** Value must be one of `allowed`. Throws otherwise. */
export function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T {
  if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

/** Optional enum; null/undefined/"" become null. Throws if not allowed. */
export function optionalEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T | null {
  if (value === undefined || value === null || value === "") return null;
  return enumValue(value, allowed, field);
}

export type Pagination = { page: number; limit: number; from: number; to: number };

/**
 * Parse ?page&limit (default limit 50, max 200) into a Supabase .range()
 * window. Non-numeric / out-of-range values fall back to the defaults.
 */
export function parsePagination(
  searchParams: URLSearchParams,
  opts: { defaultLimit?: number; maxLimit?: number } = {}
): Pagination {
  const defaultLimit = opts.defaultLimit ?? 50;
  const maxLimit = opts.maxLimit ?? 200;
  const rawPage = Number(searchParams.get("page"));
  const rawLimit = Number(searchParams.get("limit"));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1
    ? Math.min(Math.floor(rawLimit), maxLimit)
    : defaultLimit;
  const from = (page - 1) * limit;
  return { page, limit, from, to: from + limit - 1 };
}

/** Read a JSON body, returning null (instead of throwing) on bad JSON. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
