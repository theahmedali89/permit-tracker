import type { Metadata } from "next";
import Link from "next/link";
import { TimelineTool } from "./_timeline-tool";

const PAGE_URL = "https://permitwarden.com/tools/permit-timeline-calculator";
const TITLE = "Permit Timeline Calculator — When Does My Building Permit Expire?";
const DESCRIPTION =
  "Free permit timeline calculator: enter your city, permit type and issue date to estimate expiry, first-inspection deadline, renewal window and apply-by date.";

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
        alt: "Permit Warden - Free permit timeline calculator",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "How long is a building permit valid?",
    "It depends on the city. Austin, Houston, Chicago and Philadelphia permits are typically valid 180 days from issuance (with inactivity rules), San Diego and San Jose give 12 months, Seattle gives 18 months, and New York City permits can run up to 2 years. Use the calculator above for your city.",
  ],
  [
    "When should I apply to renew my permit?",
    "Apply by the expiry date minus your city's processing time minus a 7-day safety buffer. For example, New York City takes about 24 days to process a renewal, so the safe apply-by date is roughly 31 days before expiry.",
  ],
  [
    "What is the first-inspection deadline?",
    "Many cities void a permit if no work starts or no inspection happens within 180 days of issuance. Austin permits expire on the 181st day if no inspection is scheduled, and Chicago requires work to begin and a first inspection within 6 months.",
  ],
  [
    "Is this calculator's answer official?",
    "No — it is an estimate based on published city rules for building permits in 20 verified US cities. Your permit document and your local building department (AHJ) always win. Confirm every date with them.",
  ],
  [
    "Which cities does the timeline calculator cover?",
    "New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, San Jose, Austin, Jacksonville, Fort Worth, Columbus, Charlotte, San Francisco, Indianapolis, Seattle, Denver and Oklahoma City.",
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

const HOWTO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to calculate your permit timeline",
  description:
    "Estimate when a building permit expires, when the first inspection is due, and when to apply for renewal.",
  step: [
    { "@type": "HowToStep", name: "Pick your city", text: "Choose one of the 20 verified cities." },
    { "@type": "HowToStep", name: "Pick the permit type", text: "Building permits are covered; other types are not verified yet." },
    { "@type": "HowToStep", name: "Enter the issue date", text: "Use the date printed on your issued permit." },
    { "@type": "HowToStep", name: "Read your dates", text: "Note the predicted expiry, first-inspection deadline, renewal window and apply-by date — then verify them with your AHJ." },
  ],
};

const OTHER_TOOLS = [
  { href: "/tools/permit-fee-calculator", label: "Permit Fee & Cost-of-Delay Calculator" },
  { href: "/tools/shed-permit-checker", label: "Shed Permit Checker" },
  { href: "/tools/parcel-lookup", label: "APN & Parcel Number Lookup" },
  { href: "/tools/license-lookup", label: "License Lookup" },
  { href: "/tools/noise-ordinance-lookup", label: "Noise Ordinance Lookup" },
];

export default function PermitTimelineCalculatorPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_JSON_LD) }}
      />
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
        Free tool · No signup
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Permit Timeline Calculator
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
        Enter your city, permit type and issue date to estimate when your
        building permit expires, when the first inspection is due, and the
        last safe day to apply for renewal.
      </p>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <TimelineTool />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          How it works
        </h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6">
          {HOWTO_JSON_LD.step.map((s) => (
            <li key={s.name}>
              <p className="font-semibold text-gray-900 dark:text-white">{s.name}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

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
          Tired of tracking these dates by hand?{" "}
          <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            Permit Warden watches every permit deadline for you →
          </Link>
        </p>
      </section>
    </main>
  );
}
