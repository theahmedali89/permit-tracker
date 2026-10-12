-- Permit & License Deadline Tracker - Database Schema
-- Phase 0: Core tables with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (companies)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trade TEXT,
  state TEXT,
  team_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members (users belong to orgs)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  customer TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  project_type TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  start_date DATE,
  expected_completion DATE,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permits (core)
CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  permit_type TEXT NOT NULL,
  permit_number TEXT,
  issuing_authority TEXT,
  jurisdiction TEXT,
  issue_date DATE,
  expiration_date DATE,
  renewal_deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'expiring_soon', 'expired', 'pending', 'renewal_required', 'closed')),
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  -- Source/verification
  source_type TEXT DEFAULT 'user_provided' CHECK (source_type IN ('user_provided', 'verified', 'unverified', 'outdated')),
  source_name TEXT,
  source_url TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines (unified engine)
CREATE TABLE deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('permit', 'license', 'inspection')),
  resource_id UUID NOT NULL,
  deadline_type TEXT NOT NULL, -- 'expiration', 'renewal', 'inspection'
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder rules
CREATE TABLE reminder_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  days_before INTEGER NOT NULL CHECK (days_before > 0),
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminder deliveries (idempotency)
CREATE TABLE reminder_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deadline_id UUID NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  reminder_rule_id UUID REFERENCES reminder_rules(id),
  scheduled_for DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error TEXT,
  provider_message_id TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Idempotency: one delivery per deadline+rule+date
  UNIQUE(deadline_id, reminder_rule_id, scheduled_for)
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  permit_id UUID REFERENCES permits(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit events (lightweight)
CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_permits_org ON permits(organization_id);
CREATE INDEX idx_permits_project ON permits(project_id);
CREATE INDEX idx_permits_status ON permits(status);
CREATE INDEX idx_permits_expiration ON permits(expiration_date);
CREATE INDEX idx_deadlines_org ON deadlines(organization_id);
CREATE INDEX idx_deadlines_due ON deadlines(due_date);
CREATE INDEX idx_deadlines_org_due ON deadlines(organization_id, due_date);
CREATE INDEX idx_deadlines_resource ON deadlines(resource_type, resource_id);
CREATE INDEX idx_reminder_deliveries_deadline ON reminder_deliveries(deadline_id);
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_audit_org ON audit_events(organization_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access data for organizations they belong to

-- Helper function: check if user belongs to org
CREATE OR REPLACE FUNCTION user_belongs_to_org(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: members can read, owners/admins can update
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (user_belongs_to_org(id));

CREATE POLICY "Owners can update their organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Organization members: members can view, owners/admins can manage
CREATE POLICY "Members can view org members"
  ON organization_members FOR SELECT
  USING (user_belongs_to_org(organization_id));

-- Projects: full CRUD for members
CREATE POLICY "Members can manage projects"
  ON projects FOR ALL
  USING (user_belongs_to_org(organization_id));

-- Permits: full CRUD for members
CREATE POLICY "Members can manage permits"
  ON permits FOR ALL
  USING (user_belongs_to_org(organization_id));

-- Deadlines: full CRUD for members
CREATE POLICY "Members can manage deadlines"
  ON deadlines FOR ALL
  USING (user_belongs_to_org(organization_id));

-- Reminder rules: full CRUD for members
CREATE POLICY "Members can manage reminder rules"
  ON reminder_rules FOR ALL
  USING (user_belongs_to_org(organization_id));

-- Reminder deliveries: read for members (system writes via service role)
CREATE POLICY "Members can view reminder deliveries"
  ON reminder_deliveries FOR SELECT
  USING (user_belongs_to_org(organization_id));

-- Documents: full CRUD for members
CREATE POLICY "Members can manage documents"
  ON documents FOR ALL
  USING (user_belongs_to_org(organization_id));

-- Audit events: read for members (system writes)
CREATE POLICY "Members can view audit events"
  ON audit_events FOR SELECT
  USING (user_belongs_to_org(organization_id));
