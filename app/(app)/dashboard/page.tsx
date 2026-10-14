import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";

export default async function DashboardPage() {
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

  const orgId = membership.organization_id;

  // Get counts
  const { count: activeCount } = await supabase
    .from("permits")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "active");

  const { count: pendingCount } = await supabase
    .from("permits")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "pending");

  const { count: expiringCount } = await supabase
    .from("permits")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "expiring_soon");

  const { count: expiredCount } = await supabase
    .from("permits")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "expired");

  // Get action required (expired + expiring soon)
  const { data: actionItems } = await supabase
    .from("permits")
    .select("*, projects(name)")
    .eq("organization_id", orgId)
    .in("status", ["expired", "expiring_soon"])
    .order("expiration_date", { ascending: true })
    .limit(10);

  // Get upcoming deadlines
  const { data: upcoming } = await supabase
    .from("deadlines")
    .select("*")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .gte("due_date", new Date().toISOString().split("T")[0])
    .order("due_date", { ascending: true })
    .limit(10);

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        What needs your attention?
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Permits</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{(activeCount || 0) + (pendingCount || 0)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600">{expiringCount || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
          <p className="text-2xl font-bold text-red-600">{expiredCount || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Deadlines</p>
          <p className="text-2xl font-bold text-blue-600">{upcoming?.length || 0}</p>
        </Card>
      </div>

      {/* Action Required */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Action Required
      </h2>
      {!actionItems || actionItems.length === 0 ? (
        <Card className="p-6 text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            🎉 All clear! No permits need immediate attention.
          </p>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {actionItems.map((permit: any) => (
            <Card key={permit.id} className="p-4">
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
                    <p className="text-sm text-gray-500 mt-1">
                      {permit.status === "expired" ? "Expired" : "Expires"}:{" "}
                      {new Date(permit.expiration_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge color={permit.status === "expired" ? "red" : "yellow"}>
                  {permit.status.replace("_", " ")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming Deadlines */}
      {upcoming && upcoming.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcoming.map((d: any) => (
              <Card key={d.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {d.deadline_type} - {d.resource_type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(d.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge color="blue">{d.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
