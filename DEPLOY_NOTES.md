# Deploy Notes — Permit Warden v2 audit fix pass (24 November 2026)

**Deploy target:** Contabo VPS — PM2 app `permitwarden`, port 3002, nginx, `/root/permit-tracker`.
**Vercel is a fallback only.** The Vercel cron is DISABLED; reminders run from the VPS crontab (`0 9 * * *` → `/api/cron/reminders`). Ignore any deploy instructions in `CHANGELOG_MERGED.md` that say "deploy on Vercel". Do NOT split the app, subdomain, or hosting.

## 1. What this release contains

Only the files in `CHANGED_FILES.md` (75 modified + 20 new code files + 3 report files). Apply them onto the v2 code (`permit-warden-v2.zip`, 328 files) — copy each changed file over the same repo-relative path. Do NOT apply them onto the pre-v2 live code. The original `permit-tracker-main.zip` is untouched by this pass.

Headline changes: plan-limit enforcement (grace mode), Stripe checkout UI, Project Gate linking API + UI, SMS escalation **disabled** (registry `enabled: false` + toggle removed), blog admin 403, registry `enabled` enforcement, shared data modules, Stripe webhook fail-closed, official-source corrections (LA validity 180 → 730 days, Indianapolis 365 days, Chicago/DC sources), SEO fixes (reset-password noindex, title doubling, visible FAQ/HowTo, verification dates, 7 images recompressed under 100,000 bytes). Full detail: `AUDIT_REPORT.md` §6.

## 2. DB migrations to run — in exact order

Run in the Supabase SQL editor, in this order. These are **in addition to** the v2 migrations already listed in `CHANGELOG_MERGED.md` (run those first if they have not been run yet, in the order given there: `migration-security-fixes.sql` → `migration-deadline-sync.sql` → `migration-compliance-passport.sql` → `migration-blog-columns.sql` → `storage-policies.sql` → `seed-blog-posts-batch4.sql` → `migration-blog-images-webp.sql`).

**Order note that matters:** the old `supabase/migration-jurisdiction-regulations.sql` still contains `USING (true)` / `WITH CHECK (true)` write policies on `jurisdiction_regulations`. They are dropped by `migration-security-fixes.sql` — so `migration-security-fixes.sql` **must run after** `migration-jurisdiction-regulations.sql`. If the security-fixes migration was already run before the regulations migration, run it again (it uses `DROP POLICY IF EXISTS` / idempotent DDL).

| # | File | What it does | Run after |
|---|---|---|---|
| 1 | `supabase/migration-regulation-corrections-2026-11-24.sql` **(NEW in this pass)** | UPDATEs 4 `jurisdiction_regulations` rows (LA validity 180→730 + extension + LAMC source; San Antonio sa.gov source + extension process; Jacksonville jacksonville.gov source; Indianapolis validity NULL→365 + extension + City form source) and `REPLACE()`-updates the `building-permit-validity-by-city` blog post content (7 replacements). Idempotent — safe to re-run. | After `seed-jurisdiction-regulations.sql` and `seed-blog-posts-batch3.sql` have been applied at least once (the seeds use `ON CONFLICT DO NOTHING` and do NOT update existing rows — this migration is the only way the corrections reach a live DB). Run it **last**, after all v2 migrations/seeds listed above. |

**No other new migrations in this pass.** No tables were added, dropped, or altered. The SMS disable, Project Gate linking, and billing grace mode need no schema change (the `project_subcontractors` join table already exists from `migration-compliance-passport.sql`).

**Verify after running:** `SELECT city, validity_days FROM jurisdiction_regulations WHERE city IN ('Los Angeles','San Antonio','Jacksonville','Indianapolis');` — expect Los Angeles 730, San Antonio 180, Jacksonville 180, Indianapolis 365. And `SELECT slug FROM blog_posts WHERE slug = 'building-permit-validity-by-city';` then confirm the post body no longer contains "180 days of inactivity" for Los Angeles.

## 3. Environment variables

