# Risk Report

Printable HTML risk report: at-risk permits, failed inspections,
non-compliant subcontractors.

## $ exposure — honest by construction

Exposure is computed **only** where fine data already exists in the
repo:

- Daily fines from `lib/shared/fine-schedules.ts` (Baltimore $500/day,
  Chicago $1,000/day, Palo Alto $200–$800/day) → weekly exposure =
  daily rate × 7. Jurisdiction parsing comes from the same shared
  helper (`parseJurisdiction` in `lib/shared/jurisdiction.ts`).
- New York City's $800–$4,000 fine is **per violation, not daily**, so
  no weekly figure is invented — the report shows the per-violation
  range instead.
- Extension fees from the regulation data where published (NYC $130).

Every other permit shows exposure **"unknown"**, and the report header
says so when exposure is not fully known.

## API

- `buildRiskReport(supabase, orgId, orgName)` → `RiskReport`. Reuses
  `lib/reports.ts` `buildReportSummary` for headline counts and the
  per-project breakdown.
- `exposureForJurisdiction(jurisdiction)` — pure $ exposure lookup.

## Page

`app/(app)/reports/risk/page.tsx` — server component rendering the
report with a Print/PDF button (`window.print()`) and print CSS that
hides navigation and buttons (visibility technique, no `globals.css`
changes).
