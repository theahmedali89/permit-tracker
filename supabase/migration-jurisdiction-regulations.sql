-- Jurisdiction regulations: verified per-city building-permit regulatory data
-- (validity, extensions, plan-review processing times).
-- STRICT RULE: every non-NULL value requires a real source_url. Unverifiable -> NULL.
-- Ahmed runs migrations; seed data lives in seed-jurisdiction-regulations.sql.

CREATE TABLE IF NOT EXISTS jurisdiction_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_name text NOT NULL,
  state_code varchar(2),
  city text,
  permit_type text DEFAULT 'building',
  validity_days int,
  validity_notes text,
  extension_allowed boolean,
  extension_fee_usd numeric,
  extension_process text,
  processing_days int,
  source_url text,
  created_at timestamptz DEFAULT now()
);

-- De-dup guard: re-runs of the seed won't duplicate rows (ON CONFLICT DO NOTHING works).
CREATE UNIQUE INDEX IF NOT EXISTS jurisdiction_regulations_city_state_type_idx
  ON jurisdiction_regulations (city, state_code, permit_type);

-- RLS: public read (anon + authenticated SELECT); writes restricted to authenticated users.
ALTER TABLE jurisdiction_regulations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read jurisdiction regulations" ON jurisdiction_regulations;
CREATE POLICY "Public can read jurisdiction regulations"
  ON jurisdiction_regulations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage jurisdiction regulations" ON jurisdiction_regulations;
CREATE POLICY "Authenticated users can manage jurisdiction regulations"
  ON jurisdiction_regulations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update jurisdiction regulations" ON jurisdiction_regulations;
CREATE POLICY "Authenticated users can update jurisdiction regulations"
  ON jurisdiction_regulations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete jurisdiction regulations" ON jurisdiction_regulations;
CREATE POLICY "Authenticated users can delete jurisdiction regulations"
  ON jurisdiction_regulations FOR DELETE
  TO authenticated
  USING (true);
