# Fee Calculator

Public tool: permit fee + cost of delay.

## Data discipline — only what is already in the repo

- **Daily fines** from `lib/shared/fine-schedules.ts`
  (verified municipal sources; moved there from
  `app/(public)/_components/FineStats.tsx` so features no longer import
  data from a public component file):
  - Baltimore — $500/day
  - Chicago — $1,000/day (repeat violations escalate to $10,000)
  - Palo Alto — $200 → $800/day, escalating
  - New York City — $800–$4,000 **per violation, not per day**, so no
    weekly delay cost can be computed from it (shown as "not a daily fine").
- **Extension fees** from `lib/shared/jurisdiction-data.ts`
  (`extension_fee_usd`) where present — today only New York City ($130).

Everything else — the permit fee itself, re-application cost, crew
downtime — is user-entered and labelled
"estimate — check your AHJ fee schedule". No fee is invented.

## API

- `FINE_SCHEDULES` — the four fine cities with parsed daily rates.
- `calculateDelayCost({ city, weeksLate, permitFeeUsd })` → weekly cost,
  total cost over the late period, verified extension fee, and total
  exposure (low end). Returns `null` for a city with no fine data.
- `formatUsd(n)` — "$1,400" or "unknown".

## Files

- `lib/features/fee-calculator/index.ts`
- `app/(public)/tools/permit-fee-calculator/page.tsx` (+ `_fee-tool.tsx`)
