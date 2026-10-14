"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export function DeadlineAdd({ permitId }: { permitId: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [deadlineType, setDeadlineType] = useState("renewal");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/deadlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_type: "permit",
          resource_id: permitId,
          deadline_type: deadlineType,
          due_date: dueDate,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setShow(false);
      setDueDate("");
      router.refresh();
    } catch {
      alert("Failed to add deadline");
    } finally {
      setLoading(false);
    }
  }

  if (!show) {
    return (
      <Button onClick={() => setShow(true)} className="text-sm">
        + Add Deadline
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 border rounded-lg">
      <div>
        <label className="block text-xs font-medium mb-1">Type</label>
        <select
          value={deadlineType}
          onChange={e => setDeadlineType(e.target.value)}
          className="block w-full px-2 py-1 text-sm border rounded-md"
        >
          <option value="renewal">Renewal</option>
          <option value="expiration">Expiration</option>
          <option value="inspection">Inspection</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Due Date *</label>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !dueDate} className="text-sm">
          {loading ? "Adding..." : "Add"}
        </Button>
        <Button type="button" onClick={() => setShow(false)} className="text-sm">
          Cancel
        </Button>
      </div>
    </form>
  );
}
