-- Migration: regulation data corrections (2026-11-24 audit).
--
-- Re-verified against official sources on 2026-11-24 (see AUDIT_REPORT.md §6.1
-- and lib/shared/jurisdiction-data.ts header). The seed files
-- (supabase/seed-jurisdiction-regulations.sql, seed-blog-posts-batch3.sql) were
-- corrected in the same change, but both seeds use ON CONFLICT DO NOTHING, so
-- re-running them does NOT update rows that already exist. This migration
-- applies the same corrections to a live database. Idempotent: safe to re-run
-- (each UPDATE targets the exact old values; a second run matches zero rows
-- for the regulation updates, and REPLACE() is a no-op once applied).
--
-- Run AFTER seed-jurisdiction-regulations.sql and seed-blog-posts-batch3.sql
-- have been applied at least once. No new tables, no schema change.

-- 1. Los Angeles: validity was wrong (180 days). LAMC §98.0602 (as amended
--    Ord. 187,719, eff. 1/23/23) gives 2-year validity, expiring 12 months
--    after issuance if work not commenced, or after 12 continuous months
--    suspended/discontinued/abandoned. Extension: file within 30 days of
--    expiration via Form 41a/42; each extension 6 months within the 2-year
--    limit (LADBS FAQ). Sources:
--    https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414
--    https://dbs.lacity.gov/node/4081
UPDATE jurisdiction_regulations
SET validity_days = 730,
    validity_notes = 'Valid 2 yrs from issuance (LAMC 98.0602, as amended Ord. 187,719 eff. 1/23/23); expires 12 mo after issuance if work not commenced, or after 12 continuous months suspended/discontinued/abandoned. Note: LADBS FAQ still states 6-month no-start/no-work windows — the current code says 12 months.',
    extension_allowed = true,
    extension_process = 'File within 30 days of expiration via Request for Modification Form 41a or 42; each extension 6 months within the 2-year limit (LADBS FAQ)',
    source_url = 'https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414 https://dbs.lacity.gov/node/4081'
WHERE city = 'Los Angeles' AND state_code = 'CA' AND permit_type = 'building'
  AND validity_days = 180;

-- 2. San Antonio: facts confirmed, source replaced (was a Constant Contact
--    newsletter). Official source: City of San Antonio, Permit Process (sa.gov).
--    https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process
UPDATE jurisdiction_regulations
SET validity_notes = 'Every permit application and permit will expire within 180 days if no proof of work or progress has been shown (City of San Antonio, Permit Process)',
    extension_process = 'One or more 180-day extensions when you can prove a valid, justifiable reason for the project suspension or abandonment (City of San Antonio, Permit Process)',
    source_url = 'https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process http://docsonline.sanantonio.gov/DSDDocsOnline/?document=Form%2C+Applications'
WHERE city = 'San Antonio' AND state_code = 'TX' AND permit_type = 'building'
  AND source_url LIKE '%constantcontact.com%';

-- 3. Jacksonville: facts confirmed, source replaced (was a Spark Platform-hosted
--    PDF). Official source: City of Jacksonville, Building Inspection Division FAQs.
--    https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs
UPDATE jurisdiction_regulations
SET validity_notes = 'HOW LONG ARE PERMITS GOOD FOR? 180 days. (City of Jacksonville, Building Inspection Division FAQs; Division enforces Florida Building Code 8th Edition (2023). Permit may become void if no work done during a six-month period — FBC 105.4.1.)',
    source_url = 'https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs'
WHERE city = 'Jacksonville' AND state_code = 'FL' AND permit_type = 'building'
  AND source_url LIKE '%sparkplatform.com%';

