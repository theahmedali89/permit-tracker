/**
 * Official state contractor-licensing boards and their public license
 * lookup pages, used by the free Contractor License Lookup tool
 * (/tools/license-lookup).
 *
 * Every lookupUrl below was verified on 2026-10-20 as the genuine lookup
 * published by the state's own licensing authority (fetched live, or — for
 * Ohio — confirmed from official ohio.gov sources after the portal itself
 * timed out for automated fetching). Never add a URL here that has not
 * been verified the same way.
 *
 * Permit Warden does NOT host license records. The tool routes users to
 * the official board search, which is the only authoritative source.
 */
export interface LicenseBoard {
  /** 2-letter state code, e.g. "CA" */
  code: string;
  /** Full state name, e.g. "California" */
  state: string;
  /** Licensing authority display name */
  boardName: string;
  /** Short agency/board label used in buttons, e.g. "CSLB" */
  boardShort: string;
  /** Verified official license-lookup URL (external) */
  lookupUrl: string;
  /** What the board licenses/registers — shown as coverage bullets */
  covers: string[];
  /** How a user can search on the official tool */
  searchBy: string;
  /** 2–3 sentence state-specific summary shown under the H1 */
  summary: string;
  /** Honest nuance box (e.g. no state GC license), or null */
  nuance: string | null;
  /** State-specific FAQs appended to the shared ones */
  faqs: Array<[string, string]>;
}

