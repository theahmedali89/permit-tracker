import type { Metadata } from "next";
import Link from "next/link";
import FineStats from "../../_components/FineStats";

const PAGE_URL = "https://permitwarden.com/compare/permitwarden-vs-excel";

export const metadata: Metadata = {
  title: "Permit Warden vs. Excel: an honest comparison for contractors",
  description:
    "Excel works until it doesn't. An honest look at where spreadsheets fall short for permit, license, and inspection tracking — and when automated reminders are worth it.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Permit Warden vs. Excel — an honest comparison",
    description:
      "Where permit-tracking spreadsheets break down: manual entry, no auto-reminders, and alerts buried in the inbox.",
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden vs Excel - an honest comparison for contractors",
      },
    ],
  },
};

const WEBPAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Permit Warden vs. Excel: an honest comparison for contractors",
  description:
    "An honest comparison of tracking permits with a spreadsheet versus automated deadline tracking with Permit Warden.",
  url: PAGE_URL,
};

function XIcon() {
  return (
    <svg className="mt-1 h-5 w-5 shrink-0 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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

const SPREADSHEET_PAINS = [
  ["Manual entry, every time", "Every permit, renewal, and inspection has to be typed in by hand — and updated by hand when dates change. With a crew in the field and an office that's already busy, the sheet falls behind and stops being trustworthy."],
  ["No automatic reminders", "A spreadsheet can color a cell red, but it can't email you before a deadline. You have to remember to open the file, and the person who needs the reminder is usually not the person maintaining the sheet."],
  ["Alerts get buried in the inbox", "Most AHJ and utility notices arrive by email. Renewal notices from licensing boards too. They pile up under quotes, invoices, and subcontractor threads — easy to miss, hard to recover from."],
  ["One person holds the knowledge", "Usually there's a single office manager or owner who knows where everything is and what each status means. If they're out sick or leave, the system walks out the door with them."],
  ["No shared visibility", "Field crews can't see which permits are active without calling the office. The office can't see what the field pulled without asking. Everything becomes a phone call."],
];

const AUTOMATED_BENEFITS = [
  ["Reminders come to you", "Set how far ahead you want to be warned — weeks or months — and Permit Warden emails you before permits, licenses, and inspections expire. Nobody has to remember to check a file."],
  ["One source of truth", "The whole team sees the same dashboard: what's active, what's expiring, what's overdue. No more calling the office to ask."],
  ["Capture notices where they arrive", "Forward the renewal or inspection notices that land in your inbox into your account instead of letting them get buried."],
  ["Works across jurisdictions", "Track permits from every city, county, and state you work in on one screen, instead of a different folder or tab for each."],
];

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_JSON_LD) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link href="/" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            &larr; Back to Permit Warden
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Permit Warden vs. Excel: an honest comparison
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Spreadsheets are free, flexible, and familiar — and for some shops, they&apos;re enough.
            Here&apos;s an honest look at where they break down, so you can decide what fits your
            business.
          </p>

          <FineStats />

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Where spreadsheets fall short
          </h2>          <div className="mt-6 space-y-6">
            {SPREADSHEET_PAINS.map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <XIcon />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            What automated tracking changes
          </h2>
          <div className="mt-6 space-y-6">
            {AUTOMATED_BENEFITS.map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <CheckIcon />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            The honest verdict
          </h2>
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              If you have a handful of permits in one jurisdiction and a reliable person who keeps
              the sheet current, a spreadsheet is perfectly fine — we even give one away for free.
            </p>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Permit Warden earns its keep when the list grows: multiple jurisdictions, permits
              across several jobs, licenses with renewal cycles, inspection windows to hit — and
              nobody in the office has an hour a week to babysit a spreadsheet. That&apos;s the
              point where automated reminders stop being a luxury and start being cheap insurance
              against missed deadlines.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
              >
                Try Permit Warden free
              </Link>
              <Link
                href="/templates/construction-permit-tracking-spreadsheet"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Stick with the free spreadsheet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
