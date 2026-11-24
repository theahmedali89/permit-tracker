# Calendar

Google Calendar sync + OAuth.

## Purpose

- `index.ts` — `syncCalendar`, `disconnectCalendar`,
  `getCalendarStatus`, moved verbatim from
  `app/api/calendar/sync/route.ts` and `app/api/calendar/status/route.ts`.
- `oauth.ts` — `getOAuthClient`, `signState`/`verifyState` (HMAC-signed,
  10-min state), `startGoogleCalendarOAuth`,
  `handleGoogleCalendarCallback`, moved verbatim from
  `app/api/auth/google-calendar/route.ts` and its callback route.
- `client.ts` — `getCalendarClient` / `getServiceClient`, moved verbatim
  from `app/api/calendar/lib.ts` (that file is deleted; nothing else
  imported it).

## Behaviour (unchanged)

- Sync pushes pending deadlines for the next 90 days, deduped by
  `permitTrackerDeadlineId`; all-day events end the following day
  (Google treats end.date as exclusive).
- Tokens are stored encrypted (AES-256-GCM, `lib/shared/calendar-crypto`);
  legacy plaintext rows are read as a fallback and re-saved encrypted.
  Token values are never logged.
- Only workspace admins can connect/disconnect.

## Routes

- `POST /api/calendar/sync`, `DELETE /api/calendar/sync`,
  `GET /api/calendar/status`, `GET /api/auth/google-calendar`,
  `GET /api/auth/google-calendar/callback`

## Tables

- `google_calendar_tokens`, `deadlines`, `audit_events`

## Env

- `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`,
  `CALENDAR_TOKEN_KEY`, `OAUTH_STATE_SECRET`

## Registry

Entry `calendar` in `lib/features/registry.ts`.
