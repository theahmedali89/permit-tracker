import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import { evaluateProjectGate } from "@/lib/features/project-gate";
import { SubcontractorLinks } from "./subcontractor-links";

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

  // Project Gate: stop-work risk from linked non-compliant subcontractors.
  const gate = await evaluateProjectGate(supabase, project.organization_id, id);

  // Subcontractors linked to this project + all org subcontractors
  // (for the link/unlink controls below).
  const { data: linkRows } = await supabase
    .from("project_subcontractors")
    .select("subcontractor_id")
    .eq("organization_id", project.organization_id)
    .eq("project_id", id);
  const linkedIds = (linkRows ?? []).map((r: any) => r.subcontractor_id);
  const { data: allSubs } = await supabase
    .from("subcontractors")
    .select("id, name, trade")
    .eq("organization_id", project.organization_id)
    .order("name");
  const linkedSubs = (allSubs ?? []).filter((s: any) => linkedIds.includes(s.id));

  const statusColor = project.status === "active" ? "green"
    : project.status === "completed" ? "blue"
    : project.status === "on_hold" ? "yellow" : "red";

  return (
    <AppShell>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {project.name}
          </h1>
        </div>
        <Link
          href={`/projects/${id}/edit`}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Edit Project
        </Link>
      </div>

      {gate.atRisk && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20" role="alert">
          <p className="font-semibold text-red-800 dark:text-red-300">
            ⚠ Stop-work risk — a subcontractor on this project is non-compliant
          </p>
          <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-200">
            {gate.risks.map((r) => (
              <li key={r.subcontractorId}>
                <Link href="/subcontractors" className="font-medium underline">
                  {r.name}
                </Link>
                {r.trade ? ` (${r.trade})` : ""} — {r.expiredItems.join("; ")}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-red-600 dark:text-red-300">
            Work with an expired license or COI can void coverage and draw a
            stop-work order. Renew the subcontractor&apos;s documents before
            they work on this project.
          </p>
        </div>
      )}

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
            <h2 className="text-lg font-semibold mb-4">Subcontractors on this project</h2>
            <SubcontractorLinks
              projectId={project.id}
              linked={linkedSubs}
              all={allSubs ?? []}
            />
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
