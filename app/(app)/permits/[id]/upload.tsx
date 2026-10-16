"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export function DocumentUpload({ permitId }: { permitId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("permit_id", permitId);
      if (expiryDate) formData.append("expiry_date", expiryDate);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFile}
        className="hidden"
        id="doc-upload"
      />
      <div className="mb-2 max-w-xs">
        <label htmlFor="doc-expiry" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Expiry date (optional)
        </label>
        <Input
          id="doc-expiry"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          disabled={uploading}
        />
      </div>
      <Button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
    </div>
  );
}
