-- Allow authenticated users to create organizations
-- (INSERT was missing, causing "violates row-level security policy" on signup/onboarding)

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to add themselves as members (needed during org creation)
CREATE POLICY "Users can add themselves to organizations"
  ON organization_members FOR INSERT
  WITH CHECK (user_id = auth.uid());
