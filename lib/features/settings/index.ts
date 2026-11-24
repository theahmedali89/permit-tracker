// Settings — core feature (pass 2 modularity).
//
// The organization-update logic moved verbatim from
// `app/api/organization/route.ts` (PATCH): the route is now thin
// (auth/org resolution + one feature call). Behaviour is identical:
// same allow-listed fields, same "Company name is required" /
// "Nothing to update" errors, same Compliance Passport slug generation
// (server-side, once, with one retry on slug collision), same
// registry-guard scoping (only the passport branch is refused with 503
// when `compliance-passport` is disabled — other org fields on this
// route are unaffected), same audit event.
//
// The Settings page itself (`app/(app)/settings/page.tsx`) still reads
// the org + plan limits directly for display; only the mutation moved.

import { generateSlug } from "@/lib/shared/slug";
import { isFeatureEnabled } from "@/lib/features/registry";
import { ApiError, result, type FeatureResult } from "@/lib/shared/http";

const ORG_TEXT_FIELDS = ["name", "trade", "state"];
const ORG_TOGGLE_FIELDS = ["compliance_passport_public", "sms_escalation_enabled"];

/** Build the update payload from a PATCH body (pure, unit-testable). */
export function buildOrganizationUpdates(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  for (const f of ORG_TEXT_FIELDS) {
    if (body[f] !== undefined) {
      const v = body[f] as string | undefined;
      updates[f] = v?.trim() ? v.trim() : null;
    }
  }
  // Feature toggles (booleans)
  for (const f of ORG_TOGGLE_FIELDS) {
    if (body[f] !== undefined) updates[f] = body[f] === true;
  }
  return updates;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOrganization(supabase: any, orgId: string, userId: string, body: unknown): Promise<FeatureResult> {
  const raw = (body ?? {}) as Record<string, unknown>;
  const updates = buildOrganizationUpdates(raw);

  // Company name is required only when it is being changed.
  if (raw.name !== undefined && !updates.name) {
    throw new ApiError(400, "Company name is required");
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  // Enabling the Compliance Passport generates the public slug
  // server-side (once — an existing slug is kept). The passport is a
  // registered feature: when it is disabled in the registry, enabling
  // it here is refused (503) — other org fields on this route are
  // unaffected, so the guard is scoped to this branch only.
  if (updates.compliance_passport_public === true) {
    if (!isFeatureEnabled("compliance-passport")) {
      throw new ApiError(503, 'Feature "compliance-passport" is disabled');
    }
    const { data: org } = await supabase
      .from("organizations")
      .select("name, compliance_passport_slug")
      .eq("id", orgId)
      .single();
    if (org && !org.compliance_passport_slug) {
      updates.compliance_passport_slug = generateSlug(
        (updates.name as string | undefined) ?? org.name ?? "company"
      );
    }
  }

  let { data, error } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", orgId)
    .select("id, name, trade, state, compliance_passport_slug, compliance_passport_public, sms_escalation_enabled")
    .single();

  // Slug collision is rare but possible — regenerate once and retry.
  if (error && updates.compliance_passport_slug && /duplicate|unique/i.test(error.message)) {
    updates.compliance_passport_slug = generateSlug((updates.name as string | undefined) ?? "company");
    ({ data, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", orgId)
      .select("id, name, trade, state, compliance_passport_slug, compliance_passport_public, sms_escalation_enabled")
      .single());
  }

  if (error) throw new ApiError(500, error.message);

  await supabase.from("audit_events").insert({
    organization_id: orgId,
    actor_id: userId,
    action: "organization.updated",
    entity_type: "organization",
    entity_id: orgId,
  });

  return result(200, data);
}
