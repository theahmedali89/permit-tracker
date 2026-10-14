"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Input, Alert } from "@/components/ui";
import Link from "next/link";

export default function NewSubcontractorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("/api/subcontractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      router.push("/subcontractors");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/subcontractors" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Subcontractors
        </Link>
        <h1 className="text-2xl font-bold mt-2">Add Subcontractor</h1>
      </div>
      <Card className="p-6 max-w-2xl">
        {error && <Alert type="error"><p>{error}</p></Alert>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input name="name" required placeholder="ABC Electrical" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Trade</label>
              <Input name="trade" placeholder="Electrical, Plumbing..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input name="email" type="email" placeholder="contact@abc.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input name="phone" placeholder="(555) 123-4567" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">License Number</label>
              <Input name="license_number" placeholder="CSLB #123456" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">License Expiration</label>
              <Input name="license_expiration" type="date" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">COI (Insurance) Expiration</label>
            <Input name="coi_expiration" type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" rows={3}
              className="block w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Subcontractor"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
