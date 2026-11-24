/**
 * Fine schedules — "what's at stake" penalty figures.
 *
 * SHARED HOME (2026-11-24 modularity fix): FINES used to live in
 * `app/(public)/_components/FineStats.tsx`; the fee-calculator and
 * risk-report features imported it from that public component file
 * (inverted dependency). It now lives here in `lib/shared/` and
 * `FineStats.tsx` imports it from here; the component itself is
 * unchanged. Features import from `@/lib/shared/fine-schedules`,
 * never from `app/(public)/`.
 *
 * Every figure below is verified against a primary municipal source
 * (verified 2026-10-17). Do NOT add figures without a citable source.
 * - NYC $800–$4,000: NYC DOB/ECB Buildings Penalty Schedule, Class 2 violations
 * - Baltimore up to $500/day: Baltimore City Building Code §114.4–114.5
 * - Chicago up to $1,000/day: Construction Codes Table 14A-12-1203.1 (escalates to $10,000 for repeat)
 * - Palo Alto $200→$800/day: Municipal Code 16.61.030, expired-permit penalties
 *   (NOTE: this schedule belongs to Palo Alto, CA — NOT Los Altos)
 */
export const FINES: {
  city: string;
  figure: string;
  label: string;
  source: string;
  sourceUrl: string;
}[] = [
  {
    city: "New York City",
    figure: "$800–$4,000",
    label: "per building violation (Class 2)",
    source: "NYC DOB penalty schedule",
    sourceUrl: "https://www.nyc.gov/html/ecb/downloads/pdf/BuildingsPenaltySchedule.pdf",
  },
  {
    city: "Baltimore",
    figure: "$500/day",
    label: "max civil fine per violation, each day a separate offense",
    source: "City Building Code §114",
    sourceUrl: "https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/114",
  },
  {
    city: "Chicago",
    figure: "$1,000/day",
    label: "up to, per day — repeat violations escalate to $10,000",
    source: "Construction Codes 14A-12-1203.1",
    sourceUrl: "https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2661915",
  },
  {
    city: "Palo Alto",
    figure: "$200 → $800/day",
    label: "escalating daily penalty for expired permits",
    source: "Municipal Code 16.61.030",
    sourceUrl:
      "https://www.cityofpaloalto.org/files/assets/public/agendas-minutes-reports/reports/city-manager-reports-cmrs/year-archive/2013/id-4314-agenda-item-number-10.pdf",
  },
];
