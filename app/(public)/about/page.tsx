import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/about";
const TITLE = "About Permit Warden — Permit Tracking Software for Contractors";
const DESCRIPTION =
  "Permit Warden is permit tracking software for small U.S. contractors: one dashboard for permits, licenses, inspections, and subcontractor insurance.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About Permit Warden" }],
  },
};

export default function AboutPage() {
  return (
    <PublicPage
      eyebrow="About Permit Warden"
      title="Built for contractors who can't afford a missed deadline"
      intro={
        <p>
          Permit Warden is permit tracking software for small U.S.
          contractors. One missed permit deadline can mean a stop-work order,
          a fine, or a closing that falls through — so we built a single
          dashboard that watches every permit, license, inspection, and
          subcontractor certificate of insurance, and emails you before any
          of them expires.
        </p>
      }
    >
      <PageCard title="What we do">
        <p>
          Contractors juggle permits across cities, counties, and states, each
          with its own portal, its own validity rules, and its own renewal
          process. Permit Warden keeps all of that in one place: add a permit
          once, and the dashboard shows what is expiring, what needs an
          inspection, and whose insurance is about to lapse.
        </p>
        <p>
          Reminders go out 30, 14, 7, and 1 day before a deadline, with
          automatic follow-ups until the item is handled. A photo
          of a permit or license can pre-fill the form with OCR that runs in
          the browser, and deadlines sync to Google Calendar.
        </p>
      </PageCard>
      <PageCard title="Verified data, not guesses">
        <p>
          Permit rules are local, and wrong information is worse than none.
          Our AHJ directory links 186 official permit portals across all 50
          states, and where we publish validity periods, extension rules, or
          processing times, we publish them only for jurisdictions we have
          verified against an official source — and we show that source and
          the date it was last verified. Where we have not verified a rule, we
          say so instead of inventing one.
        </p>
        <p>
          Read how we handle sources on our{" "}
          <Link href="/verified-sources" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            verified sources
          </Link>{" "}
          page.
        </p>
      </PageCard>
      <PageCard title="Who it's for">
        <p>
          Small and mid-size general contractors, remodelers, roofers,
          electricians, and solar installers working across more than one
          jurisdiction — and the office staff, project managers, and field
          crews who share the same deadlines. The free tools (parcel lookup,
          license lookup, noise ordinance lookup, shed permit checker) are
          open to everyone, with or without an account.
        </p>
      </PageCard>
      <PageCard title="Get in touch">
        <p>
          Questions, corrections to a portal link, or a jurisdiction rule we
          should verify? Email{" "}
          <a href="mailto:support@permitwarden.com" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            support@permitwarden.com
          </a>{" "}
          or use the{" "}
          <Link href="/contact" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            contact form
          </Link>
          .
        </p>
      </PageCard>
    </PublicPage>
  );
}
