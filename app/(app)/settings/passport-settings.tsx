"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Alert } from "@/components/ui";

async function patchOrg(body: Record<string, unknown>) {
  const res = await fetch("/api/organization", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Save failed");
  return data;
}

/** Compliance Passport toggle (feature 5). */
export function PassportSettings({
  enabled,
  slug,
}: {
  enabled: boolean;
  slug: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPublic, setIsPublic] = useState(enabled);
  const [publicSlug, setPublicSlug] = useState(slug);

  async function toggle(next: boolean) {
    setSaving(true);
    setError("");
    try {
      const data = await patchOrg({ compliance_passport_public: next });
      setIsPublic(next);
      if (data?.compliance_passport_slug) setPublicSlug(data.compliance_passport_slug);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const url =
    isPublic && publicSlug
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${publicSlug}`
      : null;

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Compliance Passport
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        A public page that shows your license status, active permit count and
        COI validity — share it on quotes so clients can verify you. Only
        statuses, counts and expiry dates are shown; no private documents.
      </p>
      {error && <Alert type="error"><p>{error}</p></Alert>}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
        <input
          type="checkbox"
          checked={isPublic}
          disabled={saving}
          onChange={(e) => toggle(e.target.checked)}
          className="h-4 w-4"
        />
        Enable public Compliance Passport
      </label>
      {url && (
        <p className="mt-3 text-sm">
          Public URL:{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 break-all">
            {url}
          </a>
        </p>
      )}
      {!isPublic && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Disabled — your verification page returns a 404 until you enable it.
        </p>
      )}
    </Card>
  );
}

/* NOTE (2026-11-24): the SMS Escalation toggle lived here and was removed.
 * It promised a feature that can never fire: SMS escalation is DISABLED
 * pending Twilio keys, phone-number storage, and inbound ACK handling
 * (see lib/features/sms-escalation/README.md). No toggle, no fake status.
 * The `sms_escalation_enabled` column remains in the DB (migration) but
 * nothing reads it as a live setting. */
