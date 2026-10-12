-- Gap 5: AHJ renewal links
ALTER TABLE permits ADD COLUMN IF NOT EXISTS renewal_url TEXT;

-- AHJ (Authority Having Jurisdiction) directory
CREATE TABLE IF NOT EXISTS ahj_directory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT,
  county TEXT,
  state TEXT NOT NULL,
  authority_name TEXT NOT NULL,
  portal_url TEXT,
  phone TEXT,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ahj_state ON ahj_directory(state);
CREATE INDEX IF NOT EXISTS idx_ahj_city ON ahj_directory(city);

-- Public read (no RLS needed for directory, but enable with open policy)
ALTER TABLE ahj_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view AHJ directory"
  ON ahj_directory FOR SELECT
  USING (true);

-- Seed with major Texas/Florida jurisdictions
INSERT INTO ahj_directory (city, county, state, authority_name, portal_url) VALUES
('Austin', 'Travis', 'TX', 'City of Austin Development Services', 'https://www.austintexas.gov/department/development-services'),
('Houston', 'Harris', 'TX', 'Houston Permitting Center', 'https://www.houstonpermittingcenter.org'),
('Dallas', 'Dallas', 'TX', 'City of Dallas Building Inspection', 'https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection'),
('Miami', 'Miami-Dade', 'FL', 'Miami-Dade Permits', 'https://www.miamidade.gov/permits'),
('Orlando', 'Orange', 'FL', 'City of Orlando Permitting', 'https://www.orlando.gov/Building-Development/Permits'),
('Tampa', 'Hillsborough', 'FL', 'City of Tampa Construction Services', 'https://www.tampa.gov/construction-services')
ON CONFLICT DO NOTHING;
