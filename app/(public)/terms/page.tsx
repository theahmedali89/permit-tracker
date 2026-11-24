import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/terms";
const TITLE = "Terms of Service";
const DESCRIPTION =
  "Permit Warden's terms of service: what the service provides, what you are responsible for, plan limits, and the limits of the permit and jurisdiction information we publish.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden terms of service" }],
  },
};

export default function TermsPage() {
  return (
    <PublicPage
      eyebrow="Terms of Service"
      title="Terms of Service"
      intro={
        <p>
          These terms govern your use of Permit Warden. By creating an account
          or using the free tools, you agree to them. This is a plain-language
          summary of the service — it is not legal advice.
        </p>
      }
      updated="Last updated 24 November 2026"
    >
      <PageCard title="1. The service">
        <p>
          Permit Warden provides permit, license, inspection, and
          subcontractor compliance tracking, deadline reminders by email, and
          free public tools (parcel lookup, license lookup, noise ordinance
          lookup, shed permit checker, and calculators). Free accounts are
          subject to the plan limits shown on the{" "}
          <Link href="/pricing" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            pricing page
          </Link>
          .
        </p>
      </PageCard>
      <PageCard title="2. Your responsibilities">
        <p>
          You are responsible for the accuracy of the records you enter, for
          keeping your account credentials secure, and for complying with the
          laws and permit rules of every jurisdiction you work in. Permit
          Warden reminds you about deadlines you record; it does not file
          permits, pay fees, or act as your agent with any building
          department.
        </p>
        <p>
          You agree not to use the service to break the law, to misrepresent
          a license or permit, or to upload content you do not have the right
          to share.
        </p>
      </PageCard>
      <PageCard title="3. Permit and jurisdiction information">
        <p>
          Permit validity periods, extension rules, processing times, fees,
          and portal links are provided for convenience and are verified
          against official sources where stated (see our{" "}
          <Link href="/verified-sources" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            verified sources
          </Link>{" "}
          page). Rules change, and local departments have the final say: always
          confirm requirements, fees, and deadlines with the Authority Having
          Jurisdiction before acting. Permit Warden is not liable for fines,
          stop-work orders, or delays resulting from a rule change, an
          unverified rule, or a deadline you did not record.
        </p>
      </PageCard>
      <PageCard title="4. Reminders are a best effort">
        <p>
          We send reminders 30, 14, 7, and 1 day before recorded deadlines,
          with follow-ups until an item is handled. Email delivery can fail
          (spam filters, inbox limits, provider outages), so reminders are a
          safety net, not a guarantee — you remain responsible for your
          deadlines.
        </p>
      </PageCard>
      <PageCard title="5. Free tools and public content">
        <p>
          The free tools and the blog are provided as-is. Tool results are
          estimates or lookups based on the data sources stated on each tool
          page, and are not a substitute for confirming with the relevant
          authority.
        </p>
      </PageCard>
      <PageCard title="6. Accounts and termination">
        <p>
          We may suspend or terminate accounts that abuse the service, attempt
          to access other organizations&apos; data, or violate these terms.
          You may delete your account at any time; deletion removes your
          organization&apos;s data as described in the{" "}
          <Link href="/privacy" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            Privacy Policy
          </Link>
          .
        </p>
      </PageCard>
      <PageCard title="7. Changes">
        <p>
          We may update these terms as the service changes. The
          &ldquo;last updated&rdquo; date above will change, and material
          changes will be noted on the changelog page. Continued use of the
          service after a change means you accept the updated terms.
        </p>
      </PageCard>
    </PublicPage>
  );
}
