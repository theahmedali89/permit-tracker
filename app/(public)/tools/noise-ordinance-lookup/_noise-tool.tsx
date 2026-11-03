"use client";

import { useState } from "react";
import { CITIES, VERIFIED_DATE, type CityRecord } from "../_data/noise-shed";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-white/10 dark:bg-gray-900/60">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      {value ? (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-900 dark:text-white">{value}</p>
      ) : (
        <p className="mt-1.5 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
          not verified yet
        </p>
      )}
    </div>
  );
}

function ResultCard({ city }: { city: CityRecord }) {
  const n = city.noise;
  return (
    <div className="mt-6 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {city.city}, {city.stateCode} noise rules
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Weekday construction hours" value={n.weekdayHours} />
        <Field label="Weekend / holiday hours" value={n.weekendHours} />
      </div>
      <div className="mt-3">
        <Field label="Residential dB limits" value={n.dbLimits} />
      </div>
      {n.note && (
        <p className="mt-3 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
          {n.note}
        </p>
      )}
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Source:{" "}
        <a
          href={n.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-sky-600 underline hover:text-sky-700 dark:text-sky-400"
        >
          {n.sourceLabel}
        </a>{" "}
        - verified {VERIFIED_DATE}. Rules change; always confirm with the city before
        scheduling work.
      </p>
    </div>
  );
}

export function NoiseOrdinanceTool() {
  const [slug, setSlug] = useState("");
  const city = CITIES.find((c) => c.slug === slug);

  const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/15 dark:bg-gray-900 dark:text-white";

  return (
    <div className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Pick a city
        </span>
        <select
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            Choose a city…
          </option>
          {CITIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.city}, {c.stateCode}
            </option>
          ))}
        </select>
      </label>
      {!city && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          20 major cities are covered so far - more are being added as they are
          verified.
        </p>
      )}
      {city && <ResultCard city={city} />}
    </div>
  );
}
