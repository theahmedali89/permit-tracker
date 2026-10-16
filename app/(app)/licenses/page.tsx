import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { LicenseEditButton } from "./license-edit-button";

const statusColors: Record<string, "green" | "yellow" | "red" | "gray" | "blue"> = {
  active: "green",
  expiring_soon: "yellow",
  expired: "red",
  pending: "gray",
  renewal_required: "yellow",
  closed: "gray",
};

export default async function LicensesPage() {
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

  const { data: licenses } = await supabase
    .from("licenses")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .order("expiration_date", { ascending: true });

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Licenses</h1>
        <Link href="/licenses/new">
          <Button>Add License</Button>
        </Link>
      </div>

      {!licenses || licenses.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No licenses yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your contractor licenses to track renewal deadlines.
          </p>
          <Link href="/licenses/new">
            <Button>Add License</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {licenses.map((license: any) => (
            <Card key={license.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {license.license_name}
                    {license.license_number && ` - ${license.license_number}`}
                  </h3>
                  {license.issuing_authority && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {license.issuing_authority}
                    </p>
                  )}
                  {license.expiration_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Expires: {new Date(license.expiration_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <Badge color={statusColors[license.status] || "gray"}>
                    {license.status.replace("_", " ")}
                  </Badge>
                  <LicenseEditButton license={license} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
