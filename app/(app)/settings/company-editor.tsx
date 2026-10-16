"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Alert } from "@/components/ui";

const TRADE_OPTIONS = [
  { value: "general", label: "General Contractor" },
  { value: "roofing", label: "Roofing" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "solar", label: "Solar" },
  { value: "remodeling", label: "Remodeling" },
  { value: "other", label: "Other" },
];

const TRADE_LABELS = Object.fromEntries(TRADE_OPTIONS.map((t) => [t.value, t.label]));

export function CompanyEditor({
  org,
  role,
}: {
  org: { name: string; trade: string | null; state: string | null };
  role: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: org.name || "",
    trade: org.trade || "",
    state: org.state || "",
  });

  function startEdit() {
    setForm({
      name: org.name || "",
      trade: org.trade || "",
      state: org.state || "",
    });
    setError("");
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          trade: form.trade || null,
          state: form.state || null,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Save failed");
      }
      setEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company</h2>
          <Button variant="secondary" onClick={startEdit}>Edit</Button>
        </div>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">{org.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600 dark:text-gray-400">Trade</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">
              {TRADE_LABELS[org.trade as string] || org.trade || "Not set"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600 dark:text-gray-400">State</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white">{org.state || "Not set"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600 dark:text-gray-400">Your Role</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-white capitalize">{role}</dd>
          </div>
        </dl>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Company</h2>
      {error && <Alert type="error"><p>{error}</p></Alert>}
      <div className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name *
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your company name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trade
            </label>
            <select
              value={form.trade}
              onChange={(e) => setForm({ ...form, trade: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select trade</option>
              {TRADE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State (2-letter)
            </label>
            <Input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase().slice(0, 2) })}
              placeholder="TX"
              maxLength={2}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
