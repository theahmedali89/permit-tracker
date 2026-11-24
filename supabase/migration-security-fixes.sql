-- =====================================================================
-- Permit Warden — security fixes (Track A)
-- Run order: AFTER all earlier migrations (schema.sql, migration-1.1.sql,
-- migration-blog.sql, migration-jurisdiction-regulations.sql, etc.).
-- Run in the Supabase SQL editor. Safe to re-run (idempotent guards).
--
-- Contents:
--  1. Drop the tenant-takeover policy on organization_members.
--  2. platform_admins table + is_platform_admin() SECURITY DEFINER helper.
--  3. Lock blog_posts + jurisdiction_regulations writes to platform admins.
--  4. organizations.compliance_passport_public flag.
--  5. subscriptions table (Stripe billing, org-scoped RLS).
--  6. Widen permits/licenses status CHECK to include 'renewal_overdue'
--     (new value from lib/permit-status.ts).
-- =====================================================================

-- 1. Tenant takeover: any logged-in user could INSERT themselves as
-- owner of ANY organization (org UUID only). Onboarding already uses
-- the service-role client, and team invites now go through
-- POST /api/team/accept, so this policy is simply removed.
DROP POLICY IF EXISTS "Users can add themselves to organizations"
  ON organization_members;

-- 2. Platform admins ----------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_platform_admins_email ON platform_admins(email);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Authenticated users may read only their own row (so the app can check
-- admin status). No INSERT/UPDATE/DELETE policy for authenticated users:
-- only the service role (which bypasses RLS) writes this table.
DROP POLICY IF EXISTS "Users can read own platform_admin row" ON platform_admins;
CREATE POLICY "Users can read own platform_admin row"
  ON platform_admins FOR SELECT
  USING (user_id = auth.uid());

-- SECURITY DEFINER helper used by the write policies below. SQL policies
-- cannot read env vars, so the PLATFORM_ADMIN_EMAILS allow-list is
-- enforced in the app layer (lib/platform-admin.ts); the table is the
-- source of truth inside Postgres.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = auth.uid()
  );
$$;

-- 3a. Blog: only platform admins may write. Public read of published
-- posts is unchanged; admins can also read unpublished drafts.
DROP POLICY IF EXISTS "Members can manage posts" ON blog_posts;

DROP POLICY IF EXISTS "Platform admins can read all posts" ON blog_posts;
CREATE POLICY "Platform admins can read all posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE OR public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can insert posts" ON blog_posts;
CREATE POLICY "Platform admins can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can update posts" ON blog_posts;
CREATE POLICY "Platform admins can update posts"
  ON blog_posts FOR UPDATE
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can delete posts" ON blog_posts;
CREATE POLICY "Platform admins can delete posts"
  ON blog_posts FOR DELETE
  USING (public.is_platform_admin());

-- 3b. Jurisdiction regulations: public read stays; writes were open to
-- ANY authenticated user (WITH CHECK (true)) — that let any free signup
-- poison AHJ data and smart renewal alerts. Now admin-only.
DROP POLICY IF EXISTS "Authenticated users can manage jurisdiction regulations"
  ON jurisdiction_regulations;
DROP POLICY IF EXISTS "Authenticated users can update jurisdiction regulations"
  ON jurisdiction_regulations;
DROP POLICY IF EXISTS "Authenticated users can delete jurisdiction regulations"
  ON jurisdiction_regulations;

DROP POLICY IF EXISTS "Platform admins can insert jurisdiction regulations"
  ON jurisdiction_regulations;
CREATE POLICY "Platform admins can insert jurisdiction regulations"
  ON jurisdiction_regulations FOR INSERT
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can update jurisdiction regulations"
  ON jurisdiction_regulations;
CREATE POLICY "Platform admins can update jurisdiction regulations"
  ON jurisdiction_regulations FOR UPDATE
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "Platform admins can delete jurisdiction regulations"
  ON jurisdiction_regulations;
CREATE POLICY "Platform admins can delete jurisdiction regulations"
  ON jurisdiction_regulations FOR DELETE
  USING (public.is_platform_admin());

-- 4. Compliance Passport opt-in flag (public shareable page; Track C
-- builds the page itself). Default off: nothing is public until the
-- org explicitly enables it.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS compliance_passport_public BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Subscriptions (Stripe). Written only via the service role
-- (Stripe webhook / billing routes); org members get read access.
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can read own org subscription" ON subscriptions;
CREATE POLICY "Members can read own org subscription"
  ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
-- No INSERT/UPDATE/DELETE policies for authenticated users: only the
-- service role writes subscriptions.

-- 5b. Encrypted Google Calendar token columns (table created by
-- migration-google-calendar.sql). Plaintext access_token/refresh_token
-- columns are kept for legacy rows during migration; new writes go to
-- the *_encrypted columns (AES-256-GCM, see lib/calendar-crypto.ts)
-- and the plaintext columns are cleared. Never log token values.
ALTER TABLE google_calendar_tokens
  ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT;

-- 6. Widen permits/licenses status CHECK to include 'renewal_overdue'
-- (lib/permit-status.ts returns it once a renewal deadline has passed
-- but the permit has not expired yet). Constraint names were
-- auto-generated, so discover and drop them instead of guessing.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conrelid, conname
    FROM pg_constraint
    WHERE conrelid IN ('public.permits'::regclass, 'public.licenses'::regclass)
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.conrelid::regclass, r.conname);
  END LOOP;
END $$;

ALTER TABLE public.permits
  ADD CONSTRAINT permits_status_check
  CHECK (status IN ('active', 'expiring_soon', 'expired', 'pending', 'renewal_required', 'renewal_overdue', 'closed'));

ALTER TABLE public.licenses
  ADD CONSTRAINT licenses_status_check
  CHECK (status IN ('active', 'expiring_soon', 'expired', 'pending', 'renewal_required', 'renewal_overdue', 'closed'));
