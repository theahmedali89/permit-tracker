"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert } from "@/components/ui";

const dateVal = (d: string | null) => (d ? d.slice(0, 10) : "");

export function SubcontractorEditButton({ sub }: { sub: any }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});

  function startEdit() {
    setForm({
      name: sub.name || "",
      trade: sub.trade || "",
      email: sub.email || "",
      phone: sub.phone || "",
      license_number: sub.license_number || "",
      license_expiration: dateVal(sub.license_expiration),
      coi_expiration: dateVal(sub.coi_expiration),
      notes: sub.notes || "",
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
      const res = await fetch("/api/subcontractors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, ...form }),
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
              Edit Subcontractor
            </h2>
            {error && <Alert type="error"><p>{error}</p></Alert>}
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <Input value={form.name} onChange={set("name")} placeholder="ABC Electrical" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trade
                  </label>
                  <Input value={form.trade} onChange={set("trade")} placeholder="Electrical, Plumbing..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input type="email" value={form.email} onChange={set("email")} placeholder="contact@abc.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <Input value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Number
                  </label>
                  <Input value={form.license_number} onChange={set("license_number")} placeholder="CSLB #123456" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Expiration
                  </label>
                  <Input type="date" value={form.license_expiration} onChange={set("license_expiration")} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  COI (Insurance) Expiration
                </label>
                <Input type="date" value={form.coi_expiration} onChange={set("coi_expiration")} />
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
                <Button onClick={save} disabled={saving || !form.name.trim()}>
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
