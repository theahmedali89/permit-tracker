-- Fix rotted Austin portal link (old URL 404s after Austin's 2026 site redesign)
-- Verified 2026-10-17: new URL returns HTTP 200
UPDATE ahj_directory
SET portal_url = 'https://www.austintexas.gov/development-services/digital-development',
    verified_at = NOW(),
    notes = COALESCE(notes || ' ', '') || '[2026-10-17] Portal URL updated after Austin site redesign.'
WHERE city = 'Austin' AND state = 'TX';
