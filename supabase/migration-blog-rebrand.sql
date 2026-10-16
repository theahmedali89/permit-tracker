-- Rebrand: Permit Tracker -> Permit Warden in live blog posts.
-- The seed used ON CONFLICT DO NOTHING, so re-running it won't update
-- existing rows. Run this once in Supabase.

UPDATE blog_posts
SET
  title = REPLACE(title, 'Permit Tracker', 'Permit Warden'),
  excerpt = REPLACE(excerpt, 'Permit Tracker', 'Permit Warden'),
  content = REPLACE(content, 'Permit Tracker', 'Permit Warden'),
  meta_title = REPLACE(meta_title, 'Permit Tracker', 'Permit Warden'),
  meta_description = REPLACE(meta_description, 'Permit Tracker', 'Permit Warden'),
  updated_at = NOW()
WHERE
  title LIKE '%Permit Tracker%'
  OR excerpt LIKE '%Permit Tracker%'
  OR content LIKE '%Permit Tracker%'
  OR meta_title LIKE '%Permit Tracker%'
  OR meta_description LIKE '%Permit Tracker%';
