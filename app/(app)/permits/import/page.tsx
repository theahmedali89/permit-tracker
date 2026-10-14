"use client";

import { useState, useRef } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, Button, Alert, Badge } from "@/components/ui";
import Link from "next/link";

interface ImportResult {
  imported: number;
  errors: string[];
}

const EXPECTED_COLUMNS = [
  "permit_type",
  "permit_number",
  "issuing_authority",
  "jurisdiction",
  "issue_date",
  "expiration_date",
  "renewal_deadline",
  "notes",
];

export default function PermitImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | undefined) {
    setError("");
    setResult(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a .csv file");
      return;
    }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/permits/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setResult(data);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/permits" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Permits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          Import Permits from CSV
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Bulk-import permits from a spreadsheet. Download the template to see the expected format.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">1. Upload CSV file</h2>

          {error && <Alert type="error"><p>{error}</p></Alert>}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {file ? (
              <div>
                <p className="text-4xl mb-2">📄</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-blue-600 mt-2">Click to choose a different file</p>
              </div>
            ) : (
              <div>
                <p className="text-4xl mb-2">📤</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag & drop your CSV here, or click to browse
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-4 w-full"
          >
            {uploading ? "Importing..." : `Import ${file ? `"${file.name}"` : ""}`}
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">2. Expected columns</h2>
            <div className="flex flex-wrap gap-2">
              {EXPECTED_COLUMNS.map((col) => (
                <Badge key={col} color={col === "permit_type" ? "green" : "gray"}>
                  {col}{col === "permit_type" ? " *" : ""}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * permit_type is required. Dates should be YYYY-MM-DD.
            </p>
            <a
              href="/api/permits/import"
              className="inline-flex items-center mt-4 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              ⬇️ Download CSV template
            </a>
          </Card>

          {result && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Import results</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {result.imported}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500">Imported</p>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {result.errors.length}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">Errors</p>
                </div>
              </div>
              {result.errors.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">
                      {err}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400">
                  🎉 All rows imported successfully!
                </p>
              )}
              <Link
                href="/permits"
                className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-500"
              >
                View permits →
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
