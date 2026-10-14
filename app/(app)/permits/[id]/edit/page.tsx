"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Input, Alert } from "@/components/ui";
import Link from "next/link";

export default function EditPermitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch(`/api/permits?id=${id}`).then(r => r.json()),
    ]).then(([projData, permitData]) => {
      setProjects(Array.isArray(projData) ? projData : []);
      const p = Array.isArray(permitData) ? permitData[0] : permitData;
      if (p) {
        setForm({
          project_id: p.project_id || "",
          permit_type: p.permit_type || "",
          permit_number: p.permit_number || "",
          issuing_authority: p.issuing_authority || "",
          jurisdiction: p.jurisdiction || "",
          issue_date: p.issue_date || "",
          expiration_date: p.expiration_date || "",
          renewal_deadline: p.renewal_deadline || "",
          notes: p.notes || "",
          status: p.status || "pending",
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/permits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      router.push(`/permits/${id}`);
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

  if (loading) {
    return <AppShell><p className="text-gray-500">Loading...</p></AppShell>;
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href={`/permits/${id}`} className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Permit
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Edit Permit</h1>
      </div>
      <Card className="p-6 max-w-2xl">
        {error && <Alert type="error"><p>{error}</p></Alert>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              value={form.project_id}
              onChange={e => set("project_id", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">No project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permit Type *
              </label>
              <Input value={form.permit_type} onChange={e => set("permit_type", e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permit Number
              </label>
              <Input value={form.permit_number} onChange={e => set("permit_number", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issuing Authority
              </label>
              <Input value={form.issuing_authority} onChange={e => set("issuing_authority", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jurisdiction
              </label>
              <Input value={form.jurisdiction} onChange={e => set("jurisdiction", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={e => set("status", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="renewed">Renewed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Issue Date
              </label>
              <Input type="date" value={form.issue_date} onChange={e => set("issue_date", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiration Date
              </label>
              <Input type="date" value={form.expiration_date} onChange={e => set("expiration_date", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Renewal Deadline
              </label>
              <Input type="date" value={form.renewal_deadline} onChange={e => set("renewal_deadline", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
