-- Subcontractors table for COI/license tracking
CREATE TABLE IF NOT EXISTS subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trade TEXT,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  license_expiration DATE,
  coi_expiration DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'non_compliant')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcontractors_org ON subcontractors(organization_id);
CREATE INDEX IF NOT EXISTS idx_subcontractors_coi ON subcontractors(coi_expiration) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subcontractors_license ON subcontractors(license_expiration) WHERE status = 'active';

-- RLS
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org subcontractors"
  ON subcontractors FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own org subcontractors"
  ON subcontractors FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own org subcontractors"
  ON subcontractors FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org subcontractors"
  ON subcontractors FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
