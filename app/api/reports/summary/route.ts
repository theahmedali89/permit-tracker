// Thin route: the compliance summary itself lives in
// lib/shared/reports.ts (`buildReportSummary` / `summaryToCsv`). The
// only logic this route had was its own duplicate org lookup — now the
// shared `requireAuthOrg` helper. Behaviour unchanged (JSON summary,
// or CSV when ?format=csv).
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { buildReportSummary, summaryToCsv } from "@/lib/shared/reports";
import { runFeature, result, errorResponse } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";

// GET /api/reports/summary — compliance summary (JSON)
// GET /api/reports/summary?format=csv — CSV export
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const asCsv = searchParams.get("format") === "csv";

  // CSV is a raw (non-JSON) response, so it cannot go through
  // runFeature; the auth/JSON path below can.
  if (asCsv) {
    try {
      const { orgId } = await requireAuthOrg(supabase);
      const summary = await buildReportSummary(supabase, orgId);
      const csv = summaryToCsv(summary);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="compliance-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    } catch (err) {
      // requireAuthOrg throws ApiError(401/400) — same JSON shape as before.
      const res = errorResponse(err);
      if (res) return res;
      throw err;
    }
  }

  return runFeature(async () => {
    const { orgId } = await requireAuthOrg(supabase);
    return result(200, await buildReportSummary(supabase, orgId));
  });
}
