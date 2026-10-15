"use client";

import { useState } from "react";
import { Button, Input, Alert } from "@/components/ui";

export function PortalUploadForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [count, setCount] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/portal/sub/${token}`, {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCount((c) => c + 1);
      setSuccess("Document uploaded successfully. You can upload more documents below if needed.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error"><p>{error}</p></Alert>}
      {success && <Alert type="success"><p>{success}</p></Alert>}
      <div>
        <label className="block text-sm font-medium mb-1">Document type *</label>
        <select name="doc_type" required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm">
          <option value="license">License</option>
          <option value="coi">COI (Certificate of Insurance)</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Expiration date</label>
        <Input name="expiration_date" type="date" />
        <p className="text-xs text-gray-500 mt-1">If this document has an expiration date, enter it so we can remind you before it lapses.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">File * (PDF/JPG/PNG, max 10MB)</label>
        <Input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <Input name="notes" placeholder="Policy number, issuing state..." />
      </div>
      <Button type="submit" disabled={loading} variant={count > 0 ? "secondary" : "primary"}>
        {loading ? "Uploading..." : count > 0 ? "Upload another document" : "Upload document"}
      </Button>
    </form>
  );
}
