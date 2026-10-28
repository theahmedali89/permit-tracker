import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LICENSE_BOARDS, type LicenseBoard } from "@/lib/license-boards";
import { STATE_NAMES, stateSlug, stateCodeFromSlug } from "../../../ahj/_lib";

export function generateStaticParams() {
  return LICENSE_BOARDS.map((b) => ({ state: stateSlug(b.code) }));
}

function getBoard(slug: string): LicenseBoard | null {
  const code = stateCodeFromSlug(slug);
  if (!code) return null;
  return LICENSE_BOARDS.find((b) => b.code === code) ?? null;
}

const SHARED_FAQS: Array<[string, string]> = [
  [
    "What if the contractor isn't in the board's database?",
    "Either the license isn't active, the details were entered differently (try the owner's name, not just the business name), or the contractor isn't licensed. Ask the contractor for their license number and search by number — if it still doesn't appear, do not hire them for work that requires a license.",
  ],
  [
    "How often should I re-check a license?",
    "Verify before you sign, and again before final payment on long projects. Licenses can be suspended mid-project, and a lapsed license can void insurance coverage and leave you outside the board's complaint process.",
  ],
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const board = getBoard(state);
  if (!board) return {};
  const url = `https://permitwarden.com/tools/license-lookup/${state}`;
  const title =
    board.code === "CA"
      ? "California Contractor License Lookup — Verify a License with the CSLB"
      : `${board.state} Contractor License Lookup — Verify a License with the ${board.boardShort}`;
  const description = `Verify a ${board.state} contractor's license free with the official ${board.boardName} search. Check license status, classifications, and disciplinary actions before you hire.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Permit Warden - ${board.state} contractor license lookup`,
        },
      ],
    },
  };
}

export default async function LicenseLookupStatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const board = getBoard(state);
  if (!board) notFound();

  const slug = stateSlug(board.code);
  const faqs: Array<[string, string]> = [...board.faqs, ...SHARED_FAQS];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const others = LICENSE_BOARDS.filter((b) => b.code !== board.code);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-teal-50/40 dark:from-blue-950/40 dark:to-teal-950/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <nav className="text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-sky-600">Permit Warden</Link>
            {" / "}
            <Link href="/tools/license-lookup" className="hover:text-sky-600">
              Contractor License Lookup
            </Link>
            {" / "}
            <span className="text-gray-900 dark:text-white">{board.state}</span>
          </nav>

          <p className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Free tool — official {board.boardShort} search
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {board.state} Contractor License Lookup
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {board.summary}
          </p>
          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            Use this {board.state} contractor lookup to verify any contractor&apos;s license
            status before you sign a contract.
          </p>

          {board.nuance && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
              <strong>Good to know:</strong> {board.nuance}
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              The official lookup: {board.boardName}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Search by {board.searchBy}. This is the board&apos;s live database — the same
              record building departments and insurers check.
            </p>
            <a
              href={board.lookupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-base font-semibold text-white shadow hover:opacity-95"
            >
              Open the official {board.boardShort} license search →
            </a>
            <p className="mt-3 break-all text-xs text-gray-500 dark:text-gray-400">
              {board.lookupUrl}
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              What the {board.boardShort} licenses
            </h2>
            <ul className="mt-4 space-y-2">
              {board.covers.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/60 bg-white/70 px-5 py-3 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-300"
                >
                  ✓ {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to verify a {board.state} contractor in 3 steps
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Get the license number", "Ask the contractor for it — in most states it must appear on their contracts, bids, and advertising. No number? The search also works by business or owner name."],
                [`Search the ${board.boardShort} database`, `Open the official search above and look up the record by ${board.searchBy}.`],
                ["Read the record like an inspector", "Status must be active, the name must match your contract, the classification must cover your project, and the expiration date must be in the future. Check disciplinary actions before you sign."],
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
              {board.state} license lookup FAQs
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map(([q, a]) => (
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Working in {board.state}? You&apos;ll also need the permit office.
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              A license lets a contractor work — a permit lets the project start. Browse{" "}
              <Link
                href={`/ahj/${slug}`}
                className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                {STATE_NAMES[board.code]} permit portals
              </Link>{" "}
              for the official building department links, or look up a contractor in{" "}
              <Link href="/tools/license-lookup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                another state
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.slice(0, 6).map((b) => (
                <Link
                  key={b.code}
                  href={`/tools/license-lookup/${stateSlug(b.code)}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {b.state}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Managing licenses for a whole crew or sub roster?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden keeps every license, permit, and renewal date in one place and
              reminds you before anything expires — across every state you work in.
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