-- 4. Indianapolis: validity newly verified at 365 days (was NULL).
--    Indianapolis Code of Ordinances §536-213 (as amended through G.O. 38, 2025):
--    expires by operation of law if construction not commenced within 365 days
--    of issuance, or if commenced but substantially no construction occurs over
--    365 days; administrator may extend for good cause shown in writing for an
--    additional period reasonable under the circumstances. §536-213 text was
--    confirmed via the Zoneomics full-text mirror of the Municode-published
--    code — re-verify on library.municode.com. Extension form (official City
--    document): https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja
UPDATE jurisdiction_regulations
SET validity_days = 365,
    validity_notes = 'Expires by operation of law if construction not commenced within 365 days of issuance, or if commenced but substantially no construction occurs over 365 days (Indianapolis Code §536-213, as amended through G.O. 38, 2025)',
    extension_process = 'Administrator may extend for good cause shown in writing for an additional period reasonable under the circumstances (§536-213); use the City''s Request for Permit Amendment/Update, Extension, Renewal or Cancellation form',
    source_url = 'https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja'
WHERE city = 'Indianapolis' AND state_code = 'IN' AND permit_type = 'building'
  AND validity_days IS NULL;

-- 5. Blog post "building-permit-validity-by-city": same Los Angeles /
--    San Antonio / Indianapolis corrections inside the post content, so the
--    live post stops stating the wrong 180-day figure for Los Angeles.
--    Each REPLACE targets the exact old sentence (verified to occur once in
--    the seed file). If a REPLACE matches nothing (post already corrected),
--    it is a harmless no-op.
UPDATE blog_posts
SET content = REPLACE(content,
  'Our research across 20 major metros found the 180-day abandonment rule in Los Angeles, Chicago, Phoenix, Philadelphia, San Antonio, Austin, Jacksonville, Fort Worth, Charlotte, and San Francisco — ten of the twenty largest U.S. cities use essentially the same standard.',
  'Our research across 20 major metros found the 180-day abandonment rule in Chicago, Phoenix, Philadelphia, San Antonio, Austin, Jacksonville, Fort Worth, Charlotte, and San Francisco — nine of the twenty largest U.S. cities use essentially the same standard. Los Angeles is the exception: its permits are valid for two years under LAMC §98.0602.'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  '| Los Angeles | CA | 180 days of inactivity | Varies — not verified |',
  '| Los Angeles | CA | 2 years; expires 12 mo no-start / 12 mo suspended | Yes — file within 30 days via Form 41a/42; 6-month extensions |'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  '| San Antonio | TX | 180 days without activity | Yes — extension form exists; details vary |',
  '| San Antonio | TX | 180 days without activity | Yes — one or more 180-day extensions for a justifiable reason |'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  '| Indianapolis | IN | Varies — not verified | Yes — extension form exists; details vary |',
  '| Indianapolis | IN | 365 days to begin; 365 days no construction once started | Yes — good-cause written extension, reasonable additional period |'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  'Count the table and the pattern is unmistakable: **ten of the twenty cities run on 180 days.** Los Angeles, Chicago, Phoenix, Philadelphia, San Antonio, Austin, Jacksonville, Fort Worth, Charlotte, and San Francisco all use the 180-day standard for inactivity or abandonment.',
  'Count the table and the pattern is unmistakable: **nine of the twenty cities run on 180 days.** Chicago, Phoenix, Philadelphia, San Antonio, Austin, Jacksonville, Fort Worth, Charlotte, and San Francisco all use the 180-day standard for inactivity or abandonment.'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  'Four cities in the table show "varies — not verified": Dallas, Denver, and Oklahoma City, where we could not confirm validity rules from official municipal sources, and Indianapolis, where only the existence of an extension form could be verified. Three more — Los Angeles, Jacksonville, and Charlotte — have verified validity periods but unverified extension processes.',
  'Three cities in the table show "varies — not verified": Dallas, Denver, and Oklahoma City, where we could not confirm validity rules from official municipal sources. Indianapolis now has a verified 365-day validity (Code §536-213). Two more — Jacksonville and Charlotte — have verified validity periods but unverified extension processes; Los Angeles has a verified 2-year validity and a verified extension process (LAMC §98.0602).'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';

UPDATE blog_posts
SET content = REPLACE(content,
  '- **San Antonio** and **Indianapolis** both have extension forms, though the full process details weren''t verifiable from official sources — call and ask.',
  '- **San Antonio** (one or more 180-day extensions for a justifiable reason) and **Indianapolis** (good-cause written extension) both have verified extension processes — see the table above.'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city';