**No NEW env vars in this pass.** The following existing vars matter for the new behaviour (names only — never values; set them in the VPS `.env`, never commit them):

| Var | Required for | Behaviour without it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Everything | Build fails fast with a clear error when absent (see §5). Do not deploy without them. |
| `STRIPE_SECRET_KEY` (+ Stripe price IDs per plan) | Billing: checkout + plan-limit enforcement | Checkout returns 501 "Stripe keys not configured"; plan limits run in **grace mode** (writes allowed, warning logged). This is deliberate — do NOT expect limits to block anyone until Stripe is configured. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook | **New fail-closed behaviour:** without it the webhook returns 501 and never processes events. Previously it parsed unsigned JSON with only a warning — that hole is closed. Set this before enabling Stripe webhooks in the Stripe dashboard. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | SMS escalation | Feature is **disabled** in the registry (`enabled: false`) and the Settings toggle was removed. Setting these keys alone does NOT re-enable SMS — re-enabling also needs phone-number storage, cron wiring, and an inbound ACK webhook (see §6). |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Email reminders, team invites | Cron sends nothing without them (failures are logged as `failed` deliveries for retry). |
| `CRON_SECRET` | `/api/cron/reminders` auth | Cron route rejects unauthenticated calls. Must match the secret in the VPS crontab curl. |
| `CALENDAR_TOKEN_KEY` | Google Calendar token encryption | Calendar sync is unavailable without it (existing behaviour). |
| `PLATFORM_ADMIN_EMAILS` | Blog/regulations admin writes | Blog POST/PATCH/DELETE now return 403 for non-admins even if RLS were misconfigured. Put the owner's email here. |
| `NEXT_PUBLIC_GA_ID` | Analytics (consent-gated) | Falls back to a hardcoded GA ID in `components/cookie-consent.tsx` — known issue, flagged in the audit; set the env var to avoid the fallback. |

## 4. Build + verify steps (VPS)

```bash
# On the VPS, in /root/permit-tracker (keep the previous release first — see §5)
cd /root/permit-tracker
cp -a /root/permit-tracker /root/permit-tracker-prev-$(date +%Y%m%d)   # keep a rollback copy
# Apply this release's files over the repo (same repo-relative paths), then:
npm install --legacy-peer-deps
npx tsc --noEmit        # must pass, zero errors
npm run test            # vitest — must pass (108 tests expected)
npm run build           # must complete; needs real Supabase env vars (see §5 note)
```

Then start it fresh (do NOT just restart — see §5):

```bash
pm2 delete permitwarden || true
pm2 start npm --name permitwarden -- start -- -p 3002
pm2 save
sudo nginx -t && sudo systemctl reload nginx
pm2 logs permitwarden --lines 50   # watch for startup errors
```

**Verify (all against the VPS, port 3002):**
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/` → 200
- `curl -s http://localhost:3002/ahj/california/los-angeles | grep -o "730 days" | head -1` → the LA page shows 730-day validity (after the migration in §2 has run)
- `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3002/reset-password` → 200 with `X-Robots-Tag`/`robots` noindex in the HTML (check `<meta name="robots" content="index,follow">` is **absent** and `noindex` is present)
- `curl -s http://localhost:3002/pricing | grep -o "Billing is not configured yet" | head -1` → only if Stripe is unconfigured and a checkout is attempted (do NOT complete a real checkout without keys)
- Sign in as an admin and confirm: the Settings page shows a Billing card and **no SMS toggle**; a project page shows "Subcontractors on this project" with the "No subcontractors linked yet" state when empty.
- After the next `0 9 * * *` cron run, check Supabase: `SELECT status, COUNT(*) FROM reminder_deliveries WHERE created_at > NOW() - INTERVAL '1 day' GROUP BY status;` — `sent` rows should appear; `failed` rows mean Resend/cron trouble (check the PM2 logs).
- Confirm the old v2 behaviours still hold: `/signin` is noindex; thin AHJ city pages are noindex and absent from `/sitemap.xml`.

