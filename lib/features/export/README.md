# Export

CSV export (permits / licenses / projects).

## Purpose

- `index.ts` — `buildCsvExport` + `toCSV`, moved verbatim from
  `app/api/export/route.ts` (pass 2 modularity). The route is now thin
  (auth + redirect handling, then one feature call).
- The export column sets are table-driven (`EXPORT_DEFS`) — same
  tables, columns, ordering and filenames as the old route.

## Behaviour (unchanged)

- CSV formula-injection escaping: cells starting with `=`, `+`, `-`
  or `@` are prefixed with a single quote.
- Unknown type → plain-text 400 "Invalid type" (not JSON), as before.

## Routes

- `GET /api/export?type=permits|licenses|projects`

## Tables

- `permits`, `licenses`, `projects`

## Registry

Entry `export` in `lib/features/registry.ts`.
