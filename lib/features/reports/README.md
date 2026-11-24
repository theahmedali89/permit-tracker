# Reports

Simple reports (expiring + compliance).

## Purpose

- `index.ts` — `getReport` + `tallyReportStatuses`, moved verbatim
  from `app/api/reports/route.ts` (pass 2 modularity). The route is now
  thin (auth + redirect handling, then one feature call).
- The richer compliance summary (`buildReportSummary` /
  `summaryToCsv`) lives in `lib/shared/reports.ts` and is served by
  `/api/reports/summary`, whose route was also thinned (its duplicate
  org lookup replaced by the shared `requireAuthOrg` helper).

## Behaviour (unchanged)

- `expiring`: permits expiring in the next 90 days.
- `compliance`: status tallies for permits + licenses.
- Unknown type → 400 "Invalid report type".

## Routes

- `GET /api/reports?type=expiring|compliance`,
  `GET /api/reports/summary[?format=csv]`

## Tables

- `permits`, `licenses`

## Registry

Entry `reports` in `lib/features/registry.ts`.
