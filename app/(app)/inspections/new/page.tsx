"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Input, Alert } from "@/components/ui";

export default function NewInspectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [permits, setPermits] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/projects").then(r => r.json()).then(setProjects);
    fetch("/api/permits").then(r => r.json()).then(setPermits);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      router.push("/inspections");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Schedule Inspection</h1>
      <Card className="p-6 max-w-2xl">
        {error && <Alert type="error"><p>{error}</p></Alert>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inspection Type *
            </label>
            <Input name="inspection_type" required placeholder="Framing, Electrical, Plumbing, Final..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project
              </label>
              <select name="project_id" className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">Select...</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Permit
              </label>
              <select name="permit_id" className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">Select...</option>
                {permits.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.permit_type} {p.permit_number || ""}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requested Date
              </label>
              <Input name="requested_date" type="date" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Scheduled Date
              </label>
              <Input name="scheduled_date" type="date" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Inspector Name
            </label>
            <Input name="inspector_name" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea name="notes" rows={3} className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Schedule Inspection"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
