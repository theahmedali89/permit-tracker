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
    if (inspection.status === "passed") {
      return (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Result</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This inspection was marked as <strong>passed</strong>.
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
    // Failed: correction checklist (edits the existing PATCH route).
    return <CorrectionChecklist inspection={inspection} />;
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

/** Sanitize a filename for storage: keep the extension, drop path/odd chars. */
function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "correction-photo";
  const clean = base.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 80);
  return clean || "correction-photo";
}

/**
 * Correction checklist for a failed inspection. Edits correction notes +
 * re-inspection date via the existing PATCH /api/inspections route, and
 * uploads a correction photo through the existing POST /api/documents
 * endpoint (sanitised filename). No new API routes.
 */
function CorrectionChecklist({ inspection }: { inspection: any }) {
  const router = useRouter();
  const [correctionNotes, setCorrectionNotes] = useState(inspection.correction_notes || "");
  const [reinspectionDate, setReinspectionDate] = useState(inspection.reinspection_date || "");
  const [photoUrl, setPhotoUrl] = useState(inspection.correction_photo_url || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/inspections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // status: "failed" keeps the re-inspection deadline logic in the
        // PATCH route running when a date is added/changed here.
        body: JSON.stringify({
          id: inspection.id,
          status: "failed",
          correction_notes: correctionNotes,
          reinspection_date: reinspectionDate || null,
          correction_photo_url: photoUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Correction details saved. Re-inspection reminder will be emailed.");
      router.refresh();
    } catch {
      setMessage("Failed to save correction details.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setMessage("Please choose a JPG or PNG photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("That photo is larger than 10 MB.");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const safe = new File([file], sanitizeFileName(file.name), { type: file.type });
      const form = new FormData();
      form.append("file", safe);
      if (inspection.permit_id) form.append("permit_id", inspection.permit_id);
      if (inspection.project_id) form.append("project_id", inspection.project_id);
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      // Store the storage path as the correction photo reference.
      setPhotoUrl(data.storage_path ?? "");
      setMessage("Photo uploaded — save the checklist to attach it to this inspection.");
    } catch (err: any) {
      setMessage(err?.message ?? "Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-1">Correction checklist</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This inspection failed. Fix the items below, then book the
        re-inspection. Re-inspection reminder will be emailed.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Correction notes</label>
          <textarea
            value={correctionNotes}
            onChange={(e) => setCorrectionNotes(e.target.value)}
            rows={3}
            placeholder="What needs to be fixed?"
            className="block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Re-inspection date</label>
          <Input
            type="date"
            value={reinspectionDate}
            onChange={(e) => setReinspectionDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correction photo</label>
          {photoUrl ? (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ✓ Photo attached <span className="text-gray-500">({photoUrl})</span>
            </p>
          ) : (
            <p className="text-sm text-gray-500">No correction photo yet.</p>
          )}
          <label className="mt-2 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer">
            {uploading ? "Uploading…" : "Upload correction photo"}
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={uploadPhoto}
              disabled={uploading}
            />
          </label>
        </div>
        {message && <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>}
        <div className="flex gap-3">
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? "Saving…" : "Save corrections"}
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await fetch("/api/inspections", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: inspection.id, status: "scheduled" }),
              });
              router.refresh();
            }}
            disabled={saving}
          >
            Reopen
          </Button>
        </div>
      </div>
    </Card>
  );
}
