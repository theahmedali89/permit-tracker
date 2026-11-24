# Compliance Passport

A public, shareable verification page for a contractor — the "verify this
contractor" link they can put on quotes.

## What it shows (and only this)

- License status: counts (total / active / expiring soon / expired) and
  the nearest expiry date.
- Active permits: count only.
- COI validity: counts of valid vs expired COI documents and the nearest
  expiry date.

It **never** exposes document contents, file names, storage paths,
permit numbers, addresses, or private notes.

## Opt-in

- `organizations.compliance_passport_slug` (unique text) and
  `organizations.compliance_passport_public` (boolean, default false)
  — added by `supabase/migration-compliance-passport.sql`.
- The slug is generated server-side in `PATCH /api/organization` when
  the org enables the passport (slugified company name + 6 random
  characters). The public URL is `/verify/[slug]`.
- Unknown slug or not opted in → `notFound()`.

## API

- `generatePassportSlug(name)` — slugify + random suffix.
- `getPublicPassport(supabase, slug)` → `PublicPassport | null`.
  Date math uses the shared `daysUntil` from `lib/shared/dates.ts`
  (local-noon semantics, same as `lib/permit-status.ts`).

## Registry enforcement

`PATCH /api/organization` refuses to enable the passport (503) when
the `compliance-passport` entry is disabled in
`lib/features/registry.ts`; other org fields on that route are
unaffected.

## Files

- `lib/features/compliance-passport/index.ts`
- `app/(public)/verify/[slug]/page.tsx`
- Settings toggle: `app/(app)/settings/passport-settings.tsx`
  (rendered from the settings page).
