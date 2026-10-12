import { createClient } from "@/lib/supabase/server";
import { calculatePermitStatus } from "@/lib/permit-status";
import { NextRequest, NextResponse } from "next/server";

async function getOrgId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.organization_id;
}

// Expected CSV columns: permit_type, permit_number, issuing_authority, jurisdiction, issue_date, expiration_date, renewal_deadline, notes
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const lines = text.trim().split("\n");
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV is empty or has no data rows" }, { status: 400 });
  }

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
  const required = ["permit_type"];
  for (const r of required) {
    if (!headers.includes(r)) {
      return NextResponse.json({ error: `Missing required column: ${r}` }, { status: 400 });
    }
  }

  const results = { imported: 0, errors: [] as string[] };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

    if (!row.permit_type) {
      results.errors.push(`Row ${i + 1}: missing permit_type, skipped`);
      continue;
    }

    try {
      const status = calculatePermitStatus(row.expiration_date || null, row.renewal_deadline || null);

      const { data: permit, error } = await supabase
        .from("permits")
        .insert({
          organization_id: orgId,
          permit_type: row.permit_type,
          permit_number: row.permit_number || null,
          issuing_authority: row.issuing_authority || null,
          jurisdiction: row.jurisdiction || null,
          issue_date: row.issue_date || null,
          expiration_date: row.expiration_date || null,
          renewal_deadline: row.renewal_deadline || null,
          notes: row.notes || null,
          status,
          source_type: "user_provided",
        })
        .select()
        .single();

      if (error) throw error;

      if (row.expiration_date) {
        await supabase.from("deadlines").insert({
          organization_id: orgId,
          resource_type: "permit",
          resource_id: permit.id,
          deadline_type: "expiration",
          due_date: row.expiration_date,
        });
      }

      results.imported++;
    } catch (err: any) {
      results.errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: user.id,
    action: "permits.csv_imported",
    entity_type: "permit",
    metadata: { imported: results.imported, errors: results.errors.length },
  });

  return NextResponse.json(results);
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
