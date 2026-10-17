/**
 * FineStats — "what's at stake" band for public marketing pages.
 *
 * Every figure below is verified against a primary municipal source
 * (verified 2026-10-17). Do NOT add figures without a citable source.
 * - NYC $800–$4,000: NYC DOB/ECB Buildings Penalty Schedule, Class 2 violations
 * - Baltimore up to $500/day: Baltimore City Building Code §114.4–114.5
 * - Chicago up to $1,000/day: Construction Codes Table 14A-12-1203.1 (escalates to $10,000 for repeat)
 * - Palo Alto $200→$800/day: Municipal Code 16.61.030, expired-permit penalties
 *   (NOTE: this schedule belongs to Palo Alto, CA — NOT Los Altos)
 */
const FINES: {
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

export default function FineStats() {
  return (
    <section aria-label="What missed permit deadlines can cost">
      <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
        What a missed deadline can cost
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Expired permits and missed renewals don&apos;t just stall jobs — cities fine them
        daily. Real penalty schedules, from real municipal codes:
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FINES.map((f) => (
          <div
            key={f.city}
            className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{f.city}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {f.figure}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.label}</p>
            <a
              href={f.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              Source: {f.source} ↗
            </a>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
        One automated reminder costs less than a single day of these fines. Permit Warden
        watches your deadlines so you don&apos;t have to.
      </p>
    </section>
  );
}
