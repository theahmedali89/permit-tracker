-- Permit Warden: add images to 6 original blog posts (2026-10-17).
-- Run manually in Supabase SQL editor AFTER pushing public/blog/ images.
-- Safe: uses REPLACE on H2 headings; only inserts image markdown, no text changes.
-- All images <100KB, stored in public/blog/, referenced as /blog/<file>.jpg
-- Idempotent: NOT LIKE guard prevents double-insertion on re-run.

-- how-to-get-building-permit-texas: texas-permit-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Does Texas Require a Building Permit?',
  '## Does Texas Require a Building Permit?' || chr(10) || chr(10) || '![Texas state capitol representing Texas building permit authority](/blog/texas-permit-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-texas'
  AND content NOT LIKE '%/blog/texas-permit-1.jpg%';

-- how-to-get-building-permit-texas: texas-permit-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Step-by-Step: How to Get a Building Permit in Texas',
  '## Step-by-Step: How to Get a Building Permit in Texas' || chr(10) || chr(10) || '![Step-by-step Texas building permit application process with documents and checklist](/blog/texas-permit-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-texas'
  AND content NOT LIKE '%/blog/texas-permit-2.jpg%';

-- how-to-get-building-permit-texas: texas-permit-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Common Mistakes That Delay Texas Permits',
  '## Common Mistakes That Delay Texas Permits' || chr(10) || chr(10) || '![Common mistakes that delay Texas building permits marked on construction plans](/blog/texas-permit-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-texas'
  AND content NOT LIKE '%/blog/texas-permit-3.jpg%';

-- how-to-get-building-permit-florida: florida-permit-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## How Florida''s Permit System Works',
  '## How Florida''s Permit System Works' || chr(10) || chr(10) || '![Florida Building Code requirements for coastal construction](/blog/florida-permit-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-florida'
  AND content NOT LIKE '%/blog/florida-permit-1.jpg%';

-- how-to-get-building-permit-florida: florida-permit-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Step-by-Step: How to Get a Building Permit in Florida',
  '## Step-by-Step: How to Get a Building Permit in Florida' || chr(10) || chr(10) || '![Florida building permit application steps via online portal](/blog/florida-permit-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-florida'
  AND content NOT LIKE '%/blog/florida-permit-2.jpg%';

-- how-to-get-building-permit-florida: florida-permit-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Florida-Specific Issues Contractors Must Know',
  '## Florida-Specific Issues Contractors Must Know' || chr(10) || chr(10) || '![Hurricane code requirements for Florida buildings](/blog/florida-permit-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-florida'
  AND content NOT LIKE '%/blog/florida-permit-3.jpg%';

-- how-to-get-building-permit-california: california-permit-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## California''s Permit Landscape: State Rules, Local Process',
  '## California''s Permit Landscape: State Rules, Local Process' || chr(10) || chr(10) || '![California Title 24 energy code requirements for buildings](/blog/california-permit-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-california'
  AND content NOT LIKE '%/blog/california-permit-1.jpg%';

-- how-to-get-building-permit-california: california-permit-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Step-by-Step: How to Get a Building Permit in California',
  '## Step-by-Step: How to Get a Building Permit in California' || chr(10) || chr(10) || '![California building permit process steps](/blog/california-permit-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-california'
  AND content NOT LIKE '%/blog/california-permit-2.jpg%';

-- how-to-get-building-permit-california: california-permit-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Mistakes That Delay California Permits',
  '## Mistakes That Delay California Permits' || chr(10) || chr(10) || '![How to avoid delays in California building permit approval](/blog/california-permit-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-california'
  AND content NOT LIKE '%/blog/california-permit-3.jpg%';

-- how-to-get-building-permit-new-york: newyork-permit-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## New York''s Two Permit Worlds: NYC vs. Everywhere Else',
  '## New York''s Two Permit Worlds: NYC vs. Everywhere Else' || chr(10) || chr(10) || '![NYC versus upstate New York building permit systems compared](/blog/newyork-permit-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-new-york'
  AND content NOT LIKE '%/blog/newyork-permit-1.jpg%';

-- how-to-get-building-permit-new-york: newyork-permit-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Step-by-Step: How to Get a Building Permit in New York',
  '## Step-by-Step: How to Get a Building Permit in New York' || chr(10) || chr(10) || '![New York building permit application steps with documents](/blog/newyork-permit-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-new-york'
  AND content NOT LIKE '%/blog/newyork-permit-2.jpg%';

-- how-to-get-building-permit-new-york: newyork-permit-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## NYC Issues That Surprise Contractors',
  '## NYC Issues That Surprise Contractors' || chr(10) || chr(10) || '![NYC Department of Buildings violations at construction site](/blog/newyork-permit-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'how-to-get-building-permit-new-york'
  AND content NOT LIKE '%/blog/newyork-permit-3.jpg%';

-- building-permit-renewal-guide: permit-renewal-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## The Direct Answer: When Do Permits Need Renewal?',
  '## The Direct Answer: When Do Permits Need Renewal?' || chr(10) || chr(10) || '![Building permit expiration deadline marked on calendar](/blog/permit-renewal-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'building-permit-renewal-guide'
  AND content NOT LIKE '%/blog/permit-renewal-1.jpg%';

-- building-permit-renewal-guide: permit-renewal-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## What Happens When a Permit Lapses',
  '## What Happens When a Permit Lapses' || chr(10) || chr(10) || '![Expired building permit consequences at halted construction site](/blog/permit-renewal-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'building-permit-renewal-guide'
  AND content NOT LIKE '%/blog/permit-renewal-2.jpg%';

-- building-permit-renewal-guide: permit-renewal-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## A Practical Renewal System for Busy Contractors',
  '## A Practical Renewal System for Busy Contractors' || chr(10) || chr(10) || '![Permit deadline tracking system dashboard for contractors](/blog/permit-renewal-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'building-permit-renewal-guide'
  AND content NOT LIKE '%/blog/permit-renewal-3.jpg%';

-- what-is-ahj-authority-having-jurisdiction: ahj-guide-1.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## Who Can Be an AHJ?',
  '## Who Can Be an AHJ?' || chr(10) || chr(10) || '![What is an AHJ - Authority Having Jurisdiction explained](/blog/ahj-guide-1.jpg)'),
    updated_at = NOW()
WHERE slug = 'what-is-ahj-authority-having-jurisdiction'
  AND content NOT LIKE '%/blog/ahj-guide-1.jpg%';

-- what-is-ahj-authority-having-jurisdiction: ahj-guide-2.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## How to Identify Your AHJ',
  '## How to Identify Your AHJ' || chr(10) || chr(10) || '![How to find your Authority Having Jurisdiction on a map](/blog/ahj-guide-2.jpg)'),
    updated_at = NOW()
WHERE slug = 'what-is-ahj-authority-having-jurisdiction'
  AND content NOT LIKE '%/blog/ahj-guide-2.jpg%';

-- what-is-ahj-authority-having-jurisdiction: ahj-guide-3.jpg
UPDATE blog_posts
SET content = REPLACE(content,
  '## The Multi-AHJ Problem',
  '## The Multi-AHJ Problem' || chr(10) || chr(10) || '![Managing building permits across multiple AHJ jurisdictions](/blog/ahj-guide-3.jpg)'),
    updated_at = NOW()
WHERE slug = 'what-is-ahj-authority-having-jurisdiction'
  AND content NOT LIKE '%/blog/ahj-guide-3.jpg%';

