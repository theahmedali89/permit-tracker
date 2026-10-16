# Permit Warden — Design Brief (Logo & Images)

## 1. What is the app?

**Permit Warden** is a SaaS web app for **small U.S. contractors** (general contractors, roofers, electricians, plumbers, HVAC, solar installers).

**One-line pitch:** *"Never miss a permit deadline."*

**Core problem it solves:** Contractors lose money on expired permits, lapsed licenses, failed inspections, and stop-work orders because they track deadlines in Excel sheets and email. Permit Warden puts every permit, license, inspection, and renewal in one dashboard with automatic email reminders (30 / 14 / 7 / 1 day before expiry).

## 2. Key features (for visual context)

| Feature | What it does |
|---|---|
| Compliance Dashboard | Health score %, permits needing attention, upcoming deadline timeline |
| Projects & Permits | Track jobs and their permits, documents, deadlines |
| Licenses | Contractor license tracking with renewal reminders |
| Inspections | Schedule + pass/fail tracking with re-inspection scheduling |
| AHJ Directory | Searchable directory of **official permit offices in all 50 states** (verified official portals; count grows — see marketing-copy note below) |
| Subcontractor COI Portal | Track subcontractor insurance (COI) & license compliance; magic-link document uploads |
| Document Vault | Store permits, COIs, licenses with expiry dates |
| Calendar | Google Calendar sync for deadlines |
| Reports | Compliance reports |
| Blog | SEO permit guides (e.g. "How to Get a Building Permit in Texas") |

## 3. Target audience

Blue-collar business owners, 30–60 years old, U.S. Not tech-savvy — the design must feel **simple, solid, and trustworthy**, like a tool their accountant would recommend. Think QuickBooks / Jobber / ServiceTitan vibe — **not** playful startup.

## 4. Brand personality & visual direction

**Positioning: "Modern Compliance Infrastructure for Contractors"** — NOT "construction company software."

- **Professional, not playful.** (The owner explicitly rejected a "childish" look.)
- **Trustworthy & solid** — this app guards against fines and stop-work orders.
- **Calm & organized** — the feeling of "everything under control."
- **Compliance/protection SaaS, not generic construction SaaS.** The app sells risk prevention and compliance control, not just paperwork storage.

**Visual hierarchy (in this order):** Permit → Deadline → Compliant. Construction is *secondary context only* — do not make hard hats, wrenches, hammers, workers, or cranes the primary symbol. The mark should communicate *document + approval/protection* at a glance.

**Visual language:** geometric + structured + architectural + document/compliance focused + restrained blue + strong typography + generous whitespace.

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
- **Style:** Modern minimal mark + wordmark "Permit Warden" (clean sans-serif, medium/semi-bold; single-color wordmark — no need for two-tone "Permit"/"Warden").
- **Primary mark direction:** permit/document + integrated checkmark + subtle building/structural geometry. Example: a compact geometric document shape with the checkmark as part of its geometry, a subtle calendar/deadline element or building roofline in negative space — communicating permits + deadlines + compliance in one mark.
- **Secondary exploration (optional):** shield + checkmark. Note: shield+check alone is the most generic option (common in insurance/cybersecurity) — only pursue if it can be made ownable.
- **Avoid:** hammers/wrenches/hard hats/cranes as the primary symbol; tiny text, multiple building windows, document lines, or calendar numbers inside the mark.
- **Favicon test (critical):** the mark must stay legible at **32×32 AND 16×16** — at 16px only the core symbol should remain. If it collapses, the symbol is over-detailed.
- **Deliverables:** primary horizontal (mark + wordmark), compact (mark only), dark-on-light version, light-on-dark version, single-color version, SVG master, transparent PNG (1024px), 512×512 app/PWA icon, 180×180 Apple touch icon, 32×32 + 16×16 favicon.

### B. Auth / landing branding
- A wide brand panel visual for the sign-in/sign-up split screen (currently a blue gradient with feature list).
- **Composition:** subtle blueprint grid + architectural linework + permit/document cards + inspection check/status markers + faint city/building geometry. Around **10–20% visual intensity** — plenty of negative space; the visual must not steal attention from the form.
- **Avoid:** realistic construction-worker hero imagery.

### C. Blog cover images (6 existing + ongoing)
- Style: clean editorial, 16:9. No text overlays (titles are in HTML).
- **Do NOT give every article the same generic blueprint image.** Each article gets a geographically/topically relevant but professional visual identity:
  - Texas guide → municipal/building-permit office + Texas architectural context
  - Florida guide → coastal/Florida construction context
  - California guide → California urban/residential permitting context
  - New York guide → dense urban/building context
  - Renewal guide → permit document + calendar/deadline concept
  - "What is an AHJ?" → city hall/municipal + jurisdiction/document concept
- Avoid giant decorative state flags — editorial imagery is more credible.

### D. Social / OG image (1200×630)
- **Visual hierarchy:**
  - **Permit Warden**
  - *Never miss a permit deadline.*
  - *Permits • Licenses • Inspections • Renewals*
- Background: brand blue with an extremely subtle blueprint/grid/document pattern.
- Keep main content in the center-safe region (platforms crop previews differently).

### E. Empty-state illustrations
- **Already provided by the owner** (12 illustrations: no permits, projects, licenses, inspections, subcontractors, documents, deadlines, reports, results, activity + generic). Blue monochrome line-art style, each with a CTA button. Use as-is.
- Style reference for any future additions: professional line art, brand blue, never cartoonish.

### F. Icon system (to be defined)
- One consistent set for: Permit, License, Inspection, Document, Calendar, AHJ, COI, Report, plus status icons (Compliant / Expiring Soon / Expired / Upcoming / Inactive / Pending) and action icons (Add / Edit / View / Delete / Upload / Download / Search / Filter).
- All icons share the same stroke weight, corner radius, and style (outline + filled variants where needed).

### G. Dashboard / product screenshot standard (for future landing page)
- Real product UI screenshots beat stock imagery. Priority shots: Compliance Health Score → Upcoming Deadlines → Permit Status → Inspection Status.
- Screenshots must use realistic sample data and match the live app's light/dark theme.

## 7. What to avoid

- No cartoon / childish / playful styles — this was explicitly rejected.
- No emojis in any brand asset.
- No generic "construction worker" stock-photo clichés as the logo.
- The mark must stay legible at 32×32px **and** 16×16px (favicon tests).

## 9. Marketing-copy notes

- **AHJ directory:** use evergreen wording — *"Verified official permitting resources across all 50 states."* Do NOT hardcode the portal count (it goes stale as the directory grows). If a number is shown, pull it live from the database as a dynamic counter.
- **Positioning line:** "Never miss a permit deadline." (problem + benefit in one line)
- **Category line (OG/footer):** "Permits • Licenses • Inspections • Renewals"

## 10. Technical notes

- Live app: https://permit-tracker-azure.vercel.app
- Public pages a designer can view without login: `/signup`, `/blog`
- Preferred formats: SVG for logo, WebP under 100 KB for web images.
