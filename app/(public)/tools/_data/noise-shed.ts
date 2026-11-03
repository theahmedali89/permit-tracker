// Permit Warden cluster - Phase 0 verified data (20 seed cities).
// Source: ~/workspace/goals/permit-tracker/files/noise-shed-data-phase0.md
// Verified 2026-11-03 from official city sources. UNVERIFIED fields are null
// and the UI must render them as "not verified yet". Never invent values here.

export const VERIFIED_DATE = "November 3, 2026";

export interface NoiseInfo {
  weekdayHours: string | null;
  weekendHours: string | null;
  dbLimits: string | null;
  /** Extra verified context, e.g. "no hour rule exists - dB caps apply". */
  note: string | null;
  sourceUrl: string;
  sourceLabel: string;
}

export interface ShedRule {
  /** Max shed size (sq ft) that needs NO building permit. Null = no verified simple cutoff. */
  exemptUpToSqft: number | null;
  /** True when the rule is strictly-less-than (e.g. Dallas: under 200 sq ft). */
  strictLessThan: boolean;
  /** True when the city requires a permit for every shed, any size. */
  alwaysPermit: boolean;
  /** Caveats, conflicts, or zoning-only tiers. */
  caution: string | null;
  detail: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface FenceRule {
  /** Max fence height (ft) that needs NO permit. */
  maxHeightFtNoPermit: number | null;
  /** True when every new fence needs a permit regardless of height. */
  alwaysPermit: boolean;
  detail: string;
  sourceUrl: string;
  sourceLabel: string;
}

export interface CityRecord {
  city: string;
  stateCode: string;
  slug: string;
  noise: NoiseInfo;
  shed: ShedRule;
  fence: FenceRule;
  /** Verified pergola rule text, or null = not verified yet. */
  pergolaRule: string | null;
}

export const CITIES: CityRecord[] = [
  {
    city: "Austin",
    stateCode: "TX",
    slug: "austin-tx",
    noise: {
      weekdayHours: "7:00 AM - 10:30 PM daily - no separate construction-hours rule (9-2-3(A)(3))",
      weekendHours: "Same every day - no weekend/holiday distinction",
      dbLimits: "Sound equipment at a residence: 75 dB at the boundary line 10 AM - 10 PM; must not be audible beyond the property line 10 PM - 10 AM (9-2-3/9-2-5)",
      note: null,
      sourceUrl: "https://services.austintexas.gov/edims/document.cfm?id=224692",
      sourceLabel: "Austin Code of Ordinances",
    },
    shed: {
      exemptUpToSqft: 200,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "Up to 200 sq ft, max 15 ft high, no plumbing, no dwelling use, not in a flood hazard area",
      sourceUrl: "https://www.austintexas.gov/development-services/work-exempt-building-permits",
      sourceLabel: "Austin Development Services",
    },
    fence: {
      maxHeightFtNoPermit: 7,
      alwaysPermit: false,
      detail: "Up to 7 ft (up to 6 ft along a public right-of-way)",
      sourceUrl: "https://stage.austintexas.gov/page/fencing-regulations",
      sourceLabel: "Austin fencing regulations",
    },
    pergolaRule: null,
  },
  {
    city: "Charlotte",
    stateCode: "NC",
    slug: "charlotte-nc",
    noise: {
      weekdayHours: "7:00 AM - 9:00 PM daily (15-63(a)(2))",
      weekendHours: "Same every day - no weekend/holiday distinction",
      dbLimits: "Amplified sound: 55 dB(A) 9 AM - 9 PM / 50 dB(A) 9 PM - 9 AM at the nearest residential line (15-69). Mechanical noise over 60 dB(A) at the complainant's line is a probable violation",
      note: null,
      sourceUrl:
        "https://www.charlottenc.gov/files/sharedassets/city/v/1/city-government/departments/documents/clerks-office/ordinances/2015-2019/2019/ordinances-2019/june-24-2019.pdf",
      sourceLabel: "Charlotte City Code",
    },
    shed: {
      exemptUpToSqft: null,
      strictLessThan: false,
      alwaysPermit: false,
      caution:
        "Charlotte uses a dimension rule, not square footage: no dimension over 12 ft = City Zoning Use Permit only (no building permit); any dimension over 12 ft = building permit",
      detail: "No verified simple size cutoff - see the dimension rule above",
      sourceUrl:
        "https://www.charlottenc.gov/Growth-and-Development/Planning-and-Development/Zoning/Frequently-Asked-Questions?lang_update=638532764019883685",
      sourceLabel: "Charlotte Planning FAQ",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Up to 6 ft (zoning caps: 5 ft front setback, 6 ft side, 8 ft rear - UDO Art. 17.2.D)",
      sourceUrl:
        "https://data.templateroller.com/pdf_docs/2734/27346/2734660/main_fence-and-wall-certificate-application-city-of-charlotte-north-carolina.pdf?821094e7e3c0d4eaae57953e755723bb",
      sourceLabel: "Charlotte fence certificate application",
    },
    pergolaRule: null,
  },
  {
    city: "Chicago",
    stateCode: "IL",
    slug: "chicago-il",
    noise: {
      weekdayHours: "8:00 AM - 8:00 PM within 600 ft of a residential building or hospital (MCC 8-32-140)",
      weekendHours: "Same as weekdays - no weekday/weekend split. Emergency work and government work are exempt",
      dbLimits:
        "No general residential dB cap. Mechanical stationary equipment only: 55 dB(A) at 100+ ft, or 70 dB(A) at 10+ ft, 8 PM - 8 AM",
      note: null,
      sourceUrl: "https://decibelshield.app/noise-ordinance/chicago/",
      sourceLabel: "Municipal Code of Chicago 8-32-140 (quoted verbatim)",
    },
    shed: {
      exemptUpToSqft: 150,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached shed, max 150 sq ft floor area and 15 ft tall, no plumbing (MCC 14A-4-402.1)",
      sourceUrl: "https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2660948",
      sourceLabel: "Municipal Code of Chicago 14A-4-402.1",
    },
    fence: {
      maxHeightFtNoPermit: 5,
      alwaysPermit: false,
      detail: "Up to 5 ft above ground on both sides, zoning-conforming (14A-4-402.1(2))",
      sourceUrl: "https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2660948",
      sourceLabel: "MCC 14A-4-402.1(2)",
    },
    pergolaRule: null,
  },
  {
    city: "Columbus",
    stateCode: "OH",
    slug: "columbus-oh",
    noise: {
      weekdayHours: null,
      weekendHours: "No weekend/holiday distinction",
      dbLimits:
        "Residential: 65 dBA day (7 AM - 10 PM) / 60 dBA night (1-hour average at the boundary). Amplified sound must not be audible 50 ft beyond the property line",
      note: "No construction-hour provision exists - Columbus governs construction noise only by dB limits (2329.11, amended Ord. 1374-2022)",
      sourceUrl:
        "https://mcclibraryfunctions.azurewebsites.us/api/ordinanceDownload/16219/1255357/pdf?forceDownload=true",
      sourceLabel: "Columbus Code 2329.11",
    },
    shed: {
      exemptUpToSqft: null,
      strictLessThan: false,
      alwaysPermit: false,
      caution:
        "Up to 168 sq ft needs no zoning review. The 200 sq ft building-permit threshold (Residential Code of Ohio) could not be verified from the official code text - treat larger sheds as needing a permit check",
      detail: "No verified simple size cutoff - see the caution above",
      sourceUrl:
        "https://www.columbus.gov/files/sharedassets/city/v/1/building-and-zoning/general-development-standards-for-single-family-residential-zoning-districts2026-1.pdf",
      sourceLabel: "Columbus Building and Zoning",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Up to 6 ft. Masonry walls need a permit at any height",
      sourceUrl:
        "https://www.columbus.gov/files/sharedassets/city/v/1/building-and-zoning/general-development-standards-for-single-family-residential-zoning-districts2026-1.pdf",
      sourceLabel: "Columbus Building and Zoning",
    },
    pergolaRule: null,
  },
  {
    city: "Dallas",
    stateCode: "TX",
    slug: "dallas-tx",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 7:00 PM (30-2(8))",
      weekendHours: "Saturday and legal holidays 8 AM - 7 PM. Sundays prohibited",
      dbLimits:
        "Stationary uses: 56 dBA at the residential lot line (51A-6.102). Construction activity itself uses a 'presumed offensive' standard - no fixed dB",
      note: null,
      sourceUrl: "https://codelibrary.amlegal.com/codes/dallas/latest/dallas_tx/0-0-0-114035",
      sourceLabel: "Dallas City Code (American Legal)",
    },
    shed: {
      exemptUpToSqft: 200,
      strictLessThan: true,
      alwaysPermit: false,
      caution: null,
      detail: "Under 200 sq ft floor area, no utilities, on single-family or duplex premises",
      sourceUrl: "https://weborigin1.dallascityhall.com/building_inspection/building_inspection_faqs.html",
      sourceLabel: "Dallas Building Inspection FAQ",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Up to 4 ft in the front yard, up to 6 ft elsewhere. Absolute max 9 ft with approval",
      sourceUrl:
        "https://dallascityhall.com/departments/sustainabledevelopment/buildinginspection/DCH%20documents/FENCE%20PERMIT%20CHECKILST%202-Acc.pdf",
      sourceLabel: "Dallas fence permit checklist",
    },
    pergolaRule: null,
  },
  {
    city: "Denver",
    stateCode: "CO",
    slug: "denver-co",
    noise: {
      weekdayHours: "7:00 AM - 9:00 PM",
      weekendHours: "Sat - Sun 8:00 AM - 5:00 PM. Holiday hours not verified",
      dbLimits: "55 dB(A) day (7 AM - 10 PM) / 50 dB(A) night at the residential property line (DRMC Ch. 36, 36-6)",
      note: null,
      sourceUrl: "https://denvergov.org/My-Property/Remodeling-and-Construction/Permit-Office/Contractors",
      sourceLabel: "Denver DRMC Chapter 36",
    },
    shed: {
      exemptUpToSqft: 200,
      strictLessThan: false,
      alwaysPermit: false,
      caution: "This is the building-permit exemption only - a zoning permit may still be required",
      detail: "Projected roof up to 200 sq ft, 8-ft top plate, 14-ft max, one-story detached non-conditioned",
      sourceUrl:
        "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Single-Family-and-Duplex-Projects/Residential-Sheds?lang_update=638602427009766620",
      sourceLabel: "Denver Community Planning and Development",
    },
    fence: {
      maxHeightFtNoPermit: 4,
      alwaysPermit: false,
      detail: "No permit under 4 ft. Max 4 ft front / 6 ft backyard",
      sourceUrl:
        "https://denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Zoning-Permits/Apply-for-Commercial-Zoning-Permits/Fences-and-Walls?lang_update=638582247924969441",
      sourceLabel: "Denver zoning permits",
    },
    pergolaRule: null,
  },
  {
    city: "Fort Worth",
    stateCode: "TX",
    slug: "fort-worth-tx",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 8:00 PM within 300 ft of occupied residential (23-8(d)(2)(b))",
      weekendHours: "Sat - Sun 9:00 AM - 8:00 PM. No separate holiday rule",
      dbLimits: "70 dBA day (7 AM - 10 PM) / 60 dBA night at the complainant's property line (23-8(c)(1)(a))",
      note: null,
      sourceUrl: "https://codelibrary.amlegal.com/codes/ftworth/latest/ftworth_tx/0-0-0-25457",
      sourceLabel: "Fort Worth City Code",
    },
    shed: {
      exemptUpToSqft: null,
      strictLessThan: false,
      alwaysPermit: true,
      caution: null,
      detail: "No exemption - every storage shed needs a building permit",
      sourceUrl:
        "https://www.fortworthtexas.gov/files/assets/public/v/2/development-services/documents/resources-applications-forms-videos/p/permits-residential-nuts-bolts.pdf",
      sourceLabel: "Fort Worth Development Services",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Up to 6 ft solid or 8 ft open-design needs no permit; a permit is required above those heights",
      sourceUrl:
        "https://www.fortworthtexas.gov/files/assets/public/v/2/development-services/documents/resources-applications-forms-videos/p/permits-residential-nuts-bolts.pdf",
      sourceLabel: "Fort Worth Development Services",
    },
    pergolaRule: null,
  },
  {
    city: "Houston",
    stateCode: "TX",
    slug: "houston-tx",
    noise: {
      weekdayHours: "No construction-hour limits - dB caps apply 24/7",
      weekendHours: "No weekday/weekend/holiday distinction",
      dbLimits:
        "65 dB(A) daytime (7 AM - 10 PM) / 58 dB(A) nighttime at a residential receiving property; 68 dB(A) at nonresidential property (Chapter 30)",
      note: "Houston publishes no hour-based construction rule - it governs construction noise only by dB caps",
      sourceUrl: "https://www.houstontx.gov/council/committees/rna/20201102/Noise-Ordinance-Violations.pdf",
      sourceLabel: "City of Houston, Chapter 30",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached accessory structure up to 120 sq ft (R105.2 / 2021 IRC amendments)",
      sourceUrl:
        "https://www.houstonpermittingcenter.org/sites/g/files/nwywnm431/files/2026-02/Training%20PP%20-%20One-Stop%20Shop%20Residential%20-%20Shared%20-%202026.02.19.pdf",
      sourceLabel: "Houston Permitting Center (R105.2)",
    },
    fence: {
      maxHeightFtNoPermit: 8,
      alwaysPermit: false,
      detail: "Up to 8 ft, nonmasonry, nonelectrified",
      sourceUrl:
        "https://www.houstonpermittingcenter.org/sites/g/files/nwywnm431/files/2026-02/Training%20PP%20-%20One-Stop%20Shop%20Residential%20-%20Shared%20-%202026.02.19.pdf",
      sourceLabel: "Houston Permitting Center",
    },
    pergolaRule: null,
  },
  {
    city: "Indianapolis",
    stateCode: "IN",
    slug: "indianapolis-in",
    noise: {
      weekdayHours: "7:00 AM - 7:00 PM daily (Municode Ch. 391, 391-302)",
      weekendHours: "Same - no weekend/holiday distinction",
      dbLimits: null,
      note: null,
      sourceUrl:
        "https://library.municode.com/in/indianapolis_-_marion_county/codes/code_of_ordinances?nodeId=TITIIPUORSA_CH391NU_ARTIIINO&utm_source=indytoday&utm_medium=newsletter&utm_term=indytoday&utm_campaign=daily-newsletter&utm_content=indytoday",
      sourceLabel: "Indianapolis Code of Ordinances (Municode)",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: "121-200 sq ft needs a structural and drainage permit only (not a full building permit)",
      detail: "Up to 120 sq ft, under 15 ft, no foundation, no utilities",
      sourceUrl: "https://citybase-cms-prod.s3.amazonaws.com/0d257585f6c3422eb7df25df4e0f780d.pdf",
      sourceLabel: "Indianapolis permit guide",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "No permit to erect a fence. Caps: 6 ft side/rear, 3.5 ft front (4 ft if 30% opacity or less)",
      sourceUrl: "https://mkna.org/2019/08/23/fences-what-you-need-to-know/",
      sourceLabel: "Indianapolis fence guidance (MKNA)",
    },
    pergolaRule: null,
  },
  {
    city: "Jacksonville",
    stateCode: "FL",
    slug: "jacksonville-fl",
    noise: {
      weekdayHours: "7:00 AM - 10:00 PM daily (JEPB Rule 4.101/4.207A)",
      weekendHours: "Same every day - no weekend/holiday distinction",
      dbLimits: "Class A residential: 55 dBA day and night. Construction equipment: 65 dBA at the complainant's property line (daytime)",
      note: null,
      sourceUrl:
        "https://www.jacksonville.gov/departments/regulatory-boards-and-commissions/docs/environmental-protection-board/epb-rule-4.aspx",
      sourceLabel: "Jacksonville EPB Rule 4",
    },
    shed: {
      exemptUpToSqft: null,
      strictLessThan: false,
      alwaysPermit: true,
      caution: null,
      detail:
        "No official size exemption - a permit is required for every shed. Under 150 sq ft and under $5,000 gets same-visit issuance; 150 sq ft and up needs sealed drawings and plan review",
      sourceUrl:
        "https://www.jacksonville.gov/departments/public-works/building-inspection-division/commercial-permits/residential-permits/residential-shed-permit",
      sourceLabel: "Jacksonville Building Inspection Division",
    },
    fence: {
      maxHeightFtNoPermit: 8,
      alwaysPermit: false,
      detail: "No building permit for fences. Caps: 4 ft front-yard setback, 8 ft rearward",
      sourceUrl:
        "https://www.jacksonville.gov/getattachment/Departments/Planning-and-Development/Community-Planning-Division/Default/Fencing-and-Wall-Guidelines-ADOPTED.pdf.aspx?lang=en-US",
      sourceLabel: "Jacksonville fencing guidelines",
    },
    pergolaRule: null,
  },
  {
    city: "Los Angeles",
    stateCode: "CA",
    slug: "los-angeles-ca",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 9:00 PM (LAMC 41.40)",
      weekendHours: "Saturday and national holidays 8:00 AM - 6:00 PM. Sundays prohibited",
      dbLimits:
        "Powered construction equipment: 75 dBA at 50 ft within 500 ft of a residential zone (112.05). Residential ambient +5 dBA. Presumed ambient 50 dBA day / 40 dBA night (111.03)",
      note: null,
      sourceUrl: "https://www.metro.net/documents/2025/01/ivj-noisepdf/",
      sourceLabel: "Los Angeles Municipal Code (quoted in Metro EIR)",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached accessory structure up to 120 sq ft, no heat, plumbing, or electrical (LAMC 91.106)",
      sourceUrl: "https://legalclarity.org/when-is-a-building-permit-not-required-in-los-angeles/",
      sourceLabel: "LAMC 91.106 (quoted)",
    },
    fence: {
      maxHeightFtNoPermit: 10,
      alwaysPermit: false,
      detail: "Non-masonry up to 10 ft exempt. Masonry or concrete: exempt only up to 3.5 ft",
      sourceUrl: "https://legalclarity.org/when-is-a-building-permit-not-required-in-los-angeles/",
      sourceLabel: "LAMC 91.106 (quoted)",
    },
    pergolaRule: null,
  },
  {
    city: "New York City",
    stateCode: "NY",
    slug: "new-york-ny",
    noise: {
      weekdayHours: "7:00 AM - 6:00 PM, weekdays only (Section 24-222)",
      weekendHours:
        "Prohibited without an after-hours variance. Exception: 1-2 family owner-occupied homes (J-3) may work Sat-Sun 10 AM - 4 PM if more than 300 ft from a house of worship",
      dbLimits:
        "+10 dB(A) above ambient 7 AM - 10 PM; +7 dB(A) 10 PM - 7 AM (24-218). Impulsive sound +15 dB(A). HVAC max 42 dB(A) inside a dwelling",
      note: null,
      sourceUrl: "https://knctools.com/industrial/pdf/NYC_Noise_Control_Code.pdf",
      sourceLabel: "NYC Noise Control Code (Local Law 113)",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail:
        "Temporary portable shed accessory to a 1-2 family dwelling: max 120 sq ft, max height 7 ft 6 in, at least 3 ft from the lot line, one per tax lot (1 RCNY 101-14)",
      sourceUrl: "https://www.nyc.gov/assets/buildings/pdf/rcny_diagrams.pdf",
      sourceLabel: "NYC 1 RCNY 101-14",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Up to 6 ft for 1-2 family dwellings",
      sourceUrl: "https://nyc311.microsoftcrmportals.com/article/?kanumber=KA-02120",
      sourceLabel: "NYC 311 fence guidance",
    },
    pergolaRule: null,
  },
  {
    city: "Philadelphia",
    stateCode: "PA",
    slug: "philadelphia-pa",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 8:00 PM",
      weekendHours: "Weekends and legal holidays 8:00 AM - 8:00 PM",
      dbLimits:
        "Background-relative, no fixed numbers: residential sound no more than 3 dB above background beyond the boundary; non-residential no more than 5 dB at the nearest occupied residential boundary; sensitive uses (hospitals, schools) no more than 3 dB (Section 10-403)",
      note: null,
      sourceUrl:
        "https://phila.legistar.com/LegislationDetail.aspx?ID=1229577&GUID=7F18511A-6898-44F3-89E6-CDC2E6FF02DB&Options=&Search=&FullText=1",
      sourceLabel: "Philadelphia Code 10-403",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution:
        "Philadelphia also has zoning-only tiers: up to 120 sq ft in the front or side yard needs zoning review; 120-200 sq ft needs zoning only; over 200 sq ft needs a building permit",
      detail: "Up to 120 sq ft in the rear yard needs no zoning and no building permit. Max 15 ft, one story (L&I PG_011)",
      sourceUrl: "https://www.phila.gov/media/20211117115341/PG_011-_FAQ_-Shed-rev-11.17.2021.pdf",
      sourceLabel: "Philadelphia L&I PG_011",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "Non-masonry: 6 ft side/rear, 4 ft front - no permit. Masonry up to 2 ft side/rear",
      sourceUrl:
        "https://www.phila.gov/services/permits-violations-licenses/apply-for-a-permit/building-and-repair-permits/get-a-fence-permit/",
      sourceLabel: "Philadelphia fence permits",
    },
    pergolaRule: "Philadelphia treats pergolas the same as sheds - follow the shed rule above (L&I PG_011 FAQ Note 1)",
  },
  {
    city: "Phoenix",
    stateCode: "AZ",
    slug: "phoenix-az",
    noise: {
      weekdayHours:
        "Seasonal. Winter (Oct 16 - Apr 30): Mon - Fri 7 AM - 7 PM. Summer (May 1 - Oct 15, state law SB 1182): Mon - Fri 5 AM - 7 PM",
      weekendHours:
        "Winter: Sat/Sun/holidays prohibited without an Extended Hours permit. Summer: Sat 7 AM - 7 PM (state law); Sunday locally controlled (prohibited without permit)",
      dbLimits: null,
      note: null,
      sourceUrl:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/complaints/after-hours-construction-noise-complaints.html",
      sourceLabel: "City of Phoenix, after-hours construction noise",
    },
    shed: {
      exemptUpToSqft: 200,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached accessory structure up to 200 sq ft (105.2)",
      sourceUrl: "https://forensix.design/permit-phoenix.html",
      sourceLabel: "Phoenix 105.2 (quoted)",
    },
    fence: {
      maxHeightFtNoPermit: 3,
      alwaysPermit: false,
      detail: "Up to 3 ft: no permit. 3-7 ft: building permit required",
      sourceUrl: "https://www.cityofphoenix.org/content/dam/phoenix/pddsite/documents/trt/external/dsd_trt_pdf_00181.pdf",
      sourceLabel: "City of Phoenix PDD",
    },
    pergolaRule: null,
  },
  {
    city: "San Antonio",
    stateCode: "TX",
    slug: "san-antonio-tx",
    noise: {
      weekdayHours:
        "Adopted code: construction only during 'daytime' on weekdays - no clock hours in the adopted code (21-52(a)(6)). Sound must stay at or under 80 dBA at or across any property boundary",
      weekendHours: null,
      dbLimits: "63 dB residential / 70 business / 72 industrial / 85 entertainment; minus 7 dB at night",
      note: "Clock hours (7-8 Mon-Fri, 8-8 Sat, 9-5 Sun, no legal holidays) exist only in a proposed amendment - adoption was not verified",
      sourceUrl:
        "https://docsonline.sanantonio.gov/FileUploads/DSD/GoodnightGoodnightConstructionSiteCCR-June82021Meeting.pdf",
      sourceLabel: "San Antonio DSD construction noise documents",
    },
    shed: {
      exemptUpToSqft: 300,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached accessory structure up to 300 sq ft needs no permit (UDC 35-370(b))",
      sourceUrl:
        "https://www.sa.gov/Directory/Departments/DSD/Constructing/Residential/Permits/No-Permit-Required?lang_update=638527102909993789",
      sourceLabel: "San Antonio DSD",
    },
    fence: {
      maxHeightFtNoPermit: null,
      alwaysPermit: true,
      detail:
        "Every new residential fence needs a permit - there is no no-permit height. Repairs up to 25% are exempt. With a permit: 6 ft side/rear, 3 ft solid or 4 ft open in front",
      sourceUrl: "https://docsonline.sanantonio.gov/FileUploads/dsd/IB171.pdf?utm",
      sourceLabel: "San Antonio DSD IB171",
    },
    pergolaRule: null,
  },
  {
    city: "San Diego",
    stateCode: "CA",
    slug: "san-diego-ca",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 7:00 PM (a Construction Noise Permit is needed 7 PM - 7 AM)",
      weekendHours:
        "Saturday 7 AM - 7 PM. Sunday and legal holidays prohibited (except Columbus Day and Washington's Birthday). Weekend text via secondary summary - confirm on the live code",
      dbLimits:
        "One-hour average at the boundary: single-family 50 dB (7 AM - 7 PM) / 45 dB (7 PM - 10 PM) / 40 dB (10 PM - 7 AM); multi-family 55 / 50 / 45",
      note: null,
      sourceUrl: "https://www.sandiego.gov/development-services/permits/noise-permit",
      sourceLabel: "City of San Diego, Development Services noise permits",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: null,
      detail: "One-story detached accessory building up to 120 sq ft of projected roof area (129.0203)",
      sourceUrl: "https://municode.sandiego.gov/doclibrary.aspx?id=579112ac-12e7-4fad-a695-f383f448c336",
      sourceLabel: "San Diego Municipal Code 129.0203",
    },
    fence: {
      maxHeightFtNoPermit: 7,
      alwaysPermit: false,
      detail: "Up to 7 ft (swimming pool barriers excluded)",
      sourceUrl: "https://municode.sandiego.gov/doclibrary.aspx?id=579112ac-12e7-4fad-a695-f383f448c336",
      sourceLabel: "San Diego Municipal Code",
    },
    pergolaRule: null,
  },
  {
    city: "San Francisco",
    stateCode: "CA",
    slug: "san-francisco-ca",
    noise: {
      weekdayHours: "7:00 AM - 8:00 PM daily, including holidays",
      weekendHours: "Same - no weekend distinction",
      dbLimits:
        "No fixed residential dB. Noise cannot exceed 5 dB above ambient at the nearest lot line before 7 AM or after 8 PM. A night noise permit is needed for outdoor construction outside these hours",
      note: null,
      sourceUrl: "https://www.sf.gov/information--what-expect-during-construction-your-neighborhood",
      sourceLabel: "SF.gov construction noise guidance",
    },
    shed: {
      exemptUpToSqft: 100,
      strictLessThan: false,
      alwaysPermit: false,
      caution:
        "Two official sources conflict: the sf.gov permit page says under 100 sq ft and 8 ft tall; a DBI FAQ citing SFBC 106A.2 says 120 sq ft and 10 ft. Showing the conservative 100/8 until resolved",
      detail: "Conservative reading: under 100 sq ft and max 8 ft tall",
      sourceUrl: "https://www.SF.GOV/information--check-if-your-construction-project-needs-permit",
      sourceLabel: "SF.gov permit guidance",
    },
    fence: {
      maxHeightFtNoPermit: 6,
      alwaysPermit: false,
      detail: "6 ft at rear and side (at rear); 3 ft for all other fences (SFBC 106A.2)",
      sourceUrl: "https://www.SF.GOV/information--check-if-your-construction-project-needs-permit",
      sourceLabel: "SF.gov permit guidance",
    },
    pergolaRule: null,
  },
  {
    city: "San Jose",
    stateCode: "CA",
    slug: "san-jose-ca",
    noise: {
      weekdayHours: "Mon - Fri 7:00 AM - 7:00 PM within 500 ft of residential (20.100.450)",
      weekendHours: "No weekend construction within 500 ft of residential unless allowed by a development permit. Holidays not specified",
      dbLimits: "55 dBA at the property line (20.30.700). No fixed quiet-hours curfew - 'unreasonably loud' noise is banned 24/7 (10.16.010)",
      note: null,
      sourceUrl: "https://ceqanet.lci.ca.gov/2020040361/2/Attachment/yYB8g_",
      sourceLabel: "San Jose Municipal Code",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: "Over 650 sq ft triggers a building permit plus a special use permit",
      detail: "Accessory building or structure up to 120 sq ft, no electricity or plumbing",
      sourceUrl:
        "https://www.sanjoseca.gov/businesses/development-services-permit-center/start-your-project/single-family-duplex-properties/accessory-buildings-structures",
      sourceLabel: "San Jose Development Services",
    },
    fence: {
      maxHeightFtNoPermit: 7,
      alwaysPermit: false,
      detail: "Single-family/duplex lots: rear/side up to 7 ft, front up to 3 ft",
      sourceUrl:
        "https://www.sanjoseca.gov/your-government/departments-offices/planning-building-code-enforcement/building-division/bulletins-forms/projects-that-don-t-need-a-building-permit",
      sourceLabel: "San Jose Building Division",
    },
    pergolaRule: null,
  },
  {
    city: "Seattle",
    stateCode: "WA",
    slug: "seattle-wa",
    noise: {
      weekdayHours: "7:00 AM - 10:00 PM",
      weekendHours: "9:00 AM - 10:00 PM",
      dbLimits: null,
      note: null,
      sourceUrl: "https://www.seattle.gov/construction-and-inspections/codes/common-code-questions/noise-codes",
      sourceLabel: "Seattle SDCI noise codes",
    },
    shed: {
      exemptUpToSqft: 120,
      strictLessThan: false,
      alwaysPermit: false,
      caution: "Zoning cap is 12 ft. The shed must also be single-story, detached, outside critical areas, and storage/unoccupied use",
      detail: "Roof footprint up to 120 sq ft, with all criteria met",
      sourceUrl: "http://www.seattle.gov/x88932.xml",
      sourceLabel: "Seattle DPD",
    },
    fence: {
      maxHeightFtNoPermit: 8,
      alwaysPermit: false,
      detail: "Up to 8 ft needs no permit and no masonry/concrete over 6 ft. Zoning: 6 ft (4 ft front/street-side setback)",
      sourceUrl: "https://www.seattle.gov/construction-and-inspections/permits/common-projects/fences",
      sourceLabel: "Seattle fence permits",
    },
    pergolaRule: null,
  },
  {
    city: "Washington",
    stateCode: "DC",
    slug: "washington-dc",
    noise: {
      weekdayHours: "7:00 AM - 7:00 PM. Construction noise must stay at or under 80 dB(A) at 25 ft (DCMR 2802.1)",
      weekendHours: "Saturday 7 AM - 7 PM (third-party guide). Sunday and legal holidays prohibited in residential zones (2803.2)",
      dbLimits: "Construction: 80 dB(A) on weekdays. Residential ambient 60 dB(A) day / 55 dB(A) night (code-cited via third-party summary)",
      note: null,
      sourceUrl: "https://dcra.dc.gov/sites/default/files/dc/sites/dob/Noise%20Regulation%20Handbook.pdf",
      sourceLabel: "DC Noise Regulation Handbook (DOB)",
    },
    shed: {
      exemptUpToSqft: 50,
      strictLessThan: true,
      alwaysPermit: false,
      caution: null,
      detail: "Under 50 sq ft and under 10 ft tall",
      sourceUrl: "https://www.permitflow.com/blog/dc-building-permit-faq",
      sourceLabel: "DC DOB guidance via citing sources",
    },
    fence: {
      maxHeightFtNoPermit: null,
      alwaysPermit: true,
      detail: "Any new fence needs a DOB fence permit. Heights around 6 ft side / 7 ft rear; 7 ft cap along streets and alleys",
      sourceUrl: "https://app.dcoz.dc.gov/Exhibits/2010\\ZC\\20-19/Exhibit6.pdf",
      sourceLabel: "DC DCOZ exhibit (DC code cited)",
    },
    pergolaRule: null,
  },
];

export function findCity(slug: string): CityRecord | undefined {
  return CITIES.find((c) => c.slug === slug);
}
