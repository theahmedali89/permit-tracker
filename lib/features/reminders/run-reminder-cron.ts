// Reminder cron engine — moved verbatim out of
// `app/api/cron/reminders/route.ts` (pass 2 modularity). The route is now
// thin: it checks the CRON_SECRET, builds the service-role Supabase
// client and the Resend client, and calls `runReminderCron()` here.
// Behaviour is identical: same DEFAULT_REMINDER_OFFSETS (90/60/30/14/7/1),
// same `reminder_rules` honouring, same 500 error-surfacing (as ApiError),
// same delivery-insert checks, same user-list pagination.
//
// Pure helpers (`matchCity`, `constructionHoursBlock`, `matchRegulation`)
// are exported for tests. The construction-hours data (`CITIES`) still
// comes from the public tools data file — that file is owned by another
// track and was deliberately not moved.

import type { Resend } from "resend";
import { CITIES, type CityRecord } from "@/app/(public)/tools/_data/noise-shed";
import { calculatePermitStatus, daysUntilDate } from "@/lib/shared/permit-status";
import { escapeHtml } from "@/lib/shared/escape-html";
import { ApiError } from "@/lib/shared/http";
import {
  DEFAULT_REMINDER_OFFSETS,
  offsetsAlreadySent,
  offsetsFromRules,
  shouldSendReminder,
} from "@/lib/features/reminders/reminder-window";

export interface ReminderCronDeps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; // service-role client (background processing)
  resend: Resend;
  fromEmail: string;
  appUrl: string;
  /** YYYY-MM-DD run date; defaults to today. Injectable for tests. */
  today?: string;
}

export interface ReminderCronResults {
  sent: number;
  failed: number;
  skipped: number;
  renewals_sent: number;
  status_recomputed: number;
}

/** Static renewal offsets (used when no smart-buffer regulation applies). */
export const RENEWAL_OFFSETS: readonly number[] = [30, 14, 7, 1];
/** Static document-expiry offsets. */
export const DOCUMENT_OFFSETS: readonly number[] = [30, 14, 7, 1];

/** Default reminder offsets (was module-level in the old route). */
const DEFAULT_OFFSETS: number[] = [...DEFAULT_REMINDER_OFFSETS];

export type RegulationRow = { city: string | null; state_code: string | null; processing_days: number | null };

export function matchCity(jurisdiction: string | null | undefined): CityRecord | null {
  if (!jurisdiction) return null;
  const j = jurisdiction.toLowerCase();
  let cityOnly: CityRecord | null = null;
  for (const c of CITIES) {
    const city = c.city.toLowerCase().trim();
    const cityShort = city.endsWith(" city") ? city.slice(0, -5) : city;
    if (!city || (!j.includes(city) && !j.includes(cityShort))) continue;
    const state = c.stateCode.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (state && new RegExp(`\\b${state}\\b`).test(j)) return c;
    if (!cityOnly) cityOnly = c;
  }
  return cityOnly;
}

export function constructionHoursBlock(jurisdiction: string | null | undefined): string {
  const c = matchCity(jurisdiction);
  if (!c) return "";
  const n = c.noise;
  const parts: string[] = [];
  if (n.weekdayHours) parts.push(`Weekdays: ${n.weekdayHours}`);
  if (n.weekendHours) parts.push(`Weekends: ${n.weekendHours}`);
  if (n.note) parts.push(n.note);
  if (n.dbLimits) parts.push(`Noise limits: ${n.dbLimits}`);
  if (parts.length === 0) return "";
  return `<p><strong>Construction hours in ${escapeHtml(c.city)}, ${escapeHtml(c.stateCode)}:</strong> ${parts.map(escapeHtml).join(" ")} <a href="${escapeHtml(n.sourceUrl)}">Source: ${escapeHtml(n.sourceLabel)}</a></p>`;
}

