// Dashboard — core feature (pass 2 modularity).
//
// The dashboard page's data fetching moved verbatim from
// `app/(app)/dashboard/page.tsx` into `getDashboardData()` here; the
// page now only resolves auth/membership (redirects) and renders.
// Behaviour is identical: same queries, same status tally, same
// 6-month expiry forecast, same compliance-health weights
// (expired = 0 pts, expiring_soon = 50 pts, active/pending = 100 pts).
// Presentation helpers (`daysUntil`, `formatDate`, `deadlineLabel`,
// `timeAgo`) stay in the page — they are rendering, not data.

export interface StatusCounts {
  active: number;
  pending: number;
  expiring_soon: number;
  expired: number;
}

export interface ForecastMonth {
  label: string;
  permits: number;
  licenses: number;
  documents: number;
}

export interface DashboardData {
  hasSampleData: boolean;
  statusCounts: StatusCounts;
  activeCount: number;
  pendingCount: number;
  expiringCount: number;
  expiredCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionItems: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upcoming: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivity: any[] | null;
  forecast: ForecastMonth[];
  totalPermits: number;
  compliance: number;
}

/** Tally permit statuses (single grouped query, counted in JS). */
export function tallyStatusCounts(
  rows: { status: string }[] | null | undefined
): StatusCounts {
  const statusCounts: StatusCounts = { active: 0, pending: 0, expiring_soon: 0, expired: 0 };
  for (const p of rows || []) {
    if (p.status in statusCounts) {
      statusCounts[p.status as keyof StatusCounts]++;
    }
  }
  return statusCounts;
}

/**
 * Compliance health: expired = 0 pts (critical), expiring_soon = 50 pts
 * (warning but still valid), active/pending = 100 pts. An expiring
 * permit should never tank health to 0%.
 */
export function computeCompliance(counts: StatusCounts): number {
  const total = counts.active + counts.pending + counts.expiring_soon + counts.expired;
  return total > 0
    ? Math.round((((counts.active || 0) + (counts.pending || 0) + (counts.expiring_soon || 0) * 0.5) / total) * 100)
    : 100;
}

/** 6-month expiry forecast (permits + licenses + documents). */
export function buildForecast(
  pExp: { expiration_date?: string | null }[] | null | undefined,
  lExp: { expiration_date?: string | null }[] | null | undefined,
  dExp: { expiry_date?: string | null }[] | null | undefined,
  now: Date = new Date()
): ForecastMonth[] {
  const forecast: ForecastMonth[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    forecast.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      permits: (pExp || []).filter((p) => p.expiration_date?.startsWith(key)).length,
      licenses: (lExp || []).filter((l) => l.expiration_date?.startsWith(key)).length,
      documents: (dExp || []).filter((x) => x.expiry_date?.startsWith(key)).length,
    });
  }
  return forecast;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDashboardData(supabase: any, orgId: string): Promise<DashboardData> {
  // Sample-data flag (added by supabase/migration-compliance-passport.sql).
  // Fetched separately so the dashboard still loads if the migration
  // has not run yet.
  const { data: orgExtra } = await supabase
    .from("organizations")
    .select("sample_data")
    .eq("id", orgId)
    .single();
  const hasSampleData = (orgExtra as any)?.sample_data === true;

  // Single grouped status query (one round trip instead of four
  // head-count queries); tallies are computed in JS below.
  const { data: permitStatuses } = await supabase
    .from("permits")
    .select("status")
    .eq("organization_id", orgId);
  const statusCounts = tallyStatusCounts(permitStatuses as { status: string }[]);
  const activeCount = statusCounts.active;
  const pendingCount = statusCounts.pending;
  const expiringCount = statusCounts.expiring_soon;
  const expiredCount = statusCounts.expired;

  const [{ data: actionItems }, { data: upcoming }, { data: recentActivity }] = await Promise.all([
    supabase
      .from("permits")
      .select("id, permit_type, permit_number, expiration_date, renewal_deadline, jurisdiction, status, projects(name)")
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

  const forecast = buildForecast(pExp, lExp, dExp);

  const totalPermits = (activeCount || 0) + (pendingCount || 0) + (expiringCount || 0) + (expiredCount || 0);
  const compliance = computeCompliance(statusCounts);

  return {
    hasSampleData,
    statusCounts,
    activeCount,
    pendingCount,
    expiringCount,
    expiredCount,
    actionItems,
    upcoming,
    recentActivity,
    forecast,
    totalPermits,
    compliance,
  };
}
