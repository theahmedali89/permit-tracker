/**
 * Feature registry — the single list of every feature in Permit Warden.
 *
 * MODULARITY RULE: one feature = one lib/features/<feature>/ folder
 * (logic + tests + README). Shared code lives ONLY in lib/shared/.
 * Features never import each other. API routes are thin. See ARCHITECTURE.md.
 *
 * Other tracks append their own entries here — do not remove or rewrite
 * entries you do not own.
 */
export interface FeatureEntry {
  id: string;
  name: string;
  routes: string[];
  tables: string[];
  envKeys: string[];
  enabled: boolean;
  /** Free-text accuracy note (e.g. grace mode, in-memory data source). */
  notes?: string;
}

export const FEATURE_REGISTRY: FeatureEntry[] = [
  {
    id: "tools-hub",
    name: "Free tools hub",
    routes: [
      "/tools",
      "/tools/permit-timeline-calculator",
      "/tools/permit-fee-calculator",
      "/tools/parcel-lookup",
      "/tools/license-lookup",
      "/tools/noise-ordinance-lookup",
      "/tools/shed-permit-checker",
    ],
    tables: [],
    envKeys: [],
    enabled: true,
  },
  {
    id: "trust-pages",
    name: "Trust & commercial pages",
    routes: [
      "/features",
      "/about",
      "/contact",
      "/privacy",
      "/terms",
      "/faq",
      "/glossary",
      "/changelog",
      "/verified-sources",
    ],
    tables: [],
    envKeys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
    enabled: true,
  },
  {
    id: "blog-batch4",
    name: "Blog batch 4 (APN, CO, permit types + AHJ merge)",
    routes: [
      "/blog/assessors-parcel-number-guide",
      "/blog/certificate-of-occupancy-guide",
      "/blog/permit-types-explained",
    ],
    tables: ["blog_posts"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "ahj-thin-pages",
    name: "AHJ thin-page noindex rule",
    routes: ["/ahj/[state]/[city]"],
    tables: ["ahj_directory"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "public-performance",
    name: "Public performance (cookie-free public client)",
    routes: ["/ahj", "/ahj/[state]", "/ahj/[state]/[city]", "/blog", "/blog/[slug]", "/sitemap.xml"],
    tables: ["blog_posts", "ahj_directory"],
    envKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    enabled: true,
  },
  {
    id: "cookie-consent",
    name: "Cookie consent + gated Google Analytics",
    routes: [],
    tables: [],
    envKeys: ["NEXT_PUBLIC_GA_ID"],
    enabled: true,
    notes:
      "No route of its own — the CookieConsent component is mounted in app/layout.tsx on every page.",
  },
  {
    id: "service-worker",
    name: "Service worker (app shell cache)",
    routes: ["/sw.js"],
    tables: [],
    envKeys: [],
    enabled: true,
  },
  // ── Track B: New Features ──────────────────────────────────────────
  {
    id: "smart-buffer",
    name: "Smart Renewal Buffer",
    routes: ["/permits/[id]", "/dashboard"],
    tables: ["permits"],
    envKeys: [],
    enabled: true,
    notes:
      "Reads regulation data in-memory (REGULATION_DATA via lib/shared/jurisdiction-data); it does NOT query a jurisdiction_regulations DB table.",
  },
  {
    id: "timeline-calculator",
    name: "Permit Timeline Calculator",
    routes: ["/tools/permit-timeline-calculator"],
    tables: [],
    envKeys: [],
    enabled: true,
    notes:
      "Reads regulation data in-memory (REGULATION_DATA via lib/shared/jurisdiction-data); it does NOT query a jurisdiction_regulations DB table.",
  },
  {
    id: "fee-calculator",
    name: "Permit Fee & Cost-of-Delay Calculator",
    routes: ["/tools/permit-fee-calculator"],
    tables: [],
    envKeys: [],
    enabled: true,
    notes:
      "Reads regulation data in-memory (REGULATION_DATA via lib/shared/jurisdiction-data) and fine schedules from lib/shared/fine-schedules; it does NOT query a jurisdiction_regulations DB table.",
  },
  {
    id: "billing",
    name: "Billing & Plan Enforcement",
    routes: [
      "/api/billing/checkout",
      "/api/billing/webhook",
      "/pricing",
      "/api/permits",
      "/api/licenses",
      "/api/projects",
      "/api/documents",
      "/api/team",
    ],
    tables: [
      "organizations",
      "subscriptions",
      "permits",
      "licenses",
      "projects",
      "documents",
      "organization_members",
    ],
    envKeys: [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "STRIPE_PRICE_STARTER",
      "STRIPE_PRICE_PROFESSIONAL",
      "STRIPE_PRICE_BUSINESS",
    ],
    enabled: true,
    notes:
      "Grace mode: plan-limit enforcement on /api/team and the four POST routes (/api/permits, /api/licenses, /api/projects, /api/documents) plus /api/permits/import runs ONLY when Stripe is configured (STRIPE_SECRET_KEY present); without Stripe keys the writes are allowed and enforcement is skipped. STRIPE_PUBLISHABLE_KEY is intentionally absent — no code reads it.",
  },
  {
    id: "compliance-passport",
    name: "Compliance Passport",
    routes: ["/verify/[slug]", "/settings", "PATCH /api/organization"],
    tables: ["organizations", "licenses", "permits", "subcontractor_documents"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "project-gate",
    name: "Project Gate (Stop-Work Risk)",
    routes: ["/projects/[id]"],
    tables: ["project_subcontractors", "subcontractors", "subcontractor_documents"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "inspection-workflow",
    name: "Inspection Fail → Correction Workflow",
    routes: ["/inspections/[id]", "/api/inspections"],
    tables: ["inspections", "deadlines"],
    envKeys: [],
    enabled: true,
    notes:
      "Reads/writes inspections + deadlines only; it never touches the documents table.",
  },
  {
    id: "pdf-ocr",
    name: "PDF OCR (Permit Document Scan)",
    routes: ["/permits/new"],
    tables: [],
    envKeys: [],
    enabled: true,
  },
  {
    id: "sms-escalation",
    name: "SMS Escalation Chain",
    routes: ["/settings"],
    tables: [],
    envKeys: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
    enabled: false,
    notes:
      "DISABLED 2026-11-24: the feature is unwired — no cron caller, no phone-number storage — so the registry flag is the enforcement. Its Settings toggle is being removed separately. It queries no table.",
  },
  {
    id: "risk-report",
    name: "Permit Expiry Risk Report",
    routes: ["/reports/risk"],
    tables: ["permits", "inspections", "subcontractors", "subcontractor_documents"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "onboarding-sample",
    name: "Onboarding Sample Data",
    routes: ["/onboarding", "/dashboard", "/api/organization/sample-data"],
    tables: ["organizations", "projects", "permits", "deadlines"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "reminders",
    name: "Deadline Reminders (cron email)",
    routes: ["/api/cron/reminders"],
    tables: [
      "deadlines",
      "reminder_deliveries",
      "reminder_rules",
      "permits",
      "licenses",
      "inspections",
      "documents",
      "subcontractor_documents",
      "organizations",
      "organization_members",
    ],
    envKeys: ["CRON_SECRET", "RESEND_API_KEY", "RESEND_FROM_EMAIL", "NEXT_PUBLIC_APP_URL"],
    enabled: true,
  },
  {
    id: "import",
    name: "CSV Permit Import",
    routes: ["/api/permits/import"],
    tables: ["permits", "deadlines", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  // ── Pass 2: core features ────────────────────────────────────────
  {
    id: "permits",
    name: "Permits (CRUD)",
    routes: ["/api/permits", "/permits", "/permits/[id]", "/permits/new"],
    tables: ["permits", "projects", "deadlines", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "projects",
    name: "Projects (CRUD)",
    routes: ["/api/projects", "/projects", "/projects/[id]", "/projects/new"],
    tables: ["projects", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "licenses",
    name: "Licenses (CRUD)",
    routes: ["/api/licenses", "/licenses", "/licenses/new"],
    tables: ["licenses", "deadlines", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "documents",
    name: "Documents (upload + expiry)",
    routes: ["/api/documents"],
    tables: ["documents", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "dashboard",
    name: "Compliance Dashboard",
    routes: ["/dashboard"],
    tables: ["permits", "licenses", "documents", "deadlines", "audit_events", "organizations"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "landing-redesign",
    name: "Landing redesign (merged 3D hero + bento dashboard + modern sign-in)",
    routes: ["/", "/dashboard", "/signin"],
    tables: [],
    envKeys: [],
    enabled: true,
    notes:
      "Presentational redesign from the approved preview (permit-warden-complete.html). Hero scene and mockup are illustrative sample art; dashboard sections take real data as props from the dashboard/smart-buffer features. No Google button — the app has no Google OAuth wiring.",
  },
  {
    id: "calendar",
    name: "Google Calendar sync + OAuth",
    routes: [
      "/api/calendar/sync",
      "/api/calendar/status",
      "/api/auth/google-calendar",
      "/api/auth/google-calendar/callback",
    ],
    tables: ["google_calendar_tokens", "deadlines", "permits", "inspections", "licenses", "audit_events"],
    envKeys: [
      "GOOGLE_CALENDAR_CLIENT_ID",
      "GOOGLE_CALENDAR_CLIENT_SECRET",
      "CALENDAR_TOKEN_KEY",
      "OAUTH_STATE_SECRET",
    ],
    enabled: true,
  },
  {
    id: "team",
    name: "Team invites & membership",
    routes: ["/api/team", "/api/team/accept", "/settings/team"],
    tables: ["organization_members", "team_invites"],
    envKeys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "NEXT_PUBLIC_APP_URL"],
    enabled: true,
  },
  {
    id: "settings",
    name: "Organization settings",
    routes: ["/api/organization", "/settings"],
    tables: ["organizations", "audit_events"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "auth",
    name: "Auth (email/password + callback)",
    routes: [
      "/auth/signin",
      "/auth/signup",
      "/auth/signout",
      "/auth/reset-password",
      "/auth/callback",
      "/signin",
      "/signup",
      "/reset-password",
    ],
    tables: [],
    envKeys: ["NEXT_PUBLIC_APP_URL"],
    enabled: true,
  },
  {
    id: "export",
    name: "CSV export (permits / licenses / projects)",
    routes: ["/api/export"],
    tables: ["permits", "licenses", "projects"],
    envKeys: [],
    enabled: true,
  },
  {
    id: "reports",
    name: "Reports (expiring + compliance)",
    routes: ["/api/reports", "/api/reports/summary", "/reports"],
    tables: ["permits", "licenses"],
    envKeys: [],
    enabled: true,
  },
  // Other tracks append their entries below this line.
];

// ── Registry enforcement (2026-11-24 modularity fix) ─────────────────
// The `enabled` flag used to have zero readers — a flag that does
// nothing is a bug. Routes now enforce it (see ARCHITECTURE.md
// "How to disable a feature"): a disabled feature's API route answers
// 503 and never runs its logic.

/** True when the feature is enabled. Unknown ids default to enabled, so existing unregistered code keeps working. */
export function isFeatureEnabled(id: string): boolean {
  const entry = FEATURE_REGISTRY.find((f) => f.id === id);
  return entry ? entry.enabled : true;
}

/** Thrown by `requireFeatureEnabled` when a feature is disabled. Carries HTTP 503. */
export class FeatureDisabledError extends Error {
  readonly status = 503;
  readonly featureId: string;
  constructor(id: string) {
    super(`Feature "${id}" is disabled`);
    this.name = "FeatureDisabledError";
    this.featureId = id;
  }
}

/**
 * Server guard: throws `FeatureDisabledError` (HTTP 503) when the
 * feature is disabled. API routes call this first and translate the
 * throw into a 503 JSON response, e.g.:
 *
 *   try { requireFeatureEnabled("billing"); }
 *   catch (err) {
 *     if (err instanceof FeatureDisabledError)
 *       return NextResponse.json({ error: err.message }, { status: err.status });
 *     throw err;
 *   }
 */
export function requireFeatureEnabled(id: string): void {
  if (!isFeatureEnabled(id)) throw new FeatureDisabledError(id);
}
