-- =====================================================================
-- Permit Warden — deadline sync triggers (Track A)
-- Run order: AFTER schema.sql, migration-1.1.sql and
-- migration-document-expiry.sql (deadlines.resource_type already
-- includes 'document'; this file only syncs permit/license/inspection
-- deadlines — document deadlines are created by the cron, as before).
-- Run in the Supabase SQL editor. Safe to re-run (idempotent guards).
--
-- Problem fixed: editing a permit/license/inspection (or deleting it)
-- left the `deadlines` table stale — reminders fired on old dates, or
-- never fired for dates added later. These triggers keep `deadlines`
-- in sync for ANY write path (API, SQL, other services). API handlers
-- additionally call lib/features/reminders/sync-deadlines.ts, which is
-- idempotent with the triggers (same select-then-upsert).
-- =====================================================================

-- One pending deadline per (resource_type, resource_id, deadline_type).
-- The upsert helper below relies on this lookup being cheap.
CREATE INDEX IF NOT EXISTS idx_deadlines_resource_type
  ON deadlines (resource_type, resource_id, deadline_type)
  WHERE status = 'pending';

-- Generic upsert used by all three trigger functions.
CREATE OR REPLACE FUNCTION public.sync_deadline_row(
  p_organization_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_deadline_type TEXT,
  p_due_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_due_date IS NULL THEN
    DELETE FROM public.deadlines
    WHERE resource_type = p_resource_type
      AND resource_id = p_resource_id
      AND deadline_type = p_deadline_type
      AND status = 'pending';
    RETURN;
  END IF;

  UPDATE public.deadlines
  SET due_date = p_due_date,
      organization_id = p_organization_id,
      updated_at = NOW()
  WHERE resource_type = p_resource_type
    AND resource_id = p_resource_id
    AND deadline_type = p_deadline_type
    AND status = 'pending';

  IF NOT FOUND THEN
    INSERT INTO public.deadlines
      (organization_id, resource_type, resource_id, deadline_type, due_date, status)
    VALUES
      (p_organization_id, p_resource_type, p_resource_id, p_deadline_type, p_due_date, 'pending');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_deadlines_for_resource(
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.deadlines
  WHERE resource_type = p_resource_type
    AND resource_id = p_resource_id;
END;
$$;

-- Permits: expiration -> 'expiration', renewal_deadline -> 'renewal'.
CREATE OR REPLACE FUNCTION public.trg_sync_permit_deadlines()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.delete_deadlines_for_resource('permit', OLD.id);
    RETURN OLD;
  END IF;
  PERFORM public.sync_deadline_row(NEW.organization_id, 'permit', NEW.id, 'expiration', NEW.expiration_date);
  PERFORM public.sync_deadline_row(NEW.organization_id, 'permit', NEW.id, 'renewal', NEW.renewal_deadline);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_permit_deadlines ON permits;
CREATE TRIGGER sync_permit_deadlines
  AFTER INSERT OR UPDATE OR DELETE ON permits
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_permit_deadlines();

-- Licenses: expiration_date -> 'expiration', renewal_date -> 'renewal'.
CREATE OR REPLACE FUNCTION public.trg_sync_license_deadlines()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.delete_deadlines_for_resource('license', OLD.id);
    RETURN OLD;
  END IF;
  PERFORM public.sync_deadline_row(NEW.organization_id, 'license', NEW.id, 'expiration', NEW.expiration_date);
  PERFORM public.sync_deadline_row(NEW.organization_id, 'license', NEW.id, 'renewal', NEW.renewal_date);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_license_deadlines ON licenses;
CREATE TRIGGER sync_license_deadlines
  AFTER INSERT OR UPDATE OR DELETE ON licenses
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_license_deadlines();

-- Inspections: scheduled_date -> 'inspection'; a failed inspection with a
-- reinspection_date -> 'reinspection'.
CREATE OR REPLACE FUNCTION public.trg_sync_inspection_deadlines()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.delete_deadlines_for_resource('inspection', OLD.id);
    RETURN OLD;
  END IF;
  PERFORM public.sync_deadline_row(NEW.organization_id, 'inspection', NEW.id, 'inspection', NEW.scheduled_date);
  IF NEW.status = 'failed' AND NEW.reinspection_date IS NOT NULL THEN
    PERFORM public.sync_deadline_row(NEW.organization_id, 'inspection', NEW.id, 'reinspection', NEW.reinspection_date);
  ELSE
    PERFORM public.sync_deadline_row(NEW.organization_id, 'inspection', NEW.id, 'reinspection', NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_inspection_deadlines ON inspections;
CREATE TRIGGER sync_inspection_deadlines
  AFTER INSERT OR UPDATE OR DELETE ON inspections
  FOR EACH ROW EXECUTE FUNCTION public.trg_sync_inspection_deadlines();