export function matchRegulation(jurisdiction: string | null | undefined, regulations: RegulationRow[]): RegulationRow | null {
  if (!jurisdiction || regulations.length === 0) return null;
  const j = jurisdiction.toLowerCase();
  let cityOnly: RegulationRow | null = null;
  for (const r of regulations) {
    const city = (r.city || "").toLowerCase().trim();
    if (!city || !j.includes(city)) continue;
    const state = (r.state_code || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (state && new RegExp(`\\b${state}\\b`).test(j)) return r;
    if (!cityOnly) cityOnly = r;
  }
  return cityOnly;
}

/**
 * Run one daily reminder pass. Throws ApiError(500) on fatal failures
 * (deadlines / rules / deliveries / renewal / documents queries), exactly
 * as the old route answered 500. The permit-status recompute at the end
 * still only logs failures — reminders already sent must not turn the
 * whole run into a 500.
 */
export async function runReminderCron(deps: ReminderCronDeps): Promise<ReminderCronResults> {
  // Clients / config come from the caller (the thin route builds the
  // service-role Supabase client and Resend client). `today` is
  // injectable so tests can pin the run date.
  const { supabase, resend, fromEmail, appUrl } = deps;
  const today = deps.today ?? new Date().toISOString().split("T")[0];
  const results = {
    sent: 0,
    failed: 0,
    skipped: 0,
    renewals_sent: 0,
    status_recomputed: 0,
  };

  // ---- User email map (fetched ONCE per run, paginated) ----
  let userEmailMap: Map<string, string> | null = null;
  async function getUserEmailMap(): Promise<Map<string, string>> {
    if (userEmailMap) return userEmailMap;
    const map = new Map<string, string>();
    let page = 1;
    const perPage = 1000;
    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error("cron: listUsers failed on page", page, error.message);
        throw new Error(`Failed to list users: ${error.message}`);
      }
      for (const u of data.users) {
        if (u.email) map.set(u.id, u.email);
      }
      if (data.users.length < perPage) break;
      page++;
    }
    userEmailMap = map;
    return map;
  }

  // Resolve real recipient emails for an organization.
  async function getOrgEmails(organization_id: string): Promise<string[]> {
    const { data: members, error } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organization_id);
    if (error) {
      console.error("cron: organization_members lookup failed", organization_id, error.message);
      return [];
    }
    if (!members || members.length === 0) return [];
    const emails = await getUserEmailMap();
    const out: string[] = [];
    for (const m of members as { user_id: string }[]) {
      const email = emails.get(m.user_id);
      if (email) out.push(email);
    }
    return out;
  }

  // Shared email sender. Throws on any failure; a failed send is recorded
  // as status 'failed' (never left as 'processing') so it retries tomorrow.
  async function sendReminder(opts: {
    to: string[];
    subject: string;
    html: string;
    text: string;
    organization_id: string;
    deadline_id: string;
  }) {
    const { data: delivery, error: insertError } = await supabase
      .from("reminder_deliveries")
      .insert({
        organization_id: opts.organization_id,
        deadline_id: opts.deadline_id,
        scheduled_for: today,
        status: "processing",
      })
      .select()
      .single();
    if (insertError || !delivery) {
      throw new Error(`Failed to record reminder delivery: ${insertError?.message || "no row returned"}`);
    }

    try {
      const { data: sent, error: sendError } = await resend.emails.send({
        from: fromEmail,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        headers: {
          "List-Unsubscribe": `<mailto:${fromEmail}>`,
        },
      });
      if (sendError) throw sendError;
      const { error: updateError } = await supabase
        .from("reminder_deliveries")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          provider_message_id: (sent as { id?: string } | null)?.id || null,
        })
        .eq("id", delivery.id);
      if (updateError) {
        console.error("cron: failed to mark delivery sent", delivery.id, updateError.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase
        .from("reminder_deliveries")
        .update({ status: "failed", error: message.slice(0, 500) })
        .eq("id", delivery.id);
      throw err;
    }
    results.sent++;
  }

  // True when a 'sent' delivery already exists for this deadline today.
  // Failed deliveries do NOT count, so they retry the next day.
  async function alreadySentToday(deadlineId: string) {
    const { data: existing, error } = await supabase
      .from("reminder_deliveries")
      .select("id")
      .eq("deadline_id", deadlineId)
      .eq("scheduled_for", today)
      .eq("status", "sent")
      .limit(1);
    if (error) {
      console.error("cron: alreadySentToday lookup failed", deadlineId, error.message);
      return false;
    }
    return !!(existing && existing.length > 0);
  }

  function daysUntil(dateStr: string) {
    return daysUntilDate(dateStr);
  }

  // ---- Construction-hours context (Permit Warden cluster Phase 3) ----




  try {
    // ---- Main deadline reminders (no joins: deadlines has no FK to
    // permits/licenses/inspections, so PostgREST embeds always fail) ----
    const maxDue = new Date();
    maxDue.setDate(maxDue.getDate() + 120);
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("deadlines")
      .select("id, organization_id, resource_type, resource_id, deadline_type, due_date, status")
      .eq("status", "pending")
      .lte("due_date", maxDue.toISOString().split("T")[0]);
    if (deadlinesError || !deadlines) {
      console.error("cron: deadlines query failed", deadlinesError?.message);
      throw new ApiError(500, `Deadlines query failed: ${deadlinesError?.message}`);
    }

    // Reminder rules per org + resource type (honoured when present).
    const { data: rules, error: rulesError } = await supabase
      .from("reminder_rules")
      .select("organization_id, resource_type, days_before, enabled");
    if (rulesError) {
      console.error("cron: reminder_rules query failed", rulesError.message);
      throw new ApiError(500, `Reminder rules query failed: ${rulesError.message}`);
    }
    const rulesByKey = new Map<string, { days_before: number; enabled: boolean | null }[]>();
    for (const r of (rules || []) as { organization_id: string; resource_type: string; days_before: number; enabled: boolean | null }[]) {
      const key = `${r.organization_id}:${r.resource_type}`;
      const list = rulesByKey.get(key) || [];
      list.push({ days_before: r.days_before, enabled: r.enabled });
      rulesByKey.set(key, list);
    }

    // Batch-fetch resource details per resource_type (separate queries).
    const idsByType = new Map<string, string[]>();
    const orgIds = new Set<string>();
    for (const d of deadlines as { resource_type: string; resource_id: string; organization_id: string }[]) {
      const list = idsByType.get(d.resource_type) || [];
      list.push(d.resource_id);
      idsByType.set(d.resource_type, list);
      orgIds.add(d.organization_id);
    }
    const fetchByIds = async (table: string, columns: string, ids: string[]) => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase.from(table).select(columns).in("id", [...new Set(ids)]);
      if (error) {
        console.error(`cron: ${table} batch query failed`, error.message);
        throw new Error(`${table} query failed: ${error.message}`);
      }
      return (data || []) as unknown as Record<string, unknown>[];
    };

    const permitRows = await fetchByIds("permits", "id, permit_type, permit_number, jurisdiction, organization_id", idsByType.get("permit") || []);
    const licenseRows = await fetchByIds("licenses", "id, license_name, license_number, organization_id", idsByType.get("license") || []);
    const inspectionRows = await fetchByIds("inspections", "id, inspection_type, organization_id", idsByType.get("inspection") || []);
    const documentRows = await fetchByIds("documents", "id, file_name, organization_id", idsByType.get("document") || []);
    const docIdsSeen = new Set(documentRows.map((r) => r.id as string));
    const remainingDocIds = (idsByType.get("document") || []).filter((id) => !docIdsSeen.has(id));
    const subDocRows = await fetchByIds("subcontractor_documents", "id, file_name, doc_type, organization_id, subcontractor_id", remainingDocIds);
    const subRows = await fetchByIds(
      "subcontractors",
      "id, name",
      subDocRows.map((r) => r.subcontractor_id as string)
    );
    const orgRows = await fetchByIds("organizations", "id, name", [...orgIds]);

    const permitsById = new Map(permitRows.map((r) => [r.id as string, r]));
    const licensesById = new Map(licenseRows.map((r) => [r.id as string, r]));
    const inspectionsById = new Map(inspectionRows.map((r) => [r.id as string, r]));
    const documentsById = new Map(documentRows.map((r) => [r.id as string, r]));
    const subDocsById = new Map(subDocRows.map((r) => [r.id as string, r]));
    const subsById = new Map(subRows.map((r) => [r.id as string, r]));
    const orgsById = new Map(orgRows.map((r) => [r.id as string, r]));

    // Sent-delivery history per deadline (for window dedup).
    const deadlineIds = (deadlines as { id: string }[]).map((d) => d.id);
    let deliveriesByDeadline = new Map<string, { scheduled_for: string; status: string }[]>();
    if (deadlineIds.length > 0) {
      const { data: deliveries, error: deliveriesError } = await supabase
        .from("reminder_deliveries")
        .select("deadline_id, scheduled_for, status")
        .in("deadline_id", deadlineIds)
        .eq("status", "sent");
      if (deliveriesError) {
        console.error("cron: reminder_deliveries query failed", deliveriesError.message);
        throw new ApiError(500, `Reminder deliveries query failed: ${deliveriesError.message}`);
      }
      for (const d of (deliveries || []) as { deadline_id: string; scheduled_for: string; status: string }[]) {
        const list = deliveriesByDeadline.get(d.deadline_id) || [];
        list.push({ scheduled_for: d.scheduled_for, status: d.status });
        deliveriesByDeadline.set(d.deadline_id, list);
      }
    }

    for (const deadline of deadlines as {
      id: string; organization_id: string; resource_type: string; resource_id: string;
      deadline_type: string; due_date: string;
    }[]) {
      const remaining = daysUntil(deadline.due_date);
      const offsets = offsetsFromRules(
        rulesByKey.get(`${deadline.organization_id}:${deadline.resource_type}`),
        DEFAULT_OFFSETS
      );
      const sentOffsets = offsetsAlreadySent(
        deliveriesByDeadline.get(deadline.id) || [],
        deadline.due_date,
        offsets
      );
      if (!shouldSendReminder(remaining, offsets, sentOffsets)) {
        results.skipped++;
        continue;
      }

      // Resolve a human-readable label + dashboard link per resource type.
      let label = `${deadline.deadline_type} deadline`;
      let linkPath = "/dashboard";
      let jurisdiction: string | null = null;
      const orgName = String(orgsById.get(deadline.organization_id)?.name ?? "");
      if (deadline.resource_type === "permit") {
        const p = permitsById.get(deadline.resource_id);
        if (!p) { results.skipped++; continue; }
        label = `Permit: ${p.permit_type as string} ${((p.permit_number as string) || "")}`;
        jurisdiction = (p.jurisdiction as string) || null;
        linkPath = "/permits";
      } else if (deadline.resource_type === "license") {
        const l = licensesById.get(deadline.resource_id);
        if (!l) { results.skipped++; continue; }
        label = `License: ${l.license_name as string} ${((l.license_number as string) || "")}`;
        linkPath = "/licenses";
      } else if (deadline.resource_type === "inspection") {
        const insp = inspectionsById.get(deadline.resource_id);
        if (!insp) { results.skipped++; continue; }
        label = `Inspection: ${insp.inspection_type as string}`;
        linkPath = "/inspections";
      } else if (deadline.resource_type === "document") {
        const doc = documentsById.get(deadline.resource_id);
        const subDoc = subDocsById.get(deadline.resource_id);
        if (doc) {
          label = `Document: ${doc.file_name as string}`;
        } else if (subDoc) {
          const subName = subsById.get(subDoc.subcontractor_id as string)?.name as string | undefined;
          label = `Subcontractor document (${subDoc.doc_type as string}): ${subDoc.file_name as string}${subName ? ` — ${subName}` : ""}`;
        } else {
          results.skipped++;
          continue;
        }
        linkPath = "/dashboard";
      }

      try {
        const recipients = await getOrgEmails(deadline.organization_id);
        if (recipients.length === 0) {
          results.skipped++;
          continue;
        }
        await sendReminder({
          to: recipients,
          subject: `Reminder: ${label} due in ${Math.max(remaining, 0)} days`,
          html: `
            <h2>Deadline Reminder</h2>
            <p><strong>Company:</strong> ${escapeHtml(orgName)}</p>
            <p><strong>Deadline:</strong> ${escapeHtml(label)}</p>
            <p><strong>Due Date:</strong> ${escapeHtml(deadline.due_date)}</p>
            <p><strong>Days Remaining:</strong> ${Math.max(remaining, 0)}</p>
            ${constructionHoursBlock(jurisdiction)}
            <p><a href="${escapeHtml(appUrl)}${escapeHtml(linkPath)}">View in dashboard</a></p>
          `,
          text: `Deadline Reminder\nCompany: ${orgName}\nDeadline: ${label}\nDue Date: ${deadline.due_date}\nDays Remaining: ${Math.max(remaining, 0)}\nView in dashboard: ${appUrl}${linkPath}\n`,
          organization_id: deadline.organization_id,
          deadline_id: deadline.id,
        });
      } catch (err) {
        results.failed++;
        console.error("Reminder failed:", err);
      }
    }

    // ---- Renewal auto-reminders ----
    // Permits with a renewal_deadline coming up get renewal-specific emails.

    // ---- Smart renewal buffers ----
    // When verified jurisdiction-level processing times exist
    // (jurisdiction_regulations.processing_days), they REPLACE the static
    // 30/14/7/1-day offsets for that permit with a single smart alert date:
    //   alert_date = renewal_deadline - processing_days - 7 (safety margin)
    // A reminder is then due every day from the alert date until expiry, so
    // the renewal paperwork can actually clear in time.
    let regulations: RegulationRow[] = [];
    try {
      const { data, error } = await supabase
        .from("jurisdiction_regulations")
        .select("city, state_code, processing_days")
        .not("processing_days", "is", null);
      if (error) throw error;
      regulations = (data || []) as RegulationRow[];
    } catch (err) {
      console.warn(
        "jurisdiction_regulations lookup failed; using static reminder offsets:",
        err instanceof Error ? err.message : err
      );
    }



    const maxProcessing = regulations.reduce((m, r) => Math.max(m, r.processing_days || 0), 0);
    const maxRenewalDate = new Date();
    maxRenewalDate.setDate(maxRenewalDate.getDate() + Math.max(30, maxProcessing + 7));

    const { data: renewalPermits, error: renewalError } = await supabase
      .from("permits")
      .select("id, organization_id, permit_type, permit_number, renewal_deadline, jurisdiction, organizations!inner(name)")
      .gte("renewal_deadline", today)
      .lte("renewal_deadline", maxRenewalDate.toISOString().split("T")[0])
      .not("status", "in", "(closed,cancelled)");
    if (renewalError) {
      console.error("cron: renewal permits query failed", renewalError.message);
      throw new ApiError(500, `Renewal permits query failed: ${renewalError.message}`);
    }

    for (const permit of ((renewalPermits || []) as unknown as {
      id: string; organization_id: string; permit_type: string; permit_number: string | null;
      renewal_deadline: string; jurisdiction: string | null; organizations: { name: string };
    }[])) {
      const remaining = daysUntil(permit.renewal_deadline);

      const reg = matchRegulation(permit.jurisdiction, regulations);
      const processingDays = reg?.processing_days ?? null;
      let smartReminder = false;
      if (processingDays != null) {
        const alertDate = new Date(permit.renewal_deadline);
        alertDate.setDate(alertDate.getDate() - processingDays - 7);
        smartReminder = today >= alertDate.toISOString().split("T")[0] && remaining > 0;
        if (!smartReminder) continue;
      } else if (!RENEWAL_OFFSETS.includes(remaining)) {
        continue;
      }

      // Ensure a pending 'renewal' deadline row exists for idempotency
      let deadlineId: string | null = null;
      const { data: existingDl, error: existingDlError } = await supabase
        .from("deadlines")
        .select("id, due_date")
        .eq("resource_type", "permit")
        .eq("resource_id", permit.id)
        .eq("deadline_type", "renewal")
        .eq("status", "pending")
        .limit(1);
      if (existingDlError) {
        console.error("cron: renewal deadline lookup failed", permit.id, existingDlError.message);
        results.failed++;
        continue;
      }

      if (existingDl && existingDl.length > 0) {
        deadlineId = existingDl[0].id;
        if (existingDl[0].due_date !== permit.renewal_deadline) {
          await supabase
            .from("deadlines")
            .update({ due_date: permit.renewal_deadline })
            .eq("id", deadlineId);
        }
      } else {
        const { data: newDl, error: newDlError } = await supabase
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
        if (newDlError || !newDl) {
          console.error("cron: renewal deadline insert failed", permit.id, newDlError?.message);
          results.failed++;
          continue;
        }
        deadlineId = newDl.id;
      }

      if (!deadlineId) continue;
      if (smartReminder) {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
        const { data: recent, error: recentError } = await supabase
          .from("reminder_deliveries")
          .select("id")
          .eq("deadline_id", deadlineId)
          .eq("status", "sent")
          .gte("scheduled_for", fiveDaysAgo.toISOString().split("T")[0])
          .limit(1);
        if (recentError) {
          console.error("cron: smart-reminder recency lookup failed", deadlineId, recentError.message);
          results.failed++;
          continue;
        }
        if (recent && recent.length > 0) {
          results.skipped++;
          continue;
        }
      } else if (await alreadySentToday(deadlineId)) {
        results.skipped++;
        continue;
      }

      try {
        const recipients = await getOrgEmails(permit.organization_id);
        if (recipients.length === 0) {
          results.skipped++;
          continue;
        }
        const permitLabel = `${permit.permit_type} ${permit.permit_number || ""}`.trim();
        await sendReminder({
          to: recipients,
          subject: smartReminder
            ? `Start permit renewal now (${reg?.city || "your jurisdiction"}): ${permit.permit_type}`
            : `Permit renewal due in ${remaining} days: ${permit.permit_type}`,
          html: `
            <h2>Permit Renewal Reminder</h2>
            <p><strong>Company:</strong> ${escapeHtml(permit.organizations.name)}</p>
            <p><strong>Permit:</strong> ${escapeHtml(permitLabel)}</p>
            <p><strong>Renewal Deadline:</strong> ${escapeHtml(permit.renewal_deadline)}</p>
            ${smartReminder
              ? `<p><strong>Why now:</strong> renewals in ${escapeHtml(reg?.city || "this jurisdiction")} typically take ${escapeHtml(processingDays)} days to process — starting today keeps you covered.</p>`
              : `<p><strong>Days Remaining:</strong> ${remaining}</p>`}
            ${constructionHoursBlock(permit.jurisdiction)}
            <p>Start the renewal paperwork now to avoid a lapse in coverage.</p>
            <p><a href="${escapeHtml(appUrl)}/permits/${escapeHtml(permit.id)}">View permit</a></p>
          `,
          text: `Permit Renewal Reminder\nCompany: ${permit.organizations.name}\nPermit: ${permitLabel}\nRenewal Deadline: ${permit.renewal_deadline}\n${smartReminder ? `Why now: renewals in ${reg?.city || "this jurisdiction"} typically take ${processingDays} days to process.\n` : `Days Remaining: ${remaining}\n`}View permit: ${appUrl}/permits/${permit.id}\n`,
          organization_id: permit.organization_id,
          deadline_id: deadlineId,
        });
        results.renewals_sent++;
      } catch (err) {
        results.failed++;
        console.error("Renewal reminder failed:", err);
      }
    }

    // ---- Document expiry reminders ----
    const maxDocDate = new Date();
    maxDocDate.setDate(maxDocDate.getDate() + 30);
    const maxDocDateStr = maxDocDate.toISOString().split("T")[0];

    const { data: expiringDocs, error: docsError } = await supabase
      .from("documents")
      .select("id, organization_id, file_name, expiry_date, organizations!inner(name)")
      .gte("expiry_date", today)
      .lte("expiry_date", maxDocDateStr);
    if (docsError) {
      console.error("cron: expiring documents query failed", docsError.message);
      throw new ApiError(500, `Documents query failed: ${docsError.message}`);
    }

    const { data: expiringSubDocs, error: subDocsError } = await supabase
      .from("subcontractor_documents")
      .select("id, organization_id, file_name, doc_type, expiration_date, subcontractors!inner(name), organizations!inner(name)")
      .gte("expiration_date", today)
      .lte("expiration_date", maxDocDateStr);
    if (subDocsError) {
      console.error("cron: expiring subcontractor documents query failed", subDocsError.message);
      throw new ApiError(500, `Subcontractor documents query failed: ${subDocsError.message}`);
    }

    const docItems: {
      id: string;
      organization_id: string;
      file_name: string;
      expiry: string;
      label: string;
      orgName: string;
    }[] = [];
    for (const d of ((expiringDocs || []) as unknown as { id: string; organization_id: string; file_name: string; expiry_date: string; organizations: { name: string } }[])) {
      docItems.push({
        id: d.id,
        organization_id: d.organization_id,
        file_name: d.file_name,
        expiry: d.expiry_date,
        label: `Document: ${d.file_name}`,
        orgName: d.organizations.name,
      });
    }
    for (const d of ((expiringSubDocs || []) as unknown as { id: string; organization_id: string; file_name: string; doc_type: string; expiration_date: string; subcontractors: { name: string }; organizations: { name: string } }[])) {
      docItems.push({
        id: d.id,
        organization_id: d.organization_id,
        file_name: d.file_name,
        expiry: d.expiration_date,
        label: `Subcontractor document (${d.doc_type}): ${d.file_name} — ${d.subcontractors.name}`,
        orgName: d.organizations.name,
      });
    }

    for (const item of docItems) {
      const remaining = daysUntil(item.expiry);
      if (!DOCUMENT_OFFSETS.includes(remaining)) continue;

      let deadlineId: string | null = null;
      const { data: existingDl, error: existingDlError } = await supabase
        .from("deadlines")
        .select("id, due_date")
        .eq("resource_type", "document")
        .eq("resource_id", item.id)
        .eq("deadline_type", "document_expiration")
        .eq("status", "pending")
        .limit(1);
      if (existingDlError) {
        console.error("cron: document deadline lookup failed", item.id, existingDlError.message);
        results.failed++;
        continue;
      }

      if (existingDl && existingDl.length > 0) {
        deadlineId = existingDl[0].id;
        if (existingDl[0].due_date !== item.expiry) {
          await supabase
            .from("deadlines")
            .update({ due_date: item.expiry })
            .eq("id", deadlineId);
        }
      } else {
        const { data: newDl, error: newDlError } = await supabase
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
        if (newDlError || !newDl) {
          console.error("cron: document deadline insert failed", item.id, newDlError?.message);
          results.failed++;
          continue;
        }
        deadlineId = newDl.id;
      }

      if (!deadlineId) continue;
      if (await alreadySentToday(deadlineId)) {
        results.skipped++;
        continue;
      }

      try {
        const recipients = await getOrgEmails(item.organization_id);
        if (recipients.length === 0) {
          results.skipped++;
          continue;
        }
        await sendReminder({
          to: recipients,
          subject: `Document expiring in ${remaining} days: ${item.file_name}`,
          html: `
            <h2>Document Expiry Reminder</h2>
            <p><strong>Company:</strong> ${escapeHtml(item.orgName)}</p>
            <p><strong>Document:</strong> ${escapeHtml(item.label)}</p>
            <p><strong>Expiry Date:</strong> ${escapeHtml(item.expiry)}</p>
            <p><strong>Days Remaining:</strong> ${remaining}</p>
            <p>Renew or replace this document before it expires to stay compliant.</p>
            <p><a href="${escapeHtml(appUrl)}/dashboard">View dashboard</a></p>
          `,
          text: `Document Expiry Reminder\nCompany: ${item.orgName}\nDocument: ${item.label}\nExpiry Date: ${item.expiry}\nDays Remaining: ${remaining}\nView dashboard: ${appUrl}/dashboard\n`,
          organization_id: item.organization_id,
          deadline_id: deadlineId,
        });
      } catch (err) {
        results.failed++;
        console.error("Document expiry reminder failed:", err);
      }
    }

    // ---- Daily permit-status recompute ----
    // Stored statuses drift as dates pass (a permit "active" yesterday
    // may be expired today). Recompute for every permit and persist
    // only the rows whose stored status changed.
    try {
      const { data: permits, error: recomputeError } = await supabase
        .from("permits")
        .select("id, organization_id, expiration_date, renewal_deadline, status")
        .limit(5000);
      if (recomputeError) throw recomputeError;
      for (const p of (permits || []) as {
        id: string; expiration_date: string | null; renewal_deadline: string | null; status: string;
      }[]) {
        const correct = calculatePermitStatus(p.expiration_date, p.renewal_deadline);
        if (correct !== p.status) {
          const { error: updateError } = await supabase
            .from("permits")
            .update({ status: correct })
            .eq("id", p.id);
          if (updateError) {
            console.error("cron: permit status recompute update failed", p.id, updateError.message);
          } else {
            results.status_recomputed++;
          }
        }
      }
    } catch (err) {
      // Reminders already went out; a stale-status failure must not turn
      // the whole run into a 500, but it is logged loudly.
      console.error("cron: permit status recompute failed", err instanceof Error ? err.message : err);
    }

    return results;
  } catch (err) {
    console.error("cron: fatal error", err instanceof Error ? err.message : err);
    throw new ApiError(500, err instanceof Error ? err.message : "Cron failed");
  }
}
