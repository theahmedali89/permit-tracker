# SMS Escalation — DISABLED (2026-11-24)

**Status: DISABLED.** SMS escalation does not run. Completing it needs
all three of the following, none of which exists yet:

1. **Twilio keys** — `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_FROM_NUMBER` (see `SMS-SETUP.md`).
2. **Phone-number storage** — no table/column stores a phone number for
   the site engineer, project manager, or owner on the escalation chain
   (the default chain's `phone` fields are empty strings by design).
3. **Inbound ACK handling** — no webhook/route accepts a reply (e.g.
   "ACK") and marks a deadline acknowledged, so nothing could ever stop
   an escalation once started.

Until all three exist, the feature must stay off. The live settings
toggle was removed on 2026-11-24 (`app/(app)/settings/passport-settings.tsx`
no longer exports `SmsSettings`, and the settings page no longer renders
it) because it promised a feature that could never fire. The helpers
below are kept (not deleted) so the work can resume when the three
prerequisites land; `lib/features/registry.ts` marks the feature
`enabled: false`, and the flag is now enforced (`isFeatureEnabled` /
`requireFeatureEnabled` — a disabled feature's route answers 503), so
the switch is real rather than decorative.

## Behaviour (helpers only — nothing calls them in production)

- `sendSms(to, message)` — Twilio Messages REST API via `fetch`, no new
  dependency. When `TWILIO_*` env vars are absent it logs a warning and
  returns `{ sent: false, reason: "twilio-not-configured" }` — it never
  throws and never pretends a message was sent. Invalid E.164 numbers
  are rejected without a network call.
- `nextEscalationStep(chain, unacknowledgedHours)` — which step should be
  messaged now. Default chain: site engineer (4h) → PM (12h) → owner
  (24h). Returns `null` when the chain is exhausted.
- `escalationMessage({ permitLabel, dueDate, role })` — short alert text.

## Settings

~~`app/(app)/settings` had an SMS Escalation toggle
(`organizations.sms_escalation_enabled`, added by
`supabase/migration-compliance-passport.sql`).~~ Removed 2026-11-24:
the toggle is gone (see status above). The DB column remains but
nothing reads it as a live setting. SMS is a Professional / Business
feature per `lib/plans.ts` (`smsReminders`) — that limit still applies
when the feature is eventually enabled.

## Setup

See `SMS-SETUP.md` at the repo root for Twilio account, phone number and
env var setup (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`TWILIO_FROM_NUMBER`).

## Not yet wired

The chain helpers are ready, but no cron job calls them yet — the
reminder cron (Track A's area) is the natural caller when it finds an
unacknowledged deadline and the org has SMS enabled. That wiring is
deliberately left out of this track's scope.
