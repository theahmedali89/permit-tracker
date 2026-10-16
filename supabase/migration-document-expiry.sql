-- Document expiry support: expiry_date on documents + allow 'document'
-- resource_type in the deadlines engine so synthetic document-expiration
-- deadline rows can be created by the reminders cron.

-- 1. Expiry column on documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expiry_date DATE;

CREATE INDEX IF NOT EXISTS idx_documents_expiry
  ON documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- 2. Widen deadlines.resource_type CHECK to include 'document'.
-- The original CHECK was declared inline in schema.sql, so Postgres generated
-- its name automatically. Discover it instead of guessing blindly.
-- (Note: pg_get_constraintdef normalizes IN (...) to = ANY (ARRAY[...]),
-- so match on the column name, not the literal "IN".)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.deadlines'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%resource_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.deadlines DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.deadlines
  ADD CONSTRAINT deadlines_resource_type_check
  CHECK (resource_type IN ('permit', 'license', 'inspection', 'document'));

-- 3. RLS: the existing "Members can manage deadlines" FOR ALL policy
-- (schema.sql) already covers rows with resource_type = 'document'.
-- No policy changes needed.
