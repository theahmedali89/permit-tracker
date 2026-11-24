"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const CONSENT_KEY = "pw-cookie-consent";
// TODO: move the GA measurement ID fully into NEXT_PUBLIC_GA_ID and remove
// this fallback. It is the ID already hardcoded in app/layout.tsx before
// consent was added, kept so analytics does not silently break in
// deployments that have not set the env var yet.
const FALLBACK_GA_ID = "G-B6NM5BZYKJ";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || FALLBACK_GA_ID;

type Consent = "accepted" | "declined" | null;

/**
 * Cookie consent banner. Consent is stored in localStorage; Google Analytics
 * scripts are rendered ONLY after the visitor accepts. Declining loads no
 * analytics at all. The banner is shown only while no choice is stored.
 */
export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      setConsent(stored === "accepted" || stored === "declined" ? stored : null);
    } catch {
      setConsent(null);
    }
    setLoaded(true);
  }, []);

  function choose(value: "accepted" | "declined") {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // localStorage unavailable (private mode) — consent lasts this session.
    }
    setConsent(value);
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      {loaded && consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-gray-900 sm:left-auto sm:right-6 sm:bottom-6"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            We use cookies for analytics
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            We only load Google Analytics if you accept. No analytics cookies
            are set before then. See our{" "}
            <a href="/privacy" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Privacy Policy
            </a>
            .
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Accept analytics
            </button>
            <button
              type="button"
              onClick={() => choose("declined")}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/10"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}
