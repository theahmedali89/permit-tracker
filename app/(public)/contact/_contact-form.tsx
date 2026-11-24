"use client";

import { useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; message: string }
  | { kind: "error"; message: string };

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

/**
 * Contact form. POSTs to /api/contact, which sends the message via Resend
 * when email is configured and otherwise returns an honest 503 telling the
 * visitor to email support@permitwarden.com directly. No backend is invented:
 * if the API is not configured, the form says so instead of pretending the
 * message was sent.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          topic: String(data.get("topic") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (res.ok && json.ok) {
        form.reset();
        setStatus({
          kind: "sent",
          message: json.message ?? "Thanks — your message was sent.",
        });
      } else {
        setStatus({
          kind: "error",
          message:
            json.error ??
            "The message could not be sent. Please email support@permitwarden.com directly.",
        });
      }
    } catch {
      setStatus({
        kind: "error",
        message:
          "The message could not be sent. Please email support@permitwarden.com directly.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Name
        </label>
        <input id="contact-name" name="name" type="text" required maxLength={120} placeholder="Your name" className={inputCls} />
      </div>
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input id="contact-email" name="email" type="email" required maxLength={200} placeholder="you@company.com" className={inputCls} />
      </div>
      <div>
        <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Topic
        </label>
        <select id="contact-topic" name="topic" className={inputCls} defaultValue="General question">
          <option>General question</option>
          <option>Wrong portal link or rule</option>
          <option>Account or billing help</option>
          <option>Feature request</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={4000}
          rows={6}
          placeholder="How can we help?"
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 disabled:opacity-60"
      >
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      {status.kind === "sent" && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          {status.message}
        </p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {status.message}
        </p>
      )}
    </form>
  );
}
