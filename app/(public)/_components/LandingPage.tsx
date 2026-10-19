import Link from "next/link";
import FineStats from "./FineStats";

const FEATURES: [string, string][] = [
  ["Reminders before every deadline", "Permit, license, and inspection expirations with 30/14/7/1-day warnings — plus automatic 5-day follow-ups so nothing slips twice."],
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

/** CSS-only dashboard mockup for the hero — no images, fully responsive. */
function DashboardMockup() {
  const rows: [string, string, string, string][] = [
    ["BLD-2026-0418", "Austin, TX", "12 days left", "warn"],
    ["ELEC-2026-0902", "Denver, CO", "45 days left", "ok"],
    ["PLB-2026-0117", "Baltimore, MD", "3 days left", "warn"],
    ["HVAC-2026-0731", "Chicago, IL", "Expired 2d ago", "bad"],
  ];
  return (
    <div className="pw-glass pw-float-soft rounded-2xl p-4 sm:p-5 backdrop-blur-xl bg-white/20" aria-hidden="true">
      {/* mock window bar */}
      <div className="flex items-center gap-1.5 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
        <span className="ml-2 text-[11px] font-medium text-white/90">Permit Warden — Dashboard</span>
      </div>
      {/* alert banner */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-400/30 border border-amber-300/50 px-3 py-2">
        <svg className="h-4 w-4 shrink-0 text-amber-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM12 3.75l7.5 13.5h-15L12 3.75z" />
        </svg>
        <p className="text-[11px] sm:text-xs font-semibold text-amber-50">2 permits expiring within 14 days — reminders sent</p>
      </div>
      {/* mini KPI row */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[
          ["24", "Active"],
          ["2", "Expiring"],
          ["1", "Expired"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-xl bg-white/25 border border-white/30 px-2 py-2 text-center">
            <p className="text-base sm:text-lg font-bold text-white">{n}</p>
            <p className="text-[10px] text-white/85">{l}</p>
          </div>
        ))}
      </div>
      {/* permit rows */}
      <div className="space-y-2">
        {rows.map(([id, city, left, tone]) => (
          <div key={id} className="flex items-center justify-between gap-2 rounded-xl bg-white/25 border border-white/25 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] sm:text-xs font-semibold text-white">{id}</p>
              <p className="text-[10px] text-white/80">{city}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                tone === "ok"
                  ? "bg-teal-400/25 text-teal-100 border border-teal-300/40"
                  : tone === "warn"
                    ? "bg-amber-400/25 text-amber-100 border border-amber-300/40"
                    : "bg-red-400/25 text-red-100 border border-red-300/40"
              }`}
            >
              {left}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LANDING_FAQ_JSON_LD) }}
      />
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/20 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-gray-950/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo-mark.png" alt="Permit Warden" className="h-9 w-9 rounded-lg shadow" />
              <span className="text-lg font-bold tracking-tight">
                Permit <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Warden</span>
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
              <Link href="/signup" className="pw-float-btn rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25">
                Start free
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden bg-blue-800 bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 dark:bg-blue-950 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
          {/* decorative blobs — solid bg-blue-800 above guarantees the white text stays readable even if a mobile browser drops the gradient */}
          <div className="pointer-events-none absolute -top-32 right-0 h-44 w-44 rounded-full bg-teal-300/25 blur-3xl sm:h-96 sm:w-96" aria-hidden />
          <div className="pointer-events-none absolute bottom-0 -left-24 h-40 w-40 rounded-full bg-blue-300/25 blur-3xl sm:h-80 sm:w-80" aria-hidden />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-12 lg:pb-24">
            <div className="text-center lg:text-left">
              <p className="inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1 text-sm font-medium text-white backdrop-blur">
                Free to start — no credit card required
              </p>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                One missed permit deadline can cost you{" "}
                <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">$500 a day.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-blue-50/90 lg:mx-0">
                Baltimore fines up to $500 per day, per violation. New York City:
                $800–$4,000 per violation. Permit Warden watches your permits,
                licenses, inspections, and subcontractor insurance — and emails you{" "}
                <em>before</em> they expire.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="pw-float-btn inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-800 shadow-xl shadow-black/20"
                >
                  Start tracking free
                </Link>
                <a
                  href="#how"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/40 bg-white/10 px-8 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/20"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-5 text-sm font-medium text-blue-100/80">
                186 AHJ portals · All 50 states · Set up in minutes
              </p>
            </div>
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <DashboardMockup />
            </div>
          </div>
          {/* wave divider */}
          <svg className="relative block w-full text-white dark:text-gray-950" viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden>
            <path d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z" fill="currentColor" />
          </svg>
        </section>

        {/* Fine stats */}
        <div id="fines" className="mx-auto max-w-4xl px-4 sm:px-6">
          <FineStats />
        </div>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-blue-50/50 p-6 shadow-sm dark:border-white/10 dark:from-gray-900 dark:to-blue-950/40">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-gray-200 bg-gradient-to-b from-blue-50/60 to-teal-50/40 py-16 dark:border-white/10 dark:from-blue-950/40 dark:to-teal-950/20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Everything a busy shop needs, nothing it doesn&apos;t
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(([title, body]) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compare teaser */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Still on a spreadsheet?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Spreadsheets are free and familiar — and for some shops, they&apos;re enough.
            Read our honest breakdown of where they fall short and when automated
            reminders earn their keep.
          </p>
          <Link href="/compare/permitwarden-vs-excel" className="mt-6 inline-flex items-center justify-center rounded-xl border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10">
            Permit Warden vs. Excel →
          </Link>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-gray-200 bg-gray-50 py-16 dark:border-white/10 dark:bg-gray-900/50">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-4">
              {FAQS.map(([question, answer]) => (
                <div key={question} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
                  <h3 className="font-semibold">{question}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-blue-800 bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 dark:bg-blue-950 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
          <div className="pointer-events-none absolute -top-24 left-1/3 h-36 w-36 rounded-full bg-teal-300/25 blur-3xl sm:h-72 sm:w-72" aria-hidden />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
            <div className="pw-glass mx-auto rounded-3xl p-8 sm:p-10">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Your next deadline is already ticking
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-50/90">
                Add your permits today — Permit Warden will make sure you never find out
                about an expiration the expensive way.
              </p>
              <Link href="/signup" className="pw-float-btn mt-8 inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-blue-800 shadow-xl shadow-black/20">
                Start tracking free
              </Link>
              <p className="mt-4 text-sm text-blue-100/70">No credit card · 186 AHJ portals built in</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-10 dark:border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo-mark.png" alt="Permit Warden" className="h-8 w-8 rounded-lg shadow" />
              <span className="font-bold">Permit <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Warden</span></span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white">Blog</Link>
              <Link href="/compare/permitwarden-vs-excel" className="hover:text-gray-900 dark:hover:text-white">vs. Excel</Link>
              <Link href="/solutions/solar" className="hover:text-gray-900 dark:hover:text-white">Solar</Link>
              <Link href="/solutions/roofing" className="hover:text-gray-900 dark:hover:text-white">Roofing</Link>
              <Link href="/solutions/electrical" className="hover:text-gray-900 dark:hover:text-white">Electrical</Link>
              <Link href="/templates/construction-permit-tracking-spreadsheet" className="hover:text-gray-900 dark:hover:text-white">Free template</Link>
              <Link href="/tools/parcel-lookup" className="hover:text-gray-900 dark:hover:text-white">APN lookup</Link>
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
