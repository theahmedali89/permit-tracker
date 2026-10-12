import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

async function getOrgId(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .single();
  return data?.organization_id;
}

function toCSV(rows: any[], headers: string[]): string {
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
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

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) redirect("/onboarding");

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "permits";

  let csv = "";
  let filename = "";

  if (type === "permits") {
    const { data } = await supabase
      .from("permits")
      .select("permit_type,permit_number,issuing_authority,jurisdiction,issue_date,expiration_date,renewal_deadline,status,notes")
      .eq("organization_id", orgId)
      .order("expiration_date");
    csv = toCSV(data || [], ["permit_type", "permit_number", "issuing_authority", "jurisdiction", "issue_date", "expiration_date", "renewal_deadline", "status", "notes"]);
    filename = "permits-export.csv";
  } else if (type === "licenses") {
    const { data } = await supabase
      .from("licenses")
      .select("license_name,license_number,issuing_authority,state,issue_date,expiration_date,renewal_date,status,notes")
      .eq("organization_id", orgId)
      .order("expiration_date");
    csv = toCSV(data || [], ["license_name", "license_number", "issuing_authority", "state", "issue_date", "expiration_date", "renewal_date", "status", "notes"]);
    filename = "licenses-export.csv";
  } else if (type === "projects") {
    const { data } = await supabase
      .from("projects")
      .select("name,customer,address,city,state,zip,project_type,start_date,expected_completion,status,notes")
      .eq("organization_id", orgId)
      .order("created_at");
    csv = toCSV(data || [], ["name", "customer", "address", "city", "state", "zip", "project_type", "start_date", "expected_completion", "status", "notes"]);
    filename = "projects-export.csv";
  } else {
    return new Response("Invalid type", { status: 400 });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${filename}`,
    },
  });
}
