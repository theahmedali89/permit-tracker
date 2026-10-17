"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Delete button with confirmation. Used for permits and subcontractors.
 * Calls DELETE /api/<endpoint>?id=<id>, then redirects to the list page.
 */
export default function DeleteButton({
  endpoint,
  id,
  label,
  redirectTo,
}: {
  endpoint: string;
  id: string;
  label: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/${endpoint}?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push(redirectTo);
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
      alert("Delete failed. Please try again.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        confirming
          ? "text-white bg-red-600 hover:bg-red-700"
          : "text-red-600 border border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
      } disabled:opacity-50`}
    >
      {deleting ? "Deleting…" : confirming ? `Confirm delete ${label}?` : `Delete ${label}`}
    </button>
  );
}
