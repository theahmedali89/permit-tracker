# Documents

Document upload + expiry updates.

## Purpose

- `index.ts` — `uploadDocument`, `updateDocumentExpiry`,
  moved verbatim from `app/api/documents/route.ts` (pass 2 modularity).
  The route is now thin: auth/org resolution, then one feature call.
- `validateUploadInput` — 10MB limit, allow-listed MIME types,
  `YYYY-MM-DD` expiry check.

## Behaviour (unchanged)

- Never trusts client MIME type or file name: extension must be
  allow-listed (PDF/JPG/PNG), content must match it (magic bytes), and
  the stored name is a fresh UUID.
- Plan-limit enforcement runs BEFORE the storage upload so a rejected
  upload leaves no orphan file (grace mode — see `billing`).
- Cross-tenant FK checks for optional permit / project parents.
- Every write inserts an `audit_events` row.

## Routes

- `POST /api/documents`, `PATCH /api/documents`

## Tables

- `documents`, `audit_events`; Storage bucket `documents`

## Registry

Entry `documents` in `lib/features/registry.ts`.
