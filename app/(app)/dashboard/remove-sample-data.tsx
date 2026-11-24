"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveSampleDataButton() {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!window.confirm("Remove the sample project and sample permits (SAMPLE-001, SAMPLE-002, SAMPLE-003)? Your real data is not affected.")) {
      return;
    }
    setRemoving(true);
    try {
      const res = await fetch("/api/organization/sample-data", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove sample data");
      router.refresh();
    } catch {
      alert("Failed to remove sample data. Please try again.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={removing}
      className="text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 underline"
    >
      {removing ? "Removing…" : "Remove sample data"}
    </button>
  );
}
