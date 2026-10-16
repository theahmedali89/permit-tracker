-- Re-apply blog_posts RLS policies (idempotent, safe to re-run).
-- Run this if the blog admin list shows no posts even though /blog shows them.

-- Ensure RLS is on
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read for published posts
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (published = TRUE);

-- Members manage all posts (insert/update/delete/select)
DROP POLICY IF EXISTS "Members can manage posts" ON blog_posts;
CREATE POLICY "Members can manage posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.user_id = auth.uid()
    )
  );
