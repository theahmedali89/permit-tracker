import "server-only";

export interface ReportSummary {
  generated_at: string;
  permits_by_status: Record<string, number>;
  expiring: {
    in_30_days: any[];
    in_60_days: any[];
    in_90_days: any[];
  };
  inspections: {
    total: number;
    passed: number;
    failed: number;
    follow_up_required: number;
    pass_rate_pct: number | null;
  };
  per_project: {
    project_id: string;
    project_name: string;
    permits_total: number;
    permits_expired: number;
    inspections_total: number;
    inspections_failed: number;
  }[];
}

function datePlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function buildReportSummary(supabase: any, orgId: string): Promise<ReportSummary> {
  const today = new Date().toISOString().split("T")[0];

  // Permits by status
  const { data: permits } = await supabase
    .from("permits")
    .select("id, status, expiration_date, permit_type, permit_number, project_id, projects(name)")
    .eq("organization_id", orgId);

  const permits_by_status: Record<string, number> = {};
  for (const p of permits || []) {
    permits_by_status[p.status] = (permits_by_status[p.status] || 0) + 1;
  }

  // Expiring buckets (by expiration_date)
  const withExpiry = (permits || []).filter((p: any) => p.expiration_date && p.expiration_date >= today);
  const expiring = {
    in_30_days: withExpiry
      .filter((p: any) => p.expiration_date <= datePlus(30))
      .map((p: any) => ({
        id: p.id,
        permit_type: p.permit_type,
        permit_number: p.permit_number,
        expiration_date: p.expiration_date,
        status: p.status,
        project_name: p.projects?.name || null,
      })),
    in_60_days: withExpiry
      .filter((p: any) => p.expiration_date > datePlus(30) && p.expiration_date <= datePlus(60))
      .map((p: any) => ({
        id: p.id,
        permit_type: p.permit_type,
        permit_number: p.permit_number,
        expiration_date: p.expiration_date,
        status: p.status,
        project_name: p.projects?.name || null,
      })),
    in_90_days: withExpiry
      .filter((p: any) => p.expiration_date > datePlus(60) && p.expiration_date <= datePlus(90))
      .map((p: any) => ({
        id: p.id,
        permit_type: p.permit_type,
        permit_number: p.permit_number,
        expiration_date: p.expiration_date,
        status: p.status,
        project_name: p.projects?.name || null,
      })),
  };

  // Inspections pass/fail
  const { data: inspectionRows } = await supabase
    .from("inspections")
    .select("id, result, status, project_id")
    .eq("organization_id", orgId);

  const insp = inspectionRows || [];
  const passed = insp.filter((i: any) => i.result === "passed").length;
  const failed = insp.filter((i: any) => i.result === "failed").length;
  const follow_up_required = insp.filter((i: any) => i.result === "follow_up_required").length;
  const decided = passed + failed;
  const inspections = {
    total: insp.length,
    passed,
    failed,
    follow_up_required,
    pass_rate_pct: decided > 0 ? Math.round((passed / decided) * 100) : null,
  };

  // Per-project breakdown
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name");

  const per_project = (projects || []).map((proj: any) => {
    const projPermits = (permits || []).filter((p: any) => p.project_id === proj.id);
    const projInspections = insp.filter((i: any) => i.project_id === proj.id);
    return {
      project_id: proj.id,
      project_name: proj.name,
      permits_total: projPermits.length,
      permits_expired: projPermits.filter((p: any) => p.status === "expired").length,
      inspections_total: projInspections.length,
      inspections_failed: projInspections.filter((i: any) => i.result === "failed").length,
    };
  });

  return {
    generated_at: new Date().toISOString(),
    permits_by_status,
    expiring,
    inspections,
    per_project,
  };
}

export function summaryToCsv(summary: ReportSummary): string {
  const lines: string[] = [];
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  lines.push("Section,Metric,Value");
  for (const [status, count] of Object.entries(summary.permits_by_status)) {
    lines.push(["Permits by status", status, count].map(esc).join(","));
  }
  lines.push(["Inspections", "total", summary.inspections.total].map(esc).join(","));
  lines.push(["Inspections", "passed", summary.inspections.passed].map(esc).join(","));
  lines.push(["Inspections", "failed", summary.inspections.failed].map(esc).join(","));
  lines.push(["Inspections", "follow_up_required", summary.inspections.follow_up_required].map(esc).join(","));
  lines.push(["Inspections", "pass_rate_pct", summary.inspections.pass_rate_pct ?? "n/a"].map(esc).join(","));

  lines.push("");
  lines.push("Expiring permits");
  lines.push(["Bucket", "Permit", "Number", "Expiration", "Project"].map(esc).join(","));
  const buckets: [string, any[]][] = [
    ["30 days", summary.expiring.in_30_days],
    ["60 days", summary.expiring.in_60_days],
    ["90 days", summary.expiring.in_90_days],
  ];
  for (const [bucket, rows] of buckets) {
    for (const r of rows) {
      lines.push([bucket, r.permit_type, r.permit_number, r.expiration_date, r.project_name].map(esc).join(","));
    }
  }

  lines.push("");
  lines.push("Per-project breakdown");
  lines.push(["Project", "Permits total", "Permits expired", "Inspections total", "Inspections failed"].map(esc).join(","));
  for (const p of summary.per_project) {
    lines.push([p.project_name, p.permits_total, p.permits_expired, p.inspections_total, p.inspections_failed].map(esc).join(","));
  }

  return lines.join("\n");
}
