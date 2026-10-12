# Stripe Billing Architecture

## Status: Prepared, not implemented
**Reason:** Requires Ahmed's Stripe account + API keys. Architecture is ready.

## Implementation Checklist (when Ahmed provides keys)

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Database Migration
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ADD COLUMN plan TEXT DEFAULT 'free';
```

### 4. Routes to Implement
- `POST /api/billing/checkout` - Create Stripe Checkout session
- `POST /api/billing/webhook` - Handle Stripe webhooks (verify signature!)
- `GET /api/billing/portal` - Customer portal for managing subscription

### 5. Webhook Events to Handle
- `checkout.session.completed` → Create subscription record
- `customer.subscription.updated` → Update plan/status
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_failed` → Mark past_due, notify user

### 6. Plan Enforcement
Use `lib/plans.ts` `getPlanLimits()` + `checkLimit()` in API routes:
```typescript
import { getPlanLimits, checkLimit } from "@/lib/plans";

const limits = getPlanLimits(org.plan);
const { count } = await supabase.from("permits").select("*", { count: "exact", head: true });
if (!checkLimit(count || 0, limits.maxPermits)) {
  return NextResponse.json({ error: "Permit limit reached. Upgrade your plan." }, { status: 402 });
}
```

### 7. Pricing (from competitor analysis)
- Free Trial: 14 days
- Starter: $49/mo
- Professional: $99/mo
- Business: $199/mo

## Security Notes
- ALWAYS verify webhook signatures
- NEVER trust client-side plan claims
- Store Stripe IDs, not card details
- Use idempotency keys for webhook processing
