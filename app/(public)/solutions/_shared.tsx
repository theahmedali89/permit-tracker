import type { Metadata } from "next";
import Link from "next/link";
import FineStats from "../_components/FineStats";

export interface SolutionContent {
  slug: string;
  trade: string;
  title: string;
  description: string;
  ogAlt: string;
  intro: string;
  painPoints: [string, string][];
  features: [string, string][];
  faqs: [string, string][];
}

export function solutionMetadata(content: SolutionContent): Metadata {
  const url = `https://permitwarden.com/solutions/${content.slug}`;
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: url },
    openGraph: {
      title: content.title,
      description: content.description,
      url,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: content.ogAlt,
        },
      ],
    },
  };
}

export function solutionJsonLd(content: SolutionContent) {
  const url = `https://permitwarden.com/solutions/${content.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.description,
    url,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: content.faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  };
}

function CheckIcon() {
  return (
    <svg className="mt-1 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export function SolutionPage({ content }: { content: SolutionContent }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(solutionJsonLd(content)) }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link href="/" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            &larr; Back to Permit Warden
          </Link>

          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Solutions for {content.trade}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Permit &amp; license tracking for {content.trade} contractors
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{content.intro}</p>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            The deadline headaches {content.trade.toLowerCase()} crews deal with
          </h2>
          <div className="mt-6 space-y-5">
            {content.painPoints.map(([title, body]) => (
              <div key={title} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </div>

          <FineStats />

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            How Permit Warden helps
          </h2>          <div className="mt-6 space-y-5">
            {content.features.map(([title, body]) => (
              <div key={title} className="flex gap-3">
                <CheckIcon />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-4">
            {content.faqs.map(([question, answer]) => (
              <div key={question} className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">{question}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-800 dark:bg-blue-900/20">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Stop losing track of {content.trade.toLowerCase()} deadlines
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Set up your permits, licenses, and inspections in minutes — then let the reminders do
              the watching.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700"
            >
              Start tracking free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
