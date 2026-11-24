# Auth

Email/password auth + OAuth callback.

## Purpose

- `index.ts` — `signInWithPassword`, `signUp`,
  `requestPasswordReset`, `exchangeCodeForSession`, `signOut`, moved
  from the five `app/auth/*/route.ts` handlers (pass 2 modularity).
  Each function returns the redirect target; the route passes it to
  `redirect()`. The routes are now thin wrappers.
- `safeNextPath` — the callback's open-redirect guard (only in-app
  paths starting with a single "/").
- `AuthRateLimitedError` — thrown on rate-limit hits; the route turns
  it into the 429 `rateLimitResponse`.

## Behaviour (unchanged)

- Rate limits: signin 10, signup 10, reset 5 per IP per 15 minutes
  (via `lib/shared/rate-limit`).
- Same error query params and redirect targets as before.

## Routes

- `POST /auth/signin`, `POST /auth/signup`, `POST /auth/signout`,
  `POST /auth/reset-password`, `GET /auth/callback`

## Env

- `NEXT_PUBLIC_APP_URL` (email redirect targets)

## Registry

Entry `auth` in `lib/features/registry.ts`.
