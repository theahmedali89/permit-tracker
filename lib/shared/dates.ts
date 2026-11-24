/**
 * Shared date helpers (2026-11-24 modularity fix).
 *
 * These were copied into four feature folders (smart-buffer,
 * timeline-calculator, risk-report, compliance-passport) with small
 * incompatible variations. There is now one copy, here in `lib/shared/`,
 * and the features import it. `lib/permit-status.ts` is NOT changed —
 * `daysUntil` below reuses its local-noon semantics (see the note on
 * `daysUntil`); `parseDate` keeps the local-midnight semantics the
 * features already used, so date arithmetic in them is unchanged.
 */

/** Parse a YYYY-MM-DD date as a local-midnight Date (no UTC shift). */
export function parseDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Format a Date as YYYY-MM-DD (local). */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD date as local noon (immune to UTC-midnight shift). */
function parseLocalNoon(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Whole days from today (default) until `dateStr` (YYYY-MM-DD).
 * Local-noon-to-local-noon, exactly like `daysUntilDate` in
 * `lib/permit-status.ts` — so a YYYY-MM-DD value never shifts a day in
 * US timezones, and DST transitions cannot move the count (rounded).
 */
export function daysUntil(dateStr: string, today = new Date()): number {
  const fromNoon = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0,
    0
  );
  return Math.round((parseLocalNoon(dateStr).getTime() - fromNoon.getTime()) / DAY_MS);
}

/**
 * Smart-buffer apply-by date: renewal deadline − processing days −
 * 7-day safety buffer. The single shared implementation of the rule
 * (previously duplicated in smart-buffer's `computeSmartBuffer` and
 * timeline-calculator's local `applyByFor`). When `processingDays` is
 * unknown/null, only the buffer is applied and `processingDays` is
 * reported as null (callers must say so).
 */
export function applyByDate(
  renewalDeadline: string,
  processingDays?: number | null,
  bufferDays = 7
): { applyByDate: string; processingDays: number | null } {
  const processing =
    typeof processingDays === "number" && processingDays > 0
      ? Math.round(processingDays)
      : null;
  const applyBy = parseDate(renewalDeadline);
  applyBy.setDate(applyBy.getDate() - (processing ?? 0) - bufferDays);
  return { applyByDate: toDateString(applyBy), processingDays: processing };
}
