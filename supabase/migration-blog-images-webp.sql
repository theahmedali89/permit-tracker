-- Permit Warden: blog images → WebP (<100KB each) + 13 new images (2026-11-24).
--
-- WHAT CHANGED
--   * All 38 original blog images in public/blog/ were converted JPG -> WebP
--     (same filenames, .webp extension; every file verified < 100KB).
--   * 13 new images added (51 total in public/blog/):
--       - 4 AI-generated photos (same 3D-title / blueprint style as the originals):
--         building-permit-expired-1, permit-validity-city-1, permit-reinstate-1,
--         contractor-missed-deadline-3
--       - 9 branded Permit Warden title cards (blueprint grid, 1280x720):
--         building-permit-expired-2/-3, permit-validity-city-2/-3,
--         permit-reinstate-2/-3, extend-permit-3, permit-expired-inspection-3,
--         permit-validity-3
--   * The 3 batch-3 posts previously had NO images at all; they now have 3 each.
--   * The 4 batch-2 posts previously had 2 images each; they now have 3 each.
--   * Blog post pages now render markdown images via next/image with real
--     width/height (lib/blog-images.ts) — no layout shift. Blog index already
--     used next/image for featured_image.
--
-- RUN ORDER: run AFTER all seed files (seed-blog-posts*.sql, add-blog-*.sql).
-- IDEMPOTENT: every statement is guarded (NOT LIKE / IS NULL / REPLACE is a
-- no-op when the text already matches), so re-running is safe.
-- NOTE: the seed files themselves were also updated (.jpg -> .webp), so a
-- fresh database gets WebP references directly; this migration fixes LIVE
-- databases that were seeded with the old .jpg references.

-- ── Part A: convert existing live references JPG -> WebP ──────────────────
UPDATE blog_posts
SET content = REPLACE(content, '.jpg', '.webp'),
    updated_at = NOW()
WHERE content LIKE '%/blog/%.jpg%';

UPDATE blog_posts
SET featured_image = REPLACE(featured_image, '.jpg', '.webp'),
    updated_at = NOW()
WHERE featured_image LIKE '%.jpg';

-- ── Part B: insert the 13 new images ─────────────────────────────────────
-- Batch 3, post 1: what-happens-when-building-permit-expires (had 0 images)
UPDATE blog_posts
SET content = REPLACE(content,
  '## The Consequences, in Order',
  '## The Consequences, in Order' || chr(10) || chr(10) || '![Building permit document stamped EXPIRED beside a calendar with a circled date](/blog/building-permit-expired-1.webp)'),
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires'
  AND content NOT LIKE '%/blog/building-permit-expired-1.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## 2. Fines and Penalties',
  '## 2. Fines and Penalties' || chr(10) || chr(10) || '![Title card: What Happens When a Permit Expires?](/blog/building-permit-expired-2.webp)'),
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires'
  AND content NOT LIKE '%/blog/building-permit-expired-2.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## What to Do the Day You Discover It',
  '## What to Do the Day You Discover It' || chr(10) || chr(10) || '![Title card: Fines, Stop-Work Orders and Re-Applying](/blog/building-permit-expired-3.webp)'),
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires'
  AND content NOT LIKE '%/blog/building-permit-expired-3.webp%';

-- Batch 3, post 2: building-permit-validity-by-city (had 0 images)
UPDATE blog_posts
SET content = REPLACE(content,
  '## The 20-City Comparison Table',
  '## The 20-City Comparison Table' || chr(10) || chr(10) || '![US city skyline with a map and location pins showing building permit validity varies by city](/blog/permit-validity-city-1.webp)'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city'
  AND content NOT LIKE '%/blog/permit-validity-city-1.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## The 180-Day Majority',
  '## The 180-Day Majority' || chr(10) || chr(10) || '![Title card: How Long Is a Permit Valid?](/blog/permit-validity-city-2.webp)'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city'
  AND content NOT LIKE '%/blog/permit-validity-city-2.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## Extension Policies Worth Knowing',
  '## Extension Policies Worth Knowing' || chr(10) || chr(10) || '![Title card: Validity Periods, City by City](/blog/permit-validity-city-3.webp)'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city'
  AND content NOT LIKE '%/blog/permit-validity-city-3.webp%';

-- Batch 3, post 3: how-to-reinstate-expired-building-permit (had 0 images)
UPDATE blog_posts
SET content = REPLACE(content,
  '## The Three Recovery Paths',
  '## The Three Recovery Paths' || chr(10) || chr(10) || '![Contractor handing a stamped APPROVED building permit document to a city clerk](/blog/permit-reinstate-1.webp)'),
    updated_at = NOW()
WHERE slug = 'how-to-reinstate-expired-building-permit'
  AND content NOT LIKE '%/blog/permit-reinstate-1.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## Fees: What Reinstatement Actually Costs',
  '## Fees: What Reinstatement Actually Costs' || chr(10) || chr(10) || '![Title card: How to Reinstate an Expired Permit](/blog/permit-reinstate-2.webp)'),
    updated_at = NOW()
