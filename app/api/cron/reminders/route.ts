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
  const results = { sent: 0, failed: 0, skipped: 0, renewals_sent: 0 };

  // Shared email sender for reminder types
  async function sendReminder(opts: {
    to: string;
    subject: string;
    html: string;
    organization_id: string;
    deadline_id: string;
  }) {
    const { data: delivery } = await supabase
      .from("reminder_deliveries")
      .insert({
        organization_id: opts.organization_id,
        deadline_id: opts.deadline_id,
        scheduled_for: today,
        status: "processing",
      })
      .select()
      .single();

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    await supabase
      .from("reminder_deliveries")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", delivery.id);

    results.sent++;
  }

  async function alreadySentToday(deadlineId: string) {
    const { data: existing } = await supabase
      .from("reminder_deliveries")
      .select("id")
      .eq("deadline_id", deadlineId)
      .eq("scheduled_for", today)
      .limit(1);
    return !!(existing && existing.length > 0);
  }

  function daysUntil(dateStr: string) {
    const dueDate = new Date(dateStr);
    const todayDate = new Date(today);
    return Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  }

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

    // Default reminder offsets (days before)
    const offsets = [90, 60, 30, 14, 7, 1];

    for (const deadline of deadlines || []) {
      const remaining = daysUntil(deadline.due_date);

      for (const offset of offsets) {
        if (remaining === offset) {
          if (await alreadySentToday(deadline.id)) {
            results.skipped++;
            continue;
          }

          try {
            await sendReminder({
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
              organization_id: deadline.organization_id,
              deadline_id: deadline.id,
            });
          } catch (err: any) {
            results.failed++;
            console.error("Reminder failed:", err);
          }
        }
      }
    }

    // ---- Renewal auto-reminders ----
    // Permits with a renewal_deadline coming up get renewal-specific emails.
    const renewalOffsets = [30, 14, 7, 1];
    const maxRenewalDate = new Date();
    maxRenewalDate.setDate(maxRenewalDate.getDate() + 30);

    const { data: renewalPermits } = await supabase
      .from("permits")
      .select("id, organization_id, permit_type, permit_number, renewal_deadline, organizations!inner(name)")
      .gte("renewal_deadline", today)
      .lte("renewal_deadline", maxRenewalDate.toISOString().split("T")[0])
      .not("status", "in", "(closed,cancelled)");

    for (const permit of renewalPermits || []) {
      const remaining = daysUntil(permit.renewal_deadline);
      if (!renewalOffsets.includes(remaining)) continue;

      // Ensure a pending 'renewal' deadline row exists for idempotency
      let deadlineId: string | null = null;
      const { data: existingDl } = await supabase
        .from("deadlines")
        .select("id, due_date")
        .eq("resource_type", "permit")
        .eq("resource_id", permit.id)
        .eq("deadline_type", "renewal")
        .eq("status", "pending")
        .limit(1);

      if (existingDl && existingDl.length > 0) {
        deadlineId = existingDl[0].id;
        if (existingDl[0].due_date !== permit.renewal_deadline) {
          await supabase
            .from("deadlines")
            .update({ due_date: permit.renewal_deadline })
            .eq("id", deadlineId);
        }
      } else {
        const { data: newDl } = await supabase
          .from("deadlines")
          .insert({
            organization_id: permit.organization_id,
            resource_type: "permit",
            resource_id: permit.id,
            deadline_type: "renewal",
            due_date: permit.renewal_deadline,
            status: "pending",
          })
          .select("id")
          .single();
        deadlineId = newDl?.id || null;
      }

      if (!deadlineId) continue;
      if (await alreadySentToday(deadlineId)) {
        results.skipped++;
        continue;
      }

      try {
        await sendReminder({
          to: "placeholder@example.com", // TODO: Get actual user emails
          subject: `🔄 Permit renewal due in ${remaining} days: ${permit.permit_type}`,
          html: `
            <h2>Permit Renewal Reminder</h2>
            <p><strong>Company:</strong> ${(permit as any).organizations.name}</p>
            <p><strong>Permit:</strong> ${permit.permit_type} ${permit.permit_number || ""}</p>
            <p><strong>Renewal Deadline:</strong> ${permit.renewal_deadline}</p>
            <p><strong>Days Remaining:</strong> ${remaining}</p>
            <p>Start the renewal paperwork now to avoid a lapse in coverage.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/permits/${permit.id}">View permit</a></p>
          `,
          organization_id: permit.organization_id,
          deadline_id: deadlineId,
        });
        results.renewals_sent++;
      } catch (err: any) {
        results.failed++;
        console.error("Renewal reminder failed:", err);
      }
    }

    // ---- Document expiry reminders ----
    // Documents (vault) with an expiry_date and subcontractor documents
    // (COI/license) with an expiration_date coming up get expiry emails.
    // Synthetic pending 'document_expiration' deadline rows power idempotency,
    // exactly like the renewal pattern above. The first query in this cron
    // uses permits!inner, so document deadlines are handled only here.
    const docOffsets = [30, 14, 7, 1];
    const maxDocDate = new Date();
    maxDocDate.setDate(maxDocDate.getDate() + 30);
    const maxDocDateStr = maxDocDate.toISOString().split("T")[0];

    const { data: expiringDocs } = await supabase
      .from("documents")
      .select("id, organization_id, file_name, expiry_date, organizations!inner(name)")
      .gte("expiry_date", today)
      .lte("expiry_date", maxDocDateStr);

    const { data: expiringSubDocs } = await supabase
      .from("subcontractor_documents")
      .select("id, organization_id, file_name, doc_type, expiration_date, subcontractors!inner(name), organizations!inner(name)")
      .gte("expiration_date", today)
      .lte("expiration_date", maxDocDateStr);

    // Normalize both sources to a common shape
    const docItems: {
      id: string;
      organization_id: string;
      file_name: string;
      expiry: string;
      label: string;
      orgName: string;
    }[] = [];
    for (const d of expiringDocs || []) {
      docItems.push({
        id: d.id,
        organization_id: d.organization_id,
        file_name: d.file_name,
        expiry: d.expiry_date,
        label: `Document: ${d.file_name}`,
        orgName: (d as any).organizations.name,
      });
    }
    for (const d of expiringSubDocs || []) {
      docItems.push({
        id: d.id,
        organization_id: d.organization_id,
        file_name: d.file_name,
        expiry: d.expiration_date,
        label: `Subcontractor document (${d.doc_type}): ${d.file_name} — ${(d as any).subcontractors.name}`,
        orgName: (d as any).organizations.name,
      });
    }

    for (const item of docItems) {
      const remaining = daysUntil(item.expiry);
      if (!docOffsets.includes(remaining)) continue;

      // Ensure a pending 'document_expiration' deadline row exists for idempotency
      let deadlineId: string | null = null;
      const { data: existingDl } = await supabase
        .from("deadlines")
        .select("id, due_date")
        .eq("resource_type", "document")
        .eq("resource_id", item.id)
        .eq("deadline_type", "document_expiration")
        .eq("status", "pending")
        .limit(1);

      if (existingDl && existingDl.length > 0) {
        deadlineId = existingDl[0].id;
        if (existingDl[0].due_date !== item.expiry) {
          await supabase
            .from("deadlines")
            .update({ due_date: item.expiry })
            .eq("id", deadlineId);
        }
      } else {
        const { data: newDl } = await supabase
          .from("deadlines")
          .insert({
            organization_id: item.organization_id,
            resource_type: "document",
            resource_id: item.id,
            deadline_type: "document_expiration",
            due_date: item.expiry,
            status: "pending",
          })
          .select("id")
          .single();
        deadlineId = newDl?.id || null;
      }

      if (!deadlineId) continue;
      if (await alreadySentToday(deadlineId)) {
        results.skipped++;
        continue;
      }

      try {
        await sendReminder({
          to: "placeholder@example.com", // TODO: Get actual user emails
          subject: `Document expiring in ${remaining} days: ${item.file_name}`,
          html: `
            <h2>Document Expiry Reminder</h2>
            <p><strong>Company:</strong> ${item.orgName}</p>
            <p><strong>Document:</strong> ${item.label}</p>
            <p><strong>Expiry Date:</strong> ${item.expiry}</p>
            <p><strong>Days Remaining:</strong> ${remaining}</p>
            <p>Renew or replace this document before it expires to stay compliant.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/documents">View documents</a></p>
          `,
          organization_id: item.organization_id,
          deadline_id: deadlineId,
        });
      } catch (err: any) {
        results.failed++;
        console.error("Document expiry reminder failed:", err);
      }
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
