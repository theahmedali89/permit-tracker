"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LICENSE_BOARDS } from "@/lib/license-boards";
import { stateSlug } from "../../ahj/_lib";

const TRADES = [
  "General contracting",
  "Electrical",
  "Plumbing",
  "HVAC / mechanical",
  "Roofing",
  "Other specialty trade",
];

export function LicenseStatePicker() {
  const router = useRouter();
  const [state, setState] = useState("");
  const [trade, setTrade] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state) return;
    router.push(`/tools/license-lookup/${stateSlug(state)}`);
  }

  const inputCls =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-white/15 dark:bg-gray-900 dark:text-white";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/80"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            State where the work happens
          </span>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={inputCls}
            required
          >
            <option value="" disabled>
              Choose a state…
            </option>
            {LICENSE_BOARDS.map((b) => (
              <option key={b.code} value={b.code}>
                {b.state}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Trade (optional)
          </span>
          <select
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            className={inputCls}
          >
            <option value="">Any trade</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={!state}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-3 text-base font-semibold text-white shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Find the official license lookup →
      </button>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        We&apos;ll take you to your state&apos;s page with the official licensing board&apos;s
        search{trade ? ` and notes for ${trade.toLowerCase()} work` : ""}. License records
        live only with the board — we never store or resell them.
      </p>
    </form>
  );
}
