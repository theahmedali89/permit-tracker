# Import

CSV permit import.

## Purpose

- `csv-parser.ts` — RFC 4180 parser: quoted fields may contain commas
  (`"Austin, TX"`), escaped quotes (`""`) and newlines; LF and CRLF
  both work. `parseCsv(text, { maxRows: 1000 })` returns
  `{ rows, errors }`; malformed rows are reported and skipped, never
  silently mis-parsed.
- `csv-parser.test.ts` — unit tests for the parser.
- `index.ts` — `importPermitsCsv()` + `validateImportRows()`, the POST
  handler logic moved verbatim from `app/api/permits/import/route.ts`
  (pass 2 modularity). The route is now thin (feature-flag check,
  auth/org resolution, one feature call).

## Routes

- `POST app/api/permits/import/route.ts` — 5 MB file cap, 1000-row cap,
  per-row date validation, single bulk insert where possible.
- `GET app/api/permits/import/route.ts` — downloads the CSV template.

## Tables

- `permits`, `deadlines`, `audit_events`

## Registry

Entry `import` in `lib/features/registry.ts` (routes, tables and env
keys as above). The registry guard IS wired into the POST route
(`requireFeatureEnabled("import")` → 503 when disabled).
