-- Blog post display columns (2026-11-24).
-- Adds author, category, tags, and featured_image to blog_posts so the blog
-- index can show a featured image + category + reading time, related posts
-- can match on category, and per-post Open Graph images can use the post's
-- own image. Run BEFORE supabase/seed-blog-posts-batch4.sql, which inserts
-- values for these columns. Safe to re-run (IF NOT EXISTS everywhere).
-- No live posts are deleted or altered by this migration.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Backfill: existing live posts were all written by the Permit Warden team
-- and had no category; give them the generic values the blog UI expects.
UPDATE blog_posts SET author = 'Permit Warden' WHERE author IS NULL;
UPDATE blog_posts SET category = 'Guides' WHERE category IS NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_category
  ON blog_posts (category, published_at DESC) WHERE published = TRUE;
