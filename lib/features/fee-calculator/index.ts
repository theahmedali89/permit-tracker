/**
 * Permit fee & cost-of-delay calculator.
 *
 * Uses ONLY data already in the repo:
 * - Daily fines from `lib/shared/fine-schedules.ts` (FINES — verified
 *   against primary municipal sources, 2026-10-17).
 * - Extension fees (`extension_fee_usd`) from the verified regulation
 *   data (`lib/shared/jurisdiction-data.ts`) where present — today only
 *   New York City publishes one ($130).
 *
 * Everything else (the permit fee itself, re-application cost, crew
 * downtime) is user-entered or labelled "estimate — check your AHJ fee
 * schedule". Nothing is invented.
 */
import { FINES } from "@/lib/shared/fine-schedules";
import { REGULATION_DATA } from "@/lib/shared/jurisdiction-data";

/** Fine cities, with a parsed daily rate where the source is a daily fine. */
export interface FineSchedule {
  city: string;
  figure: string;
  label: string;
  source: string;
  sourceUrl: string;
  /** Daily fine, low end (null when the fine is per-violation, not daily). */
  dailyLowUsd: number | null;
  /** Daily fine, high end (null when per-violation or a single rate). */
  dailyHighUsd: number | null;
  /** Regulation key (e.g. "NY:New York") when the city is in the regulation data. */
  regulationKey: string | null;
}

function parseDaily(figure: string): { low: number | null; high: number | null } {
  // "$500/day" -> 500; "$200 → $800/day" -> 200/800; "$800–$4,000" (per violation) -> null
  if (!figure.includes("/day")) return { low: null, high: null };
  const nums = [...figure.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, "")));
  if (nums.length === 0) return { low: null, high: null };
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: Math.min(...nums), high: Math.max(...nums) };
}

const REGULATION_KEY_BY_FINE_CITY: Record<string, string> = {
  "New York City": "NY:New York",
  Chicago: "IL:Chicago",
};

export const FINE_SCHEDULES: FineSchedule[] = FINES.map((f) => {
  const { low, high } = parseDaily(f.figure);
  return {
    city: f.city,
    figure: f.figure,
    label: f.label,
    source: f.source,
    sourceUrl: f.sourceUrl,
    dailyLowUsd: low,
    dailyHighUsd: high,
    regulationKey: REGULATION_KEY_BY_FINE_CITY[f.city] ?? null,
  };
});

export function findFineSchedule(city: string): FineSchedule | undefined {
  return FINE_SCHEDULES.find((f) => f.city.toLowerCase() === city.toLowerCase());
}

/** Verified extension fee for a regulation city, or null when unpublished. */
export function extensionFeeFor(regulationKey: string | null): number | null {
  if (!regulationKey) return null;
  return REGULATION_DATA[regulationKey]?.extension_fee_usd ?? null;
}

export interface DelayCostInput {
  city: string;
  /** Whole weeks the permit has been / would be late. */
  weeksLate: number;
  /** The permit/renewal fee the user pays (their own figure, an estimate). */
  permitFeeUsd?: number | null;
}

export interface DelayCostResult {
  city: string;
  figure: string;
  label: string;
  source: string;
  sourceUrl: string;
  /** Weekly delay cost, low end (null when no daily fine is published). */
  weeklyLowUsd: number | null;
  weeklyHighUsd: number | null;
  /** Total delay cost over `weeksLate` weeks. */
  totalLowUsd: number | null;
  totalHighUsd: number | null;
  /** Verified extension fee, if the city publishes one. */
  extensionFeeUsd: number | null;
  weeksLate: number;
  /** User-entered permit fee (estimate, not verified data). */
  permitFeeUsd: number | null;
  /** Total exposure = permit fee + extension fee + delay cost (low end). */
  totalExposureLowUsd: number | null;
}

export function calculateDelayCost(input: DelayCostInput): DelayCostResult | null {
  const schedule = findFineSchedule(input.city);
  if (!schedule) return null;
  const weeks = Math.max(0, Math.floor(input.weeksLate));
  const weeklyLow = schedule.dailyLowUsd !== null ? schedule.dailyLowUsd * 7 : null;
  const weeklyHigh = schedule.dailyHighUsd !== null ? schedule.dailyHighUsd * 7 : null;
  const totalLow = weeklyLow !== null ? weeklyLow * weeks : null;
  const totalHigh = weeklyHigh !== null ? weeklyHigh * weeks : null;
  const extensionFee = extensionFeeFor(schedule.regulationKey);
  const permitFee = typeof input.permitFeeUsd === "number" && input.permitFeeUsd > 0
    ? input.permitFeeUsd
    : null;
  const totalExposureLow =
    totalLow !== null || extensionFee !== null || permitFee !== null
      ? (totalLow ?? 0) + (extensionFee ?? 0) + (permitFee ?? 0)
      : null;
  return {
    city: schedule.city,
    figure: schedule.figure,
    label: schedule.label,
    source: schedule.source,
    sourceUrl: schedule.sourceUrl,
    weeklyLowUsd: weeklyLow,
    weeklyHighUsd: weeklyHigh,
    totalLowUsd: totalLow,
    totalHighUsd: totalHigh,
    extensionFeeUsd: extensionFee,
    weeksLate: weeks,
    permitFeeUsd: permitFee,
    totalExposureLowUsd: totalExposureLow,
  };
}

export function formatUsd(n: number | null): string {
  if (n === null) return "unknown";
  return `$${n.toLocaleString("en-US")}`;
}
