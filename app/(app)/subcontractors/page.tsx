import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import { complianceStatus } from "@/lib/subcontractor-compliance";
import Link from "next/link";

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

  // All license/COI documents for the org, grouped by subcontractor
  const { data: allDocs } = await supabase
    .from("subcontractor_documents")
    .select("subcontractor_id, doc_type, expiration_date")
    .eq("organization_id", membership.organization_id);

  const docsBySub: Record<string, any[]> = {};
  for (const d of allDocs || []) {
    (docsBySub[d.subcontractor_id] ||= []).push(d);
  }

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
            const comp = complianceStatus(sub, docsBySub[sub.id] || []);
            return (
              <Link key={sub.id} href={`/subcontractors/${sub.id}`}>
                <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
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
                    {(docsBySub[sub.id] || []).length > 0 && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {(docsBySub[sub.id] || []).length} document{(docsBySub[sub.id] || []).length > 1 ? "s" : ""} on file
                      </p>
                    )}
                    {sub.phone && (
                      <p className="text-gray-600 dark:text-gray-400">{sub.phone}</p>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
