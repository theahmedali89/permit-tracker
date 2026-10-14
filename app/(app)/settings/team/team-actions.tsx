"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function TeamActions({
  memberId,
  inviteId,
}: {
  memberId?: string;
  inviteId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    const label = memberId ? "remove this member" : "revoke this invite";
    if (!confirm(`Are you sure you want to ${label}?`)) return;
    setLoading(true);
    try {
      const params = memberId ? `member_id=${memberId}` : `invite_id=${inviteId}`;
      const res = await fetch(`/api/team?${params}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Action failed");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="danger" onClick={handleRemove} disabled={loading}>
      {loading ? "…" : memberId ? "Remove" : "Revoke"}
    </Button>
  );
}
