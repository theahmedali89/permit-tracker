"use client";

import { useState } from "react";
import { CITIES, VERIFIED_DATE, type CityRecord } from "../_data/noise-shed";

type Structure = "shed" | "fence" | "pergola";
type Verdict = "permit" | "no-permit" | "check";

interface Answer {
  verdict: Verdict;
  headline: string;
  detail: string;
  caution: string | null;
  sourceUrl: string;
  sourceLabel: string;
}

function shedAnswer(city: CityRecord, sqft: number): Answer {
  const s = city.shed;
  if (s.alwaysPermit) {
    return {
      verdict: "permit",
      headline: "Yes - a permit is required.",
      detail: s.detail,
      caution: s.caution,
      sourceUrl: s.sourceUrl,
      sourceLabel: s.sourceLabel,
    };
  }
  if (s.exemptUpToSqft === null) {
    return {
      verdict: "check",
      headline: "This city has no simple size cutoff.",
      detail: s.detail,
      caution: s.caution,
      sourceUrl: s.sourceUrl,
      sourceLabel: s.sourceLabel,
    };
  }
  const exempt = s.strictLessThan ? sqft < s.exemptUpToSqft : sqft <= s.exemptUpToSqft;
  return exempt
    ? {
        verdict: "no-permit",
        headline: "No building permit needed for this size.",
        detail: `${sqft} sq ft is within the ${s.exemptUpToSqft} sq ft exemption. ${s.detail}`,
        caution: s.caution,
        sourceUrl: s.sourceUrl,
        sourceLabel: s.sourceLabel,
      }
    : {
        verdict: "permit",
        headline: "Yes - a permit is required.",
        detail: `${sqft} sq ft is over the ${s.exemptUpToSqft} sq ft exemption. ${s.detail}`,
        caution: s.caution,
        sourceUrl: s.sourceUrl,
        sourceLabel: s.sourceLabel,
      };
}

function fenceAnswer(city: CityRecord, height: number): Answer {
  const f = city.fence;
  if (f.alwaysPermit) {
    return {
      verdict: "permit",
      headline: "Yes - a permit is required.",
      detail: f.detail,
      caution: null,
      sourceUrl: f.sourceUrl,
      sourceLabel: f.sourceLabel,
    };
  }
  const max = f.maxHeightFtNoPermit ?? 0;
  return height <= max
    ? {
        verdict: "no-permit",
        headline: "No permit needed for this height.",
        detail: `${height} ft is within the ${max} ft no-permit height. ${f.detail}`,
        caution: null,
        sourceUrl: f.sourceUrl,
        sourceLabel: f.sourceLabel,
      }
    : {
        verdict: "permit",
        headline: "Yes - a permit is required.",
        detail: `${height} ft is over the ${max} ft no-permit height. ${f.detail}`,
        caution: null,
        sourceUrl: f.sourceUrl,
        sourceLabel: f.sourceLabel,
      };
}

function pergolaAnswer(city: CityRecord): Answer {
  if (city.pergolaRule) {
    return {
      verdict: "no-permit",
      headline: "Pergola rule is published for this city.",
      detail: city.pergolaRule,
      caution: null,
      sourceUrl: city.shed.sourceUrl,
      sourceLabel: city.shed.sourceLabel,
    };
  }
  return {
    verdict: "check",
    headline: "Pergola data is not verified yet for this city.",
    detail:
      "No official pergola-specific permit threshold is published for this city. Most cities treat pergolas like accessory structures, so confirm with the local building office before building.",
    caution: null,
    sourceUrl: city.shed.sourceUrl,
    sourceLabel: city.shed.sourceLabel,
  };
}

const VERDICT_STYLE: Record<Verdict, string> = {
  permit:
    "border-red-200 bg-red-50 dark:border-red-800/60 dark:bg-red-950/40",
  "no-permit":
    "border-green-200 bg-green-50 dark:border-green-800/60 dark:bg-green-950/40",
  check:
    "border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/40",
};

const VERDICT_TITLE: Record<Verdict, string> = {
  permit: "text-red-800 dark:text-red-300",
  "no-permit": "text-green-800 dark:text-green-300",
  check: "text-amber-800 dark:text-amber-300",
};

export function ShedPermitTool() {
  const [slug, setSlug] = useState("");
  const [structure, setStructure] = useState<Structure>("shed");
  const [size, setSize] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [error, setError] = useState("");

  const city = CITIES.find((c) => c.slug === slug);
  const sizeLabel = structure === "fence" ? "Planned fence height (ft)" : "Shed size (sq ft)";

  function onCheck() {
    setError("");
    if (!city) {
      setError("Pick a city first.");
      return;
    }
    if (structure === "pergola") {
      setAnswer(pergolaAnswer(city));
      return;
    }
    const n = Number(size);
    if (!size || Number.isNaN(n) || n <= 0) {
      setError(`Enter a valid ${structure === "fence" ? "height" : "size"} greater than 0.`);
      return;
    }
    setAnswer(structure === "shed" ? shedAnswer(city, n) : fenceAnswer(city, n));
  }

  const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/15 dark:bg-gray-900 dark:text-white";

  return (
    <div className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            City
          </span>
          <select
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAnswer(null);
            }}
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
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Structure
          </span>
          <div className="flex gap-2">
            {(["shed", "fence", "pergola"] as Structure[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStructure(s);
                  setAnswer(null);
                }}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium capitalize transition ${
                  structure === s
                    ? "border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 dark:border-white/15 dark:bg-gray-900 dark:text-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {structure !== "pergola" && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {sizeLabel}
          </span>
          <input
            type="number"
            min="0"
            step="any"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder={structure === "fence" ? "e.g. 6" : "e.g. 120"}
            className={inputCls}
          />
        </label>
      )}

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={onCheck}
        disabled={!city}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-base font-semibold text-white shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Check my project →
      </button>

      {answer && (
        <div className={`mt-6 rounded-2xl border p-6 ${VERDICT_STYLE[answer.verdict]}`}>
          <p className={`text-lg font-bold ${VERDICT_TITLE[answer.verdict]}`}>
            {answer.headline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
            {answer.detail}
          </p>
          {answer.caution && (
            <p className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-sm text-gray-700 dark:bg-black/20 dark:text-gray-200">
              <strong>Heads up:</strong> {answer.caution}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Source:{" "}
            <a
              href={answer.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-600 underline hover:text-sky-700 dark:text-sky-400"
            >
              {answer.sourceLabel}
            </a>{" "}
            - verified {VERIFIED_DATE}. Rules change; always confirm with the city before
            building.
          </p>
        </div>
      )}
    </div>
  );
}
