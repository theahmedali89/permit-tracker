"use client";

import { useMemo, useState } from "react";
import {
  FINE_SCHEDULES,
  calculateDelayCost,
  formatUsd,
} from "@/lib/features/fee-calculator";

export function FeeTool() {
  const [city, setCity] = useState("Chicago");
  const [weeksLate, setWeeksLate] = useState(2);
  const [permitFee, setPermitFee] = useState("");

  const result = useMemo(
    () =>
      calculateDelayCost({
        city,
        weeksLate,
        permitFeeUsd: permitFee === "" ? null : Number(permitFee),
      }),
    [city, weeksLate, permitFee]
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City (verified fine schedules only)
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {FINE_SCHEDULES.map((f) => (
              <option key={f.city} value={f.city}>
                {f.city} — {f.figure}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="weeks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weeks late
          </label>
          <input
            id="weeks"
            type="number"
            min={0}
            max={52}
            value={weeksLate}
            onChange={(e) => setWeeksLate(Math.max(0, Number(e.target.value) || 0))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your permit fee, $ (estimate)
          </label>
          <input
            id="fee"
            type="number"
            min={0}
            value={permitFee}
            onChange={(e) => setPermitFee(e.target.value)}
            placeholder="e.g. 450"
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {result && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Weekly cost of delay</p>
            <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
              {result.weeklyLowUsd === null
                ? "Not a daily fine"
                : result.weeklyLowUsd === result.weeklyHighUsd
                  ? `${formatUsd(result.weeklyLowUsd)}/week`
                  : `${formatUsd(result.weeklyLowUsd)} – ${formatUsd(result.weeklyHighUsd)}/week`}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {result.figure} {result.label}. Source: {result.source}.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Over {result.weeksLate} {result.weeksLate === 1 ? "week" : "weeks"} late:{" "}
              <strong>
                {result.totalLowUsd === null
                  ? "unknown (per-violation fine, not daily)"
                  : result.totalLowUsd === result.totalHighUsd
                    ? formatUsd(result.totalLowUsd)
                    : `${formatUsd(result.totalLowUsd)} – ${formatUsd(result.totalHighUsd)}`}
              </strong>
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fees (estimate — check your AHJ fee schedule)</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Permit fee (your figure)</dt>
                <dd className="font-medium">{formatUsd(result.permitFeeUsd)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Extension fee (verified)</dt>
                <dd className="font-medium">
                  {result.extensionFeeUsd !== null
                    ? formatUsd(result.extensionFeeUsd)
                    : "not published for this city"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-1">
                <dt className="font-medium">Total exposure (low end)</dt>
                <dd className="font-bold">{formatUsd(result.totalExposureLowUsd)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Total exposure = permit fee + extension fee + delay fines (low
              end). Re-application fees and crew downtime are not included —
              they vary by job.
            </p>
          </div>
        </div>
      )}

      {result && (
        <p className="mt-4 text-sm">
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            Source: {result.source} ↗
          </a>
        </p>
      )}

      <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Estimate only.</strong> Fine schedules are real, published
        municipal figures for the four cities listed — but fines depend on
        violation class, repeat offenses and inspector discretion. Permit and
        extension fees vary by project and are labelled estimates here:
        always check your AHJ fee schedule before budgeting.
      </p>
    </div>
  );
}
