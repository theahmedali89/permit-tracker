/**
 * Shared jurisdiction helpers (2026-11-24 modularity fix).
 *
 * `parseJurisdiction` was copied into smart-buffer and risk-report with
 * identical bodies. There is now one copy, here in `lib/shared/`.
 */

/** Split a free-text jurisdiction ("Austin, TX" / "Austin") into city + state. */
export function parseJurisdiction(jurisdiction: string | null | undefined): {
  city: string | null;
  stateCode: string | null;
} {
  if (!jurisdiction) return { city: null, stateCode: null };
  const parts = jurisdiction.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0], stateCode: parts[parts.length - 1] };
  return { city: parts[0] ?? null, stateCode: null };
}
