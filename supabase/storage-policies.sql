-- =====================================================================
-- Permit Warden — storage policies for the `documents` bucket (Track A)
-- Run order: AFTER schema.sql / migration-subcontractor-documents.sql.
-- Run in the Supabase SQL editor. Safe to re-run (idempotent guards).
--
-- Storage paths are `<organization_id>/...` (see app/api/documents and
-- the subcontractor portal), so every policy scopes access to the first
-- path segment matching one of the caller's organizations. The service
-- role bypasses RLS and is unaffected.
-- =====================================================================

-- Bucket (private; downloads go through signed URLs / the API).
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Helper predicate, inlined in each policy below:
--   (storage.foldername(name))[1] = the caller's organization id.

DROP POLICY IF EXISTS "Members can read own org documents" ON storage.objects;
CREATE POLICY "Members can read own org documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can upload to own org documents" ON storage.objects;
CREATE POLICY "Members can upload to own org documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can update own org documents" ON storage.objects;
CREATE POLICY "Members can update own org documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Members can delete own org documents" ON storage.objects;
CREATE POLICY "Members can delete own org documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT organization_id::text FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
