// Permit validity & renewal regulatory data for the public AHJ directory.
// Source: supabase/seed-jurisdiction-regulations.sql (research compiled 2026-10-17,
// verified against official city/county sources; NULL where unverifiable — never invented).
// All fields are optional except jurisdiction_name/state_code/city/permit_type.
// Corrections 2026-11-24 (re-verified against official sources, access date 2026-11-24;
// see AUDIT_REPORT.md §6.1): Los Angeles validity 180 → 730 days (LAMC 98.0602 as
// amended Ord. 187,719); San Antonio / Jacksonville sources replaced with official
// city pages; Indianapolis validity newly verified at 365 days (Code §536-213 —
// see the entry comment: corroborated 2026-11-24 by two independent full-text
// mirrors of the current Municode-published code, Zoneomics and Corpus Law;
// direct library.municode.com access was blocked (HTTP 403) on 2026-11-24).
// Pass 2 corrections 2026-11-24 (see CONTENT_ENRICHMENT_REPORT.md): Dallas
// validity newly verified (2 yrs / 120-day no-inspection rule, $200 extension,
// City Planning & Development Guide); Denver 60-day voiding rule added from the
// 2025 Denver Building Code §131.7 (no fixed maximum duration); Fort Worth
// source upgraded http → https (official host serves it); Philadelphia source
// updated to the current July 2026 revision of the P_052 sheet (the old
// 20260107 URL was the Jan 7, 2026 upload, which predates the Oct 2026 research
// — the audit's "postdates by ~3 months" was a misreading). Oklahoma City
// remains all-NULL: no building-permit-specific official validity figure found.
//
// SHARED HOME (2026-11-24 modularity fix): this data used to live in
// `app/(public)/ahj/_regulations.ts`; features imported it from a public
// page file (inverted dependency). It now lives here in `lib/shared/` and
// `app/(public)/ahj/_regulations.ts` is a thin re-export shim, so every
// existing import keeps working. Features import from
// `@/lib/shared/jurisdiction-data`, never from `app/(public)/`.

export interface RegulationData {
  jurisdiction_name: string;
  state_code: string;
  city: string;
  permit_type: string;
  validity_days?: number;
  validity_notes?: string;
  extension_allowed?: boolean;
  extension_fee_usd?: number;
  extension_process?: string;
  processing_days?: number;
  source_url?: string;
  /** ISO date (YYYY-MM-DD) the regulation data for this city was researched. Defaults to 2026-10-17 when absent. */
  researched_date?: string;
}