## 5. Build status and the fail-fast note (read before building)

- `npx tsc --noEmit`: **PASS** (zero errors) in the audit sandbox.
- `npm run test`: **PASS — 108 tests, 12 files, 0 failed** in the audit sandbox.
- `npm run build`: **PASS — completed in the audit sandbox with placeholder Supabase env** (`NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co`, placeholder keys; recorded as placeholder env, not a real project). Compiled successfully in 78s; TypeScript finished with no errors; static pages generated **169/169 in 54s**; route table printed; `.next/BUILD_ID` written. Total build time ~6 minutes, most of it in static generation while DB calls to the unreachable placeholder host timed out one by one. The designed fallbacks worked: `[ahj] generateStaticParams: DB unavailable, skipping static generation` and `[sitemap] DB fetch failed, serving static entries only`. **Caveat:** with placeholder env, DB-backed pages prerendered with the fallback (empty AHJ/sitemap data); on the VPS with real Supabase credentials the same build will prerender the real data.

**Fail-fast behaviour (observed, not assumed):** `lib/supabase/public.ts` rejects individual DB calls immediately when Supabase env vars are absent — but the build as a whole does **not** exit fast. A no-env build started in the audit sandbox compiled, passed TypeScript, and was already generating static pages (42/169) when a 90s timeout stopped it; it falls back (AHJ static generation skipped, sitemap static-only) and keeps going. The placeholder-env build completed in ~6 minutes. **On the VPS, always build with the real Supabase URL/keys** — the build is slow with unreachable/placeholder values because every DB call times out one by one. Do not expect a fast failure; expect a slow build that still completes.

## 6. Rollback

Do NOT rely on `pm2 restart` alone — a restart reuses the same (possibly broken) build output.

```bash
pm2 delete permitwarden
rm -rf /root/permit-tracker
cp -a /root/permit-tracker-prev-<date> /root/permit-tracker
cd /root/permit-tracker
npm install --legacy-peer-deps
npm run build
pm2 start npm --name permitwarden -- start -- -p 3002
pm2 save
sudo systemctl reload nginx
```

**DB rollback:** this release adds no tables and alters no schema. The only data change is `migration-regulation-corrections-2026-11-24.sql` (4 regulation rows + 1 blog post). If you must roll the data back, restore those 4 rows and the blog post from a pre-deploy database backup; there is no down-migration (the old values are in `supabase/seed-jurisdiction-regulations.sql` and `seed-blog-posts-batch3.sql` as they stood before this pass — the LA 180-day value was *wrong*, so rolling it back reintroduces a known error; prefer keeping the corrections).

## 7. Anything Ahmed must approve or provide before deploy

1. **`/signin` sitemap decision** (see AUDIT_REPORT.md §7-1): the brief says it stays in the sitemap; the code deliberately removed it. Confirm which is right before deploy — no code change was made.
2. **Stripe keys** (optional for this deploy): without `STRIPE_SECRET_KEY` + price IDs, checkout 501s and plan limits run in grace mode (nothing is blocked). Safe to deploy without keys; billing activates when keys are added. If keys are added, also set `STRIPE_WEBHOOK_SECRET` — the webhook now **refuses unsigned payloads** (previously it trusted them with a warning).
3. **Re-verify Indianapolis §536-213 on `library.municode.com`** before relying on the 365-day validity in any legal context (confirmed via a Zoneomics mirror in this pass).
4. **Free `maxTeamMembers = 1`**: team invites on free orgs 402 today. Decide the pricing (this pass did not change `lib/plans.ts`).
5. **SMS re-enablement is NOT part of this release.** If SMS is wanted later, it needs: Twilio keys, a phone-number store (new table/columns + migration), wiring `sendSms` into the reminder cron (or a second cron), and an inbound ACK webhook. Do not just flip the registry flag — the feature has no phone numbers to send to.
6. **No other approvals needed.** No new secrets, no pricing changes, no slug changes, no new page clusters.
