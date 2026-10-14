import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: permits } = await supabase
    .from("permits")
    .select("id, permit_type, permit_number, status, expiration_date")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: inspections } = await supabase
    .from("inspections")
    .select("id, inspection_type, status, scheduled_date")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const statusColor = project.status === "active" ? "green"
    : project.status === "completed" ? "blue"
    : project.status === "on_hold" ? "yellow" : "red";

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Projects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {project.name}
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
              <dd><Badge color={statusColor}>{project.status}</Badge></dd>
            </div>
            {project.customer && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Client</dt>
                <dd className="text-sm font-medium">{project.customer}</dd>
              </div>
            )}
            {project.address && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Address</dt>
                <dd className="text-sm text-right">
                  {project.address}
                  {project.city && `, ${project.city}`}
                  {project.state && ` ${project.state}`}
                  {project.zip && ` ${project.zip}`}
                </dd>
              </div>
            )}
            {project.project_type && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Type</dt>
                <dd className="text-sm">{project.project_type}</dd>
              </div>
            )}
            {project.start_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Start Date</dt>
                <dd className="text-sm">{new Date(project.start_date).toLocaleDateString()}</dd>
              </div>
            )}
            {project.expected_completion && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Expected Completion</dt>
                <dd className="text-sm">{new Date(project.expected_completion).toLocaleDateString()}</dd>
              </div>
            )}
            {project.notes && (
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</dt>
                <dd className="text-sm">{project.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Permits</h2>
              <Link href={`/permits/new?project=${project.id}`} className="text-sm text-blue-600 hover:text-blue-500">
                + Add Permit
              </Link>
            </div>
            {!permits || permits.length === 0 ? (
              <p className="text-sm text-gray-500">No permits for this project</p>
            ) : (
              <div className="space-y-2">
                {permits.map((p: any) => (
                  <Link key={p.id} href={`/permits/${p.id}`} className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {p.permit_type}{p.permit_number && ` - ${p.permit_number}`}
                      </span>
                      <Badge color={p.status === "active" ? "green" : p.status === "expired" ? "red" : "yellow"}>
                        {p.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Inspections</h2>
            {!inspections || inspections.length === 0 ? (
              <p className="text-sm text-gray-500">No inspections for this project</p>
            ) : (
              <div className="space-y-2">
                {inspections.map((i: any) => (
                  <div key={i.id} className="flex justify-between text-sm p-2">
                    <span className="capitalize">{i.inspection_type}</span>
                    <Badge color={i.status === "passed" ? "green" : i.status === "failed" ? "red" : "yellow"}>
                      {i.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