export const LICENSE_BOARDS: LicenseBoard[] = [
  {
    code: "CA",
    state: "California",
    boardName: "Contractors State License Board (CSLB)",
    boardShort: "CSLB",
    lookupUrl:
      "https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx",
    covers: [
      "General building (Class B) and general engineering (Class A) contractors",
      "Specialty trades (Class C) — electrical (C-10), plumbing (C-36), HVAC (C-20), roofing (C-39), and 40+ more",
      "Home Improvement Salesperson (HIS) registrations",
    ],
    searchBy: "license number, business name, or the license holder's name",
    summary:
      "California licenses almost every contractor through the CSLB. Anyone contracting for construction work totaling $1,000 or more (labor and materials combined) generally needs a CSLB license in the right classification — and you can verify it free on the CSLB's official license check before you sign anything.",
    nuance: null,
    faqs: [
      [
        "What does a California contractor license record show?",
        "The CSLB record shows the license status (you want \"Active\"), the classifications the contractor may legally perform, the business type, bond and workers' compensation insurance information, and complaint disclosure / disciplinary actions. If the status is anything other than active, the contractor cannot legally take the job.",
      ],
      [
        "What is a CSLB license classification, and why does it matter?",
        "A classification is the category of work a license covers — Class B for general building, Class A for general engineering, and Class C specialties such as C-10 Electrical or C-36 Plumbing. A contractor may only perform work inside their classification(s), so check that the classification on the record matches the work in your contract.",
      ],
      [
        "How do I find a California contractor's license number?",
        "By law it appears on the contractor's contracts, bids, and advertising. If you can't find it, search the CSLB lookup by business name or the owner's name instead — or ask the contractor directly. A licensed contractor will share it without hesitation.",
      ],
    ],
  },
  {
    code: "TX",
    state: "Texas",
    boardName: "Texas Department of Licensing and Regulation (TDLR)",
    boardShort: "TDLR",
    lookupUrl: "https://www.tdlr.texas.gov/LicenseSearch/",
    covers: [
      "Electricians and electrical contractors (TDLR)",
      "Air conditioning and refrigeration contractors (TDLR, commonly searched as a TACL license)",
      "Plumbers are licensed separately by the Texas State Board of Plumbing Examiners (TSBPE)",
    ],
    searchBy: "license type, license number, name or business name, city, county, or ZIP code",
    summary:
      "Texas does not issue a state general contractor license — but it absolutely licenses the trades. Electricians and HVAC contractors are licensed by TDLR, and plumbers by the Texas State Board of Plumbing Examiners. Verify the trade license on the official TDLR search before work starts.",
    nuance:
      "Texas has no state-level general contractor license. A GC's state license won't show up in any state database because none exists — instead, verify the TDLR or plumbing board licenses of the trades on the job, and note that some Texas cities require local contractor registration.",
    faqs: [
      [
        "Is a general contractor license required in Texas?",
        "No — Texas does not license general contractors at the state level. Licensing applies to specific trades: electricians and air conditioning/refrigeration contractors through TDLR, and plumbers through the Texas State Board of Plumbing Examiners. Some cities also require local registration, so check with the city where the work happens.",
      ],
      [
        "What does the TDLR license search show?",
        "TDLR's Active License Search covers active licenses only and can be searched by license type, number, name, business, or location. It shows the license type and expiration date — if a license doesn't appear, it is not currently active with TDLR.",
      ],
    ],
  },
  {
    code: "FL",
    state: "Florida",
    boardName:
      "Department of Business and Professional Regulation (DBPR) — Construction Industry Licensing Board",
    boardShort: "DBPR",
    lookupUrl: "https://www.myfloridalicense.com/wl11.asp",
    covers: [
      "Certified general, building, and residential contractors (statewide)",
      "Certified specialty contractors — roofing, plumbing, electrical, mechanical, pool, and more",
      "Registered contractors (licensed for specific local jurisdictions)",
    ],
    searchBy: "licensee name or license number",
    summary:
      "Florida licenses contractors through DBPR, and its free license search at MyFloridaLicense is the official record. Check that your contractor's license reads \"Current, Active\" and that the license type covers the work — Florida treats contracting without a license as a crime, and contracts with unlicensed contractors are unenforceable.",
    nuance: null,
    faqs: [
      [
        "What is the difference between a certified and a registered contractor in Florida?",
        "A certified contractor holds a statewide license from DBPR and can work anywhere in Florida. A registered contractor is licensed by a local jurisdiction and may only work there, with their registration recorded by DBPR. Both appear in the DBPR search — check the license type and where it is valid before hiring.",
      ],
      [
        "What license status should I look for in the Florida DBPR search?",
        "The record should read \"Current, Active.\" Delinquent, Expired, Null and Void, Revoked, or Voluntary Relinquishment all mean the contractor is not authorized to work. Also confirm the expiration date is in the future and the name matches the company on your quote.",
      ],
    ],
  },
  {
    code: "NY",
    state: "New York",
    boardName: "NYC Department of Buildings (DOB) — Licensing & Exams Unit",
    boardShort: "NYC DOB",
    lookupUrl: "https://www.nyc.gov/site/buildings/industry/license-types.page",
    covers: [
      "NYC general contractor registration (DOB)",
      "NYC trade licenses — master plumbers, master electricians, riggers, sign hangers, and more",
      "Registrations for construction superintendents, filing representatives, and safety professionals",
    ],
    searchBy: "last name, business name, or license number in the DOB licensee search",
    summary:
      "New York State does not license general contractors — licensing is local. In New York City, the Department of Buildings licenses the construction trades and registers general contractors, and its online search tool shows a licensee's current standing. Outside NYC, several counties license home-improvement contractors through their consumer protection offices.",
    nuance:
      "There is no New York State contractor license to look up. Inside New York City, verify the contractor's DOB registration or trade license. Elsewhere in the state, check with the county where the work is performed — counties such as Nassau, Suffolk, Westchester, Rockland, and Putnam license home-improvement contractors locally.",
    faqs: [
      [
        "Does New York State license general contractors?",
        "No. New York has no state-level general contractor license. New York City registers general contractors and licenses skilled trades through the Department of Buildings, and many counties license home-improvement contractors. Always verify with the authority where the project is located.",
      ],
      [
        "How do I check a New York City contractor's DOB standing?",
        "Start from the DOB Licensing page linked above and open the license search tool (\"Check Your License Status\"). You can search DOB NOW and Buildings Information System (BIS) records by last name, business name, or license number to see whether the license or registration is active and whether disciplinary actions exist.",
      ],
    ],
  },
  {
    code: "WA",
    state: "Washington",
    boardName: "Department of Labor & Industries (L&I)",
    boardShort: "WA L&I",
    lookupUrl: "https://secure.lni.wa.gov/verify/",
    covers: [
      "Registered general and specialty contractors (bonded and insured)",
      "Licensed electricians and electrical contractors",
      "Licensed plumbers and plumbing contractors",
    ],
    searchBy: "contractor or business name, or license/registration number (UBI)",
    summary:
      "In Washington, contractors register with L&I rather than taking a trade exam — but registration, bond, and insurance are mandatory, and L&I's free Verify tool shows all of it: registration status, bond and insurance accounts, workers' comp standing, and any violations or lawsuits against the bond.",
    nuance: null,
    faqs: [
      [
        "What does the Washington L&I Verify tool show?",
        "Verify shows whether a contractor's registration is active, their bond and insurance status, whether they are current on workers' compensation premiums, safety citations, and any lawsuits against their bond. If a business you hire is behind on workers' comp, L&I can hold you liable for the unpaid premiums — which is why this check matters.",
      ],
      [
        "Are Washington contractors licensed or registered?",
        "General and specialty contractors register with L&I (with a bond and insurance), while electricians and plumbers hold actual licenses. Both appear in the same Verify tool, so one search covers the whole crew.",
      ],
    ],
  },
  {
    code: "AZ",
    state: "Arizona",
    boardName: "Arizona Registrar of Contractors (AZ ROC)",
    boardShort: "AZ ROC",
    lookupUrl: "https://roc.az.gov/contractor-search",
    covers: [
      "Residential and commercial general contractors",
      "Specialty contractors — electrical, plumbing, HVAC, roofing, pools, and more",
      "Dual licenses (residential + commercial) by classification",
    ],
    searchBy: "6-digit ROC license number or the contractor's name",
    summary:
      "Arizona's Registrar of Contractors licenses every contractor working on projects over $1,000 or that require a building permit. The ROC's free contractor search confirms the license is current, shows its classification and status, and is the same database behind the state's Residential Contractors' Recovery Fund.",
    nuance: null,
    faqs: [
      [
        "When is an ROC license required in Arizona?",
        "If the total project cost — labor and materials — is over $1,000, or the work requires a permit from the local municipality, the company performing it must hold an ROC license in the proper classification. Verify the license on the day you sign the contract, not just the day work starts.",
      ],
      [
        "What should I check on an Arizona ROC record?",
        "Confirm the status is current/active, the classification covers your type of project (residential vs. commercial and the right specialty), and the business name matches your contract. The ROC record also surfaces complaint and discipline history within the agency's two-year jurisdiction window.",
      ],
    ],
  },
  {
    code: "IL",
    state: "Illinois",
    boardName:
      "Department of Financial and Professional Regulation (IDFPR)",
    boardShort: "IDFPR",
    lookupUrl: "https://idfpr.illinois.gov/CheckLicense.asp",
    covers: [
      "Roofing contractors — licensed statewide by IDFPR",
      "Home inspectors and other IDFPR-regulated professions",
      "Plumbers are licensed separately by the Illinois Department of Public Health",
    ],
    searchBy: "licensee name, business name, or license number in the IDFPR License Lookup",
    summary:
      "Illinois does not license general contractors at the state level — most GC licensing happens at city level (Chicago, for example). But roofing is a state license: every roofing contractor in Illinois must hold an IDFPR license, which you can verify free through IDFPR's official License Lookup.",
    nuance:
      "There is no Illinois state general contractor license. Verify what does exist: the IDFPR roofing license (required statewide), the state plumbing license from the Department of Public Health, and any local contractor license or registration the city requires where the work is performed.",
    faqs: [
      [
        "Do Illinois general contractors need a state license?",
        "No — Illinois has no state general contractor license. General contractor licensing and registration is handled by cities and municipalities. The major exception is roofing: Illinois law requires all roofing and waterproofing work to be performed by a state-licensed roofing contractor, verified through IDFPR.",
      ],
      [
        "How do I verify an Illinois roofing contractor's license?",
        "Open IDFPR's Check License page linked above, choose the License Lookup for individuals/entities, select \"Roofing Contractor\" as the license type, and search by name or the nine-digit license number (it usually starts with 104 or 105 and must appear on the contractor's contracts, bids, and ads). The status should be Active with a future expiration date.",
      ],
    ],
  },
  {
    code: "NC",
    state: "North Carolina",
    boardName: "Licensing Board for General Contractors (NCLBGC)",
    boardShort: "NCLBGC",
    lookupUrl: "https://portal.nclbgc.org/Public/Search",
    covers: [
      "General contractors — building, residential, highway, public utilities, and grading/excavating",
      "License limitations (Limited, Intermediate, Unlimited) by project value",
      "Electrical and plumbing/HVAC are licensed by their own NC boards",
      "Engineers and land surveyors are licensed separately by the NC Board of Examiners for Engineers and Surveyors (NCBELS)",
    ],
    searchBy: "classification type, license number, company name, or qualifier name",
    summary:
      "North Carolina requires a state general contractor license for projects of $40,000 or more, issued by the NCLBGC. Its free public search verifies the license, its limitation tier, and the qualifier behind it — and the board does not recognize licenses from any other state.",
    nuance: null,
    faqs: [
      [
        "When is a North Carolina general contractor license required?",
        "A valid NC general contractors license is required for any project quoted at $40,000 or more. Smaller projects do not require the state license, though hiring a licensed contractor still gives you the protection of the board's complaint and discipline process.",
      ],
      [
        "What are the NC license limitation tiers?",
        "NCLBGC licenses carry a limitation — Limited, Intermediate, or Unlimited — that caps the value of a single project the licensee may undertake. Check on the search record that the contractor's limitation covers your project's value, and that the license status is current (licenses renew every January 1).",
      ],
    ],
  },
  {
    code: "GA",
    state: "Georgia",
    boardName:
      "Secretary of State — Professional Licensing Boards (State Licensing Board for Residential and General Contractors)",
    boardShort: "GA SOS",
    lookupUrl: "https://verify.sos.ga.gov/verification/Search.aspx",
    covers: [
      "Residential and general contractors (individual and qualifying-agent licenses)",
      "Electrical contractors, conditioned air (HVAC) contractors, and plumbers",
      "Low voltage contractors and other Title 43 professions",
    ],
    searchBy: "profession, license type, license number, or the licensee's name",
    summary:
      "Georgia licenses residential and general contractors through the Secretary of State's Professional Licensing Boards. The state's free verification search covers contractors plus the major trades — electrical, conditioned air, plumbing, and low voltage — in one database.",
    nuance: null,
    faqs: [
      [
        "How do I verify a Georgia contractor's license?",
        "Use the Secretary of State verification search linked above: choose the profession (for example \"Residential/General Contractor\"), then search by the licensee's name or license number. Confirm the status is active and the license type matches the work — a qualifying agent's license covers the business entity named on the record.",
      ],
      [
        "Does a Georgia business license prove a contractor is licensed?",
        "No. A local business license (occupational tax certificate) only registers the business locally — it is not a state contractor license. Always verify the state license itself in the Secretary of State search before hiring.",
      ],
    ],
  },
  {
    code: "OH",
    state: "Ohio",
    boardName:
      "Ohio Construction Industry Licensing Board (OCILB) — via eLicense Ohio",
    boardShort: "OCILB",
    lookupUrl: "https://elicense.ohio.gov/oh_verifylicense",
    covers: [
      "Commercial electrical contractors (OCILB)",
      "Commercial HVAC, hydronics, plumbing, and refrigeration contractors (OCILB)",
      "Other Ohio professional licenses through the same eLicense look-up",
    ],
    searchBy: "last and first name, or full license number, with the licensing board selected",
    summary:
      "Ohio does not license general contractors or residential builders at the state level — but commercial work in five trades (electrical, HVAC, hydronics, plumbing, and refrigeration) requires an OCILB license. Verify it in the official eLicense Ohio look-up, the same system Ohio's licensing boards point to as the primary source.",
    nuance:
      "There is no Ohio state general contractor license. OCILB licenses the five commercial trades above; residential and general contracting are handled by local registration in many cities. If a GC can't be found in eLicense, check the trade licenses of the crew and the city's contractor registration list.",
    faqs: [
      [
        "Does Ohio license general contractors?",
        "Not at the state level. Ohio licenses commercial contractors in five trades through OCILB — electrical, HVAC, hydronics, plumbing, and refrigeration. General and residential contractors are typically registered locally with the city or county building department instead.",
      ],
      [
        "How do I search eLicense Ohio for an OCILB contractor?",
        "Open the eLicense look-up linked above, choose \"License Look Up,\" enter the last and first name (or the full license number including any prefix), and select the Ohio Construction Industry Licensing Board from the board list. The record shows the license type, status, and expiration date.",
      ],
    ],
  },
];

export function getLicenseBoard(code: string): LicenseBoard | undefined {
  return LICENSE_BOARDS.find((b) => b.code === code);
}
