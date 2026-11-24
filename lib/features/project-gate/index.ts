/**
 * Project Gate — stop-work risk alert for a project.
 *
 * If any subcontractor linked to a project (via `project_subcontractors`,
 * added by supabase/migration-compliance-passport.sql) is non-compliant
 * — license or COI expired — the project page shows a red banner naming
 * the sub and what expired.
 *
 * NOTE: the repo previously had NO project <-> subcontractor link at all
 * (subcontractors were org-wide only). The gate therefore only fires for
 * subs explicitly linked through `project_subcontractors`; unlinked subs
 * never trigger a false alarm on an unrelated project. Linking is done
 * via POST/DELETE /api/projects/[id]/subcontractors and the
 * "Subcontractors on this project" section on the project page.
 */
import { complianceStatus } from "@/lib/shared/subcontractor-compliance";

export interface GateRisk {
  subcontractorId: string;
  name: string;
  trade: string | null;
  /** Human-readable list of what expired, e.g. "COI expired 2026-01-05". */
  expiredItems: string[];
}

export interface ProjectGateResult {
  atRisk: boolean;
  risks: GateRisk[];
  checked: number;
}

/**
 * Validate a link/unlink request body for POST/DELETE
 * /api/projects/[id]/subcontractors. Pure (no DB) so it is unit-testable.
 * Returns the trimmed subcontractor id, or an error message.
 */
export function parseLinkBody(body: unknown): { subcontractorId: string } | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid JSON body" };
  }
  const id = (body as Record<string, unknown>).subcontractor_id;
  if (!id || typeof id !== "string" || !id.trim()) {
    return { error: "subcontractor_id is required" };
  }
  return { subcontractorId: id.trim() };
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Which license/COI dates on this sub (legacy fields + docs) are past. */
export function expiredItems(
  sub: {
    license_expiration?: string | null;
    coi_expiration?: string | null;
  },
  docs: { doc_type: string; expiration_date?: string | null }[] = []
): string[] {
  const today = new Date().toISOString().split("T")[0];
  const items: string[] = [];
  if (sub.license_expiration && sub.license_expiration < today) {
    items.push(`License expired ${fmtDate(sub.license_expiration)}`);
  }
  if (sub.coi_expiration && sub.coi_expiration < today) {
    items.push(`COI expired ${fmtDate(sub.coi_expiration)}`);
  }
  for (const d of docs) {
    if (
      (d.doc_type === "license" || d.doc_type === "coi") &&
      d.expiration_date &&
      d.expiration_date < today
    ) {
      items.push(
        `${d.doc_type === "license" ? "License" : "COI"} document expired ${fmtDate(d.expiration_date)}`
      );
    }
  }
  return [...new Set(items)];
}

/**
 * Evaluate the gate for one project. `supabase` is the request-scoped
 * client (RLS applies); returns an empty (not at-risk) result when the
 * join table has no rows or the table does not exist yet.
 */
export async function evaluateProjectGate(
  supabase: any,
  orgId: string,
  projectId: string
): Promise<ProjectGateResult> {
  try {
    const { data: links, error } = await supabase
      .from("project_subcontractors")
      .select("subcontractor_id")
      .eq("organization_id", orgId)
      .eq("project_id", projectId);
    if (error || !links || links.length === 0) {
      return { atRisk: false, risks: [], checked: 0 };
    }
    const subIds = links.map((l: any) => l.subcontractor_id);
    const { data: subs } = await supabase
      .from("subcontractors")
      .select("id, name, trade, status, license_expiration, coi_expiration")
      .eq("organization_id", orgId)
      .in("id", subIds);
    const { data: docs } = await supabase
      .from("subcontractor_documents")
      .select("subcontractor_id, doc_type, expiration_date")
      .eq("organization_id", orgId)
      .in("subcontractor_id", subIds);

    const risks: GateRisk[] = [];
    for (const sub of subs ?? []) {
      const subDocs = (docs ?? []).filter((d: any) => d.subcontractor_id === sub.id);
      const status = complianceStatus(sub, subDocs);
      if (status.color !== "red") continue;
      const items = expiredItems(sub, subDocs);
      risks.push({
        subcontractorId: sub.id,
        name: sub.name,
        trade: sub.trade ?? null,
        expiredItems: items.length > 0 ? items : ["Non-compliant (see subcontractor record)"],
      });
    }
    return { atRisk: risks.length > 0, risks, checked: (subs ?? []).length };
  } catch {
    // Join table missing (migration not run) — fail open, never break the page.
    return { atRisk: false, risks: [], checked: 0 };
  }
}
