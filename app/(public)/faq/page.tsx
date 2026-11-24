import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/faq";
const TITLE = "Frequently Asked Questions";
const DESCRIPTION =
  "Answers to common questions about Permit Warden: is it free, how reminders work, which jurisdictions are covered, how OCR works, and how it compares to a spreadsheet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden FAQ" }],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "Is Permit Warden really free?",
    "Yes — you can create an account and start tracking permits, licenses, and inspections free. No credit card required. Free accounts have plan limits (for example, a cap on the number of permits); see the pricing page for details.",
  ],
  [
    "How do the deadline reminders work?",
    "When you add a permit, license, or inspection with an expiry date, Permit Warden emails you 30, 14, 7, and 1 day before it expires — and keeps following up until the item is handled. You can also sync deadlines to Google Calendar.",
  ],
  [
    "Which jurisdictions are covered?",
    "Our directory links 186 official permit portals across all 50 states, and you can track deadlines from any city, county, or state in one place. Where we publish validity periods or renewal rules, we publish them only for jurisdictions we have verified — currently a 20-metro pilot — and we show the source and verification date.",
  ],
  [
    "How is this different from a spreadsheet?",
    "A spreadsheet can't email you. Permit Warden sends automatic reminders before deadlines, tracks COI expirations, and keeps every jurisdiction's deadlines on one dashboard. We even give away a free spreadsheet if that's all you need — see our honest comparison of Permit Warden vs. Excel.",
  ],
  [
    "Can my whole team use it?",
    "Yes — the dashboard is shared, so office staff, project managers, and field crews all see the same deadlines and statuses.",
  ],
  [
    "Do you handle subcontractor compliance?",
    "Yes — track each subcontractor's certificate of insurance with expiry dates, and get reminded before coverage lapses. Subcontractors can also upload documents through a magic-link portal without needing an account.",
  ],
  [
    "How does the photo / OCR feature work?",
    "Upload a photo of a permit or license and the form pre-fills itself. The recognition runs in your browser (Tesseract.js), so the image is never uploaded to our servers for recognition.",
  ],
  [
    "What is an AHJ?",
    "AHJ stands for Authority Having Jurisdiction — the building department, fire marshal, or other agency that issues your permits and inspections in a given area. Our AHJ directory links the official permit portal for each jurisdiction, and our blog explains how to find yours.",
  ],
  [
    "Do you file permits for me?",
    "No. Permit Warden tracks deadlines and reminds you; it does not file applications, pay fees, or act as your agent with any building department. Always confirm requirements with the AHJ itself.",
  ],
  [
    "How do I report a wrong portal link or a changed rule?",
    "Email support@permitwarden.com or use the contact form. Tell us the city and what changed, with a link to the official source if you have one, and we will verify and update it.",
  ],
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <PublicPage
        eyebrow="Frequently asked questions"
        title="FAQ"
        intro={
          <p>
            The short answers to the questions contractors ask us most. Still
            stuck? Email{" "}
            <a href="mailto:support@permitwarden.com" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              support@permitwarden.com
            </a>
            .
          </p>
        }
      >
        <div className="mt-10 space-y-4">
          {FAQS.map(([q, a]) => (
            <div
              key={q}
              className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
            >
              <h2 className="font-semibold text-gray-900 dark:text-white">{q}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {a}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-gray-600 dark:text-gray-300">
          More detail:{" "}
          <Link href="/features" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">features</Link>
          {" · "}
          <Link href="/glossary" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">permit glossary</Link>
          {" · "}
          <Link href="/blog" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">blog guides</Link>
        </p>
      </PublicPage>
    </>
  );
}
