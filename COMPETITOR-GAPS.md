# Competitor Gaps - Implementation Roadmap

## ✅ Implemented (2026-10-12 overnight)

### Gap 3: Inspection Checklist & Re-Inspection Failure Tracker
- **Status:** Database fields added (`correction_notes`, `reinspection_date`, `correction_photo_url`)
- **Migration:** `supabase/migration-inspection-fail.sql`
- **TODO:** UI for marking inspection as failed with correction notes

### Gap 4: PWA with Offline Capability
- **Status:** PWA manifest added, theme color, installable
- **File:** `public/manifest.json`
- **TODO:** Service worker for offline PDF caching (Phase 2)

### Gap 5: Multi-County AHJ Direct Link Directory
- **Status:** `ahj_directory` table + `renewal_url` on permits + 6 seeded jurisdictions (TX/FL)
- **Migration:** `supabase/migration-ahj.sql`
- **TODO:** UI to browse directory and auto-suggest renewal URL based on jurisdiction

### Gap 6: Free Excel Importer
- **Status:** CSV import API with template download, validation, error reporting
- **Route:** `POST /api/permits/import` + `GET /api/permits/import` (template)
- **TODO:** UI upload page, Excel (.xlsx) support

## 📋 Phase 2 (Needs Ahmed's approval)

### Gap 1: Subcontractor Insurance (COI) & License Portal
**Why Phase 2:** Requires new tables, magic link auth, email/SMS invites
**Tables needed:**
- `subcontractors` (id, org_id, name, trade, email, phone)
- `subcontractor_documents` (id, subcontractor_id, doc_type: license/coi, file, expiration_date, status)
- `subcontractor_invites` (id, subcontractor_id, magic_token, expires_at)

**Flow:**
1. Contractor adds subcontractor (name + email/phone)
2. App sends magic link via email
3. Subcontractor uploads license + COI (no login needed)
4. App tracks expiration, sends reminders
5. Dashboard shows compliance status per sub

**Estimated:** 3-4 days

### Gap 2: SMS/WhatsApp Alerts
**Why Phase 3:** Prompt explicitly defers SMS from V1 (Section 57)
**Architecture ready:** Notification service separates channel from deadline logic
**Providers to evaluate:** Twilio, Vonage
**Estimated cost:** ~$0.01-0.05 per SMS

**Implementation:**
1. Add `notification_preferences` table (user_id, channel: email/sms/whatsapp)
2. Add SMS provider adapter
3. Update reminder processor to check preferences
4. WhatsApp via Twilio or Meta API

**Estimated:** 2-3 days + provider setup

## 🎯 USP (Updated Positioning)
"Not just a permit alert tool — an all-in-one compliance board that handles your city permits, sub-contractor licenses, and on-site inspections via simple SMS."
