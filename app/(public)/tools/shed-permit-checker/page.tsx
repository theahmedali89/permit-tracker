import type { Metadata } from "next";
import Link from "next/link";
import { ShedPermitTool } from "./_shed-tool";

const PAGE_URL = "https://permitwarden.com/tools/shed-permit-checker";
const TITLE = "Do I Need a Shed Permit? Free Permit Checker";
const DESCRIPTION =
  "Check if your shed or fence needs a building permit in 20 US cities. Verified exemption thresholds from official city codes. Free, no signup.";

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
        alt: "Permit Warden - Free shed and fence permit checker tool",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "How big can a shed be without a permit?",
    "It depends on the city. Common cutoffs are 120 sq ft (Los Angeles, Houston, New York City) and 200 sq ft (Phoenix, Austin, Denver). Some cities are stricter: Jacksonville and Fort Worth require a permit for every shed, no matter the size.",
  ],
  [
    "Do fences need a permit?",
    "Sometimes. Chicago allows fences up to 5 ft without a permit, while San Antonio and Washington DC require a permit for every new fence. Height is what matters most: enter your planned fence height in the checker above.",
  ],
  [
    "What about pergolas?",
    "Only Philadelphia publishes a clear pergola rule (it follows the shed exemption). For the other 19 cities here, no official pergola-specific threshold was found, so the checker says 'not verified yet' and recommends confirming with the local building office.",
  ],
  [
    "What happens if I build without a required permit?",
    "Cities can issue stop-work orders and daily fines. Baltimore fines reach $500 per day and New York City violations run $800 to $4,000. A quick check here costs nothing; a violation costs plenty.",
  ],
  [
    "Is this shed permit checker free?",
    "Yes. Every threshold here is free to read, and Permit Warden is free to start with no credit card. When the answer is 'permit needed,' find your local office in the AHJ directory to apply.",
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
    "Pick your city and structure",
    "Choose one of the 20 verified cities, then pick shed, fence, or pergola. The thresholds shown come straight from that city's official code.",
  ],
  [
    "Enter the size",
    "Enter the shed's floor area in square feet. For a fence, enter the planned height in feet. Pergolas need no size because only one city publishes a verified pergola rule.",
  ],
  [
    "Get the answer with the source",
    "The checker says whether a permit is needed, shows the exact threshold, and links the official source. Anything we could not verify is labeled 'not verified yet' instead of guessed.",
  ],
] as const;

const ANSWER_CARDS = [
  [
    "No permit needed",
    "Your project fits inside the city's exemption. Double-check any extra conditions in the detail text, like height caps or utility restrictions, before you build.",
  ],
  [
    "Permit required",
    "Your project is over the exemption, or the city requires a permit for every project of this type. Find your local building office in the AHJ directory to apply.",
  ],
  [
    "Not verified yet",
    "No official rule was found for this combination. We would rather say so than guess. Confirm with the city's building office before building.",
  ],
  [
    "Heads-up notes",
    "Some answers carry a caution: conflicting official sources, zoning-only tiers, or special cases like Charlotte's dimension rule. Read these before relying on the headline answer.",
  ],
] as const;

export default function ShedPermitCheckerPage() {
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
            Do I Need a Shed Permit?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            A backyard shed or fence can trigger a permit in one city and need nothing
            in the next. This free shed permit checker compares your project against the
            official exemption thresholds of 20 major US cities, verified from city
            codes on November 3, 2026. Choose a city, pick shed or fence, enter the
            size, and get a straight answer with the source.
          </p>

          <ShedPermitTool />

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How the shed permit checker works
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
              What the answer means
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {ANSWER_CARDS.map(([title, body]) => (
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
              Shed permit FAQs
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
              <Link href="/tools/noise-ordinance-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Noise Ordinance &amp; Construction Hours Lookup
              </Link>{" "}
              — find the legal construction hours and residential dB limits for 20 US
              cities.{" "}
              <Link href="/tools/license-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Contractor License Lookup
              </Link>{" "}
              — verify a contractor&apos;s license with the official state board.
            </p>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Permit needed? Track it so the deadline never sneaks up on you.
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
