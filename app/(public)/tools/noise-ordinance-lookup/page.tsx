import type { Metadata } from "next";
import Link from "next/link";
import { CITIES } from "../_data/noise-shed";
import { NoiseOrdinanceTool } from "./_noise-tool";

const PAGE_URL = "https://permitwarden.com/tools/noise-ordinance-lookup";
const TITLE = "Free Noise Ordinance & Construction Hours Lookup";
const DESCRIPTION =
  "Find when construction can start and stop in 20 major US cities. Official noise ordinance hours and dB limits, verified from city codes. Free.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - Free noise ordinance and construction hours lookup tool",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "What are construction noise hours?",
    "Construction noise hours are the times of day a city allows loud construction work near homes. They usually start at 7 or 8 AM on weekdays, end between 6 and 10 PM, and are shorter or banned on Sundays in many cities. The exact hours differ by city, which is why this lookup shows the official rule for each one.",
  ],
  [
    "What does a dB limit mean for my job site?",
    "A dB limit caps how loud your equipment can be at a neighbor's property line. Many cities set 55 to 70 dB(A) during the day and lower caps at night. If your work runs louder than the cap, the city can stop the job and fine you, even inside legal hours.",
  ],
  [
    "Do I need a permit to work outside these hours?",
    "Often yes. New York requires an after-hours variance for weekend or night work, and San Francisco issues night noise permits for outdoor construction outside 7 AM to 8 PM. Apply through the city's building or environmental department before the job starts.",
  ],
  [
    "Why do some cities show 'not verified yet'?",
    "We only publish numbers taken from an official city source we could read on November 3, 2026. Where a city publishes no numeric limit, or the source page was unreadable, we show 'not verified yet' instead of guessing. More cities and fields are being verified every week.",
  ],
  [
    "Is this noise ordinance lookup free?",
    "Yes. All 20 city rules here are free to read, and Permit Warden is free to start with no credit card. For the full permit picture, pair this lookup with the AHJ permit portal directory to find your local building department.",
  ],
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const STEPS = [
  [
    "Pick your city",
    "Choose from the 20 major cities in the dropdown. Every city shown has its construction hours read directly from the official city code.",
  ],
  [
    "Read the weekday and weekend rules",
    "Weekday hours, weekend and holiday hours, and residential dB limits appear side by side, so you can plan crew start times without digging through code PDFs.",
  ],
  [
    "Check the source before you schedule",
    "Every rule links to the official source it came from, with the date it was verified. Rules change, so confirm with the city before locking in a schedule.",
  ],
] as const;

const FIELD_CARDS = [
  [
    "Weekday construction hours",
    "The earliest you can start noisy work and the latest you can run it, Monday to Friday. Some cities have no hour rule at all and govern noise only by dB caps.",
  ],
  [
    "Weekend and holiday hours",
    "Saturday, Sunday, and holiday rules. Many cities shorten Saturday hours or ban Sunday work near homes entirely.",
  ],
  [
    "Residential dB limits",
    "The loudness cap at a neighbor's property line, in dB(A). Daytime and nighttime caps usually differ. Where a city publishes no numeric limit, we show 'not verified yet' instead of guessing.",
  ],
  [
    "Source and verified date",
    "The official document each rule was taken from, with the verification date. If a rule ever looks wrong, this link lets you check the city's current text yourself.",
  ],
] as const;

export default function NoiseOrdinanceLookupPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-teal-50/40 dark:from-blue-950/40 dark:to-teal-950/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            &larr; Back to Permit Warden
          </Link>

          <p className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Free tool — no signup required
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Noise Ordinance &amp; Construction Hours Lookup
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Contractors get fined when crews start too early or run too loud. This free
            noise ordinance lookup shows the legal construction hours and residential
            noise limits for 20 major US cities, taken from each city&apos;s official
            code and verified on November 3, 2026. Pick a city to see weekday and
            weekend hours, dB caps, and the source document.
          </p>

          <NoiseOrdinanceTool />

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to use this noise ordinance lookup
            </h2>
            <ol className="mt-6 space-y-4">
              {STEPS.map(([title, body], i) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What each city result shows
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {FIELD_CARDS.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cities covered so far
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Every city below was read from an official source on November 3, 2026. New
              cities are added as their rules are verified.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <span
                  key={c.slug}
                  className="rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-300"
                >
                  {c.city}, {c.stateCode}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Noise ordinance FAQs
            </h2>
            <div className="mt-6 space-y-4">
              {FAQS.map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">More free tools</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <Link href="/tools/shed-permit-checker" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Shed &amp; Fence Permit Checker
              </Link>{" "}
              — find out if your shed or fence needs a building permit in 20 US cities,
              using verified exemption thresholds.{" "}
              <Link href="/tools/license-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Contractor License Lookup
              </Link>{" "}
              — verify a contractor&apos;s license with the official state board.
            </p>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Hours sorted? Now make sure the permits behind them never expire.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden tracks permits, licenses, and renewal deadlines across your
              whole team and every subcontractor, with automatic reminders before
              anything lapses.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
            >
              Start tracking permits free
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
