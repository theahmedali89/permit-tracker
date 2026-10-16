"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert } from "@/components/ui";

const dateVal = (d: string | null) => (d ? d.slice(0, 10) : "");

export function LicenseEditButton({ license }: { license: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  function startEdit() {
    setForm({
      license_name: license.license_name || "",
      license_number: license.license_number || "",
      issuing_authority: license.issuing_authority || "",
      state: license.state || "",
      issue_date: dateVal(license.issue_date),
      expiration_date: dateVal(license.expiration_date),
      renewal_date: dateVal(license.renewal_date),
      notes: license.notes || "",
    });
    setError("");
    setOpen(true);
  }

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [f]: e.target.value });

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: license.id, ...form }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Save failed");
      }
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={startEdit}>Edit</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit License
            </h2>
            {error && <Alert type="error"><p>{error}</p></Alert>}
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Name *
                </label>
                <Input value={form.license_name} onChange={set("license_name")} placeholder="General Contractor License" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Number
                  </label>
                  <Input value={form.license_number} onChange={set("license_number")} placeholder="GC-123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Issuing Authority
                  </label>
                  <Input value={form.issuing_authority} onChange={set("issuing_authority")} placeholder="Texas Dept. of Licensing" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <Input value={form.state} onChange={set("state")} placeholder="TX" maxLength={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Issue Date
                  </label>
                  <Input type="date" value={form.issue_date} onChange={set("issue_date")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expiration Date
                  </label>
                  <Input type="date" value={form.expiration_date} onChange={set("expiration_date")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Renewal Date
                  </label>
                  <Input type="date" value={form.renewal_date} onChange={set("renewal_date")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={save} disabled={saving || !form.license_name.trim()}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
