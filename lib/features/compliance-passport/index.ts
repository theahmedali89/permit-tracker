/**
 * Compliance Passport — a public, shareable verification page for a
 * contractor: license status, active permit count, COI validity.
 *
 * PRIVACY RULE: only statuses, counts and expiry dates are ever exposed.
 * Never document contents, file names, storage paths, or private notes.
 * An org is only visible when it opted in (`compliance_passport_public`)
 * and has a slug; otherwise lookups return null and the page 404s.
 */
import "server-only";
import { daysUntil } from "@/lib/shared/dates";

export interface PublicPassport {
  orgName: string;
  trade: string | null;
  state: string | null;
  slug: string;
  licenses: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
    nearestExpiry: string | null;
  };
  permits: {
    active: number;
    total: number;
  };
  coi: {
    /** COI documents on file with a known expiry date. */
    total: number;
    valid: number;
    expired: number;
    nearestExpiry: string | null;
  };
  verifiedAt: string;
}

/** URL-safe slug from a company name + 6 random chars (collision-proof enough). */
// Slug generation moved to lib/shared/slug.ts (pass 2) — it is generic
// (used by Settings too), and features never import each other.
export { generateSlug as generatePassportSlug } from "@/lib/shared/slug";

/**
 * Load the public passport for a slug. Returns null when the slug is
 * unknown or the org has not opted in. `supabase` should be a client
 * that can read organizations/licenses/permits/subcontractor_documents
 * (the verify page runs as the anon/SSR client; RLS must allow public
 * reads of these rows only via this server-side lookup — the page itself
 * never returns raw rows).
 */
export async function getPublicPassport(supabase: any, slug: string): Promise<PublicPassport | null> {
  if (!slug || typeof slug !== "string") return null;
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, name, trade, state, compliance_passport_slug, compliance_passport_public")
    .eq("compliance_passport_slug", slug)
    .eq("compliance_passport_public", true)
    .single();
  if (error || !org) return null;

  const today = new Date().toISOString().split("T")[0];

  const [{ data: licenses }, { data: permits }, { data: cois }] = await Promise.all([
    supabase
      .from("licenses")
      .select("status, expiration_date")
      .eq("organization_id", org.id),
    supabase
      .from("permits")
      .select("status")
      .eq("organization_id", org.id),
    supabase
      .from("subcontractor_documents")
      .select("expiration_date")
      .eq("organization_id", org.id)
      .eq("doc_type", "coi")
      .not("expiration_date", "is", null),
  ]);

  const lic = licenses ?? [];
  const licExpiries = lic.map((l: any) => l.expiration_date).filter(Boolean).sort();
  const perm = permits ?? [];
  const coiRows = cois ?? [];
  const coiExpiries = coiRows.map((c: any) => c.expiration_date).filter(Boolean).sort();

  return {
    orgName: org.name,
    trade: org.trade ?? null,
    state: org.state ?? null,
    slug,
    licenses: {
      total: lic.length,
      active: lic.filter((l: any) => l.status === "active").length,
      expiringSoon: lic.filter(
        (l: any) => l.expiration_date && daysUntil(l.expiration_date) >= 0 && daysUntil(l.expiration_date) <= 30
      ).length,
      expired: lic.filter((l: any) => l.status === "expired" || (l.expiration_date && l.expiration_date < today)).length,
      nearestExpiry: licExpiries.find((d: string) => d >= today) ?? licExpiries[0] ?? null,
    },
    permits: {
      active: perm.filter((p: any) => p.status === "active").length,
      total: perm.length,
    },
    coi: {
      total: coiRows.length,
      valid: coiRows.filter((c: any) => c.expiration_date >= today).length,
      expired: coiRows.filter((c: any) => c.expiration_date < today).length,
      nearestExpiry: coiExpiries.find((d: string) => d >= today) ?? coiExpiries[0] ?? null,
    },
    verifiedAt: new Date().toISOString(),
  };
}
