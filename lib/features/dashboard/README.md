# Dashboard

Compliance Dashboard data.

## Purpose

- `index.ts` — `getDashboardData`, moved verbatim from
  `app/(app)/dashboard/page.tsx` (pass 2 modularity). The page now only
  resolves auth/membership (redirects) and renders.
- `tallyStatusCounts`, `computeCompliance`, `buildForecast` — the pure
  pieces, unit-tested.

## Behaviour (unchanged)

- Single grouped status query, tallied in JS; action items (expired /
  expiring_soon, 8), upcoming pending deadlines (8), recent audit
  activity (8); 6-month expiry forecast across permits + licenses +
  documents.
- Compliance health weights: expired = 0 pts, expiring_soon = 50 pts,
  active/pending = 100 pts. No permits → 100%.
- Presentation helpers (`daysUntil`, `formatDate`, `deadlineLabel`,
  `timeAgo`) stay in the page — they are rendering, not data.

## Routes

- `GET /dashboard` (page)

## Tables

- `permits`, `licenses`, `documents`, `deadlines`, `audit_events`,
  `organizations`

## Registry

Entry `dashboard` in `lib/features/registry.ts`.
