import type { Metadata } from "next";
import Link from "next/link";
import { getPlanLimits } from "@/lib/shared/plans";
import { CheckoutButton } from "./checkout-button";

const PAGE_URL = "https://permitwarden.com/pricing";
const TITLE = "Permit Warden Pricing — $49, $99 or $199 a Month";
const DESCRIPTION =
  "Simple permit tracking pricing: Starter $49/mo, Professional $99/mo, Business $199/mo. Every paid plan starts with a 14-day free trial. No setup fees, cancel anytime.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden pricing" }],
  },
};

const TIERS = [
  {
    plan: "starter",
    name: "Starter",
    price: 49,
    blurb: "For a solo contractor getting organized.",
    cta: "Start 14-day free trial",
    featured: false,
  },
  {
    plan: "professional",
    name: "Professional",
    price: 99,
    blurb: "For growing crews that need SMS alerts and AI extraction.",
    cta: "Start 14-day free trial",
    featured: true,
  },
  {
    plan: "business",
    name: "Business",
    price: 199,
    blurb: "For companies that need unlimited everything plus API access.",
    cta: "Start 14-day free trial",
    featured: false,
  },
] as const;

function fmtLimit(n: number): string {
  return n === -1 ? "Unlimited" : String(n);
}

const FAQS: Array<[string, string]> = [
  [
    "Is there a free plan?",
    "Yes. The free plan tracks up to 10 permits, 5 licenses, 5 projects and 25 documents for one team member, with CSV import and export. Upgrade when you outgrow it.",
  ],
  [
    "How does the 14-day trial work?",
    "Every paid plan starts with a 14-day free trial. You are not charged until the trial ends, and you can cancel anytime before then.",
  ],
  [
    "What happens if I hit my plan limit?",
    "You will see an upgrade prompt when you try to add beyond your limit — nothing is deleted and nothing is silently lost. Upgrade to keep adding.",
  ],
  [
    "Can I cancel anytime?",
    "Yes. Cancel from your billing settings; your plan stays active until the end of the paid period, then drops back to the free plan.",
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

const OFFER_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Permit Warden",
  description: "Permit and license deadline tracking software for contractors.",
  brand: { "@type": "Brand", name: "Permit Warden" },
  offers: TIERS.map((t) => ({
    "@type": "Offer",
    name: `${t.name} plan`,
    price: t.price,
    priceCurrency: "USD",
    url: PAGE_URL,
    availability: "https://schema.org/InStock",
  })),
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(OFFER_JSON_LD) }}
      />
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
        Simple pricing that pays for itself
      </h1>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 text-center">
        One missed deadline can cost $500 a day in fines. Every paid plan
        starts with a <strong>14-day free trial</strong> — no credit card
        required to start, cancel anytime.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const limits = getPlanLimits(tier.plan);
          return (
            <div
              key={tier.plan}
              className={`rounded-xl border p-6 ${
                tier.featured
                  ? "border-sky-500 bg-sky-50/50 dark:bg-sky-900/10 shadow-lg"
                  : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {tier.featured && (
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Most popular
                </p>
              )}
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{tier.name}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tier.blurb}</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${tier.price}</span>
                <span className="text-gray-500 dark:text-gray-400"> / month</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>{fmtLimit(limits.maxPermits)} permits</li>
                <li>{fmtLimit(limits.maxLicenses)} licenses</li>
                <li>{fmtLimit(limits.maxProjects)} projects</li>
                <li>{fmtLimit(limits.maxDocuments)} documents</li>
                <li>{fmtLimit(limits.maxTeamMembers)} team members</li>
                <li>{limits.smsReminders ? "SMS reminders included" : "Email reminders"}</li>
                <li>{limits.aiExtraction ? "AI document extraction included" : "Manual entry + OCR"}</li>
                <li>{limits.apiAccess ? "API access included" : "No API access"}</li>
              </ul>
              <CheckoutButton plan={tier.plan} cta={tier.cta} />
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Free plan</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {(() => {
            const f = getPlanLimits("free");
            return `${fmtLimit(f.maxPermits)} permits · ${fmtLimit(f.maxLicenses)} licenses · ${fmtLimit(f.maxProjects)} projects · ${fmtLimit(f.maxDocuments)} documents · ${fmtLimit(f.maxTeamMembers)} team member — free forever, with CSV import and export.`;
          })()}
        </p>
        <Link href="/signup" className="mt-3 inline-block font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
          Start free →
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-6">
          {FAQS.map(([q, a]) => (
            <div key={q}>
              <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
