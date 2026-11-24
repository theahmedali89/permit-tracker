-- Track B (New Features) migration.
-- Run once in Supabase SQL editor. All statements are idempotent.
--
-- Contents:
--  1. Compliance Passport columns on organizations (feature 5)
--  2. Onboarding sample-data flag on organizations (feature 11)
--  3. Plan + subscriptions table for Stripe billing (feature 4;
--     table shape per the pre-existing STRIPE-SETUP.md)
--  4. SMS escalation toggle on organizations (feature 9)
--  5. project_subcontractors join table for the Project Gate (feature 6)
--     — the repo had no project <-> subcontractor link before this.

-- 1. Compliance Passport -------------------------------------------------
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS compliance_passport_slug TEXT UNIQUE;
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS compliance_passport_public BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_orgs_passport_slug
  ON organizations (compliance_passport_slug)
  WHERE compliance_passport_public = TRUE;

-- 2. Sample data flag -----------------------------------------------------
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sample_data BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Billing --------------------------------------------------------------
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions (organization_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view own org subscriptions" ON subscriptions;
CREATE POLICY "Members can view own org subscriptions"
  ON subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- 4. SMS escalation toggle ------------------------------------------------
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS sms_escalation_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 5. Project <-> subcontractor links (Project Gate) -----------------------
CREATE TABLE IF NOT EXISTS project_subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES subcontractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, subcontractor_id)
);
CREATE INDEX IF NOT EXISTS idx_project_subs_project ON project_subcontractors (project_id);
CREATE INDEX IF NOT EXISTS idx_project_subs_org ON project_subcontractors (organization_id);

ALTER TABLE project_subcontractors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can manage project subcontractors" ON project_subcontractors;
CREATE POLICY "Members can manage project subcontractors"
  ON project_subcontractors FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
