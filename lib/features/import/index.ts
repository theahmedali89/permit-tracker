// CSV permit import — handler logic moved verbatim from
// `app/api/permits/import/route.ts` POST (pass 2 modularity). The route
// is now thin (feature-flag check, auth/org resolution, one feature
// call). Behaviour is identical: same 5MB / 1000-row limits, same
// per-row validation errors, same bulk plan-limit check BEFORE the
// insert (over-limit imports are rejected whole, never partially
// imported), same status computation, same deadline syncs, same audit
// event. The GET template endpoint stays in the route (3 lines, no
// business logic).

import { calculatePermitStatus } from "@/lib/shared/permit-status";
import { isValidDateString } from "@/lib/shared/validate";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";
import { parseCsv } from "@/lib/features/import/csv-parser";
import { syncDeadline } from "@/lib/features/reminders/sync-deadlines";
import { enforceBulkPlanLimitWithGraceMode } from "@/lib/features/billing";

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_ROWS = 1000;

// Expected CSV columns: permit_type, permit_number, issuing_authority, jurisdiction, issue_date, expiration_date, renewal_deadline, notes
export function validateImportRows(rows: Record<string, string>[]): {
  validRows: Record<string, string>[];
  errors: string[];
} {
  const errors: string[] = [];
  const validRows: Record<string, string>[] = [];
  const dateFields = ["issue_date", "expiration_date", "renewal_deadline"];

  rows.forEach((row, idx) => {
    const lineNo = idx + 2;
    if (!row.permit_type) {
      errors.push(`Row ${lineNo}: missing permit_type, skipped`);
      return;
    }
    for (const f of dateFields) {
      if (row[f] && !isValidDateString(row[f])) {
        errors.push(`Row ${lineNo}: invalid ${f} "${row[f]}" (use YYYY-MM-DD), skipped`);
        return;
      }
    }
    validRows.push(row);
  });
  return { validRows, errors };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importPermitsCsv(supabase: any, orgId: string, userId: string, file: File | null): Promise<FeatureResult> {
  if (!file) throw new ApiError(400, "No file");
  if (file.size > MAX_FILE_BYTES) {
    throw new ApiError(400, "File too large. Max 5MB.");
  }

  const text = await file.text();
  const { rows, errors } = parseCsv(text, { maxRows: MAX_ROWS });

  const headers = Object.keys(rows[0] || {});
  if (rows.length === 0 && errors.length === 0) {
    throw new ApiError(400, "CSV is empty or has no data rows");
  }
  if (!headers.includes("permit_type")) {
    throw new ApiError(400, "Missing required column: permit_type");
  }

  const results = { imported: 0, errors: [...errors] as string[] };
  const { validRows, errors: rowErrors } = validateImportRows(rows);
  results.errors.push(...rowErrors);

  // Plan-limit enforcement for the whole batch (grace mode: enforced
  // only when Stripe is configured; without keys the import is allowed
  // and a warning is logged — see lib/features/billing). Checked before
  // the bulk insert so an over-limit import is rejected whole, never
  // partially imported.
  if (validRows.length > 0) {
    const planCheck = await enforceBulkPlanLimitWithGraceMode(supabase, orgId, "permits", validRows.length);
    if (!planCheck.allowed) {
      throw new ApiError(402, planCheck.message, { upgrade: true });
    }
    const payload = validRows.map((row) => ({
      organization_id: orgId,
      permit_type: row.permit_type,
      permit_number: row.permit_number || null,
      issuing_authority: row.issuing_authority || null,
      jurisdiction: row.jurisdiction || null,
      issue_date: row.issue_date || null,
      expiration_date: row.expiration_date || null,
      renewal_deadline: row.renewal_deadline || null,
      notes: row.notes || null,
      status: calculatePermitStatus(row.expiration_date || null, row.renewal_deadline || null),
      source_type: "user_provided",
    }));

    // Single bulk insert (project_id is not part of the template, so no
    // cross-tenant check is needed here).
    const { data: inserted, error } = await supabase
      .from("permits")
      .insert(payload)
      .select("id, expiration_date, renewal_deadline");
    if (error) {
      throw new ApiError(500, error.message);
    }

    // Deadline rows (idempotent with the DB triggers).
    for (const permit of inserted || []) {
      await syncDeadline(supabase, {
        organization_id: orgId,
        resource_type: "permit",
        resource_id: permit.id,
        deadline_type: "expiration",
        due_date: permit.expiration_date,
      });
      await syncDeadline(supabase, {
        organization_id: orgId,
        resource_type: "permit",
        resource_id: permit.id,
        deadline_type: "renewal",
        due_date: permit.renewal_deadline,
      });
    }
    results.imported = (inserted || []).length;
  }
  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "permits.csv_imported",
    entity_type: "permit",
    metadata: { imported: results.imported, errors: results.errors.length },
  });

  return result(200, results);
}
