// Calculate permit/license status from dates (deterministic, no AI).
// Timezone-safe: YYYY-MM-DD values are parsed as LOCAL noon, never as
// UTC midnight (new Date("2026-01-15") is UTC and shifts a day in US
// timezones). Comparisons use local-noon-to-local-noon day counts.

export type PermitStatus =
  | "pending"
  | "active"
  | "expiring_soon"
  | "renewal_overdue"
  | "expired"
  | "renewal_required"
  | "closed";

/** Parse a YYYY-MM-DD date as local noon (immune to UTC-midnight shift). */
export function parseLocalNoon(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

const DAY_MS = 1000 * 60 * 60 * 24;

/** Whole days from `from` (default: today, local noon) until `dateStr`. */
export function daysUntilDate(dateStr: string, from: Date = new Date()): number {
  const fromNoon = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12, 0, 0, 0);
  return Math.round((parseLocalNoon(dateStr).getTime() - fromNoon.getTime()) / DAY_MS);
}

export function calculatePermitStatus(
  expirationDate: string | null,
  renewalDeadline: string | null
): PermitStatus {
  if (!expirationDate) return "pending";

  const daysUntilExpiry = daysUntilDate(expirationDate);
  if (daysUntilExpiry < 0) return "expired";

  // The renewal deadline is honoured: once it has passed but the permit
  // has not expired yet, the permit is renewal_overdue — never plain
  // "active", or the renewal would look fine until it is too late.
  if (renewalDeadline) {
    const daysUntilRenewal = daysUntilDate(renewalDeadline);
    if (daysUntilRenewal < 0) return "renewal_overdue";
    if (daysUntilRenewal <= 30) return "expiring_soon";
  }

  if (daysUntilExpiry <= 30) return "expiring_soon";
  return "active";
}
