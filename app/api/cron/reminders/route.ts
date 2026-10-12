import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role for background processing (created inside handler)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  const today = new Date().toISOString().split("T")[0];
  const results = { sent: 0, failed: 0, skipped: 0 };

  try {
    // Get all pending deadlines with their reminder rules
    const { data: deadlines } = await supabase
      .from("deadlines")
      .select(`
        *,
        permits!inner(permit_type, permit_number, expiration_date),
        organizations!inner(name)
      `)
      .eq("status", "pending")
      .gte("due_date", today);

    if (!deadlines) {
      return NextResponse.json({ ...results, message: "No deadlines" });
    }

    // Default reminder offsets (days before)
    const offsets = [90, 60, 30, 14, 7, 1];

    for (const deadline of deadlines) {
      const dueDate = new Date(deadline.due_date);
      const todayDate = new Date(today);
      const daysUntil = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

      for (const offset of offsets) {
        if (daysUntil === offset) {
          // Check idempotency: already sent?
          const { data: existing } = await supabase
            .from("reminder_deliveries")
            .select("id")
            .eq("deadline_id", deadline.id)
            .eq("scheduled_for", today)
            .limit(1);

          if (existing && existing.length > 0) {
            results.skipped++;
            continue;
          }

          // Get org members' emails
          const { data: members } = await supabase
            .from("organization_members")
            .select("user_id")
            .eq("organization_id", deadline.organization_id);

          // For MVP, we'll send to a placeholder - in production, get user emails from auth
          // This is a simplified version

          try {
            // Record delivery attempt
            const { data: delivery } = await supabase
              .from("reminder_deliveries")
              .insert({
                organization_id: deadline.organization_id,
                deadline_id: deadline.id,
                scheduled_for: today,
                status: "processing",
              })
              .select()
              .single();

            // Send email via Resend
            // Note: In production, fetch actual user emails
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: "placeholder@example.com", // TODO: Get actual user emails
              subject: `⏰ Permit expiring in ${offset} days: ${deadline.permits.permit_type}`,
              html: `
                <h2>Permit Reminder</h2>
                <p><strong>Company:</strong> ${deadline.organizations.name}</p>
                <p><strong>Permit:</strong> ${deadline.permits.permit_type} ${deadline.permits.permit_number || ""}</p>
                <p><strong>Due Date:</strong> ${deadline.due_date}</p>
                <p><strong>Days Remaining:</strong> ${offset}</p>
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/permits">View in dashboard</a></p>
              `,
            });

            // Mark as sent
            await supabase
              .from("reminder_deliveries")
              .update({ status: "sent", sent_at: new Date().toISOString() })
              .eq("id", delivery.id);

            results.sent++;
          } catch (err: any) {
            results.failed++;
            console.error("Reminder failed:", err);
          }
        }
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
