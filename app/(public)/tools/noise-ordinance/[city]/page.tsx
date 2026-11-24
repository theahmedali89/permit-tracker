import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, VERIFIED_DATE } from "../../_data/noise-shed";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

function getCity(slug: string) {
  return CITIES.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const rec = getCity(city);
  if (!rec) return {};
  const url = `https://permitwarden.com/tools/noise-ordinance/${rec.slug}`;
  const title = `${rec.city} Noise Ordinance & Construction Hours`;
  const description = `Official ${rec.city} construction hours and noise limits for contractors, verified from the city code on ${VERIFIED_DATE}. Free lookup.`;
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
          alt: `Permit Warden - ${rec.city} noise ordinance and construction hours`,
        },
      ],
    },
  };
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      {value ? (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-900 dark:text-white">
          {value}
        </p>
      ) : (
        <p className="mt-1.5 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          not verified yet
        </p>
      )}
    </div>
  );
}

export default async function NoiseOrdinanceCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const rec = getCity(city);
  if (!rec) notFound();

  const n = rec.noise;
  const hasHours = n.weekdayHours !== null;

  const related = [
    ...CITIES.filter((c) => c.slug !== rec.slug && c.stateCode === rec.stateCode),
    ...CITIES.filter((c) => c.slug !== rec.slug && c.stateCode !== rec.stateCode),
  ].slice(0, 3);

  const faqs: Array<[string, string]> = [
    [
      `When can construction start in ${rec.city}?`,
      n.weekdayHours
        ? `According to the ${n.sourceLabel}, noisy construction work is allowed ${n.weekdayHours}. Confirm the current text with the city before locking in a schedule, because local rules change.`
        : `The city publishes no fixed weekday start time we could verify. Even without an hour rule, the dB limits below still apply, so keep equipment under the cap.`,
    ],
    [
      `Can crews work weekends in ${rec.city}?`,
      n.weekendHours
        ? `${n.weekendHours}. Check the source document linked below before scheduling holiday work, since holiday rules vary.`
        : `Weekend rules are not verified yet for ${rec.city}. We show "not verified yet" instead of guessing. Ask the city building department before scheduling weekend work.`,
    ],
    [
      `What is the residential noise limit in ${rec.city}?`,
      n.dbLimits
        ? `${n.dbLimits}. Limits are measured at the neighbor's property line, and breaking them can stop a job even inside legal hours.`
        : `No numeric residential dB limit could be verified from an official ${rec.city} source. The hour rules above still apply, and unreasonable noise can still draw a complaint.`,
    ],
    [
      "Where does this data come from?",
      `Each rule on this page links to the source it was read from, with the verification date shown beside it. Most rules were verified on ${VERIFIED_DATE}; fields added later were verified on November 24, 2026. Where the linked source is a secondary copy of the city code rather than the city's own site, confirm the current text with the city before scheduling work.`,
    ],
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-teal-50/40 dark:from-blue-950/40 dark:to-teal-950/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <nav
            className="text-sm text-gray-500 dark:text-gray-400"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-sky-600">
              Permit Warden
            </Link>
            {" / "}
            <Link href="/tools/noise-ordinance-lookup" className="hover:text-sky-600">
              Noise Ordinance Lookup
            </Link>
            {" / "}
            <span className="text-gray-900 dark:text-white">
              {rec.city}, {rec.stateCode}
            </span>
          </nav>

          <p className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Free tool - no signup required
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {rec.city} Noise Ordinance &amp; Construction Hours
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Planning a job in {rec.city}, {rec.stateCode}? This page shows the official
            construction noise rules from the {n.sourceLabel}, verified on{" "}
            {VERIFIED_DATE}. Contractors use it to set legal crew start times and avoid
            fines for starting too early or working too loud.
          </p>
          <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
            {hasHours
              ? "Weekday hours, weekend and holiday rules, and residential dB limits are listed below, each linked to the official source document."
              : "This city sets no fixed construction hours, so the dB limits below are the rule that matters most."}
          </p>

          <section className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {rec.city}, {rec.stateCode} noise rules
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Weekday construction hours" value={n.weekdayHours} />
              <Field label="Weekend / holiday hours" value={n.weekendHours} />
            </div>
            <div className="mt-3">
              <Field label="Residential dB limits" value={n.dbLimits} />
            </div>
            {n.note && (
              <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
                {n.note}
              </p>
            )}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Source:{" "}
              <a
                href={n.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sky-600 underline hover:text-sky-700 dark:text-sky-400"
              >
                {n.sourceLabel}
              </a>{" "}
              - verified {VERIFIED_DATE}. Rules change; always confirm with the city
              before scheduling work.
            </p>
          </section>

          <section className="mt-14 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Working in {rec.city}? Keep going.
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              <Link
                href="/tools/shed-permit-checker"
                className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Check if a shed or fence needs a permit in {rec.city}
              </Link>{" "}
              with verified exemption thresholds, or go back to the{" "}
              <Link
                href="/tools/noise-ordinance-lookup"
                className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                full noise ordinance lookup
              </Link>{" "}
              for all 20 cities.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  href={`/tools/noise-ordinance/${c.slug}`}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {c.city}, {c.stateCode}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {rec.city} noise ordinance FAQs
            </h2>
            <div className="mt-6 space-y-4">
              {faqs.map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {a}
                  </p>
                </div>
              ))}
            </div>
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
