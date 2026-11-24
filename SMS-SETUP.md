# SMS Escalation — Twilio Setup

Permit Warden can escalate unacknowledged deadline alerts by SMS:
site engineer → project manager → owner. SMS is a **Professional /
Business** plan feature.

## 1. Create a Twilio account

1. Sign up at <https://www.twilio.com/try-twilio> (trial accounts work
   for testing but can only message verified numbers).
2. In the Twilio Console, note your **Account SID** and **Auth Token**
   (Console dashboard).
3. Buy or use a Twilio phone number: **Phone Numbers → Manage → Buy a
   number**. SMS-capable numbers in the US work for this feature.

## 2. Environment variables

Add to your deployment (Vercel → Settings → Environment Variables, or
`.env.local` for local dev — never commit real keys):

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+15125550100   # your Twilio number, E.164 format
```

> `.env.example` is owned by another track; these three vars are
> documented here instead.

## 3. Enable it in the app

1. Upgrade the organization to the **Professional** ($99/mo) or
   **Business** ($199/mo) plan — SMS is not available on Free/Starter.
2. Go to **Settings → SMS Escalation** and enable the toggle
   (`organizations.sms_escalation_enabled`).

## 4. How it behaves

- Without the env vars, `sendSms()` logs a warning and returns
  `{ sent: false, reason: "twilio-not-configured" }`. Nothing is sent,
  nothing crashes, and the app never pretends a message went out.
- With the env vars, messages go through the Twilio Messages REST API
  (`POST /2010-04-01/Accounts/{SID}/Messages.json`) with Basic auth.
  No extra npm dependency is used.
- Escalation chain (default): site engineer waits 4h for an ack, then
  project manager (12h), then owner (24h). See
  `lib/features/sms-escalation/index.ts` (`DEFAULT_ESCALATION_CHAIN`,
  `nextEscalationStep`).
- Recipients must be in E.164 format (`+1` + 10 digits for US numbers).
  Invalid numbers are rejected without a network call.

## 5. Test it

1. Set the three env vars and restart the app.
2. From a server context, call `sendSms("+1YOURNUMBER", "Permit Warden test")`
   (e.g. a temporary API route or a Node REPL with the env loaded).
3. Check the Twilio Console → **Messaging → Logs** for delivery status
   and the message SID returned by `sendSms`.

## Costs

Twilio charges per SMS segment (US SMS is typically a fraction of a
cent to a few cents). Check current pricing at
<https://www.twilio.com/en-us/pricing> — Permit Warden adds no markup.
Trial accounts are limited to verified caller IDs; upgrade the Twilio
account to message any number.
