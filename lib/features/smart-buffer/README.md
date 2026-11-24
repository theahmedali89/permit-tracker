# Smart Buffer

Shows the real "apply by" date for a permit renewal instead of just the
expiry date.

## Rule

```
applyByDate = renewal_deadline − processing_days − 7 days
```

- `processing_days` comes **only** from the verified
  regulation data (`lib/shared/jurisdiction-data.ts`, 20 cities —
  in-memory `REGULATION_DATA`, not a DB table). If a city has no
  published processing time, only the 7-day buffer is applied and the
  UI must say the processing time is unverified.
- The 7 days are a fixed safety margin on top of the jurisdiction's
  processing time.
- The apply-by rule lives once in `lib/shared/dates.ts`
  (`applyByDate`) — the timeline calculator uses the same helper, so
  the two features cannot drift apart. Date helpers (`parseDate`,
  `toDateString`, `daysUntil`) and `parseJurisdiction` also live in
  `lib/shared/`; this module re-exports them for compatibility.

## Urgency

| days until apply-by | label |
| --- | --- |
| < 0 | overdue — "Apply-by date has passed — renew now" |
| 0–7 | urgent — "Apply this week" |
| 8–30 | soon — "Apply soon" |
| > 30 | ok — "On track" |

## API

- `computeSmartBuffer({ renewalDeadline, processingDays })` → result or
  `null` (no renewal deadline). Pure function, no DB.
- `smartBufferForPermit(permit)` → `{ buffer, regulation }` or `null`
  when the permit has no renewal deadline or no regulation data exists
  for its jurisdiction (parsed from `permit.jurisdiction`, e.g.
  `"Austin, TX"`).
- `parseJurisdiction`, `daysUntil`, `urgencyLabel` helpers.

## Where it is surfaced

- Permit detail page (`app/(app)/permits/[id]/page.tsx`): "Renewal buffer"
  card with the apply-by date, the city's processing time, and a source
  link — only when regulation data exists.
- Dashboard "Requires attention" list: shows the apply-by date instead of
  the plain expiry date when a buffer is available.
- The timeline calculator tool uses the same shared `applyByDate`
  helper (`lib/shared/dates.ts`).

## Data discipline

Never invent processing times. If a jurisdiction is not in the
regulation data, the feature returns `null` and the UI shows nothing
rather than a guessed date.
