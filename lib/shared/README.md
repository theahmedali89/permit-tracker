# lib/shared — shared code (the ONLY place shared code lives)

Per ARCHITECTURE.md: if two features need the same helper or data, it
goes here — never copied into a second feature folder, and a feature
never imports another feature's folder.

## Modules

- `jurisdiction-data.ts` — verified regulation data (`REGULATION_DATA`,
  `getRegulation`, `hasRegulationContent`). In-memory data only; there
  is no `jurisdiction_regulations` DB table behind it. Moved here from
  `app/(public)/ahj/_regulations.ts` (now a thin re-export shim).
  Fields are NULL where unverifiable — never invented.
- `fine-schedules.ts` — verified municipal fine figures (`FINES`).
  Moved here from `app/(public)/_components/FineStats.tsx` (the
  component now imports from here). Do not add figures without a
  citable primary source.
- `dates.ts` — `parseDate`, `toDateString`, `daysUntil`,
  `applyByDate` (renewal − processing days − 7-day buffer).
  `daysUntil` uses the local-noon semantics of
  `lib/permit-status.ts` (`daysUntilDate`); `parseDate` keeps the
  local-midnight semantics the features already used.
- `jurisdiction.ts` — `parseJurisdiction` ("Austin, TX" → city + state).
- `escape-html.ts`, `org-context.ts`, `rate-limit.ts`,
  `sanitize-file.ts`, `validate.ts` — pre-existing shared helpers.
- `slug.ts` — `generateSlug` (generic URL slugifier). Moved here from
  `lib/features/compliance-passport` (pass 2) because Settings uses it
  too and features never import each other; the passport feature
  re-exports it as `generatePassportSlug`.
- `http.ts` — `ApiError` + `FeatureResult` + `toResponse` /
  `errorResponse` / `runFeature`: the plumbing that lets feature
  functions return results (or throw) while thin routes stay HTTP-only
  (pass 2).
- `route-helpers.ts` — `requireAuthOrg` / `requireAuthUser`: the
  auth + active-org resolution every route used to repeat inline
  (pass 2).
- `plans.ts` — plan limits (`PLANS`, `getPlanLimits`, `checkLimit`).
  Values unchanged. Moved here from `lib/plans.ts` (pass 2); the old
  path is a thin re-export shim.
- `permit-status.ts` — `calculatePermitStatus`, `daysUntilDate`,
  `parseLocalNoon` (local-noon semantics). Moved here from
  `lib/permit-status.ts` (pass 2); old path is a shim.
- `reports.ts` — `buildReportSummary`, `summaryToCsv`. Moved here from
  `lib/reports.ts` (pass 2); old path is a shim.
- `subcontractor-compliance.ts` — `complianceStatus`, `nextExpiration`.
  Moved here from `lib/subcontractor-compliance.ts` (pass 2); shim kept.
- `county-assessors.ts` — `COUNTY_ASSESSORS`, `findAssessor`,
  `assessorSearchUrl`. Moved here from `lib/county-assessors.ts`
  (pass 2); shim kept.
- `license-boards.ts` — `LICENSE_BOARDS`, `getLicenseBoard`. Moved here
  from `lib/license-boards.ts` (pass 2); shim kept.
- `blog-images.ts` — `BLOG_IMAGE_DIMENSIONS`, `blogImageSize`. Moved
  here from `lib/blog-images.ts` (pass 2); shim kept.
- `calendar-crypto.ts` — AES-256-GCM token encryption (`encryptToken`,
  `decryptToken`). Moved here from `lib/calendar-crypto.ts` (pass 2);
  shim kept.
- `platform-admin.ts` — `isPlatformAdmin`, `getPlatformAdminEmails`.
  Moved here from `lib/platform-admin.ts` (pass 2); shim kept.

## Tests

`dates.test.ts`, `jurisdiction.test.ts` (helpers + regulation data).
Note `dates.test.ts` cross-checks shared `daysUntil` against
`lib/permit-status.ts` `daysUntilDate` so the two can never drift.
