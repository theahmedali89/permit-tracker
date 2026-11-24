# Timeline Calculator

Public tool: city + permit type + issue date → predicted expiry,
first-inspection deadline, renewal window, and smart-buffer apply-by date.

## Data discipline

- Only the 20 cities in `lib/shared/jurisdiction-data.ts`
  (in-memory `REGULATION_DATA` — there is no
  `jurisdiction_regulations` DB table behind this feature) are offered.
- Regulation data covers **building permits only**. Other permit types
  return no result — the UI says validity is not verified for that type
  instead of guessing.
- `predictedExpiry` = issue date + `validity_days` (verified field only).
- `firstInspectionDeadline` is derived from the city's published validity
  notes (180-day inactivity rule for most cities, 12 months to commence
  for New York). The basis string is shown next to the date.
- `renewalWindow` opens 30 days before expiry — labelled an **estimate**;
  AHJs open renewals on different schedules.
- `applyBy` uses the same rule as the smart-buffer feature
  (expiry − processing days − 7-day buffer), via the shared
  `applyByDate` helper in `lib/shared/dates.ts` — not a local copy, so
  the two features cannot drift apart. Date helpers (`parseDate`,
  `toDateString`) also come from `lib/shared/dates.ts`.

## Files

- `lib/features/timeline-calculator/index.ts` — pure calculation.
- `app/(public)/tools/permit-timeline-calculator/page.tsx` — metadata,
  FAQ + HowTo schema, disclaimer.
- `app/(public)/tools/permit-timeline-calculator/_timeline-tool.tsx` —
  interactive client component.

Everything is an estimate — the page carries a clear
"estimate only — verify with your AHJ" disclaimer.
