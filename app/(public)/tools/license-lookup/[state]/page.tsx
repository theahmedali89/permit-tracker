import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LICENSE_BOARDS,
  LICENSE_BOARD_DETAILS,
  type LicenseBoard,
} from "@/lib/shared/license-boards";
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
  const detail = LICENSE_BOARD_DETAILS[board.code];

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
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Lookup links verified October 20, 2026.
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

          {detail?.recordShows && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                What the {board.boardShort} record shows
              </h2>
              <ul className="mt-4 space-y-2">
                {detail.recordShows.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-white/60 bg-white/70 px-5 py-3 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-300"
                  >
                    ✓ {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {detail?.licenseTypes && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {board.state} license types
              </h2>
              <div className="mt-4 space-y-3">
                {detail.licenseTypes.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail?.fees && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {board.state} contractor license fees
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Checked against the official {board.boardShort} fee information on
                November 25, 2026. Fees change — confirm on the board&apos;s site before
                you budget.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                {detail.fees.map((fee, i) => (
                  <div
                    key={fee.item}
                    className={
                      i > 0
                        ? "border-t border-gray-200/70 px-5 py-4 dark:border-white/10"
                        : "px-5 py-4"
                    }
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{fee.item}</p>
                      <p className="font-bold text-gray-900 dark:text-white">{fee.amount}</p>
                    </div>
                    {fee.note && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{fee.note}</p>
                    )}
                    {fee.sourceUrl && (
                      <p className="mt-1 text-xs">
                        <a
                          href={fee.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700 dark:text-sky-400"
                        >
                          Official source ↗
                        </a>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {detail?.renewal && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Renewing a {board.state} license
              </h2>
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Cycle:</strong>{" "}
                  {detail.renewal.cycle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {detail.renewal.howTo}
                </p>
                {detail.renewal.lateFee && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Late renewal:</strong>{" "}
                    {detail.renewal.lateFee}
                  </p>
                )}
              </div>
            </section>
          )}

          {detail?.bondInsurance && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bond and insurance requirements in {board.state}
              </h2>
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Bond:</strong>{" "}
                  {detail.bondInsurance.bond}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Insurance:</strong>{" "}
                  {detail.bondInsurance.insurance}
                </p>
                {detail.bondInsurance.note && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {detail.bondInsurance.note}
                  </p>
                )}
              </div>
            </section>
          )}

          {detail?.requirements && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Who can get licensed in {board.state}
              </h2>
              <div className="mt-4 space-y-3">
                {(
                  [
                    ["Exam", detail.requirements.exam],
                    ["Experience", detail.requirements.experience],
                    ["Education", detail.requirements.education],
                    ["Good to know", detail.requirements.other],
                  ] as Array<[string, string | undefined]>
                )
                  .filter(([, v]) => v)
                  .map(([label, v]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                        {v}
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {detail?.complaintProcess && (
            <section className="mt-14">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Filing a complaint in {board.state}
              </h2>
              <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {detail.complaintProcess.howTo}
                </p>
                {detail.complaintProcess.whatHappens && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {detail.complaintProcess.whatHappens}
                  </p>
                )}
              </div>
            </section>
          )}

          {detail && (detail.processingTime || detail.sources) && (
            <section className="mt-14 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
              {detail.processingTime && (
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Processing time:</strong>{" "}
                  {detail.processingTime}
                </p>
              )}
              {detail.sources && (
                <>
                  <h2 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
                    Official sources
                  </h2>
                  <ul className="mt-2 space-y-1">
                    {detail.sources.map((s) => (
                      <li key={s} className="break-all text-xs">
                        <a
                          href={s}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700 dark:text-sky-400"
                        >
                          {s}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                The licensing details on this page were verified against these official
                sources on November 25, 2026.
              </p>
            </section>
          )}

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
