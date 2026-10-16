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
  plus: "M12 4.5v15m7.5-7.5h-15",
  user: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  briefcase: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.114 48.114 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0",
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

/* ── Quick actions ── */

const QUICK_ACTIONS = [
  { label: "New permit", hint: "Track a new permit", href: "/permits/new", icon: "doc", tone: "info" },
  { label: "Schedule inspection", hint: "Book an inspection", href: "/inspections/new", icon: "calendar", tone: "success" },
  { label: "Add license", hint: "Track a new license", href: "/licenses/new", icon: "shield", tone: "warning" },
  { label: "Add subcontractor", hint: "Onboard a sub", href: "/subcontractors/new", icon: "user", tone: "neutral" },
] as const;

const QA_TONES: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  info: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
};

/* ── Recent activity ── */

const ACTIVITY_LABELS: Record<string, string> = {
  "project.created": "Project created",
  "project.updated": "Project updated",
  "permit.created": "Permit added",
  "permit.updated": "Permit updated",
  "permits.csv_imported": "Permits imported from CSV",
  "license.created": "License added",
  "license.updated": "License updated",
  "inspection.created": "Inspection scheduled",
  "document.uploaded": "Document uploaded",
  "subcontractor.created": "Subcontractor added",
  "subcontractor_document.uploaded": "Subcontractor document uploaded",
  "subcontractor_document.deleted": "Subcontractor document deleted",
  "subcontractor_invite.sent": "Subcontractor invite sent",
  "organization.updated": "Company settings updated",
  "google_calendar.connected": "Google Calendar connected",
  "google_calendar.synced": "Calendar synced",
};

const ACTIVITY_ICONS: Record<string, string> = {
  project: "briefcase",
  permit: "doc",
  license: "shield",
  inspection: "check",
  document: "doc",
  subcontractor: "user",
  organization: "briefcase",
  google_calendar: "calendar",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Charts (pure SVG, no library) ── */

function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 15.9155; // circumference ≈ 100
  let acc = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="w-28 h-28 shrink-0 -rotate-90">
        <circle cx="21" cy="21" r={R} fill="none" strokeWidth="7" className="stroke-gray-200 dark:stroke-gray-700" />
        {segments.map((s, i) => {
          const frac = (s.value / total) * 100;
          const dashoffset = 25 - acc;
          acc += frac;
          if (frac <= 0) return null;
          return (
            <circle
              key={i}
              cx="21"
              cy="21"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="7"
              strokeDasharray={`${frac} ${100 - frac}`}
              strokeDashoffset={dashoffset}
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
            <span className="ml-auto font-semibold text-gray-900 dark:text-white pl-4">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForecastChart({ months }: { months: { label: string; permits: number; licenses: number; documents: number }[] }) {
  const max = Math.max(1, ...months.map((m) => m.permits + m.licenses + m.documents));
  return (
    <div>
      <div className="flex items-end gap-3 h-36">
        {months.map((m) => {
          const total = m.permits + m.licenses + m.documents;
          return (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {total > 0 ? total : ""}
              </span>
              <div className="w-full max-w-10 flex flex-col-reverse rounded-t-md overflow-hidden bg-gray-100 dark:bg-gray-700/60" style={{ height: `${Math.max(4, (total / max) * 100)}%` }}>
                {m.documents > 0 && <div className="bg-slate-400 dark:bg-slate-500" style={{ height: `${(m.documents / total) * 100}%` }} title={`${m.documents} documents`} />}
                {m.licenses > 0 && <div className="bg-amber-400" style={{ height: `${(m.licenses / total) * 100}%` }} title={`${m.licenses} licenses`} />}
                {m.permits > 0 && <div className="bg-blue-500" style={{ height: `${(m.permits / total) * 100}%` }} title={`${m.permits} permits`} />}
              </div>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{m.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Permits</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Licenses</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-400" /> Documents</span>
      </div>
    </div>
  );
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

  const [{ data: actionItems }, { data: upcoming }, { data: recentActivity }] = await Promise.all([
    supabase
      .from("permits")
      .select("id, permit_type, permit_number, expiration_date, status, projects(name)")
      .eq("organization_id", orgId)
      .in("status", ["expired", "expiring_soon"])
      .order("expiration_date", { ascending: true })
      .limit(8),
    supabase
      .from("deadlines")
      .select("id, deadline_type, resource_type, due_date, status")
      .eq("organization_id", orgId)
      .eq("status", "pending")
      .gte("due_date", new Date().toISOString().split("T")[0])
      .order("due_date", { ascending: true })
      .limit(8),
    supabase
      .from("audit_events")
      .select("id, action, entity_type, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // 6-month expiry forecast (permits + licenses + documents)
  const todayStr = new Date().toISOString().split("T")[0];
  const sixMo = new Date();
  sixMo.setMonth(sixMo.getMonth() + 6);
  const sixMoStr = sixMo.toISOString().split("T")[0];

  const [{ data: pExp }, { data: lExp }, { data: dExp }] = await Promise.all([
    supabase.from("permits").select("expiration_date").eq("organization_id", orgId).gte("expiration_date", todayStr).lte("expiration_date", sixMoStr),
    supabase.from("licenses").select("expiration_date").eq("organization_id", orgId).gte("expiration_date", todayStr).lte("expiration_date", sixMoStr),
    supabase.from("documents").select("expiry_date").eq("organization_id", orgId).gte("expiry_date", todayStr).lte("expiry_date", sixMoStr),
  ]);

  const forecast: { label: string; permits: number; licenses: number; documents: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    forecast.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      permits: (pExp || []).filter((p: any) => p.expiration_date?.startsWith(key)).length,
      licenses: (lExp || []).filter((l: any) => l.expiration_date?.startsWith(key)).length,
      documents: (dExp || []).filter((x: any) => x.expiry_date?.startsWith(key)).length,
    });
  }

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

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.href}
              href={qa.href}
              className="group flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <span className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg ${QA_TONES[qa.tone]}`}>
                <Icon path={ICONS[qa.icon as keyof typeof ICONS]} className="w-5 h-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-gray-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                  {qa.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                  {qa.hint}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts: status breakdown + 6-month forecast */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Permit status
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Breakdown of all permits by current status.
          </p>
          <DonutChart
            segments={[
              { value: (activeCount || 0) + (pendingCount || 0), color: "#10b981", label: "Active" },
              { value: expiringCount || 0, color: "#f59e0b", label: "Expiring soon" },
              { value: expiredCount || 0, color: "#f43f5e", label: "Expired" },
            ]}
          />
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Renewal forecast
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Expiries due in the next 6 months.
          </p>
          <ForecastChart months={forecast} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">        {/* Action required */}
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

          {/* Recent activity */}
          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Recent activity
            </h2>
            {!recentActivity || recentActivity.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No activity yet. Add a permit or project to get started.
                </p>
              </Card>
            ) : (
              <Card className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {recentActivity.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-3.5">
                    <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Icon
                        path={ICONS[(ACTIVITY_ICONS[e.entity_type] || "doc") as keyof typeof ICONS]}
                        className="w-4 h-4"
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {ACTIVITY_LABELS[e.action] || e.action}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(e.created_at)}
                    </p>
                  </div>
                ))}
              </Card>
            )}
          </div>

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
