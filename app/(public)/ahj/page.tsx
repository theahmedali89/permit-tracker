import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATE_NAMES, stateSlug, type AhjEntry } from "./_lib";

const PAGE_URL = "https://permitwarden.com/ahj";

export const metadata: Metadata = {
  title: "Permit portal directory — official AHJ links for all 50 states | Permit Warden",
  description:
    "Find the official building permit portal for your city or county. 186 curated authority links across all 50 states — direct to the source, no hunting through county websites.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Permit portal directory — all 50 states",
    description:
      "186 official permit authority links across all 50 states. Find your AHJ's portal in seconds.",
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - AHJ permit portal directory",
      },
    ],
  },
};

const COLLECTION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Permit portal directory — all 50 states",
  description:
    "Directory of official building permit authority portals across all 50 U.S. states.",
  url: PAGE_URL,
};

export default async function AhjHubPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ahj_directory")
    .select("state")
    .order("state");

  const counts: Record<string, number> = {};
  for (const row of (data as Pick<AhjEntry, "state">[] | null) || []) {
    counts[row.state] = (counts[row.state] || 0) + 1;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const states = Object.keys(counts).sort((a, b) =>
    (STATE_NAMES[a] || a).localeCompare(STATE_NAMES[b] || b)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_JSON_LD) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <Link href="/" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            &larr; Back to Permit Warden
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Permit portal directory
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            {total} official building-permit authority links across all 50 states.
            Pick your state to find the right portal — direct to the source.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {states.map((code) => (
              <Link
                key={code}
                href={`/ahj/${stateSlug(code)}`}
                className="rounded-lg border border-gray-200 bg-white p-5 transition hover:border-sky-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-sky-700"
              >
                <p className="font-semibold text-gray-900 dark:text-white">
                  {STATE_NAMES[code] || code}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {counts[code]} portal{counts[code] === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-900/20">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Tracking deadlines across jurisdictions?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-gray-600 dark:text-gray-400">
              Permit Warden watches every permit, license, and inspection deadline —
              and emails you before they expire.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
