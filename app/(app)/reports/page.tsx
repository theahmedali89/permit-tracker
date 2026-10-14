import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import { buildReportSummary } from "@/lib/reports";

export default async function ReportsPage() {
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

  const summary = await buildReportSummary(supabase, membership.organization_id);

  const statusColor = (s: string) =>
    s === "active" ? "green"
    : s === "expired" ? "red"
    : s === "expiring_soon" ? "yellow"
    : s === "pending" ? "blue" : "gray";

  const buckets: [string, any[], string][] = [
    ["Expiring in 30 days", summary.expiring.in_30_days, "red"],
    ["Expiring in 31–60 days", summary.expiring.in_60_days, "yellow"],
    ["Expiring in 61–90 days", summary.expiring.in_90_days, "blue"],
  ];

  return (
    <AppShell>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Report</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Generated {new Date(summary.generated_at).toLocaleString()}
          </p>
        </div>
        <a
          href="/api/reports/summary?format=csv"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          ⬇ Export CSV
        </a>
      </div>

      <div className="space-y-6">
        {/* Permits by status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Permits by Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(summary.permits_by_status).length === 0 && (
              <p className="text-sm text-gray-500">No permits yet.</p>
            )}
            {Object.entries(summary.permits_by_status).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <Badge color={statusColor(status) as any}>{status}</Badge>
                <span className="text-lg font-bold">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Expiring buckets */}
        {buckets.map(([title, rows, color]) => (
          <Card key={title} className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {title} <Badge color={color as any}>{rows.length}</Badge>
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-500">None.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 pr-4">Permit</th>
                      <th className="py-2 pr-4">Number</th>
                      <th className="py-2 pr-4">Expires</th>
                      <th className="py-2 pr-4">Project</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-4">
                          <Link href={`/permits/${r.id}`} className="text-blue-600 hover:text-blue-500">
                            {r.permit_type}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">{r.permit_number || "—"}</td>
                        <td className="py-2 pr-4">{r.expiration_date}</td>
                        <td className="py-2 pr-4">{r.project_name || "—"}</td>
                        <td className="py-2"><Badge color={statusColor(r.status) as any}>{r.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}

        {/* Inspections */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inspections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{summary.inspections.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Passed</p>
              <p className="text-2xl font-bold text-green-600">{summary.inspections.passed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{summary.inspections.failed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Follow-up</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.inspections.follow_up_required}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pass rate</p>
              <p className="text-2xl font-bold">
                {summary.inspections.pass_rate_pct === null ? "—" : `${summary.inspections.pass_rate_pct}%`}
              </p>
            </div>
          </div>
        </Card>

        {/* Per-project breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Per-Project Breakdown
          </h2>
          {summary.per_project.length === 0 ? (
            <p className="text-sm text-gray-500">No projects yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">Permits</th>
                    <th className="py-2 pr-4">Expired</th>
                    <th className="py-2 pr-4">Inspections</th>
                    <th className="py-2">Failed</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.per_project.map((p) => (
                    <tr key={p.project_id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4">
                        <Link href={`/projects/${p.project_id}`} className="text-blue-600 hover:text-blue-500">
                          {p.project_name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{p.permits_total}</td>
                      <td className="py-2 pr-4">
                        {p.permits_expired > 0
                          ? <Badge color="red">{p.permits_expired}</Badge>
                          : "0"}
                      </td>
                      <td className="py-2 pr-4">{p.inspections_total}</td>
                      <td className="py-2">
                        {p.inspections_failed > 0
                          ? <Badge color="red">{p.inspections_failed}</Badge>
                          : "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
