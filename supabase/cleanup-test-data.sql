-- Cleanup test data from app testing (2026-10-17)
-- Run in Supabase SQL Editor. Safe: targets only the two test records.

-- 1. Preview what will be deleted (run first)
SELECT id, permit_number, permit_type, status
FROM permits
WHERE permit_number = 'TEST-2026-001';

SELECT id, name, trade
FROM subcontractors
WHERE name = 'Test Sub Co';

-- 2. Delete (run after verifying preview)
DELETE FROM permits WHERE permit_number = 'TEST-2026-001';
DELETE FROM subcontractors WHERE name = 'Test Sub Co';

-- 3. Confirm they're gone
SELECT count(*) AS remaining_test_permits FROM permits WHERE permit_number = 'TEST-2026-001';
SELECT count(*) AS remaining_test_subs FROM subcontractors WHERE name = 'Test Sub Co';
