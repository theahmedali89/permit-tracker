-- Subcontractor documents (COI / license files) + magic-link invites
-- for the Subcontractor COI & License Portal.

CREATE TABLE IF NOT EXISTS subcontractor_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES subcontractors(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('license', 'coi', 'other')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  expiration_date DATE,
  notes TEXT,
  uploaded_by TEXT NOT NULL DEFAULT 'contractor' CHECK (uploaded_by IN ('contractor', 'subcontractor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcontractor_docs_org ON subcontractor_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_docs_sub ON subcontractor_documents(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_docs_exp ON subcontractor_documents(expiration_date) WHERE expiration_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS subcontractor_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES subcontractors(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcontractor_invites_org ON subcontractor_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_invites_sub ON subcontractor_invites(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_subcontractor_invites_token ON subcontractor_invites(token);

-- RLS
ALTER TABLE subcontractor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractor_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org subcontractor documents"
  ON subcontractor_documents FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own org subcontractor documents"
  ON subcontractor_documents FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own org subcontractor documents"
  ON subcontractor_documents FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org subcontractor documents"
  ON subcontractor_documents FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own org subcontractor invites"
  ON subcontractor_invites FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own org subcontractor invites"
  ON subcontractor_invites FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own org subcontractor invites"
  ON subcontractor_invites FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own org subcontractor invites"
  ON subcontractor_invites FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
