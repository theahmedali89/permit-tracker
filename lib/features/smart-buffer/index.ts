/**
 * Smart renewal buffer — "apply by" date for a permit renewal.
 *
 * Rule (already used by the reminder cron, now surfaced in the UI):
 *   applyByDate = renewal_deadline − processing_days − 7 days
 * The 7 days are a safety margin on top of the jurisdiction's published
 * processing time. Processing days come ONLY from the verified
 * regulation data (`lib/shared/jurisdiction-data`, 20 cities) — never invented.
 *
 * This module is pure (no DB, no network) so it can be unit-tested and
 * reused by server components, the dashboard, and public tools.
 */
import { getRegulation, type RegulationData } from "@/lib/shared/jurisdiction-data";
import { applyByDate, daysUntil, parseDate, toDateString } from "@/lib/shared/dates";
import { parseJurisdiction } from "@/lib/shared/jurisdiction";

// Re-exported for compatibility: pages/tests that imported these helpers
// from this feature keep working. New code should import them from
// `@/lib/shared/dates` / `@/lib/shared/jurisdiction` directly.
export { parseDate, toDateString, daysUntil, parseJurisdiction };

export const BUFFER_DAYS = 7;

export type BufferUrgency = "overdue" | "urgent" | "soon" | "ok";

export interface SmartBufferInput {
  /** Renewal deadline (YYYY-MM-DD). Required — without it there is no buffer. */
  renewalDeadline: string | null | undefined;
  /** Jurisdiction processing time in days, from verified regulation data. */
  processingDays?: number | null;
}

export interface SmartBufferResult {
  /** Date the renewal application should be filed by (YYYY-MM-DD). */
  applyByDate: string;
  /** Days from today until the apply-by date (negative = already passed). */
  daysUntilApplyBy: number;
  /** Days from today until the renewal deadline itself. */
  daysUntilRenewal: number;
  urgency: BufferUrgency;
  processingDays: number | null;
  bufferDays: number;
  renewalDeadline: string;
}

/**
 * Core computation. Returns null when there is no renewal deadline to
 * work from. When processingDays is unknown, only the 7-day buffer is
 * applied and `processingDays` is reported as null (callers must say so).
 * The apply-by date itself comes from the shared `applyByDate` helper
 * (`lib/shared/dates.ts`) — the same rule the timeline calculator uses.
 */
export function computeSmartBuffer(input: SmartBufferInput): SmartBufferResult | null {
  if (!input.renewalDeadline) return null;
  const { applyByDate: applyByDateStr, processingDays: processing } = applyByDate(
    input.renewalDeadline,
    input.processingDays,
    BUFFER_DAYS
  );
  const daysUntilApplyBy = daysUntil(applyByDateStr);
  return {
    applyByDate: applyByDateStr,
    daysUntilApplyBy,
    daysUntilRenewal: daysUntil(input.renewalDeadline),
    urgency: urgencyFor(daysUntilApplyBy),
    processingDays: processing,
    bufferDays: BUFFER_DAYS,
    renewalDeadline: input.renewalDeadline,
  };
}

export function urgencyFor(daysUntilApplyBy: number): BufferUrgency {
  if (daysUntilApplyBy < 0) return "overdue";
  if (daysUntilApplyBy <= 7) return "urgent";
  if (daysUntilApplyBy <= 30) return "soon";
  return "ok";
}

export function urgencyLabel(urgency: BufferUrgency): string {
  switch (urgency) {
    case "overdue":
      return "Apply-by date has passed — renew now";
    case "urgent":
      return "Apply this week";
    case "soon":
      return "Apply soon";
    case "ok":
      return "On track";
  }
}

/**
 * Convenience wrapper: look up the verified regulation for a permit's
 * jurisdiction and compute its buffer. Returns null when the permit has
 * no renewal deadline or no regulation data exists for its jurisdiction.
 */
export function smartBufferForPermit(permit: {
  renewal_deadline?: string | null;
  renewalDeadline?: string | null;
  jurisdiction?: string | null;
  issuing_authority?: string | null;
  state?: string | null;
}): { buffer: SmartBufferResult; regulation: RegulationData } | null {
  const renewalDeadline = permit.renewal_deadline ?? permit.renewalDeadline ?? null;
  if (!renewalDeadline) return null;
  const { city, stateCode } = parseJurisdiction(permit.jurisdiction);
  // Fall back to issuing_authority as the city name when jurisdiction is empty.
  const lookupCity = city ?? permit.issuing_authority ?? null;
  const lookupState = stateCode ?? permit.state ?? "";
  if (!lookupCity || !lookupState) return null;
  const regulation = getRegulation(lookupState, lookupCity);
  if (!regulation) return null;
  const buffer = computeSmartBuffer({
    renewalDeadline,
    processingDays: regulation.processing_days ?? null,
  });
  if (!buffer) return null;
  return { buffer, regulation };
}
