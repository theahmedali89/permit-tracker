# Team

Team invites & membership.

## Purpose

- `index.ts` — `listTeam`, `inviteMember`, `removeTeamMember`,
  `acceptInvite`, moved verbatim from `app/api/team/route.ts` and
  `app/api/team/accept/route.ts` (pass 2 modularity). The routes are
  now thin: auth resolution, then one feature call.
- `validateInvite` — email + role validation; `isAdminRole` —
  owner/admin check.

## Behaviour (unchanged)

- Only owners/admins can invite or manage the team (403 otherwise).
- Plan-limit enforcement before creating an invite (402 + `upgrade`).
- Duplicate pending invite → 409. Invite email is best-effort (a mail
  failure is reported, not fatal); invite token is a fresh UUID.
- Removing the last owner is refused; you cannot remove yourself; a
  delete matching 0 rows reports failure.
- Accept verifies the token server-side and inserts membership with the
  service-role client (the "add yourself to an org" RLS policy was
  deliberately removed — tenant-takeover risk).

## Routes

- `GET /api/team`, `POST /api/team`, `DELETE /api/team`,
  `POST /api/team/accept`

## Tables

- `organization_members`, `team_invites`

## Env

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_APP_URL`

## Registry

Entry `team` in `lib/features/registry.ts`.
