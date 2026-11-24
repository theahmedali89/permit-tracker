// Thin route: CSV import logic lives in lib/features/import.
// The GET template endpoint stays here (3 lines, no business logic).
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";
import { runFeature } from "@/lib/shared/http";
import { requireAuthOrg } from "@/lib/shared/route-helpers";
import { importPermitsCsv } from "@/lib/features/import";

// Expected CSV columns: permit_type, permit_number, issuing_authority, jurisdiction, issue_date, expiration_date, renewal_deadline, notes
export async function POST(request: NextRequest) {
  try {
    requireFeatureEnabled("import");
  } catch (err) {
    if (err instanceof FeatureDisabledError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const supabase = await createClient();
  return runFeature(async () => {
    const { user, orgId } = await requireAuthOrg(supabase);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    return importPermitsCsv(supabase, orgId, user.id, file);
  });
}

// GET: Download CSV template
export async function GET() {
  const template = "permit_type,permit_number,issuing_authority,jurisdiction,issue_date,expiration_date,renewal_deadline,notes\nBuilding,2026-001,City of Austin,\"Austin, TX\",2026-01-15,2026-07-15,2026-06-15,Sample permit\n";
  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=permit-import-template.csv",
    },
  });
}
