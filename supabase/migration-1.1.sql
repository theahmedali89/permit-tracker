-- Phase 1.1: Licenses and Inspections tables

CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  license_name TEXT NOT NULL,
  license_number TEXT,
  issuing_authority TEXT,
  state TEXT,
  issue_date DATE,
  expiration_date DATE,
  renewal_date DATE,
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'expiring_soon', 'expired', 'pending', 'renewal_required', 'closed')),
  source_type TEXT DEFAULT 'user_provided' CHECK (source_type IN ('user_provided', 'verified', 'unverified', 'outdated')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  permit_id UUID REFERENCES permits(id) ON DELETE SET NULL,
  inspection_type TEXT NOT NULL,
  requested_date DATE,
  scheduled_date DATE,
  completed_date DATE,
  inspector_name TEXT,
  result TEXT CHECK (result IN ('passed', 'failed', 'follow_up_required', 'cancelled')),
  status TEXT DEFAULT 'not_scheduled' CHECK (status IN ('not_scheduled', 'scheduled', 'passed', 'failed', 'follow_up_required', 'completed')),
  follow_up_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_licenses_org ON licenses(organization_id);
CREATE INDEX idx_licenses_expiration ON licenses(expiration_date);
CREATE INDEX idx_inspections_org ON inspections(organization_id);
CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_date);

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage licenses"
  ON licenses FOR ALL
  USING (user_belongs_to_org(organization_id));

CREATE POLICY "Members can manage inspections"
  ON inspections FOR ALL
  USING (user_belongs_to_org(organization_id));
