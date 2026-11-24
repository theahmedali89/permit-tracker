import type { Metadata } from "next";
import Link from "next/link";
import { FeeTool } from "./_fee-tool";

const PAGE_URL = "https://permitwarden.com/tools/permit-fee-calculator";
const TITLE = "Permit Fee & Cost-of-Delay Calculator — What a Lapsed Permit Costs";
const DESCRIPTION =
  "Free calculator: estimate what a lapsed permit costs in fines per week, plus extension fees, using verified municipal fine schedules for four U.S. cities.";

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
        alt: "Permit Warden - Free permit fee and cost-of-delay calculator",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "How much does an expired permit cost per day?",
    "It depends on the city. Baltimore fines reach $500 per day, Chicago up to $1,000 per day (escalating to $10,000 for repeat violations), and Palo Alto charges $200 to $800 per day on an escalating schedule. New York City fines $800 to $4,000 per building violation — a per-violation fine, not a daily one.",
  ],
  [
    "What is a permit extension fee?",
    "Some cities charge to extend a permit instead of making you reapply. New York City's published extension fee is $130. Most cities in our data do not publish an extension fee, so the calculator says so rather than guessing one.",
  ],
  [
    "Does this calculator include re-application costs?",
    "No. Re-application fees, new plan review and crew downtime vary too much by job to estimate honestly. Enter your own permit fee above and treat the total as a low-end exposure figure.",
  ],
  [
    "Are these fines real?",
    "Yes — every figure comes from a published municipal source: the NYC DOB penalty schedule, Baltimore City Building Code §114, Chicago Construction Codes 14A-12-1203.1, and Palo Alto Municipal Code 16.61.030. Each result links its source.",
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

const OTHER_TOOLS = [
  { href: "/tools/permit-timeline-calculator", label: "Permit Timeline Calculator" },
  { href: "/tools/shed-permit-checker", label: "Shed Permit Checker" },
  { href: "/tools/parcel-lookup", label: "APN & Parcel Number Lookup" },
  { href: "/tools/license-lookup", label: "License Lookup" },
  { href: "/tools/noise-ordinance-lookup", label: "Noise Ordinance Lookup" },
];

export default function PermitFeeCalculatorPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
        Free tool · No signup
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Permit Fee &amp; Cost-of-Delay Calculator
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
        A lapsed permit doesn&apos;t just stall the job — cities fine it
        daily. Pick a city and see what each week of delay costs, using
        verified municipal fine schedules.
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Fine schedules verified October 17, 2026.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <FeeTool />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-6">
          {FAQS.map(([q, a]) => (
            <div key={q}>
              <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">More free tools</h2>
        <ul className="mt-4 space-y-2">
          {OTHER_TOOLS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                {t.label} →
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Never pay a delay fine again —{" "}
          <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            let Permit Warden watch your deadlines →
          </Link>
        </p>
      </section>
    </main>
  );
}
