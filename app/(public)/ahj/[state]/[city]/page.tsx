import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STATE_NAMES, stateSlug, stateCodeFromSlug, citySlug, type AhjEntry } from "../../_lib";

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase.from("ahj_directory").select("state, city");
  return ((data as { state: string; city: string | null }[] | null) || []).map((r) => ({
    state: stateSlug(r.state),
    city: citySlug(r.city),
  }));
}

async function getEntry(stateSlugParam: string, citySlugParam: string) {
  const code = stateCodeFromSlug(stateSlugParam);
  if (!code) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ahj_directory")
    .select("*")
    .eq("state", code);
  const entries = (data as AhjEntry[] | null) || [];
  const entry = entries.find((e) => citySlug(e.city) === citySlugParam);
  if (!entry) return null;
  // Siblings for internal linking (same state, excluding self)
  const siblings = entries.filter((e) => e.id !== entry.id).slice(0, 6);
  return { code, name: STATE_NAMES[code], entry, siblings };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}): Promise<Metadata> {
  const { state, city } = await params;
  const data = await getEntry(state, city);
  if (!data) return {};
  const { name, entry } = data;
  const place = entry.city || entry.county || name;
  const url = `https://permitwarden.com/ahj/${state}/${city}`;
  return {
    title: `${place} permit portal — ${entry.authority_name} | Permit Warden`,
    description: `Official permit portal for ${place}, ${name}: ${entry.authority_name}. Direct portal link${entry.phone ? `, phone ${entry.phone}` : ""}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${place} permit portal`,
      description: `Official portal: ${entry.authority_name}.`,
      url,
    },
  };
}

export default async function JurisdictionPage({
  params,
}: {
  params: Promise<{ state: string; city: string }>;
}) {
  const { state, city } = await params;
  const data = await getEntry(state, city);
  if (!data) notFound();
  const { name, entry, siblings } = data;
  const place = entry.city || entry.county || name;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOffice",
    name: entry.authority_name,
    url: entry.portal_url || undefined,
    telephone: entry.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: entry.city || undefined,
      addressRegion: name,
      addressCountry: "US",
    },
    description: entry.notes || `Building permit authority for ${place}, ${name}.`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <nav className="text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-sky-600">Home</Link>
            {" / "}
            <Link href="/ahj" className="hover:text-sky-600">Permit portals</Link>
            {" / "}
            <Link href={`/ahj/${state}`} className="hover:text-sky-600">{name}</Link>
            {" / "}
            <span className="text-gray-900 dark:text-white">{place}</span>
          </nav>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {place} permit portal
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {entry.authority_name}
          </p>

          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <dl className="space-y-4">
              {entry.portal_url && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Official portal
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={entry.portal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Open {entry.authority_name} portal ↗
                    </a>
                  </dd>
                </div>
              )}
              {entry.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    <a href={`tel:${entry.phone.replace(/[^0-9+]/g, "")}`} className="text-sky-600 hover:text-sky-700 dark:text-sky-400">
                      {entry.phone}
                    </a>
                  </dd>
                </div>
              )}
              {(entry.city || entry.county) && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Jurisdiction</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {[entry.city, entry.county ? `${entry.county} County` : null, name]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
              {entry.notes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    What to know
                  </dt>
                  <dd className="mt-1 text-gray-700 dark:text-gray-300">{entry.notes}</dd>
                </div>
              )}
              {entry.verified_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last verified</dt>
                  <dd className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(entry.verified_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {siblings.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                More {name} permit portals
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {siblings.map((s) => (
                  <Link
                    key={s.id}
                    href={`/ahj/${state}/${citySlug(s.city)}`}
                    className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 hover:border-sky-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-sky-700"
                  >
                    {s.city || s.county} — {s.authority_name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/20">
            <p className="font-semibold text-gray-900 dark:text-white">
              Filing in {place}? Don&apos;t miss the deadline.
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Permit Warden emails you before permits expire — free to start.
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
