// Thin route: report logic lives in lib/features/reports.
// Auth failures still redirect (this is a browser-facing GET, not a
// JSON API), exactly as before.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/shared/http";
import { getActiveOrgId } from "@/lib/shared/org-context";
import { getReport } from "@/lib/features/reports";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const orgId = await getActiveOrgId(supabase, user.id);
  if (!orgId) redirect("/onboarding");

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "expiring";

  try {
    const report = await getReport(supabase, orgId, type);
    return Response.json(report);
  } catch (err) {
    const res = errorResponse(err);
    if (res) return res;
    throw err;
  }
}
