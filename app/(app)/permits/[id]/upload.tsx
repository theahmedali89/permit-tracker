"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function DocumentUpload({ permitId }: { permitId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
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
      <Button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "📎 Upload Document"}
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
    </div>
  );
}
