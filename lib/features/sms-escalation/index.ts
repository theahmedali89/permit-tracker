/**
 * SMS escalation — Twilio via plain fetch (no new dependency).
 *
 * When TWILIO_* env vars are absent, `sendSms` logs a warning and
 * returns `{ sent: false, reason: "twilio-not-configured" }` — it never
 * throws and never pretends a message was sent. When configured, it
 * calls the Twilio Messages REST API with Basic auth.
 *
 * Phone numbers are expected in E.164 format (e.g. +1 512 555 0100).
 */
import "server-only";

export interface SmsResult {
  sent: boolean;
  sid?: string;
  reason?: string;
}

export function smsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER
  );
}

/**
 * Send one SMS. Safe to call unconfigured — returns a not-sent result.
 * `to` must be E.164; anything else is rejected without a network call.
 */
export async function sendSms(to: string, message: string): Promise<SmsResult> {
  if (!smsConfigured()) {
    console.warn("[sms] Twilio not configured — SMS not sent. See SMS-SETUP.md.");
    return { sent: false, reason: "twilio-not-configured" };
  }
  if (!/^\+[1-9]\d{6,14}$/.test(to.trim())) {
    return { sent: false, reason: "invalid-phone-number" };
  }
  if (!message || message.length > 1600) {
    return { sent: false, reason: "invalid-message" };
  }
  const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
  const auth = Buffer.from(
    `${accountSid}:${process.env.TWILIO_AUTH_TOKEN as string}`
  ).toString("base64");
  const body = new URLSearchParams({
    To: to.trim(),
    From: process.env.TWILIO_FROM_NUMBER as string,
    Body: message,
  });
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[sms] Twilio error:", data?.message ?? res.status);
      return { sent: false, reason: `twilio-error-${res.status}` };
    }
    return { sent: true, sid: data?.sid };
  } catch (err: any) {
    console.error("[sms] Twilio request failed:", err?.message);
    return { sent: false, reason: "twilio-request-failed" };
  }
}

/** One step in the escalation chain. */
export interface EscalationStep {
  role: "site_engineer" | "project_manager" | "owner";
  /** E.164 phone number for this step's contact. */
  phone: string;
  /** Hours to wait for an acknowledgement before escalating. */
  ackTimeoutHours: number;
}

export interface EscalationChain {
  steps: EscalationStep[];
}

/** Default chain: site engineer (4h) → PM (12h) → owner (24h). */
export const DEFAULT_ESCALATION_CHAIN: EscalationChain = {
  steps: [
    { role: "site_engineer", phone: "", ackTimeoutHours: 4 },
    { role: "project_manager", phone: "", ackTimeoutHours: 12 },
    { role: "owner", phone: "", ackTimeoutHours: 24 },
  ],
};

/**
 * Decide which step should be messaged now, given how long the alert has
 * been unacknowledged. Returns null when every step's timeout has passed
 * (the chain is exhausted) or when no step has a phone number.
 */
export function nextEscalationStep(
  chain: EscalationChain,
  unacknowledgedHours: number
): EscalationStep | null {
  let elapsed = 0;
  for (const step of chain.steps) {
    if (!step.phone) continue;
    if (unacknowledgedHours < elapsed + step.ackTimeoutHours) return step;
    elapsed += step.ackTimeoutHours;
  }
  return null;
}

/** Short alert text for a deadline (kept under one SMS segment where possible). */
export function escalationMessage(args: {
  permitLabel: string;
  dueDate: string;
  role: EscalationStep["role"];
}): string {
  return (
    `Permit Warden: ${args.permitLabel} is due ${args.dueDate} and has not ` +
    `been acknowledged. You are the ${args.role.replace("_", " ")} on the ` +
    `escalation chain. Reply ACK to confirm, or open Permit Warden to act.`
  );
}
