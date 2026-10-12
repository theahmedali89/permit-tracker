# Permit & License Deadline Tracker

Track permits, licenses, inspections, and renewal deadlines in one simple dashboard for small U.S. contractors.

**Core promise:** Know what expires next. Never lose track of a permit deadline.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres + Auth + Storage)
- **Resend** (transactional email)
- **Vercel** (hosting + cron)

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Then run `supabase/migration-1.1.sql` (licenses + inspections)
4. Create a storage bucket named `documents` (private)
5. Copy your project URL, anon key, and service role key

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
CRON_SECRET=your-random-secret
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Resend Setup

1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain (required for production)
3. Create API key
4. Add to `.env.local`

## Features

### Phase 0 - Foundation ✅
- Multi-tenant architecture (organizations)
- Row Level Security (mandatory tenant isolation)
- Auth (signup, signin, signout, password reset, email verification)
- Light/dark/system theme
- Responsive (mobile-first)

### Phase 1 - Core MVP ✅
- **Projects:** CRUD with customer, address, dates
- **Permits:** CRUD with auto status calculation, search/filter
- **Documents:** PDF/JPG/PNG upload with validation
- **Deadline Engine:** Unified system for permits/licenses/inspections
- **Email Reminders:** Daily cron with idempotency
- **Dashboard:** "What needs attention?" with Action Required
- **Audit Log:** Track all important changes

### Phase 1.1 ✅
- **Licenses:** CRUD with deadline integration
- **Inspections:** CRUD with scheduling
- **Calendar:** Monthly deadline view

## Database Schema

See `supabase/schema.sql` for full schema with RLS policies.

## Testing

```bash
npx vitest run        # Unit tests
npx tsc --noEmit      # TypeScript
npm run build         # Production build
```

## Deployment (Vercel)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

The `vercel.json` includes cron for daily reminders at 9 AM UTC.

## Cost Estimate

| Service | Production Cost |
|---------|----------------|
| Vercel Pro | $20/mo |
| Supabase Pro | $25/mo |
| Resend | $20/mo |

**Note:** Vercel Hobby prohibits commercial use. Budget ~$65/mo for production.

## Security

- ✅ Row Level Security on all tenant tables
- ✅ Server-side authorization checks
- ✅ Input validation
- ✅ Secure file uploads (private bucket)
- ✅ Environment variables for secrets
