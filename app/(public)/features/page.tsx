import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/features";
const TITLE = "Features — Permit Tracking Software for Contractors";
const DESCRIPTION =
  "Permit Warden tracks permits, licenses, inspections, and subcontractor insurance with automatic reminders, OCR form filling, and Google Calendar sync.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden features" }],
  },
};

const FEATURES: Array<[string, string, string?]> = [
  [
    "Reminders before every deadline",
    "Permit, license, and inspection expirations with 30/14/7/1-day warnings — plus follow-ups until it's handled, so nothing slips twice.",
  ],
  [
    "One dashboard, every jurisdiction",
    "Permits across cities, counties, and states on a single screen — filter by what's expiring, not by folder.",
  ],
  [
    "186 official AHJ portals, all 50 states",
    "Direct links to the real permit portals for every state — no more hunting through county websites.",
    "/ahj",
  ],
  [
    "Snap a photo, skip the typing",
    "Upload a photo of a permit or license and the form pre-fills itself with OCR. The recognition runs in your browser, so the image is never uploaded.",
  ],
  [
    "Subcontractor COI tracking",
    "Certificates of insurance with expiry dates per sub. Get warned before a lapsed COI puts your job at risk.",
  ],
  [
    "Google Calendar sync",
    "Deadlines land on your calendar automatically, alongside everything else.",
  ],
  [
    "Free tools that save a trip to the county site",
    "Parcel (APN) lookup, contractor license lookup, noise ordinance lookup, and a shed permit checker — free, no account needed.",
    "/tools",
  ],
  [
    "Permit timeline & fee calculators",
    "Estimate when a permit expires and what a delay could cost, using the jurisdiction rules we have verified.",
    "/tools",
  ],
  [
    "Reports and exports",
    "Export your permits and deadlines to CSV for clients, insurers, and your own records.",
  ],
];

export default function FeaturesPage() {
  return (
    <PublicPage
      eyebrow="What Permit Warden does"
      title="Features"
      intro={
        <p>
          Permit tracking software for contractors: every permit, license,
          inspection, and subcontractor certificate in one place, with
          reminders that arrive before a deadline can cost you money.
        </p>
      }
    >
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {FEATURES.map(([title, body, href]) => (
          <div
            key={title}
            className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {body}
            </p>
            {href && (
              <Link
                href={href}
                className="mt-3 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Learn more →
              </Link>
            )}
          </div>
        ))}
      </div>
      <PageCard title="Free to start">
        <p>
          You can create an account and start tracking permits, licenses, and
          inspections free — no credit card required. The free tools and the
          AHJ directory are free for everyone, with or without an account.
        </p>
        <p>
          See <Link href="/pricing" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">pricing</Link>{" "}
          for plan limits, or read the{" "}
          <Link href="/faq" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">frequently asked questions</Link>{" "}
          if you are comparing Permit Warden with a spreadsheet.
        </p>
      </PageCard>
    </PublicPage>
  );
}
