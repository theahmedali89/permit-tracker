import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";

/* ── Inline SVG icons (no emoji) ── */

function Icon({ path, className = "w-5 h-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  shield: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  alert: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z",
  calendar: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  check: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  doc: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  arrow: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
};

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: string;
  tone: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    info: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${tones[tone]}`}>
          <Icon path={icon} className="w-4.5 h-4.5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
    </Card>
  );
}

function daysUntil(dateStr: string) {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function deadlineLabel(d: { deadline_type: string; resource_type: string }) {
  const typeLabels: Record<string, string> = {
    expiration: "Expiration",
    renewal: "Renewal",
    inspection: "Inspection",
    document_expiration: "Document expiry",
  };
  const resourceLabels: Record<string, string> = {
    permit: "Permit",
    license: "License",
    inspection: "Inspection",
    document: "Document",
  };
  return `${typeLabels[d.deadline_type] ?? d.deadline_type} · ${resourceLabels[d.resource_type] ?? d.resource_type}`;
}

export default async function DashboardPage() {
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

  const orgId = membership.organization_id;
  const orgName = (membership as any).organizations?.name ?? "Your organization";

  const [{ count: activeCount }, { count: pendingCount }, { count: expiringCount }, { count: expiredCount }] =
    await Promise.all([
      supabase.from("permits").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active"),
      supabase.from("permits").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "pending"),
      supabase.from("permits").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "expiring_soon"),
      supabase.from("permits").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "expired"),
    ]);

  const { data: actionItems } = await supabase
    .from("permits")
    .select("id, permit_type, permit_number, expiration_date, status, projects(name)")
    .eq("organization_id", orgId)
    .in("status", ["expired", "expiring_soon"])
    .order("expiration_date", { ascending: true })
    .limit(8);

  const { data: upcoming } = await supabase
    .from("deadlines")
    .select("id, deadline_type, resource_type, due_date, status")
    .eq("organization_id", orgId)
    .eq("status", "pending")
    .gte("due_date", new Date().toISOString().split("T")[0])
    .order("due_date", { ascending: true })
    .limit(8);

  const totalPermits = (activeCount || 0) + (pendingCount || 0) + (expiringCount || 0) + (expiredCount || 0);
  const atRisk = (expiringCount || 0) + (expiredCount || 0);
  const compliance = totalPermits > 0 ? Math.round(((totalPermits - atRisk) / totalPermits) * 100) : 100;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{orgName}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Compliance Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Compliance health
            </p>
            <p className={`text-2xl font-semibold ${compliance >= 90 ? "text-emerald-600 dark:text-emerald-400" : compliance >= 70 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>
              {compliance}%
            </p>
          </div>
          <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full ${compliance >= 90 ? "bg-emerald-500" : compliance >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
              style={{ width: `${compliance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active permits" value={(activeCount || 0) + (pendingCount || 0)} icon={ICONS.shield} tone="success" />
        <StatCard label="Expiring soon" value={expiringCount || 0} icon={ICONS.clock} tone="warning" />
        <StatCard label="Expired" value={expiredCount || 0} icon={ICONS.alert} tone="danger" />
        <StatCard label="Upcoming deadlines" value={upcoming?.length || 0} icon={ICONS.calendar} tone="info" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Action required */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Requires attention
            </h2>
            <Link href="/permits" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 inline-flex items-center gap-1">
              View all permits <Icon path={ICONS.arrow} className="w-3.5 h-3.5" />
            </Link>
          </div>
          {!actionItems || actionItems.length === 0 ? (
            <Card className="p-8 text-center">
              <span className="mx-auto mb-3 inline-flex items-center justify-center w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Icon path={ICONS.check} className="w-5 h-5" />
              </span>
              <p className="font-medium text-gray-900 dark:text-white">All clear</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No permits are expired or expiring soon.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {actionItems.map((permit: any) => {
                const days = permit.expiration_date ? daysUntil(permit.expiration_date) : null;
                const isExpired = permit.status === "expired";
                return (
                  <Link
                    key={permit.id}
                    href={`/permits/${permit.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className={`shrink-0 w-1 self-stretch rounded-full ${isExpired ? "bg-rose-500" : "bg-amber-500"}`} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {permit.permit_type}
                        {permit.permit_number && (
                          <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">
                            {permit.permit_number}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {permit.projects?.name ?? "No project"}
                        {permit.expiration_date && (
                          <> · {isExpired ? "Expired" : "Expires"} {formatDate(permit.expiration_date)}</>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge color={isExpired ? "red" : "yellow"}>
                        {isExpired ? "Expired" : "Expiring soon"}
                      </Badge>
                      {days !== null && (
                        <p className={`mt-1 text-xs font-medium ${isExpired ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                          {isExpired ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </Card>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Upcoming deadlines
            </h2>
            <Link href="/calendar" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 inline-flex items-center gap-1">
              Calendar <Icon path={ICONS.arrow} className="w-3.5 h-3.5" />
            </Link>
          </div>
          {!upcoming || upcoming.length === 0 ? (
            <Card className="p-6 text-center">
              <span className="mx-auto mb-3 inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Icon path={ICONS.calendar} />
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming deadlines scheduled.
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {upcoming.map((d: any) => {
                const days = daysUntil(d.due_date);
                const urgent = days <= 7;
                return (
                  <div key={d.id} className="flex items-center gap-3 p-4">
                    <div className={`shrink-0 w-11 text-center rounded-lg py-1.5 ${urgent ? "bg-rose-50 dark:bg-rose-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                      <p className={`text-lg font-semibold leading-none ${urgent ? "text-rose-600 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}>
                        {new Date(d.due_date).getDate()}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {new Date(d.due_date).toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {deadlineLabel(d)}
                      </p>
                      <p className={`text-xs mt-0.5 ${urgent ? "text-rose-600 dark:text-rose-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                        {days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `In ${days} days`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </Card>
          )}

          {/* Documents expiring note */}
          <Card className="mt-6 p-4">
            <div className="flex gap-3">
              <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <Icon path={ICONS.doc} className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Document expiries</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Documents and subcontractor certificates with expiry dates now generate
                  automatic reminders alongside permit deadlines.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
