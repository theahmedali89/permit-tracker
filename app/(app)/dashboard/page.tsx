import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { smartBufferForPermit } from "@/lib/features/smart-buffer";
import { getDashboardData } from "@/lib/features/dashboard";
import {
  buildJourneySteps,
  buildPipelineStages,
  DashboardBento,
  JourneyTimeline,
  monthlyBarTotals,
  PipelineStages,
} from "@/lib/features/landing-redesign";
import type {
  ExpiringRow,
  InspectionRow,
  SmartBufferCard,
} from "@/lib/features/landing-redesign";
import { RemoveSampleDataButton } from "./remove-sample-data";

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

  // Data fetching lives in the dashboard feature (pass 2 modularity).
  const {
    hasSampleData,
    activeCount,
    pendingCount,
    expiringCount,
    expiredCount,
    actionItems,
    upcoming,
    recentActivity,
    forecast,
    compliance,
    stageExamples,
    inspectionCount,
  } = await getDashboardData(supabase, orgId);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // ── Landing redesign: assemble the bento / pipeline / journey props ──
  // Everything below is derived from the real data above — nothing is
  // invented. Where a section has no backing data it renders empty.
  const expiringRows: ExpiringRow[] = (actionItems || []).map((permit: any) => {
    const isExpired = permit.status === "expired";
    const days = permit.expiration_date ? daysUntil(permit.expiration_date) : null;
    const buffer = smartBufferForPermit(permit)?.buffer ?? null;
    return {
      id: permit.id,
      title: `${permit.permit_type}${permit.permit_number ? ` #${permit.permit_number}` : ""}`,
      meta: `${permit.projects?.name ?? "No project"} · ${
        isExpired ? "Expired" : "Expires"
      } ${permit.expiration_date ? formatDate(permit.expiration_date) : "—"}`,
      applyByLabel: buffer ? formatDate(buffer.applyByDate) : permit.expiration_date ? formatDate(permit.expiration_date) : "—",
      daysLabel:
        days === null
          ? "—"
          : isExpired
            ? `${Math.abs(days)}d overdue`
            : `${days}d left`,
      href: `/permits/${permit.id}`,
    };
  });

  // Smart buffer card: the first expiring permit with verified regulation data.
  let smartBufferCard: SmartBufferCard | null = null;
  for (const permit of actionItems || []) {
    const result = smartBufferForPermit(permit);
    if (result && permit.expiration_date) {
      smartBufferCard = {
        cityLabel: result.regulation.city,
        applyByLabel: formatDate(result.buffer.applyByDate),
        expiryLabel: formatDate(permit.expiration_date),
        processingDays: result.buffer.processingDays,
      };
      break;
    }
  }

  const inspectionDeadlines = (upcoming || []).filter((d: any) => d.resource_type === "inspection");
  const inspectionRows: InspectionRow[] = inspectionDeadlines.slice(0, 3).map((d: any) => {
    const due = new Date(d.due_date);
    const days = daysUntil(d.due_date);
    return {
      id: d.id,
      day: String(due.getDate()),
      month: due.toLocaleDateString("en-US", { month: "short" }),
      title: deadlineLabel(d),
      meta: days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `In ${days} days`,
    };
  });

  const pipelineStages = buildPipelineStages({
    applied: { count: pendingCount || 0, example: stageExamples.applied ?? undefined },
    approved: { count: activeCount || 0, example: stageExamples.approved ?? undefined },
    inspection: {
      count: inspectionCount || 0,
      example: inspectionDeadlines[0]
        ? { title: deadlineLabel(inspectionDeadlines[0]), meta: `Due ${formatDate(inspectionDeadlines[0].due_date)}` }
        : undefined,
    },
    renewal: {
      count: (expiringCount || 0) + (expiredCount || 0),
      example: actionItems?.[0]
        ? {
            title: `${actionItems[0].permit_type}${actionItems[0].permit_number ? ` #${actionItems[0].permit_number}` : ""}`,
            meta: actionItems[0].jurisdiction ?? "No jurisdiction recorded",
          }
        : undefined,
    },
  });

  // Journey timeline: the most urgent permit, with its own inspection
  // deadline linked by resource_id (never attributed from another permit).
  const journeyPermit = actionItems?.[0] ?? null;
  const journeyInspection = journeyPermit
    ? inspectionDeadlines.find((d: any) => d.resource_id === journeyPermit.id)
    : null;
  const journeySteps = journeyPermit
    ? buildJourneySteps(journeyPermit, journeyInspection?.due_date ?? null)
    : null;

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
          {hasSampleData && <RemoveSampleDataButton />}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active permits" value={(activeCount || 0) + (pendingCount || 0) + (expiringCount || 0)} icon={ICONS.shield} tone="success" />
        <StatCard label="Expiring soon" value={expiringCount || 0} icon={ICONS.clock} tone="warning" />
        <StatCard label="Expired" value={expiredCount || 0} icon={ICONS.alert} tone="danger" />
        <StatCard label="Upcoming deadlines" value={upcoming?.length || 0} icon={ICONS.calendar} tone="info" />
      </div>

      {/* Bento grid — compliance, expiring soon, smart buffer, bars, inspections */}
      <div className="mb-8">
        <DashboardBento
          compliance={compliance}
          totalPermits={(activeCount || 0) + (pendingCount || 0) + (expiringCount || 0) + (expiredCount || 0)}
          expiring={expiringRows}
          smartBuffer={smartBufferCard}
          monthlyBars={monthlyBarTotals(forecast)}
          inspections={inspectionRows}
        />
      </div>

      {/* Permit pipeline */}
      <div className="mb-10">
        <PipelineStages stages={pipelineStages} />
      </div>

      {/* Permit journey — most urgent permit */}
      {journeyPermit && journeySteps && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-1">
            Permit journey
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            The most urgent permit, step by step — from application to close-out.
          </p>
          <JourneyTimeline
            permitTitle={`${journeyPermit.permit_type}${journeyPermit.permit_number ? ` #${journeyPermit.permit_number}` : ""}`}
            permitMeta={`${journeyPermit.jurisdiction ?? "No jurisdiction recorded"}${journeyPermit.expiration_date ? ` · Expires ${formatDate(journeyPermit.expiration_date)}` : ""}`}
            steps={journeySteps}
          />
        </div>
      )}

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

      {/* Permit status + recent activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
        </div>
        <div>
          {/* Recent activity */}
          <div>
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
