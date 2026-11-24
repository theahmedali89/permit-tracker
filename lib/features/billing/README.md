# Billing

Stripe billing + plan enforcement. Plan **limits** come from
`lib/plans.ts`; dollar **prices** ($49 / $99 / $199) do NOT live in
`lib/plans.ts` — they live only in `app/(public)/pricing/page.tsx`
(and are duplicated in `PLAN_PRICES` in `index.ts` for display).
14-day trial on every paid plan.

## Plan enforcement — grace mode (2026-11-24)

`enforcePlanLimit(supabase, orgId, resource)` reads `organizations.plan`
(added by `supabase/migration-compliance-passport.sql`; falls back to
`"free"` if the column has not been migrated yet), counts the org's rows
in the resource table, and checks them against `getPlanLimits` /
`checkLimit` from `lib/plans.ts`.

**Grace-mode rule:** routes must call
`enforcePlanLimitWithGraceMode()` (not `enforcePlanLimit()` directly).
Limits are enforced ONLY when Stripe is configured
(`stripeConfigured()` — `STRIPE_SECRET_KEY` present). When Stripe is
NOT configured there is no working upgrade path and every existing org
defaults to plan `"free"`, so enforcing the free limits would lock
over-limit orgs out with no way to pay to continue. In that case the
helper logs a warning and allows the write WITHOUT checking the limit
(no DB call). Once Stripe keys + price IDs are set, enforcement turns
on automatically — no code change needed.

Wired into POST **before** insert in:

- `/api/permits` (permits)
- `/api/licenses` (licenses)
- `/api/projects` (projects)
- `/api/documents` (documents — checked BEFORE the storage upload, so a
  rejected upload leaves no orphan file)
- `/api/permits/import` (permits, bulk — the whole batch counts via
  `enforceBulkPlanLimitWithGraceMode()`; an import that would push the
  org over its max is rejected whole, never partially imported)
- `/api/team` (team members — counts `organization_members`)

Over the limit (Stripe configured) → `402 { error, upgrade: true }`.
No silent downgrade, no free pass.

**Known live lockout — owner pricing decision needed:** `/api/team`
predates grace mode and still calls `enforcePlanLimit()` directly, so
it enforces unconditionally. Free `maxTeamMembers` is **1** and the org
owner already counts as 1, so any team invite on a free org returns
402 today. Do NOT change `lib/plans.ts` to fix this here — the owner
must decide the free team-member limit first.

## Stripe routes

- `POST /api/billing/checkout` — creates a Stripe Checkout session for
  Starter / Professional / Business. Requires `STRIPE_SECRET_KEY` and a
  price ID env var (`STRIPE_PRICE_STARTER` /
  `STRIPE_PRICE_PROFESSIONAL` / `STRIPE_PRICE_BUSINESS`). Without keys
  it returns `501 { error: "Stripe keys not configured" }` — never a
  fake payment, never a crash.
- `POST /api/billing/webhook` — thin route: checks the registry flag
  (`billing` → 503 when disabled), then verifies the Stripe signature
  and delegates event dispatch to `handleWebhookEvent(event)` in
  `lib/features/billing/index.ts`, which handles
  `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted` and `invoice.payment_failed`, and
  upserts `subscriptions` (migration adds the table) +
  `organizations.plan`. Without keys: 501.
  **Fail-closed:** without `STRIPE_WEBHOOK_SECRET` the route returns
  501 and never parses an unsigned payload — previously it parsed
  unsigned JSON with only a warning, which would have let a forged
  webhook flip `organizations.plan`. A missing `stripe-signature`
  header is a 400.
- `handleWebhookEvent(event, { admin, stripe })` — injectable
  `admin`/`stripe` deps exist for tests (`billing.test.ts`); in
  production they default to the service client / Stripe SDK.

Price IDs are deployment config (env vars), never hardcoded in code.

## Pricing page

`app/(public)/pricing/page.tsx` — the three paid tiers, 14-day trial
note, Offer schema + FAQ schema.

## Setup

See `STRIPE-SETUP.md` at the repo root (pre-existing) for the full
checklist. Required env vars: `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`,
`STRIPE_PRICE_PROFESSIONAL`, `STRIPE_PRICE_BUSINESS`.
(`STRIPE_PUBLISHABLE_KEY` is intentionally not listed — no code reads
it, and it was removed from the registry entry.)
