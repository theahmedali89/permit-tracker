/**
 * FineStats — "what's at stake" band for public marketing pages.
 *
 * The figures live in `lib/shared/fine-schedules.ts` (moved there
 * 2026-11-24 so features can import them without depending on this
 * component file); this component only renders them.
 */
import { FINES } from "@/lib/shared/fine-schedules";

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
