import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import { STATE_NAMES, stateSlug, stateCodeFromSlug, citySlug, type AhjEntry } from "../_lib";
import { getStateSummary } from "@/lib/shared/state-summaries";

export async function generateStaticParams() {
  return Object.keys(STATE_NAMES).map((code) => ({ state: stateSlug(code) }));
}

async function getStateData(slug: string) {
  const code = stateCodeFromSlug(slug);
  if (!code) return null;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("ahj_directory")
    .select("*")
    .eq("state", code)
    .order("city", { ascending: true });
  return { code, name: STATE_NAMES[code], entries: (data as AhjEntry[] | null) || [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const data = await getStateData(state);
  if (!data) return {};
  const url = `https://permitwarden.com/ahj/${state}`;
  return {
    title: `${data.name} permit portals — official AHJ links`,
    description: `Official building permit portals in ${data.name}: ${data.entries.length} curated authority links with direct portal URLs, phone numbers, and notes.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${data.name} permit portals`,
      description: `${data.entries.length} official permit authority links in ${data.name}.`,
      url,
    },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const data = await getStateData(state);
  if (!data || data.entries.length === 0) notFound();

  // Verified state-level summary (lib/shared/state-summaries.ts, access date
  // 2026-11-24); null until a state is verified, in which case the page shows
  // a visible "Data coming soon" note instead of an invented summary.
  const summary = getStateSummary(data.code);
  const verifiedLabel = summary
    ? new Date(`${summary.verifiedDate}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.name} permit portals`,
    description: `Official building permit authority portals in ${data.name}.`,
    url: `https://permitwarden.com/ahj/${state}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <nav className="text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            {" / "}
            <Link href="/ahj" className="hover:text-sky-600">Permit portals</Link>
            {" / "}
            <span className="text-gray-900 dark:text-white">{data.name}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {data.name} permit portals
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {data.entries.length} official permit authorit{data.entries.length === 1 ? "y" : "ies"} in{" "}
            {data.name} — direct links to the portals where contractors actually file.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Portal links last verified October 16, 2026.
          </p>

          <section
            className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            aria-label={`About building permits in ${data.name}`}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              About building permits in {data.name}
            </h2>
            {summary ? (
              <>
                <p className="mt-3 text-gray-600 dark:text-gray-400">{summary.summary}</p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Source:{" "}
                  <a
                    href={summary.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
                  >
                    {summary.sourceName}
                  </a>
                  {" · "}Verified {verifiedLabel}.
                </p>
              </>
            ) : (
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Data coming soon — we are still verifying {data.name}&apos;s statewide
                building code and permit authority against official sources.
              </p>
            )}
          </section>

          <div className="mt-8 space-y-4">
            {data.entries.map((e) => (
              <Link
                key={e.id}
                href={`/ahj/${state}/${citySlug(e.city)}`}
                className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-sky-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {e.city || e.county} — {e.authority_name}
                    </h2>
                    {e.county && e.city && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {e.county} County
                      </p>
                    )}
                    {e.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {e.notes}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sky-600 dark:text-sky-400">→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              Working across state lines?{" "}
              <Link href="/ahj" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                Browse all 50 states →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
