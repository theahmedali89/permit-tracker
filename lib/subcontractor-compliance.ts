/**
 * Shared compliance helper for subcontractors.
 * Combines legacy date fields (license_expiration / coi_expiration on the
 * subcontractors row) with uploaded license/COI documents.
 */

export type ComplianceColor = "red" | "yellow" | "blue" | "green" | "gray";

export interface ComplianceResult {
  label: string;
  color: ComplianceColor;
}

interface SubLike {
  status?: string | null;
  license_expiration?: string | null;
  coi_expiration?: string | null;
}

interface DocLike {
  doc_type: string;
  expiration_date?: string | null;
}

export function complianceStatus(sub: SubLike, docs: DocLike[] = []): ComplianceResult {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  if (sub.status === "inactive") return { label: "Inactive", color: "gray" };

  // Collect every license/COI expiry we know about: legacy fields + documents
  const dates: Array<string | null | undefined> = [
    sub.license_expiration,
    sub.coi_expiration,
  ];
  for (const d of docs) {
    if (d.doc_type === "license" || d.doc_type === "coi") {
      dates.push(d.expiration_date);
    }
  }

  if (dates.some((d) => d && d < today)) {
    return { label: "Non-compliant", color: "red" };
  }
  if (dates.some((d) => d && d < thirtyDays)) {
    return { label: "Expiring soon", color: "yellow" };
  }
  return { label: "Compliant", color: "green" };
}

/** Earliest upcoming license/COI expiration across legacy fields + docs. */
export function nextExpiration(
  sub: SubLike,
  docs: DocLike[] = []
): string | null {
  const today = new Date().toISOString().split("T")[0];
  const dates: string[] = [];
  for (const d of [
    sub.license_expiration,
    sub.coi_expiration,
    ...docs
      .filter((doc) => doc.doc_type === "license" || doc.doc_type === "coi")
      .map((doc) => doc.expiration_date),
  ]) {
    if (d && d >= today) dates.push(d);
  }
  if (dates.length === 0) return null;
  return dates.sort()[0];
}
