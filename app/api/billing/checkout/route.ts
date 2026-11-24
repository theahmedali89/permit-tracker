import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  stripeConfigured,
  getStripe,
  priceIdForPlan,
} from "@/lib/features/billing";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";

const PLANS = ["starter", "professional", "business"] as const;

/**
 * POST /api/billing/checkout — create a Stripe Checkout session.
 * Without STRIPE_SECRET_KEY (or without a price ID for the plan) this
 * returns 501 — it never fakes a payment and never crashes.
 */
export async function POST(request: NextRequest) {
  try {
    requireFeatureEnabled("billing");
  } catch (err) {
    if (err instanceof FeatureDisabledError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe keys not configured" }, { status: 501 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const plan = body?.plan as string;
  if (!PLANS.includes(plan as (typeof PLANS)[number])) {
    return NextResponse.json({ error: "plan must be starter, professional or business" }, { status: 400 });
  }

  const priceId = priceIdForPlan(plan as (typeof PLANS)[number]);
  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID not configured for plan "${plan}"` },
      { status: 501 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://permitwarden.com";
  try {
    const stripe = await getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      client_reference_id: membership.organization_id,
      customer_email: user.email ?? undefined,
      subscription_data: { trial_period_days: 14 },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
