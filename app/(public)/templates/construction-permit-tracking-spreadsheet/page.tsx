import type { Metadata } from "next";
import Link from "next/link";

const PAGE_URL = "https://permitwarden.com/templates/construction-permit-tracking-spreadsheet";

export const metadata: Metadata = {
  title: "Free Construction Permit Tracking Spreadsheet (Excel Template)",
  description:
    "Download a free Excel template to track building permits, licenses, and inspections. Color-coded expiry dates, jurisdiction columns, and a how-to-use guide included.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Free Construction Permit Tracking Spreadsheet — Permit Warden",
    description:
      "A free Excel template for tracking permits, licenses, and inspections, with automatic color-coded expiry alerts.",
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - Free construction permit tracking spreadsheet",
      },
    ],
  },
};

const HOW_TO_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Track construction permits with a free Excel spreadsheet",
  description:
    "Download and use the free Permit Warden permit-tracking spreadsheet to log permits, licenses, and inspections with color-coded expiry dates.",
  url: PAGE_URL,
  step: [
    {
      "@type": "HowToStep",
      name: "Download the template",
      text: "Download the free .xlsx file. It opens in Microsoft Excel, Google Sheets, or LibreOffice.",
    },
    {
      "@type": "HowToStep",
      name: "Add one row per permit",
      text: "Fill in the permit number, type, jurisdiction, issue date, expiry date, status, and notes.",
    },
    {
      "@type": "HowToStep",
      name: "Watch the color coding",
      text: "The Expiry Date column highlights automatically: green for more than 60 days out, yellow for 30–60 days, red for under 30 days or expired.",
    },
    {
      "@type": "HowToStep",
      name: "Sort by expiry date",
      text: "Filter or sort the sheet by Expiry Date to see which deadlines are coming up next.",
    },
  ],
};

function CheckIcon() {
  return (
    <svg className="mt-1 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

const INCLUDED = [
  ["Permit, license & inspection columns", "Dedicated columns for the permit number, type, jurisdiction, issue and expiry dates, status, and notes — everything needed to keep one clean log."],
  ["Color-coded expiry dates", "Built-in conditional formatting highlights expiry dates in green (60+ days out), yellow (30–60 days), and red (under 30 days or expired)."],
  ["Sample rows to get started", "Three labeled example rows show how to fill the sheet, so you can see the formatting working before you add your own data."],
  ["How-to-use guide in the file", "The first data row explains the color coding and how to sort by expiry date — no separate instructions to lose."],
  ["Works everywhere spreadsheets do", "Opens in Microsoft Excel, Google Sheets, Apple Numbers, or LibreOffice. No account, no sign-up, no cost."],
];

const FOR_WHO = [
  ["Small general contractors", "Keep every active job's permits in one sheet you can filter by jurisdiction or expiry."],
  ["Specialty trades", "Solar, roofing, electrical, plumbing, and HVAC crews tracking trade permits and inspections across multiple projects."],
  ["Office admins & bookkeepers", "One place to check before renewals come due, instead of digging through email and paper folders."],
  ["Owner-operators", "A simple system that doesn't require new software — just a spreadsheet you already know how to use."],
];

export default function TemplateLandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOW_TO_JSON_LD) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link href="/" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            &larr; Back to Permit Warden
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Free Construction Permit Tracking Spreadsheet
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            A free Excel template for tracking building permits, licenses, and inspections — with
            automatic color-coded expiry alerts. No sign-up required.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="/templates/permit-tracking-template.xlsx"
              download
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download the free template (.xlsx)
            </a>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Free download — works in Excel, Google Sheets, Numbers, and LibreOffice.
          </p>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            What&apos;s inside the template
          </h2>
          <div className="mt-6 space-y-5">
            {INCLUDED.map(([title, body]) => (
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
            Who it&apos;s for
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FOR_WHO.map(([title, body]) => (
              <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            When spreadsheets aren&apos;t enough
          </h2>
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              A spreadsheet is a great place to start — but it only works if someone remembers to
              open it. Spreadsheets can&apos;t send you a reminder before a permit expires, they
              don&apos;t alert you when an inspection window is closing, and the one person who
              knows how the sheet is organized is usually out on a job site.
            </p>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Permit Warden takes the same information and watches it for you: automatic email
              reminders before permits, licenses, and inspections expire, shared visibility for the
              whole team, and a clean dashboard instead of one more file to maintain.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              Try Permit Warden free
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            You&apos;re welcome to keep using the spreadsheet as long as you like. If your list of
            permits ever grows past what a sheet can comfortably handle, the signup button above is
            the next step.
          </p>
        </div>
      </div>
    </>
  );
}
