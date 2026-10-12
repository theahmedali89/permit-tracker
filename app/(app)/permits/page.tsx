import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";

const statusColors: Record<string, "green" | "yellow" | "red" | "gray" | "blue"> = {
  active: "green",
  expiring_soon: "yellow",
  expired: "red",
  pending: "gray",
  renewal_required: "yellow",
  closed: "gray",
};

export default async function PermitsPage() {
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

  const { data: permits } = await supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", membership.organization_id)
    .order("expiration_date", { ascending: true });

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permits</h1>
        <Link href="/permits/new">
          <Button>Add Permit</Button>
        </Link>
      </div>

      {!permits || permits.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No permits yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first permit to start tracking expiration dates and renewal deadlines.
          </p>
          <Link href="/permits/new">
            <Button>Add Permit</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {permits.map((permit: any) => (
            <Link key={permit.id} href={`/permits/${permit.id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {permit.permit_type}
                      {permit.permit_number && ` - ${permit.permit_number}`}
                    </h3>
                    {permit.projects && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {permit.projects.name}
                      </p>
                    )}
                    {permit.expiration_date && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Expires: {new Date(permit.expiration_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge color={statusColors[permit.status] || "gray"}>
                    {permit.status.replace("_", " ")}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
