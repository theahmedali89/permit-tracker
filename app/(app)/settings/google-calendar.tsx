"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";

export function GoogleCalendarConnect({ isAdmin = false }: { isAdmin?: boolean }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/calendar/status")
      .then(r => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoading(false));

    // Show result of OAuth redirect
    const params = new URLSearchParams(window.location.search);
    const cal = params.get("calendar");
    if (cal === "connected") setMessage("Google Calendar connected successfully!");
    else if (cal === "error") setMessage("Failed to connect Google Calendar. Please try again.");
  }, []);

  async function handleSync() {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Synced! ${data.created} events created, ${data.skipped} already existed.`);
    } catch (err: any) {
      setMessage("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm("Disconnect Google Calendar?")) return;
    try {
      await fetch("/api/calendar/sync", { method: "DELETE" });
      setStatus({ ...status, connected: false, google_email: null });
      setMessage("Disconnected.");
    } catch {
      setMessage("Failed to disconnect.");
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!status?.configured) {
    return (
      <p className="text-sm text-yellow-700 dark:text-yellow-400">
        Google Calendar integration is not configured yet. Add GOOGLE_CALENDAR_CLIENT_ID and
        GOOGLE_CALENDAR_CLIENT_SECRET to your environment variables.
      </p>
    );
  }

  return (
    <div>
      {status.connected ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ Connected{status.google_email ? ` as ${status.google_email}` : ""}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleSync} disabled={syncing}>
              {syncing ? "Syncing..." : "🔄 Sync Deadlines Now"}
            </Button>
            {isAdmin && <Button onClick={handleDisconnect}>Disconnect</Button>}
          </div>
          {!isAdmin && (
            <p className="text-xs text-gray-500">
              Only workspace admins can change the connected Google account.
            </p>
          )}
        </div>
      ) : isAdmin ? (
        <a href="/api/auth/google-calendar">
          <Button>📅 Connect Google Calendar</Button>
        </a>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Google Calendar is not connected yet. Ask a workspace admin to connect it in Settings.
        </p>
      )}
      {message && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{message}</p>}
      <p className="text-xs text-gray-500 mt-2">
        Sync pushes upcoming permit, inspection, and license deadlines (next 90 days) to your Google Calendar.
      </p>
    </div>
  );
}
