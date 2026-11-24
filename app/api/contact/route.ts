import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SUPPORT_EMAIL = "support@permitwarden.com";
const MAX_LEN = 4000;

/**
 * POST /api/contact — contact form endpoint.
 *
 * Sends the message to support@permitwarden.com via Resend when email is
 * configured (RESEND_API_KEY + RESEND_FROM_EMAIL). When it is not
 * configured, it returns a clear 503 instead of pretending the message was
 * sent — the form then tells the visitor to email support directly.
 * No message is stored in the database.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  const { name, email, topic, message } = (body ?? {}) as Record<string, unknown>;
  const cleanName = typeof name === "string" ? name.trim().slice(0, 120) : "";
  const cleanEmail = typeof email === "string" ? email.trim().slice(0, 200) : "";
  const cleanTopic = typeof topic === "string" ? topic.trim().slice(0, 80) : "General question";
  const cleanMessage = typeof message === "string" ? message.trim().slice(0, MAX_LEN) : "";
  if (!cleanName || !cleanEmail || !cleanMessage) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and message are all required." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    // Honest failure: email is not configured in this deployment.
    return NextResponse.json(
      {
        ok: false,
        error: `Email is not configured yet — please email ${SUPPORT_EMAIL} directly and mention "${cleanTopic}".`,
      },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: SUPPORT_EMAIL,
      replyTo: cleanEmail,
      subject: `[Permit Warden contact] ${cleanTopic} — ${cleanName}`,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\nTopic: ${cleanTopic}\n\n${cleanMessage}`,
    });
    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { ok: false, error: `The message could not be sent. Please email ${SUPPORT_EMAIL} directly.` },
        { status: 502 }
      );
    }
    return NextResponse.json({
      ok: true,
      message: "Thanks — your message was sent. We will reply to the email address you gave.",
    });
  } catch (err) {
    console.error("[contact] send failed:", err);
    return NextResponse.json(
      { ok: false, error: `The message could not be sent. Please email ${SUPPORT_EMAIL} directly.` },
      { status: 502 }
    );
  }
}
