import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import { buildRiskReport } from "@/lib/features/risk-report";
import { PrintButton } from "./_print-button";

function fmt(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function RiskReportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");
  const orgName = (membership as any).organizations?.name ?? "Your organization";
  const report = await buildRiskReport(supabase, membership.organization_id, orgName);

  return (
    <AppShell>
      {/* Print CSS: only the report prints; nav + buttons are hidden. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #risk-report, #risk-report * { visibility: visible; }
          #risk-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="risk-report">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <Link href="/reports" className="no-print text-sm text-blue-600 hover:text-blue-500">
              ← Back to Reports
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              Permit Expiry Risk Report
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {report.orgName} · Generated{" "}
              {new Date(report.generatedAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <PrintButton />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">At-risk permits</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{report.atRiskPermits.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Failed inspections</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{report.failedInspections.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Non-compliant subs</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{report.nonCompliantSubs.length}</p>
          </Card>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-1">At-risk permits</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Weekly $ exposure is shown only where a city publishes a daily
            fine schedule; otherwise it is &ldquo;unknown&rdquo;.{" "}
            {report.atRiskPermits.length > 0 && report.totalWeeklyExposureUsd > 0 && (
              <>Known weekly exposure: <strong>${report.totalWeeklyExposureUsd.toLocaleString("en-US")}/week</strong>. </>
            )}
            {!report.exposureFullyKnown && "Some permits have unknown exposure — check their AHJ fine schedule."}
          </p>
          {report.atRiskPermits.length === 0 ? (
            <p className="text-sm text-gray-500">No expired or expiring-soon permits. All clear.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4">Permit</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Expires</th>
                  <th className="py-2 pr-4">Jurisdiction</th>
                  <th className="py-2">$ exposure</th>
                </tr>
              </thead>
              <tbody>
                {report.atRiskPermits.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">
                      {p.permitType}
                      {p.permitNumber ? ` — ${p.permitNumber}` : ""}
                      <span className="block text-xs text-gray-500">{p.projectName ?? "No project"}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <Badge color={p.status === "expired" ? "red" : "yellow"}>{p.status}</Badge>
                    </td>
                    <td className="py-2 pr-4">{fmt(p.expirationDate)}</td>
                    <td className="py-2 pr-4">{p.jurisdiction ?? "—"}</td>
                    <td className="py-2">{p.exposureLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Failed inspections</h2>
          {report.failedInspections.length === 0 ? (
            <p className="text-sm text-gray-500">No failed inspections.</p>
          ) : (
            <div className="space-y-3">
              {report.failedInspections.map((i) => (
                <div key={i.id} className="text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                  <p className="font-medium capitalize">{i.inspectionType} inspection — {i.projectName ?? "No project"}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Scheduled {fmt(i.scheduledDate)}
                    {i.reinspectionDate ? ` · Re-inspection ${fmt(i.reinspectionDate)}` : " · No re-inspection booked"}
                  </p>
                  {i.correctionNotes && <p className="mt-1 text-gray-700 dark:text-gray-300">{i.correctionNotes}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Non-compliant subcontractors</h2>
          {report.nonCompliantSubs.length === 0 ? (
            <p className="text-sm text-gray-500">All subcontractors are compliant.</p>
          ) : (
            <div className="space-y-3">
              {report.nonCompliantSubs.map((s) => (
                <div key={s.id} className="text-sm border-b border-gray-100 dark:border-gray-800 pb-3">
                  <p className="font-medium">
                    {s.name}
                    {s.trade ? ` (${s.trade})` : ""} —{" "}
                    <span className="text-red-600 dark:text-red-400">{s.label}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    License expires {fmt(s.licenseExpiration)} · COI expires {fmt(s.coiExpiration)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
