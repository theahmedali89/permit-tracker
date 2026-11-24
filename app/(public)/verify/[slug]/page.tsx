import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getPublicPassport } from "@/lib/features/compliance-passport";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Verify Contractor — Permit Warden Compliance Passport",
    description: `Verify this contractor's license status, active permits and COI validity. Compliance Passport ${slug}.`,
    robots: { index: false, follow: true },
  };
}

/**
 * Public compliance passport. Data comes through the service client
 * (bypasses RLS) but `getPublicPassport` only returns the page when the
 * org opted in, and only ever returns statuses/counts/expiry dates —
 * never private document contents.
 */
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const passport = await getPublicPassport(createServiceClient(), slug);
  if (!passport) notFound();

  const fmt = (iso: string | null) =>
    iso ? new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
        Permit Warden · Compliance Passport
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {passport.orgName}
      </h1>
      <p className="mt-1 text-gray-600">
        {passport.trade ? `${passport.trade} · ` : ""}
        {passport.state ?? "Verified contractor"}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Verified {new Date(passport.verifiedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ·
        Statuses only — no private documents are shown on this page.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Licenses</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {passport.licenses.active}
            <span className="text-lg font-medium text-gray-400"> / {passport.licenses.total}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">active licenses</p>
          {passport.licenses.expired > 0 && (
            <p className="mt-1 text-sm font-medium text-red-600">{passport.licenses.expired} expired</p>
          )}
          {passport.licenses.expiringSoon > 0 && (
            <p className="mt-1 text-sm font-medium text-amber-600">
              {passport.licenses.expiringSoon} expiring within 30 days
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">Nearest expiry: {fmt(passport.licenses.nearestExpiry)}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Active permits</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {passport.permits.active}
            <span className="text-lg font-medium text-gray-400"> / {passport.permits.total}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">permits currently active</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-medium text-gray-500">Insurance (COI)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {passport.coi.valid}
            <span className="text-lg font-medium text-gray-400"> / {passport.coi.total}</span>
          </p>
          <p className="mt-1 text-sm text-gray-600">valid certificates on file</p>
          {passport.coi.expired > 0 && (
            <p className="mt-1 text-sm font-medium text-red-600">{passport.coi.expired} expired</p>
          )}
          <p className="mt-2 text-xs text-gray-500">Nearest expiry: {fmt(passport.coi.nearestExpiry)}</p>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        This page shows license, permit and insurance <em>statuses</em> only,
        shared by the contractor. For full verification, ask the contractor
        for their license number and certificate directly.
      </p>
      <p className="mt-4 text-sm">
        <Link href="/" className="font-medium text-sky-600 hover:text-sky-700">
          Track your own permits with Permit Warden →
        </Link>
      </p>
    </main>
  );
}
