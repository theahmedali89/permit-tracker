-- Fix stale Vercel links in live blog posts (2026-10-17).
-- The 6 original posts were seeded with https://permit-tracker-qaspor.vercel.app/signup
-- (stale deployment). Point them at the real domain instead.
-- Safe to re-run: only touches rows that still contain the old URL.

UPDATE blog_posts
SET content = REPLACE(
  content,
  'https://permit-tracker-qaspor.vercel.app/signup',
  'https://permitwarden.com/signup'
)
WHERE content LIKE '%permit-tracker-qaspor.vercel.app%';
