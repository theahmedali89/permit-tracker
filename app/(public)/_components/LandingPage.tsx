import Link from "next/link";
import FineStats from "./FineStats";

function ShieldIcon() {
  return (
    <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 1.5l7.5 3v6c0 5.25-3.75 9.75-7.5 11.25C8.25 20.25 4.5 15.75 4.5 10.5v-6L12 1.5zm-1.2 13.8l6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-1 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

const FEATURES: [string, string][] = [
  ["Reminders before every deadline", "Permit, license, and inspection expirations with smart 30/14/7/1-day warnings — plus automatic 5-day follow-ups so nothing slips twice."],
  ["Subcontractor COI tracking", "Certificates of insurance with expiry dates per sub. Get warned before a lapsed COI puts your job at risk."],
  ["186 official AHJ portals, all 50 states", "Direct links to the real permit portals for every state — no more hunting through county websites."],
  ["Snap a photo, skip the typing", "Upload a photo of a permit or license and the form pre-fills itself with OCR."],
  ["Google Calendar sync", "Deadlines land on your calendar automatically, alongside everything else."],
  ["One dashboard, every jurisdiction", "Permits across cities, counties, and states on a single screen — filter by what's expiring, not by folder."],
];

const STEPS: [string, string][] = [
  ["1. Add your permits", "Log permits, licenses, inspections, and COIs per project — or snap a photo and let OCR fill the form."],
  ["2. Set your warning windows", "Choose how far ahead you want to be warned. Smart defaults handle renewal buffers per jurisdiction."],
  ["3. Get emailed before it's late", "Reminders land in your inbox before expirations — and keep coming every 5 days until it's handled."],
];

const FAQS: [string, string][] = [
  ["Is Permit Warden really free?", "Yes — you can create an account and start tracking permits, licenses, and inspections free. No credit card required."],
  ["How is this different from a spreadsheet?", "A spreadsheet can't email you. Permit Warden sends automatic reminders before deadlines, tracks COI expirations, and keeps every jurisdiction's deadlines on one dashboard. We even give away a free spreadsheet if that's all you need — see our honest comparison."],
  ["Which jurisdictions are covered?", "Our directory links 186 official permit portals across all 50 states. You can track deadlines from any city, county, or state in one place."],
  ["Can my whole team use it?", "Yes — the dashboard is shared, so office staff, project managers, and field crews all see the same deadlines and statuses."],
  ["Do you handle subcontractor compliance?", "Yes — track each subcontractor's certificate of insurance with expiry dates, and get reminded before coverage lapses."],
];

export const LANDING_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LANDING_FAQ_JSON_LD) }}
      />
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <ShieldIcon />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                Permit Warden
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300 md:flex">
              <a href="#features" className="hover:text-gray-900 dark:hover:text-white">Features</a>
              <a href="#fines" className="hover:text-gray-900 dark:hover:text-white">Fines</a>
              <a href="#how" className="hover:text-gray-900 dark:hover:text-white">How it works</a>
              <a href="#faq" className="hover:text-gray-900 dark:hover:text-white">FAQ</a>
              <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white">Blog</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/signin" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Start free
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Free to start — no credit card required
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Never miss a permit deadline again
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Permit Warden watches your permits, licenses, inspections, and subcontractor
            insurance — and emails you <em>before</em> they expire. Built for small U.S.
            contractors who can&apos;t afford a stop-work order.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700">
              Start tracking free
            </Link>
            <a href="#how" className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-8 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
              See how it works
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
            Set up in minutes · 186 AHJ portals built in · Cancel anytime
          </p>
        </section>

        {/* Fine stats */}
        <div id="fines" className="mx-auto max-w-4xl px-4 sm:px-6">
          <FineStats />
        </div>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-gray-200 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything a busy shop needs, nothing it doesn&apos;t
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(([title, body]) => (
                <div key={title} className="flex gap-3 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <CheckIcon />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compare teaser */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Still on a spreadsheet?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Spreadsheets are free and familiar — and for some shops, they&apos;re enough.
            Read our honest breakdown of where they fall short and when automated
            reminders earn their keep.
          </p>
          <Link href="/compare/permitwarden-vs-excel" className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
            Permit Warden vs. Excel →
          </Link>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-gray-200 bg-gray-50 py-16 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-4">
              {FAQS.map(([question, answer]) => (
                <div key={question} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{question}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Your next deadline is already ticking
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Add your permits today — Permit Warden will make sure you never find out
            about an expiration the expensive way.
          </p>
          <Link href="/signup" className="mt-8 inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white hover:bg-blue-700">
            Start tracking free
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-10 dark:border-gray-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <ShieldIcon />
              <span className="font-bold text-gray-900 dark:text-white">Permit Warden</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white">Blog</Link>
              <Link href="/compare/permitwarden-vs-excel" className="hover:text-gray-900 dark:hover:text-white">vs. Excel</Link>
              <Link href="/solutions/solar" className="hover:text-gray-900 dark:hover:text-white">Solar</Link>
              <Link href="/solutions/roofing" className="hover:text-gray-900 dark:hover:text-white">Roofing</Link>
              <Link href="/solutions/electrical" className="hover:text-gray-900 dark:hover:text-white">Electrical</Link>
              <Link href="/templates/construction-permit-tracking-spreadsheet" className="hover:text-gray-900 dark:hover:text-white">Free template</Link>
              <Link href="/signup" className="hover:text-gray-900 dark:hover:text-white">Sign up</Link>
            </nav>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2026 Permit Warden
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
