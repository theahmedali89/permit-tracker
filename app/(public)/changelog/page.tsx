import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/changelog";
const TITLE = "Changelog";
const DESCRIPTION =
  "What changed in Permit Warden: the November 2026 v2 release — security and reliability fixes, new free tools, trust pages, and blog guides.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden changelog" }],
  },
};

export default function ChangelogPage() {
  return (
    <PublicPage
      eyebrow="Changelog"
      title="Changelog"
      intro={
        <p>
          What changed in Permit Warden, newest first. We keep this list
          honest: it covers the product and the public site, not marketing
          promises.
        </p>
      }
      updated="Last updated 24 November 2026"
    >
      <PageCard title="November 2026 — v2: security, reliability, and new tools">
        <p>
          <strong>Security:</strong> tenant-isolation and blog/regulation
          write-access fixes, open-redirect protection on the auth callback,
          and a fix for the broken password-reset flow.
        </p>
        <p>
          <strong>Reliability:</strong> permit edits now keep deadline
          reminders in sync, reminder delivery is retried instead of silently
          dropped, and the reminder system reads each organization&apos;s own
          warning windows instead of only hardcoded offsets.
        </p>
        <p>
          <strong>New free tools:</strong> a permit timeline calculator and a
          permit fee / cost-of-delay calculator, joining the parcel lookup,
          license lookup, noise ordinance lookup, and shed permit checker on
          the{" "}
          <Link href="/tools" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            tools hub
          </Link>
          .
        </p>
        <p>
          <strong>Trust pages:</strong> new About, Contact, Privacy, Terms,
          FAQ, Glossary, Verified Sources, and Changelog pages, plus a
          contact form and cookie consent for analytics.
        </p>
        <p>
          <strong>Blog:</strong> three new guides published — the
          assessor&apos;s parcel number (APN), the certificate of occupancy,
          and permit types explained — and the AHJ guide expanded with new
          sections on what an AHJ controls, code cycles, and working with
          your AHJ.
        </p>
        <p>
          <strong>Performance:</strong> public pages (AHJ directory, blog,
          sitemap) now fetch data with a cookie-free client so they can be
          cached, thin AHJ pages without verified regulation data are
          excluded from search indexing and the sitemap, and the sitemap uses
          real last-modified dates from the database.
        </p>
      </PageCard>
      <PageCard title="Earlier — 2026">
        <p>
          The first public release: permit, license, inspection, and
          subcontractor COI tracking with 30/14/7/1-day email reminders,
          browser-based OCR for permit photos, Google Calendar sync, the AHJ
          directory of 186 official permit portals across all 50 states, and
          the first free tools and blog guides.
        </p>
      </PageCard>
    </PublicPage>
  );
}
