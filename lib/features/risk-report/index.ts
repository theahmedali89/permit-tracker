/**
 * Risk report — printable at-risk summary for an org.
 *
 * Sections: at-risk permits (with $ exposure ONLY where fine data
 * exists in the repo — `lib/shared/fine-schedules` daily fines /
 * regulation extension fees — otherwise "unknown"), failed inspections,
 * non-compliant subcontractors. Reuses `lib/reports.ts`
 * (`buildReportSummary`) for the headline counts and per-project breakdown.
 */
import "server-only";
import { buildReportSummary, type ReportSummary } from "@/lib/shared/reports";
import { FINES } from "@/lib/shared/fine-schedules";
import { getRegulation } from "@/lib/shared/jurisdiction-data";
import { parseJurisdiction } from "@/lib/shared/jurisdiction";
import { complianceStatus } from "@/lib/shared/subcontractor-compliance";

export interface AtRiskPermit {
  id: string;
  permitType: string;
  permitNumber: string | null;
  status: string;
  expirationDate: string | null;
  projectName: string | null;
  jurisdiction: string | null;
  /** Weekly $ exposure when a daily fine is published for the city. */
  weeklyExposureUsd: number | null;
  /** Per-violation fine range (e.g. NYC) when the fine is not daily. */
  violationFine: string | null;
  /** Verified extension fee, if the city publishes one. */
  extensionFeeUsd: number | null;
  /** "unknown" when no fine/fee data exists for the jurisdiction. */
  exposureLabel: string;
}

export interface FailedInspection {
  id: string;
  inspectionType: string;
  projectName: string | null;
  scheduledDate: string | null;
  correctionNotes: string | null;
  reinspectionDate: string | null;
}

export interface NonCompliantSub {
  id: string;
  name: string;
  trade: string | null;
  label: string;
  licenseExpiration: string | null;
  coiExpiration: string | null;
}

export interface RiskReport {
  generatedAt: string;
  orgName: string;
  summary: ReportSummary;
  atRiskPermits: AtRiskPermit[];
  failedInspections: FailedInspection[];
  nonCompliantSubs: NonCompliantSub[];
  /** Low-end total weekly exposure across at-risk permits with daily fines. */
  totalWeeklyExposureUsd: number;
  /** True when every at-risk permit has known exposure data. */
  exposureFullyKnown: boolean;
}

/** Daily fine low end for a fine-schedule figure, or null when per-violation. */
function dailyLowUsd(figure: string): number | null {
  if (!figure.includes("/day")) return null;
  const nums = [...figure.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, "")));
  return nums.length > 0 ? Math.min(...nums) : null;
}
export function exposureForJurisdiction(jurisdiction: string | null): {
  weeklyExposureUsd: number | null;
  violationFine: string | null;
  extensionFeeUsd: number | null;
  exposureLabel: string;
} {
  const none = {
    weeklyExposureUsd: null,
    violationFine: null,
    extensionFeeUsd: null,
    exposureLabel: "unknown",
  };
  if (!jurisdiction) return none;
  const { city, stateCode } = parseJurisdiction(jurisdiction);
  if (!city) return none;

  // Daily fine schedules (Baltimore / Chicago / Palo Alto / NYC), from
  // `lib/shared/fine-schedules`.
  const fine = FINES.find((f) => {
    const fineCity = f.city.replace(" City", "");
    return fineCity.toLowerCase() === city.toLowerCase();
  });
  const fineDailyLow = fine ? dailyLowUsd(fine.figure) : null;
  // Verified extension fee from the regulation data.
  const reg = stateCode ? getRegulation(stateCode, city) : undefined;
  const extensionFeeUsd = reg?.extension_fee_usd ?? null;

  if (fine && fineDailyLow !== null) {
    return {
      weeklyExposureUsd: fineDailyLow * 7,
      violationFine: null,
      extensionFeeUsd,
      exposureLabel: `$${(fineDailyLow * 7).toLocaleString("en-US")}/week (${fine.figure} ${fine.label})`,
    };
  }
  if (fine) {
    // Per-violation fine (NYC): no weekly figure can be computed honestly.
    return {
      weeklyExposureUsd: null,
      violationFine: fine.figure,
      extensionFeeUsd,
      exposureLabel: `${fine.figure} per violation — no daily rate published`,
    };
  }
  if (extensionFeeUsd !== null) {
    return {
      weeklyExposureUsd: null,
      violationFine: null,
      extensionFeeUsd,
      exposureLabel: `Extension fee ${extensionFeeUsd} — no fine schedule published`,
    };
  }
  return none;
}

export async function buildRiskReport(
  supabase: any,
  orgId: string,
  orgName: string
): Promise<RiskReport> {
  const summary = await buildReportSummary(supabase, orgId);

  const { data: permits } = await supabase
    .from("permits")
    .select("id, permit_type, permit_number, status, expiration_date, jurisdiction, projects(name)")
    .eq("organization_id", orgId)
    .in("status", ["expired", "expiring_soon"])
    .order("expiration_date", { ascending: true });

  const atRiskPermits: AtRiskPermit[] = (permits ?? []).map((p: any) => {
    const exposure = exposureForJurisdiction(p.jurisdiction ?? null);
    return {
      id: p.id,
      permitType: p.permit_type,
      permitNumber: p.permit_number ?? null,
      status: p.status,
      expirationDate: p.expiration_date ?? null,
      projectName: p.projects?.name ?? null,
      jurisdiction: p.jurisdiction ?? null,
      ...exposure,
    };
  });

  const { data: inspections } = await supabase
    .from("inspections")
    .select("id, inspection_type, scheduled_date, correction_notes, reinspection_date, projects(name)")
    .eq("organization_id", orgId)
    .eq("status", "failed")
    .order("scheduled_date", { ascending: false });

  const failedInspections: FailedInspection[] = (inspections ?? []).map((i: any) => ({
    id: i.id,
    inspectionType: i.inspection_type,
    projectName: i.projects?.name ?? null,
    scheduledDate: i.scheduled_date ?? null,
    correctionNotes: i.correction_notes ?? null,
    reinspectionDate: i.reinspection_date ?? null,
  }));

  const { data: subs } = await supabase
    .from("subcontractors")
    .select("id, name, trade, status, license_expiration, coi_expiration")
    .eq("organization_id", orgId);
  const { data: docs } = await supabase
    .from("subcontractor_documents")
    .select("subcontractor_id, doc_type, expiration_date")
    .eq("organization_id", orgId);
  const nonCompliantSubs: NonCompliantSub[] = (subs ?? [])
    .filter((s: any) => {
      const sDocs = (docs ?? []).filter((d: any) => d.subcontractor_id === s.id);
      return complianceStatus(s, sDocs).color === "red";
    })
    .map((s: any) => ({
      id: s.id,
      name: s.name,
      trade: s.trade ?? null,
      label: complianceStatus(s, (docs ?? []).filter((d: any) => d.subcontractor_id === s.id)).label,
      licenseExpiration: s.license_expiration ?? null,
      coiExpiration: s.coi_expiration ?? null,
    }));

  const totalWeeklyExposureUsd = atRiskPermits.reduce(
    (sum, p) => sum + (p.weeklyExposureUsd ?? 0),
    0
  );

  return {
    generatedAt: new Date().toISOString(),
    orgName,
    summary,
    atRiskPermits,
    failedInspections,
    nonCompliantSubs,
    totalWeeklyExposureUsd,
    exposureFullyKnown: atRiskPermits.every(
      (p) => p.weeklyExposureUsd !== null || p.violationFine !== null
    ),
  };
}
