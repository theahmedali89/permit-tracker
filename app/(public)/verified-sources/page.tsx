import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/verified-sources";
const TITLE = "Verified Sources — How Permit Warden Checks Permit Data";
const DESCRIPTION =
  "Permit Warden publishes permit validity, extension, and processing-time data only where verified against an official source — plus how to report an error.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden verified sources" }],
  },
};

export default function VerifiedSourcesPage() {
  return (
    <PublicPage
      eyebrow="Trust & data policy"
      title="Verified sources"
      intro={
        <p>
          Permit rules are local, and wrong information is worse than none.
          This page explains what we verify, what we refuse to guess at, and
          how you can check — or correct — anything we publish.
        </p>
      }
    >
      <PageCard title="The policy, in one paragraph">
        <p>
          We publish a permit validity period, extension rule, processing
          time, or fee only when we have verified it against an official
          source. Where we have not verified a rule, we leave the field
          blank and say so — we never invent a number to fill a page. Every
          AHJ page that carries verified regulation data shows the source link
          and the date it was last verified.
        </p>
      </PageCard>
      <PageCard title="What counts as a source">
        <p>
          <strong>Official city and county permit portals (.gov):</strong>{" "}
          the building department&apos;s own website or online permit system
          — the primary source for portal links, fee schedules, and
          application routes in our AHJ directory.
        </p>
        <p>
          <strong>Municipal codes and published rules:</strong> the adopted
          building code and the department&apos;s published permit rules (for
          example, validity and extension provisions cited by section), used
          for the regulation data on AHJ pages.
        </p>
        <p>
          <strong>State license boards:</strong> the official license
          verification pages linked from our license lookup tool, used to
          confirm a contractor&apos;s license status.
        </p>
        <p>
          <strong>County assessor offices:</strong> the official assessor or
          recorder sites linked from our parcel lookup, used for assessor&apos;s
          parcel number (APN) lookups.
        </p>
        <p>
          We do not treat another contractor blog, a forum post, or an AI
          summary as a source for a rule. If a claim can only be traced to one
          of those, it is not published as verified data.
        </p>
      </PageCard>
      <PageCard title="What is verified today — and what is not">
        <p>
          The AHJ directory itself — 186 official permit portals across all
          50 states — is a link directory: each entry is an official portal
          link with a phone number and notes where available, and each entry
          carries a &ldquo;last verified&rdquo; date.
        </p>
        <p>
          Detailed regulation data (validity periods, extension rules and
          fees, processing times) is published only for a 20-metro pilot set
          of cities, where each figure is tied to a cited official source.
          The other AHJ pages carry the portal link only, and are marked as
          such — they are not indexed by search engines until regulation data
          is added.
        </p>
        <p>
          Blog guides cite the same discipline: figures in the expiry and
          validity guides come from the verified 20-metro set, and anything
          unverified is labelled &ldquo;varies — not verified.&rdquo;
        </p>
      </PageCard>
      <PageCard title="Report an error">
        <p>
          Rules change, portals move, and departments reorganise. If a portal
          link is dead, a fee has changed, or a validity rule on one of our
          pages is wrong, email{" "}
          <a href="mailto:support@permitwarden.com" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            support@permitwarden.com
          </a>{" "}
          with the city, what changed, and a link to the official source if
          you have one. We verify against the official source before updating
          — we do not take a correction on trust alone, either.
        </p>
        <p>
          Browse the directory:{" "}
          <Link href="/ahj" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            AHJ permit portals →
          </Link>
        </p>
      </PageCard>
    </PublicPage>
  );
}
