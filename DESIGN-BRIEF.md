# Permit Tracker — Design Brief (Logo & Images)

## 1. What is the app?

**Permit Tracker** is a SaaS web app for **small U.S. contractors** (general contractors, roofers, electricians, plumbers, HVAC, solar installers).

**One-line pitch:** *"Never miss a permit deadline."*

**Core problem it solves:** Contractors lose money on expired permits, lapsed licenses, failed inspections, and stop-work orders because they track deadlines in Excel sheets and email. Permit Tracker puts every permit, license, inspection, and renewal in one dashboard with automatic email reminders (30 / 14 / 7 / 1 day before expiry).

## 2. Key features (for visual context)

| Feature | What it does |
|---|---|
| Compliance Dashboard | Health score %, permits needing attention, upcoming deadline timeline |
| Projects & Permits | Track jobs and their permits, documents, deadlines |
| Licenses | Contractor license tracking with renewal reminders |
| Inspections | Schedule + pass/fail tracking with re-inspection scheduling |
| AHJ Directory | Searchable directory of **official permit offices in all 50 states** (186 verified portals) |
| Subcontractor COI Portal | Track subcontractor insurance (COI) & license compliance; magic-link document uploads |
| Document Vault | Store permits, COIs, licenses with expiry dates |
| Calendar | Google Calendar sync for deadlines |
| Reports | Compliance reports |
| Blog | SEO permit guides (e.g. "How to Get a Building Permit in Texas") |

## 3. Target audience

Blue-collar business owners, 30–60 years old, U.S. Not tech-savvy — the design must feel **simple, solid, and trustworthy**, like a tool their accountant would recommend. Think QuickBooks / Jobber / ServiceTitan vibe — **not** playful startup.

## 4. Brand personality

- **Professional, not playful.** (The owner explicitly rejected a "childish" look.)
- **Trustworthy & solid** — this app guards against fines and stop-work orders.
- **Calm & organized** — the feeling of "everything under control."
- **American contractor** — hard hats, job sites, city skylines, blueprints — but tasteful, never cartoonish.

## 5. Color palette (must match the app)

| Use | Color |
|---|---|
| Primary / brand | **Blue `#2563eb`** (buttons, links, active states) |
| Backgrounds | White / light gray `#f9fafb`, dark mode `#111827` |
| Text | Slate/gray `#111827` headings, `#6b7280` secondary |
| Success | Green (compliant) |
| Warning | Amber (expiring soon) |
| Danger | Red (expired / non-compliant) |

The logo must work on **white, dark navy, and the blue `#2563eb`** backgrounds.

## 6. Assets needed

### A. Logo (priority)
- **Style:** Modern minimal mark + wordmark "Permit Tracker".
- **Mark ideas:** shield + checkmark (protection/compliance), or a document/permit paper with a checkmark, or a building + checkmark. Avoid hammers/wrenches clichés unless done elegantly.
- **Deliverables:** SVG (primary), PNG with transparency (1024px), light version (for dark backgrounds), dark version (for light backgrounds), monochrome single-color version, favicon (32px, legible at small size).

### B. Auth / landing branding
- A wide brand panel visual for the sign-in/sign-up split screen (currently a blue gradient with feature list) — abstract architectural / blueprint-style artwork in brand blue tones, professional, subtle.

### C. Blog cover images (6 existing + ongoing)
- Style: clean editorial, construction/permit theme (city hall, blueprints, job site, documents). 16:9. No text overlays (titles are in HTML).
- The 6 articles: Texas / Florida / California / New York permit guides, permit renewal guide, "What is an AHJ?" explainer.

### D. Social / OG image (1200×630)
- For link previews: logo + tagline "Never miss a permit deadline" on brand blue.

### E. (Optional later) Empty-state illustrations
- Small, professional line-art style for empty lists (no permits, no documents, etc.).

## 7. What to avoid

- No cartoon / childish / playful styles — this was explicitly rejected.
- No emojis in any brand asset.
- No generic "construction worker" stock-photo clichés as the logo.
- The mark must stay legible at 32×32px (favicon test).

## 8. Technical notes

- Live app: https://permit-tracker-azure.vercel.app
- Public pages a designer can view without login: `/signup`, `/blog`
- Preferred formats: SVG for logo, WebP under 100 KB for web images.
