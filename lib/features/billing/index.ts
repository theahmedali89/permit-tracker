/**
 * Billing — plan enforcement + Stripe helpers.
 *
 * Limits come from `lib/plans.ts` (Free / Starter / Professional /
 * Business). Dollar prices ($49 / $99 / $199) do NOT live in
 * `lib/plans.ts` — they live only in `app/(public)/pricing/page.tsx`
 * (and are duplicated in `PLAN_PRICES` below for display use).
 * No price is invented here.
 *
 * Plan source: `organizations.plan` (added by
 * supabase/migration-compliance-passport.sql). Until that migration has
 * run, the column may not exist — the lookup then falls back to "free"
 * instead of crashing.
 */
import { getPlanLimits, checkLimit, type PlanLimits } from "@/lib/shared/plans";
import { createServiceClient } from "@/lib/supabase/service";

export type BillableResource = "permits" | "licenses" | "projects" | "documents" | "team";

const TABLE_BY_RESOURCE: Record<BillableResource, string> = {
  permits: "permits",
  licenses: "licenses",
  projects: "projects",
  documents: "documents",
  team: "organization_members",
};

const LIMIT_KEY: Record<BillableResource, keyof PlanLimits> = {
  permits: "maxPermits",
  licenses: "maxLicenses",
  projects: "maxProjects",
  documents: "maxDocuments",
  team: "maxTeamMembers",
};

const LABEL: Record<BillableResource, string> = {
  permits: "permit",
  licenses: "license",
  projects: "project",
  documents: "document",
  team: "team member",
};

export interface PlanCheck {
  allowed: boolean;
  plan: string;
  resource: BillableResource;
  current: number;
  max: number;
  /** Human-readable message for the 402 response. */
  message: string;
  /**
   * True when this result came from grace mode (Stripe not configured):
   * the write was allowed WITHOUT checking the limit. See
   * `enforcePlanLimitWithGraceMode`.
   */
  graceMode?: boolean;
}

/** Read the org's plan; "free" when the column/row is missing. */
export async function getOrgPlan(supabase: any, orgId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select("plan")
      .eq("id", orgId)
      .single();
    if (error || !data?.plan) return "free";
    return typeof data.plan === "string" ? data.plan : "free";
  } catch {
    return "free";
  }
}

/**
 * Enforce a plan limit BEFORE an insert. Returns `{ allowed: false }`
 * when the org is at its limit; callers answer 402
 * `{ error, upgrade: true }`.
 */
export async function enforcePlanLimit(
  supabase: any,
  orgId: string,
  resource: BillableResource
): Promise<PlanCheck> {
  const plan = await getOrgPlan(supabase, orgId);
  const limits = getPlanLimits(plan);
  const max = limits[LIMIT_KEY[resource]] as number;
  const { count } = await supabase
    .from(TABLE_BY_RESOURCE[resource])
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  const current = count ?? 0;
  const allowed = checkLimit(current, max);
  return {
    allowed,
    plan,
    resource,
    current,
    max,
    message: allowed
      ? "Within plan limit."
      : `Your ${plan} plan allows ${max === -1 ? "unlimited" : max} ${LABEL[resource]}s (${current} used). Upgrade to add more.`,
  };
}

/**
 * GRACE-MODE RULE (2026-11-24): plan limits are enforced ONLY when
 * Stripe is configured (`stripeConfigured()`). When Stripe is NOT
 * configured there is no working upgrade path, and every existing org
 * defaults to plan "free" — enforcing the free limits would lock
 * over-limit orgs out of adding permits/licenses/projects/documents
 * with no way to pay to continue. So in that case this logs a warning
 * and allows the write WITHOUT counting rows or checking the limit
 * (no DB call is made at all). Once Stripe keys + price IDs are set,
 * enforcement turns on automatically — no code change needed.
 *
 * NOTE: POST /api/team (team invites) predates this rule and still
 * calls `enforcePlanLimit()` directly, i.e. it enforces unconditionally.
 * That is a known live lockout: free `maxTeamMembers` is 1 and the org
 * owner already counts as 1, so any invite on a free org returns 402.
 * Changing that limit is a pricing decision for the owner — do not
 * change `lib/plans.ts` here.
 */
export async function enforcePlanLimitWithGraceMode(
  supabase: any,
  orgId: string,
  resource: BillableResource
): Promise<PlanCheck> {
  if (!stripeConfigured()) {
    console.warn(
      `[billing] Stripe not configured — plan-limit check for "${resource}" skipped (grace mode); write allowed. Configure STRIPE_SECRET_KEY to enforce limits.`
    );
    return {
      allowed: true,
      plan: "grace-mode",
      resource,
      current: 0,
      max: -1,
      message: "Billing not configured — plan limits not enforced (grace mode).",
      graceMode: true,
    };
  }
  return enforcePlanLimit(supabase, orgId, resource);
}

/** Pure bulk-limit check: would `current + additional` exceed `max`? (`-1` = unlimited.) */
export function wouldExceedLimit(current: number, max: number, additional: number): boolean {
  if (max === -1) return false;
  return current + additional > max;
}

/**
 * Bulk version of the grace-mode check (CSV import): like
 * `enforcePlanLimitWithGraceMode`, but the whole batch counts — the
 * import is rejected (402) when `current + additional` would exceed
 * the plan max. Same grace-mode rule: no Stripe keys → warn + allow.
 */
