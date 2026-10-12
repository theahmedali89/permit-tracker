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

export default async function PermitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
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

  const params = await searchParams;
  const statusFilter = params.status || "";
  const searchQuery = params.search || "";

  let query = supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", membership.organization_id)
    .order("expiration_date", { ascending: true });

  if (statusFilter) query = query.eq("status", statusFilter);
  if (searchQuery) query = query.or(`permit_number.ilike.%${searchQuery}%,permit_type.ilike.%${searchQuery}%`);

  const { data: permits } = await query;

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permits</h1>
        <div className="flex gap-2">
          <a href="/api/export?type=permits" className="px-3 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            📥 Export CSV
          </a>
          <Link href="/permits/new">
            <Button>Add Permit</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search permits..."
          defaultValue={searchQuery}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
          <option value="closed">Closed</option>
        </select>
        <button type="submit" className="px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">
          Filter
        </button>
        {(statusFilter || searchQuery) && (
          <a href="/permits" className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700">
            Clear
          </a>
        )}
      </form>

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
