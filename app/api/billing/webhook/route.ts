import { NextRequest, NextResponse } from "next/server";
import {
  stripeConfigured,
  getStripe,
  handleWebhookEvent,
} from "@/lib/features/billing";
import {
  FeatureDisabledError,
  requireFeatureEnabled,
} from "@/lib/features/registry";

/**
 * POST /api/billing/webhook — Stripe webhook receiver (thin route).
 * Verifies the signature, then delegates event dispatch to
 * `handleWebhookEvent` in `lib/features/billing`.
 *
 * FAIL-CLOSED: without STRIPE_SECRET_KEY this returns 501 (never a fake
 * payment), and without STRIPE_WEBHOOK_SECRET it ALSO returns 501 and
 * never parses/trusts an unsigned payload — a forged webhook must not
 * be able to flip `organizations.plan`. Previously the route parsed
 * unsigned JSON with only a warning; that hole is closed.
 * Handled events update `subscriptions` and `organizations.plan` (both
 * added by supabase/migration-compliance-passport.sql).
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(
      "[billing] STRIPE_WEBHOOK_SECRET not set — refusing webhook without signature verification (fail-closed)."
    );
    return NextResponse.json(
      { error: "Stripe webhook secret not configured" },
      { status: 501 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: any;
  try {
    const stripe = await getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook verification failed: ${err?.message}` }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event);
  } catch (err: any) {
    console.error("[billing] Webhook handling failed:", err?.message);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
