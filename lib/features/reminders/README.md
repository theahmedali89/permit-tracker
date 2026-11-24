# Reminders

Deadline reminders (email) for permits, licenses, inspections and
documents.

## Purpose

- `reminder-window.ts` — pure window logic: a deadline `N` days away is
  inside the smallest configured offset `>= N`; it is due when that
  window has not been sent yet. Failed deliveries never count as sent,
  so they retry the next day.
- `sync-deadlines.ts` — `syncDeadline()` upserts (or clears) the pending
  `deadlines` row for one resource. Called by API handlers; the Postgres
  triggers in `supabase/migration-deadline-sync.sql` are the backstop.
- `run-reminder-cron.ts` — the daily cron engine, moved verbatim out of
  `app/api/cron/reminders/route.ts` (pass 2 modularity):
  `runReminderCron({ supabase, resend, fromEmail, appUrl, today? })`.
  Same offsets (90/60/30/14/7/1), same `reminder_rules` honouring, same
  500 error-surfacing (as `ApiError`), same delivery-insert checks,
  same user-list pagination. The duplicated renewal/document offset
  lists are now the single `RENEWAL_OFFSETS` / `DOCUMENT_OFFSETS`
  constants. `matchCity` / `constructionHoursBlock` / `matchRegulation`
  are exported for tests.
- `index.ts` — deadline CRUD (`createDeadline`, `updateDeadline`),
  moved verbatim from `app/api/deadlines/route.ts` (pass 2).
- `reminder-window.test.ts`, `run-reminder-cron.test.ts` — unit tests
  for the window logic and the cron engine (fake Supabase + Resend).

## Routes

- `app/api/cron/reminders/route.ts` — daily cron (Vercel, 09:00 UTC),
  now thin: flag + secret check, builds the clients, calls
  `runReminderCron()`. Loads deadlines without joins, batch-fetches
  resource details per `resource_type`, honours
  `reminder_rules.days_before` per org (default 90/60/30/14/7/1),
  sends via Resend, records `reminder_deliveries`, and recomputes
  stored permit statuses.
- `app/api/deadlines/route.ts` — `POST` / `PATCH` deadline CRUD, now
  thin (auth/org resolution + one feature call).

## Tables

- `deadlines`, `reminder_deliveries`, `reminder_rules`
- `permits`, `licenses`, `inspections`, `documents`,
  `subcontractor_documents`, `organizations`, `organization_members`

## Env

- `CRON_SECRET` (cron auth), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`,
  `NEXT_PUBLIC_APP_URL`

## Registry

Entry `reminders` in `lib/features/registry.ts` (routes, tables and env
keys as above). The cron route checks the flag first: when the feature
is disabled it answers 503 without sending anything.
