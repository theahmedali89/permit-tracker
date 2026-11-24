/**
 * Landing redesign — pure presentation logic.
 *
 * Maps the real dashboard data (from `lib/features/dashboard`) onto the
 * new sections: pipeline stages, permit journey steps, and monthly bar
 * totals. No DB, no network, no cross-feature imports — the page calls
 * `getDashboardData()` / `smartBufferForPermit()` itself and passes the
 * results in. Nothing here invents data: a stage with no permits shows
 * count 0 and no example; a journey step with no date says so.
 */

export type ComplianceTone = "good" | "warn" | "bad";

/** Dial colour follows the same thresholds as the dashboard header. */
export function complianceTone(score: number): ComplianceTone {
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

export interface StageExample {
  title: string;
  meta: string;
}

export interface PipelineStage {
  key: "applied" | "approved" | "inspection" | "renewal";
  stepNo: string;
  label: string;
  count: number;
  countLabel: string;
  example?: StageExample;
}

export interface PipelineInput {
  applied: { count: number; example?: StageExample };
  approved: { count: number; example?: StageExample };
  inspection: { count: number; example?: StageExample };
  renewal: { count: number; example?: StageExample };
}

/**
 * Four pipeline stages from real counts. The permit lifecycle in this
 * codebase has no "completed/closed" status (statuses are active,
 * pending, expiring_soon, expired), so stage 4 is honestly "Renewal
 * due" (expiring soon + expired) — never labelled "Done" with no data
 * behind it.
 */
export function buildPipelineStages(input: PipelineInput): PipelineStage[] {
  return [
    {
      key: "applied",
      stepNo: "Stage 1",
      label: "Applied",
      count: input.applied.count,
      countLabel: input.applied.count === 1 ? "permit filed" : "permits filed",
      example: input.applied.example,
    },
    {
      key: "approved",
      stepNo: "Stage 2",
      label: "Approved",
      count: input.approved.count,
      countLabel: input.approved.count === 1 ? "ready to build" : "ready to build",
      example: input.approved.example,
    },
    {
      key: "inspection",
      stepNo: "Stage 3",
      label: "Inspection",
      count: input.inspection.count,
      countLabel: input.inspection.count === 1 ? "scheduled" : "scheduled",
      example: input.inspection.example,
    },
    {
      key: "renewal",
      stepNo: "Stage 4",
      label: "Renewal due",
      count: input.renewal.count,
      countLabel: input.renewal.count === 1 ? "needs renewal" : "need renewal",
      example: input.renewal.example,
    },
  ];
}

export type JourneyState = "done" | "now" | "next";

export interface JourneyStep {
  title: string;
  detail: string;
  state: JourneyState;
  pill: string;
}

export interface JourneyPermit {
  status: string;
  created_at?: string | null;
  expiration_date?: string | null;
}

/** Short "Mon D, YYYY" date, or null when there is no date to show. */
export function shortDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Lifecycle steps for one permit, derived only from its real status and
 * dates. Steps with no backing data are "Up next" with no invented date.
 * The "Complete" step is never marked done — there is no completed
 * status in the data to prove it.
 */
export function buildJourneySteps(
  permit: JourneyPermit,
  nextInspectionDate: string | null | undefined
): JourneyStep[] {
  const applied = shortDate(permit.created_at);
  const expiry = shortDate(permit.expiration_date);
  const inspection = shortDate(nextInspectionDate);
  const isPending = permit.status === "pending";
  const isApproved = permit.status === "active" || permit.status === "expiring_soon" || permit.status === "expired";

  return [
    {
      title: "Applied",
      detail: applied ? `Submitted on ${applied}.` : "Application on file.",
      state: "done",
      pill: "Done",
    },
    {
      title: "Under review",
      detail: isPending
        ? "City plan review in progress."
        : "Plan review cleared.",
      state: isPending ? "now" : "done",
      pill: isPending ? "In progress" : "Done",
    },
    {
      title: "Approved",
      detail: isApproved
        ? expiry
          ? `Permit issued. Valid until ${expiry}.`
          : "Permit issued."
        : "Approval comes after plan review.",
      state: isApproved ? "done" : "next",
      pill: isApproved ? "Done" : "Up next",
    },
    {
      title: "Inspection",
      detail: inspection
        ? `Inspection booked for ${inspection}.`
        : "No inspection scheduled yet.",
      state: inspection ? "now" : "next",
      pill: inspection ? "In progress" : "Up next",
    },
    {
      title: "Complete",
      detail: "Final inspection and certificate of occupancy close out this permit.",
      state: "next",
      pill: "Up next",
    },
  ];
}

/** Monthly bar totals from the dashboard forecast (permits + licenses + documents). */
export function monthlyBarTotals(
  forecast: { label: string; permits: number; licenses: number; documents: number }[]
): { label: string; total: number }[] {
  return forecast.map((m) => ({
    label: m.label,
    total: m.permits + m.licenses + m.documents,
  }));
}
