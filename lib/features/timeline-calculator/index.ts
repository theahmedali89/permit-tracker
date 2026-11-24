/**
 * Permit timeline calculator — pure date math over the verified
 * regulation data (20 cities, building permits only).
 *
 * Nothing here is invented: validity_days and processing_days come from
 * `lib/shared/jurisdiction-data` (in-memory REGULATION_DATA — there is no
 * `jurisdiction_regulations` DB table behind this feature). Anything not
 * in that data is returned as null and the UI must say "not verified —
 * check your AHJ".
 */
import { REGULATION_DATA, type RegulationData } from "@/lib/shared/jurisdiction-data";
import { applyByDate, parseDate, toDateString } from "@/lib/shared/dates";

export const PERMIT_TYPES = [
  "building",
  "electrical",
  "plumbing",
  "mechanical",
  "roofing",
  "solar",
] as const;

export type PermitType = (typeof PERMIT_TYPES)[number];

/** The 20 regulated cities, sorted for the city picker. */
export const REGULATED_CITIES: RegulationData[] = Object.values(REGULATION_DATA).sort((a, b) =>
  a.city.localeCompare(b.city)
);

export function findRegulation(cityKey: string): RegulationData | undefined {
  return REGULATION_DATA[cityKey];
}

export interface TimelineInput {
  /** Key into REGULATION_DATA, e.g. "TX:Austin". */
  cityKey: string;
  permitType: string;
  /** Issue date (YYYY-MM-DD). */
  issueDate: string;
}

export interface TimelineResult {
  regulation: RegulationData;
  issueDate: string;
  /** issue + validity_days, or null when validity is unverified. */
  predictedExpiry: string | null;
  /** First-inspection / commence-work deadline derived from the city's
   *  published notes (see below), or null when the notes say nothing. */
  firstInspectionDeadline: string | null;
  firstInspectionBasis: string | null;
  /** Estimated renewal window: opens 30 days before expiry. */
  renewalWindow: { opens: string; closes: string } | null;
  /** Smart-buffer apply-by date (expiry − processing − 7 days), or null. */
  applyBy: { applyByDate: string; processingDays: number | null } | null;
}

/**
 * Apply-by date, using the shared smart-buffer rule
 * (renewal − processing days − 7-day buffer) from `lib/shared/dates.ts`.
 * Shared rather than local per the modularity rule — features never
 * import each other, so the rule lives in `lib/shared/`.
 */
function applyByFor(renewalDeadline: string, processingDays?: number | null): {
  applyByDate: string;
  processingDays: number | null;
} {
  return applyByDate(renewalDeadline, processingDays);
}

/**
 * Derive a commence-work / first-inspection deadline from the city's
 * published validity notes. Most cities in the dataset use a 180-day
 * inactivity rule; New York uses 12 months to commence. The basis string
 * is returned alongside so the UI can show exactly where it came from.
 * Returns null when the notes mention no commencement rule.
 */
export function firstInspectionDays(regulation: RegulationData): {
  days: number;
  basis: string;
} | null {
  const notes = regulation.validity_notes ?? "";
  if (/12\s*mo(?:nths?)?\b/i.test(notes) && /commenc/i.test(notes)) {
    return { days: 365, basis: "12 months to commence work (per the city's published notes)" };
  }
  if (/180/i.test(notes) && /(inspect|commenc|begin|work not|no work|inactiv)/i.test(notes)) {
    return { days: 180, basis: "180-day inactivity / commencement rule (per the city's published notes)" };
  }
  if (/6\s*mo(?:nths?)?\b/i.test(notes) && /(inspect|commenc|begin)/i.test(notes)) {
    return { days: 180, basis: "6 months to begin work and request first inspection (per the city's published notes)" };
  }
  if (/1\s*year/i.test(notes) && /begin/i.test(notes)) {
    return { days: 365, basis: "1 year to begin work (per the city's published notes)" };
  }
  return null;
}

export function calculateTimeline(input: TimelineInput): TimelineResult | null {
  const regulation = findRegulation(input.cityKey);
  if (!regulation) return null;
  // Regulation data covers building permits only.
  if (input.permitType !== "building") return null;
  const issue = parseDate(input.issueDate);
  const addDays = (days: number) => {
    const d = new Date(issue);
    d.setDate(d.getDate() + days);
    return toDateString(d);
  };

  const predictedExpiry =
    typeof regulation.validity_days === "number" ? addDays(regulation.validity_days) : null;

  const first = firstInspectionDays(regulation);
  const firstInspectionDeadline = first ? addDays(first.days) : null;

  const renewalWindow = predictedExpiry
    ? {
        opens: (() => {
          // setDate (not ms arithmetic) so DST transitions can't shift the day.
          const opens = parseDate(predictedExpiry);
          opens.setDate(opens.getDate() - 30);
          return toDateString(opens);
        })(),
        closes: predictedExpiry,
      }
    : null;

  const applyBy = predictedExpiry
    ? applyByFor(predictedExpiry, regulation.processing_days ?? null)
    : null;

  return {
    regulation,
    issueDate: input.issueDate,
    predictedExpiry,
    firstInspectionDeadline,
    firstInspectionBasis: first?.basis ?? null,
    renewalWindow,
    applyBy,
  };
}
