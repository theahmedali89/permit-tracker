"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface LinkedSub {
  id: string;
  name: string;
  trade: string | null;
}

/**
 * "Subcontractors on this project" — link/unlink controls for the
 * Project Gate. The gate only evaluates LINKED subs, so the empty state
 * is explicit: "No subcontractors linked yet — link one to enable the
 * stop-work check" (an empty gate must not look like a safe project).
 */
export function SubcontractorLinks({
  projectId,
  linked,
  all,
}: {
  projectId: string;
  linked: LinkedSub[];
  all: LinkedSub[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const linkedIds = new Set(linked.map((s) => s.id));
  const unlinked = all.filter((s) => !linkedIds.has(s.id));

  async function call(method: "POST" | "DELETE", subcontractorId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/subcontractors`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subcontractor_id: subcontractorId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setSelected("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {linked.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No subcontractors linked yet — link one to enable the stop-work
          check. Until a subcontractor is linked, the gate cannot warn
          about expired licenses or COIs on this project.
        </p>
      ) : (
        <ul className="space-y-2">
          {linked.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {s.name}
                {s.trade ? ` (${s.trade})` : ""}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => call("DELETE", s.id)}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Unlink
              </button>
            </li>
          ))}
        </ul>
      )}
      {unlinked.length > 0 && (
        <div className="mt-4 flex gap-2">
          <select
            value={selected}
            disabled={busy}
            onChange={(e) => setSelected(e.target.value)}
            aria-label="Subcontractor to link"
            className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Link a subcontractor…</option>
            {unlinked.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.trade ? ` (${s.trade})` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy || !selected}
            onClick={() => selected && call("POST", selected)}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Link
          </button>
        </div>
      )}
      {all.length === 0 && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          No subcontractors in this organization yet — add one from the
          Subcontractors page first.
        </p>
      )}
    </div>
  );
}