export async function enforceBulkPlanLimitWithGraceMode(
  supabase: any,
  orgId: string,
  resource: BillableResource,
  additional: number
): Promise<PlanCheck> {
  if (!stripeConfigured()) {
    console.warn(
      `[billing] Stripe not configured — bulk plan-limit check for "${resource}" (+${additional}) skipped (grace mode); write allowed. Configure STRIPE_SECRET_KEY to enforce limits.`
    );
    return {
      allowed: true,
      plan: "grace-mode",
      resource,
      current: 0,
      max: -1,
      message: "Billing not configured — plan limits not enforced (grace mode).",
      graceMode: true,
    };
  }
  const plan = await getOrgPlan(supabase, orgId);
  const limits = getPlanLimits(plan);
  const max = limits[LIMIT_KEY[resource]] as number;
  const { count } = await supabase
    .from(TABLE_BY_RESOURCE[resource])
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  const current = count ?? 0;
  const allowed = !wouldExceedLimit(current, max, additional);
  return {
    allowed,
    plan,
    resource,
    current,
    max,
    message: allowed
      ? "Within plan limit."
      : `Your ${plan} plan allows ${max === -1 ? "unlimited" : max} ${LABEL[resource]}s (${current} used); importing ${additional} more would exceed it. Upgrade to add more.`,
  };
}
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Lazily load the Stripe SDK (installed dependency). Throws when absent. */
export async function getStripe(): Promise<any> {
  if (!stripeConfigured()) {
    throw new Error("Stripe keys not configured");
  }
  const Stripe = (await import("stripe")).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

/** Price IDs are deployment config, not code — set via env, never hardcoded. */
export function priceIdForPlan(plan: "starter" | "professional" | "business"): string | null {
  const map = {
    starter: process.env.STRIPE_PRICE_STARTER ?? null,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL ?? null,
    business: process.env.STRIPE_PRICE_BUSINESS ?? null,
  } as const;
  return map[plan];
}

export const PLAN_PRICES: { plan: string; name: string; priceUsd: number; blurb: string }[] = [
  { plan: "starter", name: "Starter", priceUsd: 49, blurb: "For a solo contractor getting organized." },
  { plan: "professional", name: "Professional", priceUsd: 99, blurb: "For growing crews that need SMS alerts and AI extraction." },
  { plan: "business", name: "Business", priceUsd: 199, blurb: "For companies that need unlimited everything plus API access." },
];

// ── Stripe webhook dispatch (moved from app/api/billing/webhook/route.ts, 2026-11-24) ──

/** Map a Stripe price ID to a plan slug, or null when the price is unknown. */
async function planFromPrice(priceId: string | null): Promise<string | null> {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PROFESSIONAL) return "professional";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return "business";
  return null;
}

export interface WebhookDeps {
  /** Supabase service client (defaults to `createServiceClient()`). Injectable for tests. */
  admin?: any;
  /** Stripe SDK instance (defaults to `getStripe()`). Injectable for tests. */
  stripe?: any;
}

/**
 * Handle one VERIFIED Stripe event. Only call this after the webhook
 * signature has been verified — the route (`app/api/billing/webhook/route.ts`)
 * is fail-closed: without `STRIPE_WEBHOOK_SECRET` it returns 501 and
 * never parses/trusts an unsigned payload, so a forged webhook cannot
 * flip `organizations.plan`.
 *
 * Handled events update `subscriptions` and `organizations.plan` (both
 * added by supabase/migration-compliance-passport.sql). Unhandled event
 * types are acknowledged (no-op), not errors.
 */
export async function handleWebhookEvent(event: any, deps: WebhookDeps = {}): Promise<void> {
  const admin = deps.admin ?? createServiceClient();
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.client_reference_id as string | undefined;
      const subscriptionId = session.subscription as string | undefined;
      if (orgId && subscriptionId) {
        const stripe = deps.stripe ?? (await getStripe());
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items?.data?.[0]?.price?.id ?? null;
        const plan = await planFromPrice(priceId);
        await admin.from("subscriptions").upsert(
          {
            organization_id: orgId,
            stripe_customer_id: session.customer ?? sub.customer ?? null,
            stripe_subscription_id: subscriptionId,
            plan: plan ?? "starter",
            status: sub.status ?? "active",
            current_period_end: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          },
          { onConflict: "stripe_subscription_id" }
        );
        if (plan) {
          await admin.from("organizations").update({ plan }).eq("id", orgId);
        }
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object;
      const priceId = sub.items?.data?.[0]?.price?.id ?? null;
      const plan = await planFromPrice(priceId);
      const updates: Record<string, unknown> = {
        status: sub.status,
        current_period_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      };
      if (plan) updates.plan = plan;
      await admin
        .from("subscriptions")
        .update(updates)
        .eq("stripe_subscription_id", sub.id);
      if (plan) {
        const { data } = await admin
          .from("subscriptions")
          .select("organization_id")
          .eq("stripe_subscription_id", sub.id)
          .single();
        if (data?.organization_id) {
          await admin.from("organizations").update({ plan }).eq("id", data.organization_id);
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", plan: "free" })
        .eq("stripe_subscription_id", sub.id);
      const { data } = await admin
        .from("subscriptions")
        .select("organization_id")
        .eq("stripe_subscription_id", sub.id)
        .single();
      if (data?.organization_id) {
        await admin.from("organizations").update({ plan: "free" }).eq("id", data.organization_id);
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoice.subscription);
      }
      break;
    }
    default:
      // Unhandled event types are acknowledged, not errors.
      break;
  }
}
