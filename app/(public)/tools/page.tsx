import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/tools";
const TITLE = "Free Permit Tools for Contractors";
const DESCRIPTION =
  "Free permit tools for U.S. contractors: timeline calculator, fee & cost-of-delay calculator, parcel lookup, license lookup, and noise ordinance lookup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden free tools" }],
  },
};

const TOOLS: Array<[string, string, string, boolean?]> = [
  [
    "Permit timeline calculator",
    "City + permit type + issue date → predicted expiry, first-inspection deadline, and renewal window, using the jurisdiction rules we have verified.",
    "/tools/permit-timeline-calculator",
    true,
  ],
  [
    "Permit fee & cost-of-delay calculator",
    "Estimate permit fees and what each week of delay could cost — the numbers no competitor shows you.",
    "/tools/permit-fee-calculator",
    true,
  ],
  [
    "Parcel (APN) lookup",
    "Find an assessor's parcel number for any property — the identifier almost every permit application asks for.",
    "/tools/parcel-lookup",
  ],
  [
    "Contractor license lookup",
    "Verify a contractor's license against the official state license board.",
    "/tools/license-lookup",
  ],
  [
    "Noise ordinance lookup",
    "Verified construction hours and residential noise limits for 20 major US cities.",
    "/tools/noise-ordinance-lookup",
  ],
  [
    "Shed permit checker",
    "Pick your city and see instantly whether your shed, fence, or pergola project needs a permit, with the official rule linked.",
    "/tools/shed-permit-checker",
  ],
];

export default function ToolsHubPage() {
  return (
    <PublicPage
      eyebrow="Free tools — no account needed"
      title="Free permit tools"
      intro={
        <p>
          Six free tools for U.S. contractors — lookups and calculators built
          on the same verified AHJ data as the tracker. No account, no email
          address, no credit card.
        </p>
      }
    >
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TOOLS.map(([title, body, href, isNew]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur transition-shadow hover:shadow-md dark:border-white/10 dark:bg-gray-900/70"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {title}{" "}
              {isNew && (
                <span className="ml-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                  New
                </span>
              )}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {body}
            </p>
            <span className="mt-3 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Open tool →
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-gray-600 dark:text-gray-300">
        Tool results are estimates or lookups based on the sources stated on
        each tool page — always confirm fees, deadlines, and requirements with
        your local building department (the AHJ). Want these deadlines watched
        automatically?{" "}
        <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
          Start tracking free →
        </Link>
      </p>
    </PublicPage>
  );
}
