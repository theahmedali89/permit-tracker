# Onboarding Sample Data

New orgs start empty, which is a bad first impression. Onboarding offers
sample data: 1 sample project + 3 sample permits.

## What gets seeded

- Project **"Sample Project"** — customer "Sample Customer", fictional
  address "123 Congress Ave, Austin, TX 78701".
- Permits **SAMPLE-001** (Building), **SAMPLE-002** (Electrical),
  **SAMPLE-003** (Plumbing) — jurisdiction "Austin, TX" (a city already
  in the regulation data), with staggered expiries (150 / 60 / 20 days)
  so the dashboard shows active, expiring-soon and attention states.
- Each permit gets a matching `deadlines` row, like a real permit.
- `organizations.sample_data` is set to `true`
  (`supabase/migration-compliance-passport.sql`).

No real person or company names are used. Every row is labelled SAMPLE
in its notes.

## Opt-in

The onboarding form has a checked-by-default checkbox: "Add sample
project & permits so I can explore". Uncheck it to start empty. Seeding
happens in `POST /api/organizations` right after org creation, via the
service client.

## Removal

- Dashboard shows a **"Remove sample data"** button while
  `sample_data` is true.
- `DELETE /api/organization/sample-data` removes permits where
  `permit_number LIKE 'SAMPLE-%'`, their deadline rows, and the
  "Sample Project" project — all scoped to the org — and resets the
  flag. Real data is never touched.

## API

- `seedSampleData(admin, orgId)` — idempotent (no-op if the sample
  project already exists).
- `removeSampleData(supabase, orgId)` → `{ permitsRemoved, projectsRemoved }`.
