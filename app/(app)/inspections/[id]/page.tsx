import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import { InspectionActions } from "./actions";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: inspection } = await supabase
    .from("inspections")
    .select("*, projects(name), permits(permit_type, permit_number)")
    .eq("id", id)
    .single();

  if (!inspection) notFound();

  const statusColor =
    inspection.status === "passed" ? "green"
    : inspection.status === "failed" ? "red"
    : inspection.status === "scheduled" ? "blue" : "yellow";

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/inspections" className="text-sm text-blue-600 hover:text-blue-500">
          ← Back to Inspections
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 capitalize">
          {inspection.inspection_type} Inspection
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Status</dt>
              <dd><Badge color={statusColor}>{inspection.status}</Badge></dd>
            </div>
            {inspection.projects && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Project</dt>
                <dd className="text-sm font-medium">{inspection.projects.name}</dd>
              </div>
            )}
            {inspection.permits && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Permit</dt>
                <dd className="text-sm">{inspection.permits.permit_type}{inspection.permits.permit_number && ` - ${inspection.permits.permit_number}`}</dd>
              </div>
            )}
            {inspection.inspector_name && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Inspector</dt>
                <dd className="text-sm">{inspection.inspector_name}</dd>
              </div>
            )}
            {inspection.scheduled_date && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600 dark:text-gray-400">Scheduled</dt>
                <dd className="text-sm">{new Date(inspection.scheduled_date).toLocaleDateString()}</dd>
              </div>
            )}
            {inspection.notes && (
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</dt>
                <dd className="text-sm">{inspection.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <div className="space-y-6">
          <InspectionActions inspection={inspection} />

          {inspection.status === "failed" && (
            <Card className="p-6 border-red-200 dark:border-red-800">
              <h2 className="text-lg font-semibold mb-4 text-red-700 dark:text-red-400">Correction Required</h2>
              {inspection.correction_notes && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Correction Notes</p>
                  <p className="text-sm">{inspection.correction_notes}</p>
                </div>
              )}
              {inspection.reinspection_date && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Re-inspection Date</p>
                  <p className="text-sm font-medium">{new Date(inspection.reinspection_date).toLocaleDateString()}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
