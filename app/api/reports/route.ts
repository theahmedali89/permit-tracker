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

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const orgId = await getOrgId(supabase, user.id);
  if (!orgId) redirect("/onboarding");

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "expiring";

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
    return Response.json({ report: "expiring_90_days", data });
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

    const summary = {
      permits: {
        total: permits?.length || 0,
        active: permits?.filter((p: any) => p.status === "active").length || 0,
        expiring_soon: permits?.filter((p: any) => p.status === "expiring_soon").length || 0,
        expired: permits?.filter((p: any) => p.status === "expired").length || 0,
      },
      licenses: {
        total: licenses?.length || 0,
        active: licenses?.filter((l: any) => l.status === "active").length || 0,
        expiring_soon: licenses?.filter((l: any) => l.status === "expiring_soon").length || 0,
        expired: licenses?.filter((l: any) => l.status === "expired").length || 0,
      },
    };
    return Response.json({ report: "compliance_summary", data: summary });
  }

  return Response.json({ error: "Invalid report type" }, { status: 400 });
}
