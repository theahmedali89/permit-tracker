import type { Metadata } from "next";
import Link from "next/link";
import { LICENSE_BOARDS } from "@/lib/license-boards";
import { stateSlug } from "../../ahj/_lib";
import { LicenseStatePicker } from "./_picker";

const PAGE_URL = "https://permitwarden.com/tools/license-lookup";
const TITLE = "Contractor License Lookup — Verify a Contractor's License Free";
const DESCRIPTION =
  "Free contractor license lookup: pick your state and we'll send you to the official state licensing board's search to verify a contractor's license status, classification, and disciplinary record.";

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
        alt: "Permit Warden - Free contractor license lookup tool",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "How do I look up a contractor's license?",
    "Pick your state in the tool above and open the official licensing board's search. Enter the contractor's license number (fastest) or their business or personal name. The board's record shows whether the license is active, what work it covers, and any disciplinary history.",
  ],
  [
    "What should I check on a contractor's license record?",
    "Five things: the status is Active/Current, the name matches the company on your contract, the license classification covers your type of work, the expiration date is in the future, and there are no serious disciplinary actions. Where the board shows it, also confirm bond and insurance are current.",
  ],
  [
    "Is this contractor license lookup really free?",
    "Yes. Every state board linked here offers its license search free to the public. Permit Warden simply routes you to the right official search for your state — we don't charge, and we don't keep a copy of anyone's license record.",
  ],
  [
    "What if my state isn't listed?",
    "We are adding states in order of search demand. In the meantime, your state licensing board's website will have a license search — search for your state name plus \"contractor license board.\" If the contractor will pull permits, you can also find your local permit office in our AHJ directory.",
  ],
  [
    "What if a contractor has no license at all?",
    "Don't hire them for work that requires one. In most states, unlicensed contracting is illegal, the contract may be unenforceable, the contractor can't pull permits, and you lose access to the board's complaint process and recovery funds. A licensed contractor will always share their license number when asked.",
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

const CHECKS = [
  ["Status is Active", "Anything else — expired, suspended, revoked, delinquent — means the contractor is not authorized to do the work right now."],
  ["Name matches your contract", "The license belongs to a specific person or business entity. If the name on the record doesn't match the company you're paying, stop and ask why."],
  ["Classification covers the job", "A license only authorizes the categories listed on it — an electrical license doesn't cover a roof replacement."],
  ["Expiration date is in the future", "Licenses lapse more often than you'd think. Check the date covers your whole project, not just the start."],
  ["No serious disciplinary actions", "Boards publish citations, suspensions, and legal actions. One old minor citation is different from a pattern of complaints."],
  ["Bond & insurance are current", "Boards like California's CSLB and Washington's L&I show bond and insurance status right on the record."],
] as const;

export default function LicenseLookupPage() {
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
            Contractor License Lookup
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Before you hire a contractor — or sign a subcontract — verify their license with
            the only source that counts: <strong>the state licensing board itself</strong>.
            Pick your state below and we&apos;ll route you to the official board search,
            with exactly what to check when you get there. Use this contractor lookup
            before you sign anything. It takes a minute and can save you from hiring
            an unlicensed contractor.
          </p>

          <LicenseStatePicker />

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to verify a contractor&apos;s license in 3 steps
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Pick your state above", "Contractor licenses are issued by states (and a few big cities), not the federal government. Your state page names the exact board that licenses your contractor's trade."],
                ["Open the official board search", "We deep-link you to the board's own lookup page — never a paid middleman or a scraped copy that may be months out of date."],
                ["Search by license number or name", "The license number is printed on the contractor's contracts, bids, and ads by law in most states. No number? Search by business or owner name."],
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
              What to check on the license record
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {CHECKS.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">✓ {title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              License lookup by state
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Each state page names the licensing board, what it covers, and links straight
              to the official search.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {LICENSE_BOARDS.map((b) => (
                <Link
                  key={b.code}
                  href={`/tools/license-lookup/${stateSlug(b.code)}`}
                  className="block rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:border-sky-300 hover:shadow dark:border-white/10 dark:bg-gray-900/70 dark:hover:border-sky-700"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {b.state} contractor license lookup
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{b.boardName}</p>
                  <span className="mt-2 inline-block text-sm font-medium text-sky-600 dark:text-sky-400">
                    Verify a {b.state} license →
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
              Working in a state that isn&apos;t listed yet? Find your local permit office in
              the{" "}
              <Link href="/ahj" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                AHJ permit portal directory
              </Link>{" "}
              — and check back, we add states in order of demand.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Contractor license lookup FAQs
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
              <Link href="/tools/parcel-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                APN &amp; Parcel Number Lookup
              </Link>{" "}
              — find the assessor&apos;s parcel number your permit application needs, for any
              U.S. address.
            </p>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              License checks out? Now keep it — and every permit — from expiring.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden tracks contractor licenses, permits, and renewal deadlines across
              your whole team and every subcontractor, with automatic reminders before
              anything lapses.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
            >
              Start tracking licenses free
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
