// Reports — feature (pass 2 modularity).
//
// The simple report endpoints moved verbatim from
// `app/api/reports/route.ts`: the route is now thin (auth + redirect
// handling, then one feature call). Behaviour is identical: same
// "expiring" 90-day window, same compliance tallies, same
// "Invalid report type" 400. (The richer compliance summary lives in
// `lib/shared/reports.ts` and is served by /api/reports/summary.)

import { ApiError } from "@/lib/shared/http";

export type ReportType = "expiring" | "compliance";

/** Tally a status column the way the compliance report does. */
export function tallyReportStatuses(rows: { status: string }[] | null | undefined) {
  const list = rows || [];
  return {
    total: list.length,
    active: list.filter((r) => r.status === "active").length || 0,
    expiring_soon: list.filter((r) => r.status === "expiring_soon").length || 0,
    expired: list.filter((r) => r.status === "expired").length || 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getReport(supabase: any, orgId: string, type: string): Promise<{ report: string; data: unknown }> {
  if (type === "expiring") {
    // Permits expiring in next 90 days
    const future = new Date();
    future.setDate(future.getDate() + 90);
    const { data } = await supabase
      .from("permits")
      .select("permit_type,permit_number,expiration_date,status,projects(name)")
      .eq("organization_id", orgId)
      .lte("expiration_date", future.toISOString().split("T")[0])
      .gte("expiration_date", new Date().toISOString().split("T")[0])
      .order("expiration_date");
    return { report: "expiring_90_days", data };
  }

  if (type === "compliance") {
    // Compliance summary
    const { data: permits } = await supabase
      .from("permits")
      .select("status")
      .eq("organization_id", orgId);

    const { data: licenses } = await supabase
      .from("licenses")
      .select("status")
      .eq("organization_id", orgId);

    return {
      report: "compliance_summary",
      data: {
        permits: tallyReportStatuses(permits),
        licenses: tallyReportStatuses(licenses),
      },
    };
  }

  throw new ApiError(400, "Invalid report type");
}
