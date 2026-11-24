import type { Metadata } from "next";
import { PublicPage, PageCard } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/privacy";
const TITLE = "Privacy Policy";
const DESCRIPTION =
  "Permit Warden's privacy policy: what account, permit, and usage data we collect, how we use it to send deadline reminders, and how to ask for your data to be deleted.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden privacy policy" }],
  },
};

export default function PrivacyPage() {
  return (
    <PublicPage
      eyebrow="Privacy Policy"
      title="Privacy Policy"
      intro={
        <p>
          Permit Warden tracks your permits — not you. This policy explains
          what data we collect, why we need it, and what we never do with it.
        </p>
      }
      updated="Last updated 24 November 2026"
    >
      <PageCard title="1. Data we collect">
        <p>
          <strong>Account data:</strong> your email address and password
          (stored hashed by our authentication provider), and the
          organization details you enter during onboarding, such as your
          company name.
        </p>
        <p>
          <strong>Data you enter:</strong> the permits, licenses,
          inspections, projects, documents, and subcontractor records you add
          to your dashboard. This is your business data; we store it so the
          product can remind you about it.
        </p>
        <p>
          <strong>Usage data:</strong> basic, aggregated information about how
          the service is used (for example, which pages are visited), used to
          fix bugs and improve the product. Analytics cookies are only loaded
          after you accept them in the cookie banner.
        </p>
        <p>
          <strong>OCR:</strong> permit and license photos you upload for
          form pre-filling are processed in your browser. The image is not
          uploaded to our servers for recognition.
        </p>
      </PageCard>
      <PageCard title="2. How we use your data">
        <p>
          We use your data to provide the service: to show your dashboard, to
          send the deadline reminders you asked for, to sync deadlines to
          Google Calendar when you connect it, and to respond to support
          requests. We do not sell your personal data or your permit data, and
          we do not share it with advertisers.
        </p>
      </PageCard>
      <PageCard title="3. Third-party services">
        <p>
          We use third-party providers to run the service: Supabase for
          authentication and database hosting, Resend for transactional email
          (deadline reminders), Google Calendar when you choose to connect it,
          and Google Analytics when you consent to analytics cookies. Each
          provider processes data under its own terms; we share only what that
          provider needs to perform its function.
        </p>
      </PageCard>
      <PageCard title="4. Data retention and deletion">
        <p>
          Your data is kept while your account is active. If you delete your
          account, or ask us to delete your data, we will delete your account
          data and the records tied to it. Backup copies may persist for a
          short period while backups rotate. Email us at{" "}
          <a href="mailto:support@permitwarden.com" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            support@permitwarden.com
          </a>{" "}
          to request deletion or a copy of your data.
        </p>
      </PageCard>
      <PageCard title="5. Security">
        <p>
          Access to your data is controlled by authentication and by
          organization-level access rules in the database, so one
          organization cannot see another&apos;s permits. No system is
          perfectly secure; if you believe your account has been compromised,
          change your password and contact us immediately.
        </p>
      </PageCard>
      <PageCard title="6. Changes to this policy">
        <p>
          If we change this policy, we will update the &ldquo;last
          updated&rdquo; date above. Material changes will be noted on the
          changelog page.
        </p>
      </PageCard>
    </PublicPage>
  );
}
