"use client";

import { useMemo, useState } from "react";
import {
  REGULATED_CITIES,
  PERMIT_TYPES,
  calculateTimeline,
} from "@/lib/features/timeline-calculator";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineTool() {
  const [cityKey, setCityKey] = useState("TX:Austin");
  const [permitType, setPermitType] = useState<string>("building");
  const [issueDate, setIssueDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });

  const result = useMemo(
    () => (issueDate ? calculateTimeline({ cityKey, permitType, issueDate }) : null),
    [cityKey, permitType, issueDate]
  );

  const noData =
    issueDate !== "" && (permitType !== "building" || !result);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </label>
          <select
            id="city"
            value={cityKey}
            onChange={(e) => setCityKey(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {REGULATED_CITIES.map((r) => (
              <option key={`${r.state_code}:${r.city}`} value={`${r.state_code}:${r.city}`}>
                {r.city}, {r.state_code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="permit-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Permit type
          </label>
          <select
            id="permit-type"
            value={permitType}
            onChange={(e) => setPermitType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {PERMIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="issue-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Issue date
          </label>
          <input
            id="issue-date"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {noData && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          No verified timeline data for this city and permit type yet. Our
          regulation data covers building permits in 20 US cities. Check the
          validity period with your local building department (AHJ) before
          relying on any date.
        </div>
      )}

      {result && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Predicted expiry</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {fmt(result.predictedExpiry)}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {result.regulation.validity_days
                ? `${result.regulation.validity_days} days from issue, per the city's published rules.`
                : "Validity period not verified for this city — check with your AHJ."}
            </p>
            {result.regulation.validity_notes && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{result.regulation.validity_notes}</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">First-inspection deadline</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {fmt(result.firstInspectionDeadline)}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {result.firstInspectionBasis ??
                "No commencement / first-inspection rule verified for this city — check with your AHJ."}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renewal window (estimate)</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {result.renewalWindow
                ? `${fmt(result.renewalWindow.opens)} – ${fmt(result.renewalWindow.closes)}`
                : "—"}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Estimated window opening 30 days before expiry. Your AHJ may
              open renewals earlier or later.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Apply by (smart buffer)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {result.applyBy ? fmt(result.applyBy.applyByDate) : "—"}
            </p>
            <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
              {result.applyBy && result.applyBy.processingDays !== null
                ? `${result.regulation.city} takes ~${result.applyBy.processingDays} days to process + 7-day buffer.`
                : "Processing time not verified for this city — only the 7-day buffer is applied."}
            </p>
          </div>
        </div>
      )}

      {result?.regulation.source_url && (
        <p className="mt-4 text-sm">
          <a
            href={result.regulation.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            Source: {result.regulation.jurisdiction_name} official guidance ↗
          </a>
        </p>
      )}

      <p className="mt-6 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Estimate only — verify with your AHJ.</strong> Dates are
        calculated from published city rules for building permits. Codes
        change, extensions and inspections can move your real deadline, and
        your permit document always wins. Confirm every date with your local
        building department before you rely on it.
      </p>
    </div>
  );
}
