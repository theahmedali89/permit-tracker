import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge, Button } from "@/components/ui";
import Link from "next/link";

const statusColors: Record<string, "green" | "yellow" | "red" | "gray" | "blue"> = {
  not_scheduled: "gray",
  scheduled: "blue",
  passed: "green",
  failed: "red",
  follow_up_required: "yellow",
  completed: "green",
};

export default async function InspectionsPage() {
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

  const { data: inspections } = await supabase
    .from("inspections")
    .select("*, projects(name)")
    .eq("organization_id", membership.organization_id)
    .order("scheduled_date", { ascending: true });

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inspections</h1>
        <Link href="/inspections/new">
          <Button>Schedule Inspection</Button>
        </Link>
      </div>

      {!inspections || inspections.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No inspections yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Schedule your first inspection to track it here.
          </p>
          <Link href="/inspections/new">
            <Button>Schedule Inspection</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp: any) => (
            <Card key={insp.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {insp.inspection_type}
                  </h3>
                  {insp.projects && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {insp.projects.name}
                    </p>
                  )}
                  {insp.scheduled_date && (
                    <p className="text-sm text-gray-500 mt-1">
                      Scheduled: {new Date(insp.scheduled_date).toLocaleDateString()}
                    </p>
                  )}
                  {insp.inspector_name && (
                    <p className="text-sm text-gray-500">Inspector: {insp.inspector_name}</p>
                  )}
                </div>
                <Badge color={statusColors[insp.status] || "gray"}>
                  {insp.status.replace("_", " ")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