WHERE slug = 'how-to-reinstate-expired-building-permit'
  AND content NOT LIKE '%/blog/permit-reinstate-2.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## Preventing the Next Lapse',
  '## Preventing the Next Lapse' || chr(10) || chr(10) || '![Title card: Reinstatement Checklist and Fees](/blog/permit-reinstate-3.webp)'),
    updated_at = NOW()
WHERE slug = 'how-to-reinstate-expired-building-permit'
  AND content NOT LIKE '%/blog/permit-reinstate-3.webp%';

-- Batch 2: third image for each post (had 2 each)
UPDATE blog_posts
SET content = REPLACE(content,
  '## What Recovery Looks Like: Reinstatement or Reapplication',
  '## What Recovery Looks Like: Reinstatement or Reapplication' || chr(10) || chr(10) || '![Title card: Expired Before Inspection?](/blog/permit-expired-inspection-3.webp)'),
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires-before-inspection'
  AND content NOT LIKE '%/blog/permit-expired-inspection-3.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## Fees and Timelines: What to Expect',
  '## Fees and Timelines: What to Expect' || chr(10) || chr(10) || '![Title card: Extend It Before It Expires](/blog/extend-permit-3.webp)'),
    updated_at = NOW()
WHERE slug = 'how-to-extend-expired-building-permit'
  AND content NOT LIKE '%/blog/extend-permit-3.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## Reading Your Permit Card: What to Look For',
  '## Reading Your Permit Card: What to Look For' || chr(10) || chr(10) || '![Title card: Validity Periods, Explained](/blog/permit-validity-3.webp)'),
    updated_at = NOW()
WHERE slug = 'building-permit-validity-periods-explained'
  AND content NOT LIKE '%/blog/permit-validity-3.webp%';

UPDATE blog_posts
SET content = REPLACE(content,
  '## What a Missed Deadline Actually Costs',
  '## What a Missed Deadline Actually Costs' || chr(10) || chr(10) || '![Contractor checking a permit reminder notification on a smartphone at a construction site](/blog/contractor-missed-deadline-3.webp)'),
    updated_at = NOW()
WHERE slug = 'why-contractors-miss-permit-renewal-deadlines'
  AND content NOT LIKE '%/blog/contractor-missed-deadline-3.webp%';

-- ── Part C: featured images (blog index cards + OG image) ────────────────
-- Only set where none exists, so batch-4 posts (which already set one) are untouched.
UPDATE blog_posts SET featured_image = '/blog/building-permit-expired-1.webp', updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/permit-validity-city-1.webp', updated_at = NOW()
WHERE slug = 'building-permit-validity-by-city' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/permit-reinstate-1.webp', updated_at = NOW()
WHERE slug = 'how-to-reinstate-expired-building-permit' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/permit-expired-inspection-1.webp', updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires-before-inspection' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/extend-permit-1.webp', updated_at = NOW()
WHERE slug = 'how-to-extend-expired-building-permit' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/permit-validity-1.webp', updated_at = NOW()
WHERE slug = 'building-permit-validity-periods-explained' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/contractor-missed-deadline-1.webp', updated_at = NOW()
WHERE slug = 'why-contractors-miss-permit-renewal-deadlines' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/texas-permit-1.webp', updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-texas' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/florida-permit-1.webp', updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-florida' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/california-permit-1.webp', updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-california' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/newyork-permit-1.webp', updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-new-york' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/permit-renewal-1.webp', updated_at = NOW()
WHERE slug = 'building-permit-renewal-guide' AND featured_image IS NULL;

UPDATE blog_posts SET featured_image = '/blog/ahj-guide-1.webp', updated_at = NOW()
WHERE slug = 'what-is-ahj-authority-having-jurisdiction' AND featured_image IS NULL;
