import type { JourneyStep } from "../lib";

/**
 * Permit journey timeline — the five lifecycle steps from the
 * approved preview, driven by `buildJourneySteps()` from one real
 * permit's status and dates. Steps with no backing data are "Up
 * next" with no invented date.
 */
export function JourneyTimeline({
  permitTitle,
  permitMeta,
  steps,
}: {
  permitTitle: string;
  permitMeta: string;
  steps: JourneyStep[];
}) {
  return (
    <div className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-800">
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Permit journey — {permitTitle}
        </h3>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{permitMeta}</p>
      </div>
      <ol className="relative mt-5">
        <span
          className="absolute bottom-[26px] left-4 top-[14px] w-[3px] rounded-full bg-gradient-to-b from-teal-500 from-[0%] via-teal-500 via-[58%] to-gray-200 to-[58%] dark:to-gray-700"
          aria-hidden="true"
        />
        {steps.map((step) => (
          <li key={step.title} className="relative pb-[18px] pl-[50px] last:pb-0">
            <span
              className={`absolute left-1 top-3 z-10 grid h-[27px] w-[27px] place-items-center rounded-full border-[3px] ${
                step.state === "done"
                  ? "border-teal-500 bg-teal-500 text-white"
                  : step.state === "now"
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_0_0_5px_rgba(37,99,235,0.18)]"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
              }`}
              aria-hidden="true"
            >
              {step.state === "done" ? (
                <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              ) : step.state === "now" ? (
                <svg className="h-2 w-2" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="4" />
                </svg>
              ) : null}
            </span>
            <div className="rounded-[14px] border border-gray-200 bg-slate-50 p-3.5 px-4 dark:border-gray-700 dark:bg-gray-700/40">
              <h4 className="flex flex-wrap items-center gap-2 text-[0.96rem] font-semibold text-gray-900 dark:text-white">
                {step.title}
                <span
                  className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-wide ${
                    step.state === "done"
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                      : step.state === "now"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border border-gray-200 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {step.pill}
                </span>
              </h4>
              <p className="mt-1 text-[0.85rem] text-gray-500 dark:text-gray-400">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