export const REGULATION_DATA: Record<string, RegulationData> = {
  "NY:New York": {
    jurisdiction_name: "New York",
    state_code: "NY",
    city: "New York",
    permit_type: "building",
    validity_days: 730,
    validity_notes:
      "Max 2 yrs from issuance (AC 28-105.8.1); expires if work not commenced within 12 mo or lapsed 12 mo (AC 28-105.9); DOB NOW:Build permits expire at earliest of insurance/license expiry or 1 yr",
    extension_allowed: true,
    extension_fee_usd: 130,
    extension_process:
      "Renew online via DOB NOW:Build/eFiling about 2 weeks before expiration; Commissioner may grant additional 12-month periods",
    processing_days: 24,
    source_url: "https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page",
  },
  "CA:Los Angeles": {
    jurisdiction_name: "Los Angeles",
    state_code: "CA",
    city: "Los Angeles",
    permit_type: "building",
    validity_days: 730,
    validity_notes:
      "Valid 2 yrs from issuance (LAMC 98.0602, as amended Ord. 187,719 eff. 1/23/23); expires 12 mo after issuance if work not commenced, or after 12 continuous months suspended/discontinued/abandoned. Note: LADBS FAQ still states 6-month no-start/no-work windows — the current code says 12 months.",
    extension_allowed: true,
    extension_process:
      "File within 30 days of expiration via Request for Modification Form 41a or 42; each extension 6 months within the 2-year limit (LADBS FAQ)",
    source_url:
      "https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414 https://dbs.lacity.gov/node/4081",
  },
  "IL:Chicago": {
    jurisdiction_name: "Chicago",
    state_code: "IL",
    city: "Chicago",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "6 mo from payment to begin work and request first inspection (14A-4-413.9); on hold/no inspection for more than 365 days requires reinstatement",
    extension_allowed: true,
    extension_process:
      "Up to 2 x 180-day extensions pre-construction, up to 4 x 180 days post-start; cumulative max 720 days (14A-4-413.9.1)",
    processing_days: 87,
    source_url:
      "https://www.chicago.gov/content/dam/city/depts/bldgs/general/CodeModernization/07242020codeQandA.pdf",
  },
  "TX:Houston": {
    jurisdiction_name: "Houston",
    state_code: "TX",
    city: "Houston",
    permit_type: "building",
    validity_days: 730,
    validity_notes:
      "Invalid/inactive on 180th day unless commenced and inspected; hard expiry at 2 yrs if never commenced or abandoned 2 yrs (R105.5)",
    extension_allowed: true,
    extension_process:
      "One or more extensions of up to 180 days each; written request with justifiable cause (R105.5.1)",
    source_url: "https://www.houstonpermittingcenter.org/media/9056/download",
  },
  "AZ:Phoenix": {
    jurisdiction_name: "Phoenix",
    state_code: "AZ",
    city: "Phoenix",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Null/void if work not started within or ceased for 180 days; Section 114 violation permits must complete within 12 months of issuance",
    extension_allowed: true,
    extension_process:
      "One-time 90-day extension plus one-time 90-day reinstatement for Section 114 permits; fire permits: one or more 180-day extensions; written application before expiration (TRT/DOC/00021P)",
    source_url:
      "https://www.cityofphoenix.org/content/dam/phoenix/pddsite/documents/trt/external/dsd_trt_pdf_00021p.pdf",
  },
  "PA:Philadelphia": {
    jurisdiction_name: "Philadelphia",
    state_code: "PA",
    city: "Philadelphia",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Invalid if not commenced within 6 mo or suspended/abandoned 6 mo; construction/demolition permits valid max 5 yrs (A-302.2)",
    extension_allowed: true,
    extension_process:
      "Written request; code official may extend in writing: up to 2 extensions (12 mo total) to commence work, up to 1 extension (6 mo) for suspended work; expired permits require a new permit (A-302.2)",
    processing_days: 15,
    source_url:
      "https://www.phila.gov/media/20260707130349/P_052_INF_Building-permit-extension-info-sheet-WebUI.pdf",
  },
  "TX:San Antonio": {
    jurisdiction_name: "San Antonio",
    state_code: "TX",
    city: "San Antonio",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Every permit application and permit will expire within 180 days if no proof of work or progress has been shown (City of San Antonio, Permit Process)",
    extension_allowed: true,
    extension_process:
      "One or more 180-day extensions when you can prove a valid, justifiable reason for the project suspension or abandonment (City of San Antonio, Permit Process)",
    source_url:
      "https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process http://docsonline.sanantonio.gov/DSDDocsOnline/?document=Form%2C+Applications",
  },
  "CA:San Diego": {
    jurisdiction_name: "San Diego",
    state_code: "CA",
    city: "San Diego",
    permit_type: "building",
    validity_days: 365,
    validity_notes:
      "One-year utilization period (IB 117); void if work not begun within 180 days or suspended/abandoned 180 days (SDMC sections 129.0216/129.0217)",
    extension_allowed: true,
    extension_process:
      "Form DS-117 filed at least 1 month before end of utilization period; Building Official may grant up to 180 days plus one additional extension under conditions",
    source_url:
      "https://www.sandiego.gov/development-services/forms-publications/information-bulletin/117",
  },
  "TX:Dallas": {
    jurisdiction_name: "Dallas",
    state_code: "TX",
    city: "Dallas",
    permit_type: "building",
    validity_days: 730,
    validity_notes:
      "Permits expire after 2 years from issuance, or after 120 days of no inspection activity — whichever comes first (City of Dallas Planning & Development Guide; verified November 24, 2026)",
    extension_allowed: true,
    extension_fee_usd: 200,
    extension_process:
      "Request an Extension in DallasNow before the permit expires; $200 fee for issued permits, no fee for applications (City of Dallas Planning & Development Guide)",
    source_url:
      "https://dallascityhall.com/departments/sustainabledevelopment/guide/Pages/default.aspx",
    researched_date: "2026-11-24",
  },
  "CA:San Jose": {
    jurisdiction_name: "San Jose",
    state_code: "CA",
    city: "San Jose",
    permit_type: "building",
    validity_days: 365,
    validity_notes:
      "Expires 12 months from issuance or 180 days from last inspection approval/partial approval",
    extension_allowed: true,
    extension_process:
      "Request before expiry via Permit Center (408-535-3555) or buildingpermits@sanjoseca.gov; approved first extension adds 180 days; second extension via Letter of Request to Chief Building Official, up to 360 days, discretionary, non-appealable",
    source_url: "https://www.sanjoseca.gov/home/showpublisheddocument/25887/636965525550970000",
  },
  "TX:Austin": {
    jurisdiction_name: "Austin",
    state_code: "TX",
    city: "Austin",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Expires on the 181st day if no inspection scheduled/received; passing inspection extends expiration 180 days",
    extension_allowed: true,
    extension_process:
      "One-time extension of up to 180 days; written request before expiration (Section 25-12-268); via AB+C portal or DSD form",
    source_url: "https://www.austintexas.gov/development-services/apply-standalone-permit",
  },
  "FL:Jacksonville": {
    jurisdiction_name: "Jacksonville",
    state_code: "FL",
    city: "Jacksonville",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "HOW LONG ARE PERMITS GOOD FOR? 180 days. (City of Jacksonville, Building Inspection Division FAQs; Division enforces Florida Building Code 8th Edition (2023). Permit may become void if no work done during a six-month period — FBC 105.4.1.)",
    source_url:
      "https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs",
  },
  "TX:Fort Worth": {
    jurisdiction_name: "Fort Worth",
    state_code: "TX",
    city: "Fort Worth",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Building permits expire 180 days from date issued unless work has begun or an extension is requested (City building code Sec. 105.5; stated in official zoning case record)",
    extension_allowed: true,
    extension_process:
      "One 180-day extension may be requested; per Sec. 105.5 a permit shall not extend more than once when no work has proceeded",
    source_url:
      "https://apps.fortworthtexas.gov/council_packet/render_file.asp?filename=Zoning_cases/3713/ZC-16-035.pdf",
  },
  "OH:Columbus": {
    jurisdiction_name: "Columbus",
    state_code: "OH",
    city: "Columbus",
    permit_type: "building",
    validity_days: 365,
    validity_notes:
      "Work must begin within 1 year of issuance; once begun, no delays in progress over 6 months; all related building/mechanical/electrical/plumbing permits treated as a single project for expiration",
    extension_allowed: true,
    extension_process:
      "Limited permit extensions allowed under the building code; contact ExpiredPermits@columbus.gov or 614-645-8563",
    source_url: "https://www.columbus.gov/Business-Development/Get-a-Permit/Get-or-Track-a-Building-Permit",
  },
  "NC:Charlotte": {
    jurisdiction_name: "Charlotte",
    state_code: "NC",
    city: "Charlotte",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Expires 6 months after issue if no inspections ever requested/performed; 1 year after latest inspection if inspections begun but not completed (Mecklenburg County Code Enforcement)",
    source_url: "https://code.mecknc.gov/site-menu/permitting/expired-permits",
  },
  "CA:San Francisco": {
    jurisdiction_name: "San Francisco",
    state_code: "CA",
    city: "San Francisco",
    permit_type: "building",
    validity_days: 180,
    validity_notes:
      "Work suspended/abandoned 180+ days renders permit expired and null and void (SFBC 106A.4.4); overall maximum time to complete per Table B by valuation; demolition permits expire 180 days after issuance",
    extension_allowed: true,
    extension_process:
      "Request before expiration via Service Request Form emailed to dbi.inspectionservices@sfgov.org; second extension requires a letter to the Chief Building Inspector; invoice sent after approval",
    source_url: "https://www.sf.gov/documents/38140/26.07.12__Permit_Extension_How_To.pdf",
  },
  // Indianapolis validity (365 days) per Code §536-213. Pass 2 (2026-11-24):
  // the 365-day text is corroborated by TWO independent full-text mirrors of
  // the current Municode-published code — Zoneomics and Corpus Law (Supp. No.
  // 47, Update 2, codified through Ord. No. 42, 2026, passed June 1, 2026;
  // ordinance history through G.O. 40, 2025, §6). Direct library.municode.com
  // access was blocked (HTTP 403) on 2026-11-24, so a direct Municode
  // confirmation is still outstanding — re-verify there when access allows.
  // The City's own 2018 Gold Book states the older 180-day rule.
  "IN:Indianapolis": {
    jurisdiction_name: "Indianapolis",
    state_code: "IN",
    city: "Indianapolis",
    permit_type: "building",
    validity_days: 365,
    validity_notes:
      "Expires by operation of law if construction not commenced within 365 days of issuance, or if commenced but substantially no construction occurs over 365 days (Indianapolis Code §536-213, as amended through G.O. 40, 2025, §6)",
    extension_allowed: true,
    extension_process:
      "Administrator may extend for good cause shown in writing for an additional period reasonable under the circumstances (§536-213); use the City's Request for Permit Amendment/Update, Extension, Renewal or Cancellation form",
    source_url: "https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja",
  },
  "WA:Seattle": {
    jurisdiction_name: "Seattle",
    state_code: "WA",
    city: "Seattle",
    permit_type: "building",
    validity_days: 540,
    validity_notes: "18 months from issuance (Seattle Building Code section 106.10)",
    extension_allowed: true,
    extension_process:
      "Renew up to 30 days before expiration via Seattle Services Portal; renewed permit valid 18 months from prior expiration; permits expired less than 1 year can be reestablished; expired 1+ year requires new application",
    source_url:
      "https://Seattle.gov/documents/Departments/SDCI/Permits/ConstructionPermitRenewals.pdf",
  },
  "CO:Denver": {
    jurisdiction_name: "Denver",
    state_code: "CO",
    city: "Denver",
    permit_type: "building",
    validity_notes:
      "No fixed maximum duration in the 2025 Denver Building Code §131. A construction permit may be voided when work is not commenced within 60 days of issuance, work is suspended or abandoned for 60 days, or no inspection has been requested for 60 days (§131.7). Before work recommences, new plans may be required and a new permit obtained (verified November 24, 2026)",
    source_url:
      "https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf",
    researched_date: "2026-11-24",
  },
  "OK:Oklahoma City": {
    jurisdiction_name: "Oklahoma City",
    state_code: "OK",
    city: "Oklahoma City",
    permit_type: "building",
  },
};

// Normalized index: "ny:new york" -> RegulationData (case-insensitive lookup).
const NORMALIZED: Record<string, RegulationData> = Object.fromEntries(
  Object.entries(REGULATION_DATA).map(([key, value]) => [key.toLowerCase(), value])
);

/** Look up regulatory data by state code + city name (case-insensitive). */
export function getRegulation(stateCode: string, city: string | null): RegulationData | undefined {
  if (!city) return undefined;
  const key = `${stateCode}:${city}`.toLowerCase();
  return NORMALIZED[key];
}

/**
 * True when the regulation row has at least one substantive field worth
 * showing. Previously duplicated verbatim in
 * `app/(public)/ahj/[state]/[city]/page.tsx` and `app/sitemap.ts` (and
 * wrongly listed in the audit brief as living in `_regulations.ts` — it
 * never did); now the single shared copy — both call sites import it
 * from here.
 */
export function hasRegulationContent(reg: RegulationData): boolean {
  return (
    reg.validity_days !== undefined ||
    reg.validity_notes !== undefined ||
    reg.extension_allowed !== undefined ||
    reg.extension_process !== undefined ||
    reg.extension_fee_usd !== undefined ||
    reg.processing_days !== undefined ||
    reg.source_url !== undefined
  );
}
