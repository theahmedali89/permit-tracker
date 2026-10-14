-- Team invites (pending member invitations)
-- Run in Supabase SQL editor after schema.sql

CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

CREATE INDEX IF NOT EXISTS idx_team_invites_org ON team_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);

ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Members can view pending invites for their org
DROP POLICY IF EXISTS "Members can view team invites" ON team_invites;
CREATE POLICY "Members can view team invites"
  ON team_invites FOR SELECT
  USING (user_belongs_to_org(organization_id));

-- Owners/admins can manage invites
DROP POLICY IF EXISTS "Admins can manage team invites"
  ON team_invites;
CREATE POLICY "Admins can manage team invites"
  ON team_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = team_invites.organization_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );
