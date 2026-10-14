import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";

function complianceStatus(sub: any): { label: string; color: "red" | "yellow" | "blue" | "green" | "gray" } {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  if (sub.status === "inactive") return { label: "Inactive", color: "gray" };
  if ((sub.coi_expiration && sub.coi_expiration < today) ||
      (sub.license_expiration && sub.license_expiration < today)) {
    return { label: "Non-compliant", color: "red" };
  }
  if ((sub.coi_expiration && sub.coi_expiration < thirtyDays) ||
      (sub.license_expiration && sub.license_expiration < thirtyDays)) {
    return { label: "Expiring soon", color: "yellow" };
  }
  return { label: "Compliant", color: "green" };
}

export default async function SubcontractorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/onboarding");

  const { data: subs } = await supabase
    .from("subcontractors")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("name");

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subcontractors</h1>
        <Link href="/subcontractors/new">
          <Button>Add Subcontractor</Button>
        </Link>
      </div>

      {!subs || subs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No subcontractors yet. Track their licenses and insurance here.
          </p>
          <Link href="/subcontractors/new">
            <Button>Add your first subcontractor</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subs.map((sub: any) => {
            const comp = complianceStatus(sub);
            return (
              <Card key={sub.id} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{sub.name}</h3>
                  <Badge color={comp.color}>{comp.label}</Badge>
                </div>
                {sub.trade && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{sub.trade}</p>
                )}
                <div className="space-y-1 text-sm">
                  {sub.license_expiration && (
                    <p className="text-gray-600 dark:text-gray-400">
                      License exp: {new Date(sub.license_expiration).toLocaleDateString()}
                    </p>
                  )}
                  {sub.coi_expiration && (
                    <p className="text-gray-600 dark:text-gray-400">
                      COI exp: {new Date(sub.coi_expiration).toLocaleDateString()}
                    </p>
                  )}
                  {sub.phone && (
                    <p className="text-gray-600 dark:text-gray-400">{sub.phone}</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
