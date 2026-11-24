// CSV export — feature (pass 2 modularity).
//
// Moved verbatim from `app/api/export/route.ts`: the route is now thin
// (auth + redirect handling, then one feature call). Behaviour is
// identical: same three export types (permits / licenses / projects),
// same columns and ordering, same CSV formula-injection escaping
// (cells starting with =, +, - or @ are prefixed with a single quote),
// same filenames.

import { ApiError } from "@/lib/shared/http";

export type ExportType = "permits" | "licenses" | "projects";

export function toCSV(rows: { [key: string]: unknown }[], headers: string[]): string {
  // Escape CSV formula injection: a cell starting with =, +, - or @ can
  // execute as a formula when the CSV is opened in Excel/Sheets, so
  // prefix it with a single quote (after any quoting).
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    let s = String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

const EXPORT_DEFS: Record<ExportType, { table: string; columns: string; headers: string[]; filename: string; order: string }> = {
  permits: {
    table: "permits",
    columns: "permit_type,permit_number,issuing_authority,jurisdiction,issue_date,expiration_date,renewal_deadline,status,notes",
    headers: ["permit_type", "permit_number", "issuing_authority", "jurisdiction", "issue_date", "expiration_date", "renewal_deadline", "status", "notes"],
    filename: "permits-export.csv",
    order: "expiration_date",
  },
  licenses: {
    table: "licenses",
    columns: "license_name,license_number,issuing_authority,state,issue_date,expiration_date,renewal_date,status,notes",
    headers: ["license_name", "license_number", "issuing_authority", "state", "issue_date", "expiration_date", "renewal_date", "status", "notes"],
    filename: "licenses-export.csv",
    order: "expiration_date",
  },
  projects: {
    table: "projects",
    columns: "name,customer,address,city,state,zip,project_type,start_date,expected_completion,status,notes",
    headers: ["name", "customer", "address", "city", "state", "zip", "project_type", "start_date", "expected_completion", "status", "notes"],
    filename: "projects-export.csv",
    order: "created_at",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildCsvExport(supabase: any, orgId: string, type: string): Promise<{ csv: string; filename: string }> {
  const def = EXPORT_DEFS[type as ExportType];
  if (!def) throw new ApiError(400, "Invalid type");
  const { data } = await supabase
    .from(def.table)
    .select(def.columns)
    .eq("organization_id", orgId)
    .order(def.order);
  return { csv: toCSV(data || [], def.headers), filename: def.filename };
}
