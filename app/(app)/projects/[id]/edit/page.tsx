"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Input, Alert } from "@/components/ui";
import Link from "next/link";

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => {
        const p = Array.isArray(data) ? data.find((x: any) => x.id === id) : null;
        if (p) {
          setForm({
            name: p.name || "",
            customer: p.customer || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            zip: p.zip || "",
            project_type: p.project_type || "",
            start_date: p.start_date || "",
            expected_completion: p.expected_completion || "",
            notes: p.notes || "",
            status: p.status || "active",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      router.push(`/projects/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function set(field: string, value: string) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  if (loading) return <AppShell><p className="text-gray-500">Loading...</p></AppShell>;

  return (
    <AppShell>
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Project
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Project</h1>
      </div>
      <Card className="p-6 max-w-2xl">
        {error && <Alert type="error"><p>{error}</p></Alert>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <Input value={form.customer} onChange={e => set("customer", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <Input value={form.project_type} onChange={e => set("project_type", e.target.value)} placeholder="Commercial, Residential..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input value={form.city} onChange={e => set("city", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <Input value={form.state} onChange={e => set("state", e.target.value)} maxLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP</label>
              <Input value={form.zip} onChange={e => set("zip", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expected Completion</label>
              <Input type="date" value={form.expected_completion} onChange={e => set("expected_completion", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800">
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              className="block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800" />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
