import type { Metadata } from "next";
import Link from "next/link";
import { ParcelLookupForm } from "./_form";

const PAGE_URL = "https://permitwarden.com/tools/parcel-lookup";
const TITLE = "Free APN & Parcel Number Lookup — Find Your Assessor's Parcel Number";
const DESCRIPTION =
  "Free APN lookup tool: enter any U.S. address to find its county and get a direct link to the official county assessor parcel search. No signup, no fees.";

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
        alt: "Permit Warden - Free APN and parcel number lookup tool",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "What is an APN (Assessor's Parcel Number)?",
    "An APN — also called a parcel number, parcel ID, or folio number — is a unique identifier your county assessor assigns to every piece of real property. It usually looks like 1234-567-890 or 12-34-567-890. Building departments use it to tie permits, inspections, and tax records to the right property.",
  ],
  [
    "Where do I find my parcel number?",
    "The fastest way is your county assessor's online parcel search: enter the property address and the APN appears in the property record. It's also printed on your property tax bill, and sometimes on your deed. Use the free lookup tool above to jump straight to your county's official search page.",
  ],
  [
    "Why do contractors need the APN?",
    "Most building permit applications require the APN to identify the property. Having it ready before you apply avoids rejected applications and delays — one wrong digit can send your permit to the wrong parcel.",
  ],
  [
    "Is this APN lookup really free?",
    "Yes. The lookup uses the free U.S. Census geocoder to identify your county, then links you directly to your county assessor's official parcel search. No account, no fees, no limits.",
  ],
  [
    "How do I get a parcel number?",
    "You don't apply for one — the county assessor assigns a parcel number to every property automatically. To get the number for a specific property, run an address search on your county assessor's site (the tool above takes you there), or check the property tax bill or the deed, where it is printed. If none of those are handy, the assessor's office can look it up by address.",
  ],
  [
    "Is an APN number the same as a parcel number?",
    "Yes — they are two names for the same identifier. Counties pick their own label: APN (Assessor's Parcel Number), parcel number, parcel ID, or folio number. Whatever your county calls it, it points to the same property record and serves the same purpose on permit applications and tax documents.",
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

export default function ParcelLookupPage() {
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
            Free APN &amp; Parcel Number Lookup
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Enter any U.S. property address and we&apos;ll identify its county and send you
            straight to the official county assessor parcel search — where your{" "}
            <strong>Assessor&apos;s Parcel Number (APN)</strong> is one address search away.
            Contractors need the APN on almost every permit application; find it before you file.
          </p>

          <ParcelLookupForm />

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to find your parcel number in 3 steps
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Search your address above", "We use the U.S. Census geocoder to pinpoint the property's county — free and instant."],
                ["Open your county assessor link", "We give you the official parcel search page for your county (top 50 counties curated by hand)."],
                ["Enter the address on the assessor site", "Your APN / parcel ID appears in the property record. Copy it onto your permit application."],
              ].map(([title, body], i) => (
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
              One lookup, many names
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-gray-600 dark:text-gray-300">
              Counties never agreed on a single label, so the same records search shows up
              under different names depending on where the property sits: one assessor site
              calls it an <strong>APN lookup</strong>, another an{" "}
              <strong>APN number lookup</strong> or <strong>APN search</strong>, and a third
              just a parcel or property search. They all lead to the same place — the
              county&apos;s property record for the address, with the same parcel number in
              it. The number&apos;s format changes from county to county; what it identifies
              does not.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              APN lookup FAQs
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
              <Link href="/tools/license-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Contractor License Lookup
              </Link>{" "}
              — verify a contractor&apos;s license with the official state board search for
              your state before you hire.
            </p>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Found your APN? Never miss a permit deadline on that property.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden tracks permits, licenses, and renewal deadlines for every property
              you work on — with automatic reminders before anything expires.
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
