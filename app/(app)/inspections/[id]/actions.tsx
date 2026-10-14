"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input } from "@/components/ui";

export function InspectionActions({ inspection }: { inspection: any }) {
  const router = useRouter();
  const [showFail, setShowFail] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState(inspection.correction_notes || "");
  const [reinspectionDate, setReinspectionDate] = useState(inspection.reinspection_date || "");
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      const body: any = { id: inspection.id, status };
      if (status === "failed") {
        body.correction_notes = correctionNotes;
        body.reinspection_date = reinspectionDate || null;
      }
      const res = await fetch("/api/inspections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      router.refresh();
      setShowFail(false);
    } catch {
      alert("Failed to update inspection");
    } finally {
      setLoading(false);
    }
  }

  if (inspection.status === "passed" || inspection.status === "failed") {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Result</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This inspection was marked as <strong>{inspection.status}</strong>.
        </p>
        <Button
          className="mt-4"
          onClick={() => updateStatus("scheduled")}
          disabled={loading}
        >
          Reopen
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Mark Result</h2>
      {!showFail ? (
        <div className="flex gap-3">
          <Button onClick={() => updateStatus("passed")} disabled={loading}>
            ✓ Pass
          </Button>
          <Button
            onClick={() => setShowFail(true)}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            ✗ Fail
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Correction Notes *</label>
            <textarea
              value={correctionNotes}
              onChange={e => setCorrectionNotes(e.target.value)}
              rows={3}
              required
              placeholder="What needs to be fixed?"
              className="block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Re-inspection Date</label>
            <Input
              type="date"
              value={reinspectionDate}
              onChange={e => setReinspectionDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => updateStatus("failed")}
              disabled={loading || !correctionNotes}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Saving..." : "Confirm Fail"}
            </Button>
            <Button onClick={() => setShowFail(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
