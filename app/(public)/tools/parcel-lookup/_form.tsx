"use client";

import { useState } from "react";

interface LookupResult {
  county: string;
  state: string;
  matchedAddress: { city: string; zip: string };
  assessor: { office: string; url: string; curated: boolean };
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export function ParcelLookupForm() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams({ street, zip });
      if (city) params.set("city", city);
      if (state) params.set("state", state);
      const res = await fetch(`/api/tools/parcel-lookup?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data as LookupResult);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/15 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500";

  return (
    <div className="mt-8 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/70 sm:p-8">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="pw-street" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Street address *
          </label>
          <input
            id="pw-street"
            required
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="123 Main St"
            className={inputCls}
            autoComplete="street-address"
          />
        </div>
        <div>
          <label htmlFor="pw-city" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            City
          </label>
          <input
            id="pw-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Austin"
            className={inputCls}
            autoComplete="address-level2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="pw-state" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              State
            </label>
            <select id="pw-state" value={state} onChange={(e) => setState(e.target.value)} className={inputCls}>
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pw-zip" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              ZIP *
            </label>
            <input
              id="pw-zip"
              required
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="78701"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              title="Enter a 5-digit ZIP code"
              className={inputCls}
              autoComplete="postal-code"
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Looking up…" : "Find my county assessor"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50/70 p-5 dark:border-teal-900/50 dark:bg-teal-950/30">
          <p className="text-sm font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">
            Property located
          </p>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {result.county}, {result.state}
          </p>
          <div className="mt-4 rounded-lg bg-white/80 p-4 dark:bg-gray-900/60">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Open the official parcel search at the
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">{result.assessor.office}</p>
            {!result.assessor.curated && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                We don&apos;t have a direct link for this county yet — this opens a Google search for its official assessor page.
              </p>
            )}
            <a
              href={result.assessor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              Open {result.assessor.curated ? "assessor parcel search" : "assessor search"} →
            </a>
          </div>
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
            <li>Enter the property address on the assessor site.</li>
            <li>Find the <strong>APN / Parcel ID</strong> in the property record.</li>
            <li>Copy it onto your permit application.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
