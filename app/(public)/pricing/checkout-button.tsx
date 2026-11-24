"use client";

import { useState } from "react";

/**
 * Paid-tier CTA: POSTs to /api/billing/checkout and redirects to the
 * Stripe Checkout URL it returns. When Stripe is not configured the
 * route returns 501 and we show a plain "Billing is not configured
 * yet" message — never a fake checkout, never a silent failure.
 * Unauthenticated users get a sign-in prompt (401 from the route).
 */
export function CheckoutButton({
  plan,
  cta,
}: {
  plan: "starter" | "professional" | "business";
  cta: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 501) {
        setError("Billing is not configured yet — checkout will be available once Stripe is set up. You can still start on the free plan.");
        return;
      }
      if (res.status === 401) {
        setError("Please sign in first, then choose your plan.");
        return;
      }
      if (!res.ok || !data?.url) {
        setError(data?.error || "Checkout could not be started. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout could not be started. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={busy}
        className="mt-6 block w-full rounded-md bg-sky-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
      >
        {busy ? "Starting checkout…" : cta}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </p>
      )}
    </div>
  );
}
