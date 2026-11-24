import type { Metadata } from "next";
import { PublicPage, PageCard } from "../_components/PublicPage";
import { ContactForm } from "./_contact-form";

const PAGE_URL = "https://permitwarden.com/contact";
const TITLE = "Contact Permit Warden";
const DESCRIPTION =
  "Contact Permit Warden: report a wrong portal link or permit rule, get account help, or suggest a feature. Email support@permitwarden.com or use the contact form.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Contact Permit Warden" }],
  },
};

export default function ContactPage() {
  return (
    <PublicPage
      eyebrow="Contact"
      title="Contact us"
      intro={
        <p>
          Questions, a wrong portal link, or a permit rule that changed? Send
          us a message — or email us directly at{" "}
          <a href="mailto:support@permitwarden.com" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            support@permitwarden.com
          </a>
          .
        </p>
      }
    >
      <PageCard title="Send a message">
        <ContactForm />
        <p>
          We read every message. If you are reporting a portal link or a rule
          change, include the city and a link to the official source if you
          have one — we verify corrections against the official source before
          publishing them.
        </p>
      </PageCard>
    </PublicPage>
  );
}
