import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared shell for the public trust/commercial pages (/features, /about,
 * /contact, /privacy, /terms, /faq, /glossary, /tools, /changelog,
 * /verified-sources). Same visual language as the existing public guides
 * (building-permit, certificate-of-occupancy): gradient hero band, centred
 * max-w-4xl column, card sections, signup CTA.
 */
export function PublicPage({
  eyebrow,
  title,
  intro,
  children,
  updated,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
  /** e.g. "Last updated 24 November 2026" — shown only when given. */
  updated?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-teal-50/40 dark:from-blue-950/40 dark:to-teal-950/20">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
        >
          &larr; Back to Permit Warden
        </Link>
        <p className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {title}
        </h1>
        <div className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          {intro}
        </div>
        {updated && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{updated}</p>
        )}
        {children}
        <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Permits expire. Deadlines sneak up. We watch both.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">
            Permit Warden tracks every permit, inspection, and renewal across
            your projects — with automatic reminders before anything lapses.
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
  );
}

/** Card used by the trust pages for one section of content. */
export function PageCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </section>
  );
}
