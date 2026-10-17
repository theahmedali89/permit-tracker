import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBuildClient } from "@/lib/supabase/build";
import { STATE_NAMES, stateSlug, stateCodeFromSlug, citySlug, type AhjEntry } from "../../_lib";
import { getRegulation, type RegulationData } from "../../_regulations";

/** True when the regulation row has at least one substantive field worth showing. */
function hasRegulationContent(reg: RegulationData): boolean {
  return (
    reg.validity_days !== undefined ||
    reg.validity_notes !== undefined ||
    reg.extension_allowed !== undefined ||
    reg.extension_process !== undefined ||
    reg.extension_fee_usd !== undefined ||
    reg.processing_days !== undefined ||
    reg.source_url !== undefined
  );
}

export async function generateStaticParams() {
  // Build-time only: no cookies available. If the DB is unreachable (e.g. no
  // env vars in a local build), return [] so pages render on demand instead of
  // failing the whole build.
  try {
    const supabase = createBuildClient();
    const { data, error } = await supabase.from("ahj_directory").select("state, city");
    if (error) throw error;
    return ((data as { state: string; city: string | null }[] | null) || []).map((r) => ({
      state: stateSlug(r.state),
      city: citySlug(r.city),
    }));
  } catch {
    console.warn("[ahj] generateStaticParams: DB unavailable, skipping static generation");
    return [];
  }
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
  const reg = getRegulation(data.code, entry.city);
  const validityBit =
    reg && reg.validity_days !== undefined
      ? ` Building permits typically valid ${reg.validity_days} days.`
      : "";
  return {
    title: `${place} permit portal — ${entry.authority_name} | Permit Warden`,
    description: `Official permit portal for ${place}, ${name}: ${entry.authority_name}.${validityBit} Direct portal link${entry.phone ? `, phone ${entry.phone}` : ""}.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${place} permit portal`,
      description: `Official portal: ${entry.authority_name}.${validityBit}`,
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
  const reg = getRegulation(data.code, entry.city);
  const showReg = reg !== undefined && hasRegulationContent(reg);

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

  // FAQ entries derived strictly from the regulatory data (no invented answers).
  const faqQuestions: { name: string; text: string }[] = [];
  if (showReg && reg) {
    if (reg.validity_days !== undefined) {
      let answer = `Building permits in ${place} are valid for ${reg.validity_days} days (${reg.permit_type} permits).`;
      if (reg.validity_notes) answer += ` ${reg.validity_notes}`;
      faqQuestions.push({
        name: `How long is a building permit valid in ${place}?`,
        text: answer,
      });
    }
    if (reg.extension_allowed !== undefined || reg.extension_process || reg.extension_fee_usd !== undefined) {
      let answer: string;
      if (reg.extension_allowed === true) {
        answer = `Yes — permit extensions are allowed in ${place}.`;
        if (reg.extension_fee_usd !== undefined) answer += ` The renewal fee is $${reg.extension_fee_usd}.`;
        if (reg.extension_process) answer += ` ${reg.extension_process}`;
      } else if (reg.extension_allowed === false) {
        answer = `Extensions are not allowed in ${place} under the rules we have verified.`;
        if (reg.extension_process) answer += ` ${reg.extension_process}`;
      } else {
        answer = `Extension policy for ${place}: ${reg.extension_process ?? ""}`;
      }
      faqQuestions.push({
        name: `Can I extend or renew a building permit in ${place}?`,
        text: answer.trim(),
      });
    }
    if (reg.processing_days !== undefined) {
      faqQuestions.push({
        name: `How long does it take to get a building permit in ${place}?`,
        text: `Reported processing time in ${place} is about ${reg.processing_days} days. Actual times vary by project type and application completeness.`,
      });
    }
  }

  const faqJsonLd =
    faqQuestions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqQuestions.map((q) => ({
            "@type": "Question",
            name: q.name,
            acceptedAnswer: { "@type": "Answer", text: q.text },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

          {showReg && reg && (
            <div className="mt-8 rounded-lg border border-emerald-200 bg-white p-6 dark:border-emerald-800 dark:bg-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Permit validity &amp; renewal — {place}
              </h2>
              <dl className="mt-4 space-y-4">
                {reg.validity_days !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Validity period
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {reg.validity_days} days ({reg.permit_type} permits)
                    </dd>
                    {reg.validity_notes && (
                      <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {reg.validity_notes}
                      </dd>
                    )}
                  </div>
                )}
                {(reg.extension_allowed !== undefined || reg.extension_process || reg.extension_fee_usd !== undefined) && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Extension / renewal
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {reg.extension_allowed === true
                        ? "Allowed"
                        : reg.extension_allowed === false
                          ? "Not allowed"
                          : "Policy on file"}
                      {reg.extension_fee_usd !== undefined &&
                        ` — $${reg.extension_fee_usd} fee`}
                    </dd>
                    {reg.extension_process && (
                      <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                        {reg.extension_process}
                      </dd>
                    )}
                  </div>
                )}
                {reg.processing_days !== undefined && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Typical processing time
                    </dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      About {reg.processing_days} days
                    </dd>
                  </div>
                )}
                {reg.source_url && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Source
                    </dt>
                    <dd className="mt-1 text-sm">
                      <a
                        href={reg.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sky-600 hover:text-sky-700 dark:text-sky-400"
                      >
                        Official source ↗
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

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
