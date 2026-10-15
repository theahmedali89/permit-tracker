"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Alert } from "@/components/ui";

// ---- Upload form (contractor uploads on behalf of sub) ----
export function DocumentUploadForm({ subcontractorId }: { subcontractorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/subcontractors/${subcontractorId}/documents`, {
        method: "POST",
        body: new FormData(e.currentTarget),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setSuccess(`Uploaded ${data.file_name}`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      {error && <Alert type="error"><p>{error}</p></Alert>}
      {success && <Alert type="success"><p>{success}</p></Alert>}
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Document type</label>
          <select name="doc_type" required
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm">
            <option value="license">License</option>
            <option value="coi">COI (Insurance)</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expiration date</label>
          <Input name="expiration_date" type="date" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File (PDF/JPG/PNG, max 10MB)</label>
          <Input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <Input name="notes" placeholder="Policy #, issuing state..." />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Uploading..." : "Upload document"}
      </Button>
    </form>
  );
}

// ---- Delete button per document row ----
export function DeleteDocButton({ docId }: { docId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this document?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/subcontractors/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}

// ---- Send magic-link invite to the subcontractor ----
export function InviteForm({ subcontractorId, currentEmail }: { subcontractorId: string; currentEmail?: string | null }) {
  const [email, setEmail] = useState(currentEmail || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLink("");
    setCopied(false);
    try {
      const res = await fetch(`/api/subcontractors/${subcontractorId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setLink(data.link);
      setEmailSent(!!data.emailSent);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="subcontractor@email.com"
          className="max-w-xs"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send upload link"}
        </Button>
      </form>
      {error && <div className="mt-2"><Alert type="error"><p>{error}</p></Alert></div>}
      {link && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {emailSent
              ? "Invite email sent! You can also share this link manually:"
              : "Email could not be sent — share this link manually:"}
          </p>
          <div className="flex gap-2 items-center">
            <code className="flex-1 break-all text-xs bg-white dark:bg-gray-800 p-2 rounded border">{link}</code>
            <Button variant="secondary" onClick={copyLink}>{copied ? "Copied!" : "Copy"}</Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Link expires in 7 days. No account needed.</p>
        </div>
      )}
    </div>
  );
}
