// Thin route: CSV export logic lives in lib/features/export.
// Auth failures still redirect (browser-facing GET), exactly as before.
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/shared/http";
import { getActiveOrgId } from "@/lib/shared/org-context";
import { buildCsvExport } from "@/lib/features/export";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const orgId = await getActiveOrgId(supabase, user.id);
  if (!orgId) redirect("/onboarding");

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "permits";

  try {
    const { csv, filename } = await buildCsvExport(supabase, orgId, type);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (err) {
    // The old route answered "Invalid type" as a plain-text 400.
    if (err instanceof ApiError) {
      return new Response(err.message, { status: err.status });
    }
    throw err;
  }
}
