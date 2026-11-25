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

/**
 * Verified per-state licensing detail (fees, renewal, bond/insurance,
 * requirements, complaint process) for the license-lookup pages.
 *
 * Every figure below was checked against the official source cited in
 * `sources` / per-section `sourceUrl` on 2026-11-25. Anything no official
 * source could settle was left out — never guess a fee, bond amount, or
 * deadline into this file.
 */
export interface LicenseFeeItem {
  item: string;
  amount: string;
  note?: string;
  asOf?: string;
  sourceUrl?: string;
}

export interface LicenseBoardDetail {
  licenseTypes?: Array<{ name: string; description: string }>;
  fees?: LicenseFeeItem[];
  renewal?: { cycle: string; howTo: string; lateFee?: string; sourceUrl?: string };
  bondInsurance?: { bond: string; insurance: string; note?: string; sourceUrl?: string };
  requirements?: { exam?: string; experience?: string; education?: string; other?: string; sourceUrl?: string };
  recordShows?: string[];
  complaintProcess?: { howTo: string; whatHappens?: string; sourceUrl?: string };
  processingTime?: string;
  sources?: string[];
  verifiedAt?: string;
}

export const LICENSE_BOARD_DETAILS: Record<string, LicenseBoardDetail> = {
  "CA": {
    "licenseTypes": [
      {
        "name": "Class A — General Engineering",
        "description": "Fixed works needing specialized engineering skill: highways, bridges, dams, pipelines, excavation."
      },
      {
        "name": "Class B — General Building",
        "description": "Any structure built, being built or to be built, using at least two unrelated building trades."
      },
      {
        "name": "Class B-2 — Residential Remodeling",
        "description": "Remodeling and repair of existing residential structures."
      },
      {
        "name": "Class C-10 — Electrical",
        "description": "General electrical work; renewal carries an extra $20 certification enforcement fee."
      },
      {
        "name": "Class C-20 — Warm-Air Heating, Ventilating and Air-Conditioning",
        "description": "HVAC installation and service; cannot claim a workers' comp exemption."
      },
      {
        "name": "Class C-36 — Plumbing",
        "description": "Plumbing work including water, gas and sewer piping."
      },
      {
        "name": "Class C-39 — Roofing",
        "description": "Roofing work; cannot claim a workers' comp exemption."
      },
      {
        "name": "Class C-27 — Landscaping",
        "description": "Landscaping, irrigation and related site work."
      },
      {
        "name": "Class C-46 — Solar",
        "description": "Solar energy system installation."
      }
    ],
    "fees": [
      {
        "item": "Original application fee",
        "amount": "$450",
        "note": "Non-refundable, for one classification; $150 for each additional classification on the original application.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      },
      {
        "item": "Exam fee",
        "amount": "Paid directly to PSI Exams",
        "note": "Since January 1, 2025 (SB 1455) applicants pay exam fees directly to PSI Exams, not to CSLB; the per-exam dollar amount is not published on CSLB's fee page.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      },
      {
        "item": "Initial license fee",
        "amount": "$200 (sole owner) / $350 (non-sole owner)",
        "note": "Covers the first two-year license period; paid after passing the exams.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      },
      {
        "item": "Active timely renewal fee",
        "amount": "$450 (sole owner) / $700 (non-sole owner)",
        "note": "C-10 electrical contractors pay $470 / $720. Inactive timely renewal is $300 / $500.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      },
      {
        "item": "Delinquent renewal fee",
        "amount": "$675 (sole owner) / $1,050 (non-sole owner)",
        "note": "Charged when an acceptable renewal is not received by the expiration date; C-10 pays $695 / $1,070.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      },
      {
        "item": "Fingerprinting (Live Scan)",
        "amount": "$32 (DOJ) + $17 (FBI) + rolling fee (varies by site)",
        "note": "Paid to the Live Scan operator; CSLB does not set the rolling fee.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.cslb.ca.gov/About_us/Library/Fees.aspx"
      }
    ],
    "renewal": {
      "cycle": "every 2 years (active licenses); every 4 years (inactive licenses)",
      "howTo": "Renew through CSLB online services before the expiration date; the renewal application must reach CSLB headquarters before expiry to avoid delinquent fees.",
      "lateFee": "$675 (sole owner) / $1,050 (non-sole owner) for delinquent active renewal — a $225 / $350 penalty over the timely fee.",
      "sourceUrl": "https://www.cslb.ca.gov/contractors/maintain_license/renew_license/general_renewal_information.aspx"
    },
    "bondInsurance": {
      "bond": "$25,000 contractor bond (or cash deposit) filed with the Registrar; a separate $25,000 Bond of Qualifying Individual is required for an RME or RMO.",
      "insurance": "Workers' compensation insurance required if you have employees; contractors with no employees file a certificate of exemption, except C-8, C-20, C-22, C-39 and C-61/D-49, which cannot claim the exemption. LLCs need liability insurance.",
      "note": "CSLB does not issue bonds; buy from an insurer or surety licensed by the California Department of Insurance. An RMO is exempt from the Bond of Qualifying Individual if they own at least 10% of the voting stock/equity.",
      "sourceUrl": "https://www.cslb.ca.gov/contractors/applicants/Contractors_License/Exam_Application/Issuing_My_License.aspx"
    },
    "requirements": {
      "exam": "Law and Business exam plus a trade exam, administered by PSI Exams; applicants have 18 months from acceptance to pass.",
      "experience": "4 years of journey-level experience in the trade within the 10 years immediately prior to filing, at least 1 year of it practical experience.",
      "education": "No schooling required; technical training, apprenticeship, military training or education can substitute for up to 3 years of the 4, with at least 1 year practical.",
      "other": "Must be 18 or older with an SSN or ITIN; all applicants are fingerprinted (Live Scan) and pass a criminal background check before a license is issued; asbestos open-book exam required for new applicants.",
      "sourceUrl": "https://www.cslb.ca.gov/About_Us/Examination_FAQ.aspx"
    },
    "recordShows": [
      "License status (current and active, inactive, suspended, revoked)",
      "Workers' compensation coverage status",
      "Pending or prior disciplinary actions and complaint disclosure information"
    ],
    "complaintProcess": {
      "howTo": "File online at cslb.ca.gov, by mail with the complaint form, or call 1-800-321-CSLB (2752) to request a form. Send complaints about work in Imperial, Los Angeles, Orange, Riverside, San Bernardino, San Diego or Ventura counties to the Norwalk Intake and Mediation Center; all other counties go to Sacramento.",
      "whatHappens": "CSLB investigates, can mediate, issue an advisory notice or citation, or refer the case to a district attorney. Proven violations can lead to license discipline (suspension or revocation). CSLB discipline does not guarantee restitution; small claims court and CSLB's Judgment Unit are the routes for unpaid judgments. No recovery fund exists.",
      "sourceUrl": "http://www.cslb.ca.gov/Resources/GuidesAndPublications/ConstructionComplaintGuide.pdf"
    },
    "processingTime": "CSLB sends an acknowledgment letter within 4-6 weeks of receiving an application.",
    "sources": [
      "https://www.cslb.ca.gov/About_us/Library/Fees.aspx",
      "https://www.cslb.ca.gov/contractors/maintain_license/renew_license/general_renewal_information.aspx",
      "https://www.cslb.ca.gov/contractors/applicants/Contractors_License/Exam_Application/Issuing_My_License.aspx",
      "https://www.cslb.ca.gov/About_Us/Examination_FAQ.aspx",
      "https://www.cslb.ca.gov/About_us/Public_info_Faq.aspx",
      "https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx",
      "http://www.cslb.ca.gov/Resources/GuidesAndPublications/ConstructionComplaintGuide.pdf"
    ],
    "verifiedAt": "2026-11-25"
  },
  "TX": {
    "licenseTypes": [
      {
        "name": "Electrical Contractor",
        "description": "Designs, installs, repairs, or alters electrical wiring for light, heat, power, or signaling; must employ or be a licensed Master Electrician."
      },
      {
        "name": "Electrical Sign Contractor",
        "description": "Designs, manufactures, installs, and services electric signs, neon, and outline gas tubing."
      },
      {
        "name": "Residential Appliance Installation Contractor",
        "description": "Installs residential appliances, including pool-related electrical installation and maintenance."
      },
      {
        "name": "Air Conditioning & Refrigeration Contractor — Class A",
        "description": "ACR work on units of any size, with endorsements for environmental air, commercial refrigeration, or process cooling/heating."
      },
      {
        "name": "Air Conditioning & Refrigeration Contractor — Class B",
        "description": "ACR work on cooling systems of 25 tons and under and heating systems of 1.5 million BTU/hour and under."
      }
    ],
    "fees": [
      {
        "item": "Electrical Contractor application fee",
        "amount": "$110",
        "note": "Non-refundable; paid with the application to TDLR.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.tdlr.texas.gov/electricians/apply/businesses/contractor-elec.htm"
      },
      {
        "item": "Electrical Contractor renewal fee",
        "amount": "$110",
        "note": "Annual renewal; renewals are completed online.",
        "asOf": "2026-11-24",
        "sourceUrl": "http://www.tdlr.texas.gov/electricians/renew/businesses/contractor-elec.htm"
      },
      {
        "item": "ACR Contractor application fee",
        "amount": "$115",
        "note": "Non-refundable; paid with the application to TDLR.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.tdlr.texas.gov/acr/contractor-apply.htm"
      },
      {
        "item": "ACR Contractor renewal fee",
        "amount": "$65",
        "note": "Annual renewal; renewals are completed online.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.tdlr.texas.gov/acr/contractor-renew.htm"
      },
      {
        "item": "ACR Contractor exam fee — Class A",
        "amount": "$74",
        "note": "Paid to PSI when scheduling the exam; retakes are scheduled through PSI.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://test-takers.psiexams.com/api/content/bulletin/5994"
      },
      {
        "item": "ACR Contractor exam fee — Class B",
        "amount": "$60",
        "note": "Paid to PSI when scheduling the exam; retakes are scheduled through PSI.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://test-takers.psiexams.com/api/content/bulletin/5994"
      }
    ],
    "renewal": {
      "cycle": "every year (1 year from date of issue)",
      "howTo": "Renew online through TDLR (Renew Online) before the expiration date.",
      "lateFee": "Electrical Contractor: $165 if expired 90 days or less, $220 if expired 91 days to 18 months. ACR Contractor: 1.5x the renewal fee if expired 90 days or less, 2x if expired 91 days to 18 months.",
      "sourceUrl": "https://www.tdlr.texas.gov/acr/contractor-renew.htm"
    },
    "bondInsurance": {
      "bond": "No surety bond requirement found on TDLR's contractor application pages; liability insurance is the published financial requirement.",
      "insurance": "Electrical contractors: $300,000 per occurrence, $600,000 aggregate, $300,000 products/completed operations. ACR Class A: same limits. ACR Class B: $100,000 per occurrence, $200,000 aggregate, $100,000 products/completed operations. Workers' comp (electrical trades): provide proof of workers' compensation insurance, a certificate of authority to self-insure, or a statement electing not to obtain coverage, with the application.",
      "note": "A certificate of insurance must be filed with the application and coverage must be maintained at all times while the license is active.",
      "sourceUrl": "https://www.tdlr.texas.gov/acr/contractor-apply.htm"
    },
    "requirements": {
      "exam": "ACR contractor licensing exam administered by PSI (exam depends on license class and endorsements). Electrical contractors take no separate exam, but must employ or be a licensed Master Electrician, who must pass the Master Electrician exam.",
      "experience": "ACR: 48 months of supervised practical experience in the past 72 months, or 36 months of practical experience in the preceding 48 months after holding a technician certification for 12 months. Master Electrician: 12,000 hours of on-the-job training under a master electrician, plus a journeyman electrician license held for at least two years.",
      "education": "No formal education requirement published for initial licensing (degree/diploma holders may qualify for ACR experience exceptions). Continuing education: ACR contractors must complete 8 hours of approved continuing education each year, including 1 hour on Texas laws and rules, before renewal.",
      "other": "Must be 18+. TDLR runs a criminal history background check, including fingerprinting, on all applicants and renewals; a Criminal History Questionnaire is required if ever convicted of a felony or misdemeanor (other than a minor traffic violation).",
      "sourceUrl": "https://www.tdlr.texas.gov/acr/contractor-apply.htm"
    },
    "recordShows": [
      "Licensee name (person or business)",
      "License number (license type + 8-digit number)",
      "License type",
      "Expiration date",
      "Address"
    ],
    "complaintProcess": {
      "howTo": "File online through TDLR's online complaint system, or by mail to Enforcement Division, P.O. Box 12157, Austin, TX 78711; help by phone at 1-800-803-9202. Complaints must be filed within 2 years of the event; anonymous complaints are accepted.",
      "whatHappens": "TDLR's Enforcement Division checks jurisdiction, investigates (interviews, documents, site visit), and a prosecutor decides the outcome; penalties and license sanctions can follow. Disciplinary orders are posted in TDLR's Administrative Orders Search for 3 years. No recovery fund for TDLR contractor licensees was identified in the TDLR material reviewed.",
      "sourceUrl": "https://www.tdlr.texas.gov/complaints/"
    },
    "sources": [
      "https://www.tdlr.texas.gov/LicenseSearch/",
      "https://www.tdlr.texas.gov/LicenseSearch/help1.asp",
      "https://www.tdlr.texas.gov/electricians/apply/businesses/contractor-elec.htm",
      "http://www.tdlr.texas.gov/electricians/renew/businesses/contractor-elec.htm",
      "https://www.tdlr.texas.gov/acr/contractor-apply.htm",
      "https://www.tdlr.texas.gov/acr/contractor-renew.htm",
      "https://www.tdlr.texas.gov/acr/acrexam.htm",
      "https://test-takers.psiexams.com/api/content/bulletin/5994",
      "https://www.tdlr.texas.gov/complaints/",
      "https://www.tdlr.texas.gov/media/pdf/TDLR-Consumer-Complaints-at-a-Glance.pdf"
    ],
    "verifiedAt": "2026-11-25"
  },
  "FL": {
    "licenseTypes": [
      {
        "name": "Certified General Contractor",
        "description": "Builds and remodels commercial and residential structures of any size, anywhere in Florida."
      },
      {
        "name": "Certified Building Contractor",
        "description": "Builds and remodels commercial buildings and single- and multi-family residential structures up to 3 stories."
      },
      {
        "name": "Certified Residential Contractor",
        "description": "Builds and remodels one-, two-, and three-family residences."
      },
      {
        "name": "Certified Roofing Contractor",
        "description": "Installs, repairs, and replaces roof systems."
      },
      {
        "name": "Certified Air Conditioning Contractor (Class A/B/C)",
        "description": "Class A: any size system. Class B: systems up to 25 tons cooling. Class C: limited to the servicing of air-conditioning, heating or refrigeration systems; grandfathered category, only for persons whose certification or registration was valid on October 1, 1988 (no new Class C licenses issued since)."
      },
      {
        "name": "Certified Plumbing Contractor",
        "description": "Installs and repairs plumbing systems and fixtures."
      },
      {
        "name": "Certified Mechanical Contractor",
        "description": "Installs and services mechanical systems, including HVAC, piping, and sheet metal work."
      },
      {
        "name": "Certified Swimming Pool/Spa Contractor",
        "description": "Builds and services residential and commercial pools and spas."
      },
      {
        "name": "Certified Solar Contractor",
        "description": "Installs solar thermal and photovoltaic systems."
      },
      {
        "name": "Certified Underground Utility & Excavation Contractor",
        "description": "Installs underground utilities and performs excavation work."
      }
    ],
    "fees": [
      {
        "item": "Application and examination fee (combined)",
        "amount": "$335",
        "note": "Non-refundable, per Rule 61G4-12.009. The CILB exam application itself carries no separate fee; exam registration is handled by Professional Testing, Inc.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.flrules.org/gateway/ruleNo.asp?id=61G4-12.009"
      },
      {
        "item": "Initial license fee",
        "amount": "$245 or $145",
        "note": "$245 if applying May 1 of an even year through August 31 of an odd year; $145 if applying September 1 of an odd year through April 30 of an even year.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www2.myfloridalicense.com/pro/cilb/documents/CILB5A_Certified_Contractor_Individual_General.pdf"
      },
      {
        "item": "Renewal fee (biennial, active)",
        "amount": "$205",
        "note": "$200 rule fee + $5 unlicensed-activity fee, per Rule 61G4-12.009. DBPR adds a $50 business qualification fee per business entity the license qualifies.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.flrules.org/gateway/ruleNo.asp?id=61G4-12.009"
      },
      {
        "item": "Renewal fee (biennial, inactive)",
        "amount": "$55",
        "note": "$50 rule fee + $5 unlicensed-activity fee, per Rule 61G4-12.009; inactive licenses must still be renewed every two years.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.flrules.org/gateway/ruleNo.asp?id=61G4-12.009"
      },
      {
        "item": "Delinquency fee",
        "amount": "$25",
        "note": "Per Rule 61G4-12.009(11).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.flrules.org/gateway/ruleNo.asp?id=61G4-12.009"
      }
    ],
    "renewal": {
      "cycle": "every 2 years — certified licenses expire August 31 of even-numbered years; registered licenses expire August 31 of odd-numbered years",
      "howTo": "Renew online through DBPR's online services at MyFloridaLicense.com. 14 hours of board-approved continuing education are required each cycle.",
      "lateFee": "$25 delinquency fee (Rule 61G4-12.009(11)).",
      "sourceUrl": "https://www2.myfloridalicense.com/construction-industry/faqs/"
    },
    "bondInsurance": {
      "bond": "No surety bond for the contractor license itself. A Financially Responsible Officer (FRO) must hold a $100,000 bond (or irrevocable letter of credit) payable to the Construction Industry Licensing Board.",
      "insurance": "General and building contractors: $300,000 public liability and $50,000 property damage. All other categories: $100,000 public liability and $25,000 property damage. Workers' compensation coverage or an exemption is required within 30 days of license issuance.",
      "note": "Active licensees must maintain the minimum insurance at all times. Applicants must also submit a credit report with a FICO score of 660 or higher, or complete a 14-hour financial responsibility course if below 660.",
      "sourceUrl": "https://www2.myfloridalicense.com/construction-industry/faqs/"
    },
    "requirements": {
      "exam": "Division I exams have three parts: Business and Finance, Contract Administration, and Project Management. Division II exams have two parts: Business and Finance and Trade Knowledge. Computer-based exams are administered by Pearson VUE; candidates register through Professional Testing, Inc. (floridaexam.com). A bachelor's degree in building construction with a 3.0+ GPA exempts the trade knowledge portion.",
      "experience": "Four years of field experience in the license category, including one year of supervisory experience. Up to 3 years of college credit or military service can substitute for field experience. General contractors must also show experience in 4 of 6 areas (foundations/slabs over 20,000 sq ft, masonry walls, steel erection, elevated slabs, column erection, formwork), including at least 1 year on new construction of 4+ story structures.",
      "education": "No construction-specific degree required; accredited college credit hours can substitute for up to 3 years of the experience requirement.",
      "other": "Electronic fingerprints and an FDLE background check; credit report with FICO score of 660 or higher (or a 14-hour financial responsibility course if lower). You must obtain your license within 4 years of your exam score.",
      "sourceUrl": "https://www2.myfloridalicense.com/construction-industry/faqs/"
    },
    "recordShows": [
      "License number",
      "Licensee name",
      "License type/category",
      "License status",
      "Expiration date"
    ],
    "complaintProcess": {
      "howTo": "File a complaint with DBPR online at MyFloridaLicense.com or call the Customer Contact Center at 850.487.1395. Report unlicensed activity to the Unlicensed Activity hotline at 1-866-532-1440.",
      "whatHappens": "Homeowners who obtain a judgment can claim from the Florida Homeowners' Construction Recovery Fund — up to $100,000 per Division I claim and $30,000 per Division II claim for contracts entered on or after July 1, 2024.",
      "sourceUrl": "https://www2.myfloridalicense.com/construction-industry/faqs/"
    },
    "processingTime": "The Board must approve or deny an application within 90 days — this is a decision window, not a processing-time figure.",
    "sources": [
      "https://www.myfloridalicense.com/wl11.asp",
      "https://www2.myfloridalicense.com/construction-industry/faqs/",
      "https://www2.myfloridalicense.com/pro/cilb/documents/CILB5A_Certified_Contractor_Individual_General.pdf",
      "https://www2.myfloridalicense.com/examination-information/construction-examinations/",
      "https://www2.myfloridalicense.com/construction-industry/recovery-fund/",
      "https://www2.myfloridalicense.com/documents/DBPR-Hurricane-Guide-for-Businesses.pdf",
      "https://www.flrules.org/gateway/ruleNo.asp?id=61G4-12.009"
    ],
    "verifiedAt": "2026-11-25"
  },
  "NY": {
    "licenseTypes": [
      {
        "name": "General Contractor Registration",
        "description": "Required to pull permits to build 1-, 2-, or 3-family homes in New York City. This is a registration, not a trade license."
      },
      {
        "name": "Master Plumber",
        "description": "Licensed to install, alter, and repair plumbing and gas piping; holds a certificate of competence."
      },
      {
        "name": "Master Electrician",
        "description": "Licensed to perform electrical work in New York City."
      },
      {
        "name": "Master Fire Suppression Piping Contractor",
        "description": "Installs and services fire suppression piping systems."
      },
      {
        "name": "Oil Burner Equipment Installer",
        "description": "Installs and services oil-burning equipment."
      },
      {
        "name": "Rigger (Master / Special)",
        "description": "Licensed to rig and hoist loads on construction sites."
      },
      {
        "name": "Sign Hanger",
        "description": "Licensed to install and maintain signs."
      },
      {
        "name": "Welder",
        "description": "Licensed to perform structural welding."
      },
      {
        "name": "Hoisting Machine Operator",
        "description": "Licensed to operate cranes and hoisting machinery."
      },
      {
        "name": "Construction Superintendent",
        "description": "Oversees construction sites for code compliance and safety."
      },
      {
        "name": "Site Safety Manager",
        "description": "Manages site safety on major buildings."
      }
    ],
    "fees": [
      {
        "item": "General Contractor Registration fee",
        "amount": "$300",
        "note": "Initial registration fee, per the DOB licensing fee chart.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.nyc.gov/assets/buildings/pdf/licensing_fee_chart.pdf"
      },
      {
        "item": "General Contractor Registration renewal fee",
        "amount": "$240",
        "note": "Renewal every 3 years; paid via the online portal.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.nyc.gov/site/buildings/industry/general-contractor-registration-renewal.page"
      },
      {
        "item": "General Contractor Registration late renewal fee",
        "amount": "$50",
        "note": "Late renewal total is $290 ($240 renewal + $50 late fee).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.nyc.gov/site/buildings/industry/general-contractor-registration-renewal.page"
      },
      {
        "item": "Background investigation fee",
        "amount": "$330",
        "note": "Charged for the background investigation required for General Contractor Registration.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.nyc.gov/assets/buildings/pdf/licensing_fee_chart.pdf"
      },
      {
        "item": "Safety Registration endorsement",
        "amount": "$80 per endorsement",
        "note": "$80 per endorsement on renewal; $130 per endorsement for late renewal (includes the $50 late fee).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.nyc.gov/site/buildings/industry/general-contractor-registration-renewal.page"
      }
    ],
    "renewal": {
      "cycle": "every 3 years",
      "howTo": "Renew online through DOB NOW (eFiling account, BIS Options section). Renewal applications must be submitted 30–90 days before the expiration date shown on the license card.",
      "lateFee": "$50 (late renewal total $290, not including Safety Registration endorsements). If more than 1 year has passed since expiration, you must reapply for the registration.",
      "sourceUrl": "https://www.nyc.gov/site/buildings/industry/general-contractor-registration-renewal.page"
    },
    "bondInsurance": {
      "bond": "No surety bond requirement published in DOB's General Contractor Registration requirements.",
      "insurance": "General liability insurance certificate with a $1 million minimum policy, plus workers' compensation certificate and disability insurance certificate.",
      "note": "Insurance must stay active and current with the DOB Licensing & Exams Unit at all times.",
      "sourceUrl": "https://www.nyc.gov/site/buildings/industry/obtain-a-general-contractor-registration.page"
    },
    "requirements": {
      "exam": "No exam for General Contractor Registration — applicants pass a DOB background investigation instead. Other DOB trade licenses (Master Plumber, Master Electrician, etc.) require written and practical exams through the Licensing & Exams Unit.",
      "experience": "No years-of-experience requirement published for General Contractor Registration; applicants must prove financial solvency.",
      "education": "No formal education requirement published; applicants must be able to read and write English.",
      "other": "Must be 18+ and of good moral character. Background investigation requires a notarized LIC6 form, LIC50 or LIC51, child support certification, proof of EIN, 3 consecutive business bank statements each showing a $25,000 minimum ending balance, government photo ID, and Social Security card. Corporations must be in good standing under New York State law and have no outstanding OATH penalties.",
      "sourceUrl": "https://www.nyc.gov/site/buildings/industry/obtain-a-general-contractor-registration.page"
    },
    "complaintProcess": {
      "howTo": "Report through NYC311 (call 311 or portal.311.nyc.gov) or to DOB. Complaints about licensees are referred to DOB's Investigations Audit and Disciplinary Unit (IAD). For complaint status, contact the Buildings Special Investigations Unit (BSIU) in writing at 180 Maiden Lane, 19th Floor, New York, NY 10038, or call (212) 825-2413.",
      "sourceUrl": "https://www.nyc.gov/site/buildings/codes/oppn0500.page"
    },
    "processingTime": "Registration card mailed within 30 days of approval (renewals). New applicants receive a determination email via DOB NOW and have 1 year from approval to pick up the license.",
    "sources": [
      "https://www.nyc.gov/site/buildings/industry/license-types.page",
      "https://www.nyc.gov/site/buildings/industry/obtain-a-general-contractor-registration.page",
      "https://www.nyc.gov/site/buildings/industry/general-contractor-registration-renewal.page",
      "https://www.nyc.gov/assets/buildings/pdf/licensing_fee_chart.pdf",
      "https://www.nyc.gov/site/buildings/codes/oppn0500.page",
      "https://portal.311.nyc.gov/report-problems/"
    ],
    "verifiedAt": "2026-11-25"
  },
  "WA": {
    "licenseTypes": [
      {
        "name": "General Contractor",
        "description": "May perform more than one construction trade; requires a $30,000 bond."
      },
      {
        "name": "Specialty Contractor",
        "description": "May perform only the single trade selected at registration; may only subcontract work that is incidental to its specialty (RCW 18.27.010(12)); requires a $15,000 bond."
      }
    ],
    "fees": [
      {
        "item": "Application / registration fee",
        "amount": "$150.20",
        "note": "Covers the contractor registration application; same amount for renewal.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index"
      },
      {
        "item": "Reinstatement fee",
        "amount": "$70.90",
        "note": "To reinstate a suspended registration after fixing the cause (new bond, insurance or satisfied judgment).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index"
      }
    ],
    "renewal": {
      "cycle": "every 2 years",
      "howTo": "Renew online with your 12-digit contractor registration number and UBI number, or by mail or in person at an L&I office, with the $150.20 fee.",
      "sourceUrl": "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index"
    },
    "bondInsurance": {
      "bond": "$30,000 continuous surety bond for general contractors; $15,000 for specialty contractors (or an assigned savings account for the same amount). Bond rises with prior final judgments on a single-family home: 1 judgment $40,000/$20,000; 2 judgments $60,000/$30,000; 3 or more $90,000/$45,000.",
      "insurance": "General liability $200,000 public liability plus $50,000 property damage, or $250,000 combined single limit. Workers' comp account required if you have employees (the Verify tool checks it is active and paid to date).",
      "note": "L&I must be listed as certificate holder on the liability policy; bond and insurance must use the exact business name on file.",
      "sourceUrl": "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index"
    },
    "requirements": {
      "exam": "Washington registration has no trade exam; it is a registration, not a license exam.",
      "experience": "No experience requirement is published for registration.",
      "education": "No education requirement is published for registration.",
      "other": "Register the business with the Department of Revenue; each principal must provide an SSN or ITIN; application signatures must be notarized; no unsatisfied final judgments for work under RCW 18.27 or debts owed to L&I.",
      "sourceUrl": "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index"
    },
    "recordShows": [
      "Whether the business has an active contractor registration",
      "Workers' comp account status (active and paid to date)",
      "Safety violations and construction citations",
      "Lawsuits against the contractor's surety bond",
      "Business owner names",
      "Trade certifications (electrical, plumbing, elevator, manufactured home)"
    ],
    "complaintProcess": {
      "howTo": "L&I does not take contractor complaints or sue on your behalf. File a summons and complaint in the Superior Court of the county where the work was done, naming the bond company, then send L&I three copies plus a $66.20 service fee so L&I serves the contractor and bond company.",
      "whatHappens": "A court judgment lets you collect from the bond (up to $30,000 general / $15,000 specialty). If losses remain after the bond, owner-occupants can apply to L&I's Homeowner Recovery Fund for up to $25,000 within 90 days of the case ending (the judgment must be ordered after July 1, 2026). L&I can suspend a registration when bond or insurance lapses.",
      "sourceUrl": "https://lni.wa.gov/licensing-permits/contractors/problems-with-a-contractor/filing-a-lawsuit"
    },
    "processingTime": "Mailed applications take 3-4 weeks after receipt to process and activate; registration card arrives in about 2 weeks.",
    "sources": [
      "https://www.lni.wa.gov/licensing-permits/contractors/register-as-a-contractor/index",
      "https://www.lni.wa.gov/licensing-permits/contractors/hiring-a-contractor/verify-contractor-tradesperson-business",
      "https://lni.wa.gov/licensing-permits/contractors/problems-with-a-contractor/filing-a-lawsuit",
      "https://www.lni.wa.gov/forms-publications/F625-120-000.pdf",
      "https://secure.lni.wa.gov/verify/"
    ],
    "verifiedAt": "2026-11-25"
  },
  "AZ": {
    "licenseTypes": [
      {
        "name": "A — General Engineering",
        "description": "Fixed works, streets, roads, dams, bridges, tunnels, utility and sewage plants."
      },
      {
        "name": "B-1 — General Commercial Contractor",
        "description": "Commercial structures of any size; electrical, plumbing, HVAC, pools and wells must be subcontracted."
      },
      {
        "name": "B-2 — General Small Commercial Contractor",
        "description": "Commercial construction on projects of $2,000,000 or less including labor and materials."
      },
      {
        "name": "B — General Residential Contractor",
        "description": "Builds and repairs all or any part of a residential structure; trade work must be subcontracted."
      },
      {
        "name": "B-3 — General Remodeling and Repair Contractor",
        "description": "Remodels and repairs existing residential structures (not electrical, plumbing, mechanical, pools or wells)."
      },
      {
        "name": "C — Specialty Commercial",
        "description": "Commercial specialty trades (for example electrical, plumbing, roofing) licensed per trade."
      },
      {
        "name": "R — Specialty Residential",
        "description": "Residential specialty trades licensed per trade."
      },
      {
        "name": "KA / KB / CR — Dual",
        "description": "Dual licenses covering both commercial and residential work in the same trade."
      }
    ],
    "fees": [
      {
        "item": "New license, General Commercial (A, B-1, B-2)",
        "amount": "$780 total ($200 application + $580 license)",
        "note": "Two-year license; no Recovery Fund assessment for commercial-only licenses.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "New license, Specialty Commercial (C)",
        "amount": "$580 total ($100 application + $480 license)",
        "note": "Two-year license.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "New license, General Residential (B, B-3, B-4, B-5, B-6, B-10)",
        "amount": "$870 total ($180 application + $320 license + $370 Recovery Fund assessment)",
        "note": "Two-year license; Recovery Fund assessment is mandatory for residential licenses.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "New license, Specialty Residential (R)",
        "amount": "$720 total ($80 application + $270 license + $370 Recovery Fund assessment)",
        "note": "Two-year license.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "New license, General Dual (KA, KB-1, KB-2)",
        "amount": "$1,050 total ($200 application + $480 license + $370 Recovery Fund assessment)",
        "note": "Two-year license.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "New license, Specialty Dual (CR)",
        "amount": "$850 total ($100 application + $380 license + $370 Recovery Fund assessment)",
        "note": "Two-year license.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "Renewal (2-year license)",
        "amount": "$580 General Commercial / $480 Specialty Commercial / $590 General Residential / $540 Specialty Residential / $750 General Dual / $650 Specialty Dual",
        "note": "Residential and dual renewals include a $270 Recovery Fund assessment (down from $370 at initial issue).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "Exam — AZ Statutes and Rules Training Course and Exam (SRE)",
        "amount": "$61",
        "note": "Paid directly to Gmetrix; every qualifying party must take it.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "Exam — trade-specific exam",
        "amount": "$66",
        "note": "Paid directly to PSI, online or at a testing center.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/licensing-fees"
      },
      {
        "item": "Late renewal fee",
        "amount": "$50",
        "note": "Charged for late renewal via the ROC portal.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://roc.az.gov/sites/default/files/2022-09/checklist_Renewing_a_License_20220909.pdf"
      }
    ],
    "renewal": {
      "cycle": "every 2 years (biennial; all license fees shown are for a two-year license)",
      "howTo": "Renew in the ROC Online Customer Portal: confirm the entity is active and in good standing with the Arizona Corporation Commission, confirm the bond is active and covers annual volume, confirm workers' comp details, then submit and pay. Renewal by mail or in person is also accepted.",
      "lateFee": "$50 for late renewal.",
      "sourceUrl": "https://roc.az.gov/sites/default/files/2022-09/checklist_Renewing_a_License_20220909.pdf"
    },
    "bondInsurance": {
      "bond": "Residential general: $9,000 (volume under $750,000) or $15,000 ($750,000 or more). Residential specialty: $4,250 (under $375,000) or $7,500 ($375,000 or more). Commercial: from $2,500 (Class C / specialty dual, volume $150,000 or less) to $100,000 (general commercial over $10M). Dual licences use the combined amount and can exceed $100,000. Residential contractors must also pay into the Recovery Fund or post a second $200,000 bond.",
      "insurance": "The ROC does not require general liability insurance to be licensed. Workers' compensation is required if you have employees; select the exemption in the portal if you have none.",
      "note": "Bond amounts are sized to the licensee's volume; dual licences use the combined amount.",
      "sourceUrl": "https://roc.az.gov/recovery-fund"
    },
    "requirements": {
      "exam": "Statutes and Rules Training Course and Exam (SRE) plus a trade-specific exam; qualifying party must pass each by at least 70%. SRE via Gmetrix, trade exam via PSI. A trade-exam waiver may be approved in eligible cases.",
      "experience": "Minimum years are set per classification in the ROC's classification-requirements table: A General Engineering 4 years; B-1 General Commercial 4 years; C-1 Acoustical Systems 2 years without the T test (0 years with it). The full per-class table has not yet been transcribed.",
      "other": "Background check through the ROC's vendor PeopleG2 for the qualifying party and every person listed on the application; government-issued ID for each person listed; all persons listed must be 18 or older; corporations and LLCs must be registered and in good standing with the Arizona Corporation Commission.",
      "sourceUrl": "https://roc.az.gov/license-classifications"
    },
    "complaintProcess": {
      "howTo": "File online in the ROC portal: register or log in, click the 'File a Complaint' button on the dashboard, complete the form and attach files. New-construction complaints must be filed within 2 years of close of escrow or actual occupancy, whichever came first; remodel/repair complaints within 2 years of the date work was last performed.",
      "whatHappens": "An ROC investigator is assigned within a couple of days and contacts you to review the case. The ROC can suspend or revoke the license. Homeowner-occupants can then claim from the Residential Contractors' Recovery Fund — but only after first filing a claim against the contractor's bond and getting a final determination, and only if the license was suspended or revoked because of your complaint.",
      "sourceUrl": "https://roc.az.gov/file-complaint"
    },
    "processingTime": "60 days for the ROC to review and act on a license application (R4-9-113). The agency returns the application fee if it exceeds the statutorily allowed timeframe; the licence fee is refunded only on a denied licence that took longer than 60 days.",
    "sources": [
      "https://roc.az.gov/licensing-fees",
      "https://roc.az.gov/license-classifications",
      "https://roc.az.gov/recovery-fund",
      "https://roc.az.gov/before-hire",
      "https://roc.az.gov/file-complaint",
      "https://roc.az.gov/faq",
      "https://roc.az.gov/sites/default/files/2022-09/checklist_Renewing_a_License_20220909.pdf",
      "https://roc.az.gov/contractor-search"
    ],
    "verifiedAt": "2026-11-25"
  },
  "IL": {
    "licenseTypes": [
      {
        "name": "Limited Roofing Contractor",
        "description": "Roofing work on residential properties of 8 units or fewer."
      },
      {
        "name": "Unlimited Roofing Contractor",
        "description": "Roofing work on residential, commercial and industrial properties of any size."
      }
    ],
    "fees": [
      {
        "item": "Application fee",
        "amount": "$125",
        "note": "Non-refundable; covers the application for either license type.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ilga.gov/commission/jcar/admincode/068/068014600000800R.html"
      },
      {
        "item": "Exam fee",
        "amount": "$248",
        "note": "Paid to Continental Testing Services per exam (Residential, Commercial/Industrial, or combined RCI). No refunds.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://continentaltesting.net/Profession/Index/60"
      },
      {
        "item": "Initial license fee",
        "amount": "$0",
        "note": "No separate initial license fee in the fee rule; the $125 application fee covers it.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ilga.gov/commission/jcar/admincode/068/068014600000800R.html"
      },
      {
        "item": "Renewal fee",
        "amount": "$125 per 2-year cycle ($62.50 per year)",
        "note": "Licenses expire December 31 of odd-numbered years.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ilga.gov/commission/jcar/admincode/068/068014600000800R.html"
      }
    ],
    "renewal": {
      "cycle": "Every 2 years",
      "howTo": "Renew online through IDFPR's online renewal system (link on the Roofing Contractor page).",
      "lateFee": "$50 restoration fee plus all lapsed renewal fees, max $375",
      "sourceUrl": "https://www.ilga.gov/commission/jcar/admincode/068/068014600000800R.html"
    },
    "bondInsurance": {
      "bond": "$10,000 continuous surety bond (Limited) or $25,000 (Unlimited)",
      "insurance": "Public liability $500,000 per occurrence (personal injury) and $250,000 per occurrence (property damage); workers' compensation for employees (or approval as a self-insurer)",
      "note": "The policy cannot be cancelled without 30 days' written notice to IDFPR.",
      "sourceUrl": "https://ilga.gov/ftp/JCAR/AdminCode/068/068014600000200R.html"
    },
    "requirements": {
      "exam": "Illinois Roofing Contractor Qualifying Party Examination via Continental Testing Services (Residential, Commercial/Industrial, or combined RCI)",
      "sourceUrl": "https://idfpr.illinois.gov/profs/roof.html"
    },
    "complaintProcess": {
      "howTo": "File online through IDFPR's complaint portal or mail a complaint to the Complaint Intake Unit, 555 West Monroe Street, 5th Floor, Chicago, IL 60661; email FPR.CIU@illinois.gov; phone 312-814-6910.",
      "whatHappens": "The Complaint Intake Unit reviews the complaint and assigns it to an investigator; the Division can pursue discipline through its Prosecutions Unit. The exact sanctions were not verified against the Act text I opened.",
      "sourceUrl": "http://idfpr.illinois.gov/admin/dpr/dprcomplaint.html"
    },
    "sources": [
      "https://idfpr.illinois.gov/CheckLicense.asp",
      "https://idfpr.illinois.gov/profs/roof.html",
      "https://www.ilga.gov/commission/jcar/admincode/068/068014600000800R.html",
      "https://ilga.gov/ftp/JCAR/AdminCode/068/068014600000200R.html",
      "https://continentaltesting.net/Profession/Index/60",
      "http://idfpr.illinois.gov/admin/dpr/dprcomplaint.html",
      "https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/renewals/apply/forms/rf.pdf"
    ],
    "verifiedAt": "2026-11-25"
  },
  "NC": {
    "licenseTypes": [
      {
        "name": "Building Contractor",
        "description": "Private, public, commercial, industrial and residential buildings of all types."
      },
      {
        "name": "Residential Contractor",
        "description": "Only residences that must conform to the North Carolina Residential Code."
      },
      {
        "name": "Highway Contractor",
        "description": "Highway construction work."
      },
      {
        "name": "Public Utilities Contractor",
        "description": "Water and sewer mains and lines, water/wastewater treatment, electrical power and communication distribution, and natural gas distribution, in subclassifications."
      },
      {
        "name": "Specialty Contractor",
        "description": "Construction work needing special skill and specialized trades or crafts, such as grading, concrete, masonry, roofing or marine work."
      }
    ],
    "fees": [
      {
        "item": "Application fee",
        "amount": "$75 (Limited) / $100 (Intermediate) / $125 (Unlimited)",
        "note": "Non-refundable; caps set by G.S. 87-10(a1).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
      },
      {
        "item": "Exam fee",
        "amount": "$79 per exam",
        "note": "Paid to PSI per exam (trade exam and Business and Law exam are charged separately). Non-refundable.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://test-takers.psiexams.com/nccon"
      },
      {
        "item": "Initial license fee",
        "amount": "$0",
        "note": "No separate initial license fee; the application fee is the license fee under G.S. 87-10(a1).",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
      },
      {
        "item": "Renewal fee",
        "amount": "$75 (Limited) / $100 (Intermediate) / $125 (Unlimited) per year",
        "note": "Same as the application fee; 8 hours of continuing education also required each year.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
      }
    ],
    "renewal": {
      "cycle": "Every year — expires January 1; invalid 60 days after if not renewed",
      "howTo": "Renew online through the Board's portal before January 1, with proof of continued financial responsibility and 8 hours of continuing education (2 mandatory + 6 elective, done by November 30, with a 90-day grace period).",
      "lateFee": "$10 for each month or part of a month after January",
      "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
    },
    "bondInsurance": {
      "bond": "No bond is required to hold the license. Financial responsibility instead — Limited: $17,000 working capital or $80,000 net worth or a $175,000 surety bond; Intermediate: $75,000 working capital (agreed-upon procedures report or audit) or a $500,000 bond; Unlimited: $150,000 working capital (agreed-upon procedures report or audit) or a $1,000,000 bond.",
      "insurance": "No liability insurance is required to hold the license. Workers' compensation is required by North Carolina law if you have employees.",
      "note": "Intermediate and Unlimited working capital must be shown by an agreed-upon procedures report or audited financial statement. The Limited $17,000 working capital / $80,000 net worth figures rest on the Cornell LII reproduction of 21 NCAC 12A .0204, not a Board page.",
      "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
    },
    "requirements": {
      "exam": "Applicants pass an examination based on the desired classification of licence; the NC state Building/Residential exams already include business-and-law content. The standalone NC Business & Law exam is only for the NASCLA path, reciprocity/waiver, and military applicants. Exams via PSI (computer-based, open book, 70% to pass); the NASCLA Accredited Examination is accepted for the Building classification.",
      "experience": "G.S. 87-10 sets no minimum years of experience; the qualifier's competence is shown by passing the exam.",
      "education": "No education requirement is set in the statute (G.S. 87-10).",
      "other": "Age 18 or older; good moral character; consent to a criminal background check if the Board requires one (G.S. 87-10(a)).",
      "sourceUrl": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html"
    },
    "recordShows": [
      "Company name and license number",
      "Qualifier name and qualifier number",
      "Classification and limitation (Limited up to $750,000, Intermediate up to $1,500,000, Unlimited)",
      "License status"
    ],
    "complaintProcess": {
      "howTo": "Request a complaint form at nclbgc.org/complaints or call the Board at 919-571-4183. Complaints can also cover unlicensed contractors on projects of $40,000 or more.",
      "whatHappens": "The Board investigates the complaint; sanctions can include suspension or revocation of the license. North Carolina's Homeowners Recovery Fund is a last resort for homeowners harmed by a dishonest or incompetent general contractor.",
      "sourceUrl": "https://www.nclbgc.org/complaints"
    },
    "processingTime": "About 30 days from application with a completed exam (initial processing about 2 weeks), per the Board FAQ.",
    "sources": [
      "https://portal.nclbgc.org/Public/Search",
      "https://www.nclbgc.org/",
      "https://www.nclbgc.org/complaints",
      "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_87/Article_1.html",
      "https://test-takers.psiexams.com/nccon",
      "https://dev-nclbgc.pantheonsite.io/faq-consumers/"
    ],
    "verifiedAt": "2026-11-25"
  },
  "GA": {
    "licenseTypes": [
      {
        "name": "Residential-Basic Contractor",
        "description": "Detached one- and two-family homes and one-family townhouses up to three stories, plus accessory buildings."
      },
      {
        "name": "Residential-Light Commercial Contractor",
        "description": "Everything Residential-Basic covers, plus multifamily and light-commercial buildings under four stories and under 25,000 sq ft (pre-engineered steel up to 50,000 sq ft)."
      },
      {
        "name": "General Contractor",
        "description": "No limit on the type of work — private, commercial, institutional, industrial and public buildings — subject to the financial tier."
      },
      {
        "name": "General Contractor Limited Tier",
        "description": "Same scope as General Contractor, but each contract is capped at $1,000,000, including change orders."
      }
    ],
    "fees": [
      {
        "item": "Application fee",
        "amount": "$210",
        "note": "Application fee $200 plus $10 processing fee, per the Board's Application for License by Examination (General Contractor); non-refundable and non-transferable.",
        "asOf": "2026-11-24",
        "sourceUrl": "https://sos.ga.gov:8443/sites/default/files/forms/49%20App%20-%20Commercial%20GC_EXAM_Unlimited%20Individual%20or%20Unlimitied%20Qualifying%20Agent.pdf"
      }
    ],
    "renewal": {
      "cycle": "Every 2 years (biennial) — due June 30 of even-numbered years",
      "howTo": "Renew online via the GOALS portal before June 30 of the even-numbered year. Residential-Basic needs 3 continuing-education hours per year and Residential-Light Commercial 6 hours per year; General Contractor licenses need no continuing education.",
      "lateFee": "A penalty fee applies to renewals after June 30 through December 31; failure to renew by December 31 has the same effect as revocation (Rule 553-12-.05).",
      "sourceUrl": "https://rules.sos.ga.gov/gac/553-12"
    },
    "bondInsurance": {
      "bond": "No surety bond is required for the license itself. Financial responsibility instead: General Contractor $150,000 minimum net worth; Limited Tier $25,000; residential tiers $25,000 (a $25,000 surety bond, line of credit, or letter of credit is an accepted way to show it).",
      "insurance": "General liability $500,000 per occurrence (General Contractor, Limited Tier, Residential-Light Commercial); $300,000 per occurrence (Residential-Basic); workers' compensation as required by Georgia law.",
      "note": "The $25,000 bond is an alternative proof of financial responsibility, not a license bond.",
      "sourceUrl": "https://sos.ga.gov/state-licensing-board-residential-and-commercial-general-contractors"
    },
    "requirements": {
      "exam": "Georgia Business and Law exam plus the trade exam, via PSI; the General Contractor trade exam is the NASCLA Accredited Examination",
      "experience": "General Contractor: 4 years of construction experience (at least 2 as/for a general contractor, 1 in administration, estimating, supervision or project management), or a related bachelor's degree plus 1 year, or college coursework plus experience totaling 4 years. Residential-Basic: at least 2 years of proven experience working as or in the employment of a residential contractor AND significant responsibility for the successful performance and completion of at least 2 projects falling within the residential-basic category in the 2 years immediately preceding application.",
      "education": "A related bachelor's degree (engineering, architecture, construction management) can substitute for part of the experience (see experience paths); no standalone education requirement.",
      "other": "Minimum age 21; applicants must disclose arrests, charges and convictions, and the Board may run a criminal background check. A company applies through a qualifying agent.",
      "sourceUrl": "https://sos.ga.gov/state-licensing-board-residential-and-commercial-general-contractors"
    },
    "recordShows": [
      "Licensee name and profession",
      "License type and license number",
      "License status",
      "Issue and expiration dates"
    ],
    "complaintProcess": {
      "howTo": "File a complaint through the Secretary of State's verification portal (verify.sos.ga.gov — 'search and submit a complaint against a person') or the Board's 'File a Complaint' link on the SOS board page.",
      "whatHappens": "The Board investigates and can discipline a licensee (grounds in Rule 553-9, Disciplinary Action). A license not renewed by December 31 has the same effect as revocation.",
      "sourceUrl": "https://verify.sos.ga.gov/verification/Search.aspx"
    },
    "processingTime": "About 20 business days from receipt of a complete application; the 20-day count restarts if a deficiency letter is issued.",
    "sources": [
      "https://verify.sos.ga.gov/verification/Search.aspx",
      "https://sos.ga.gov/state-licensing-board-residential-and-commercial-general-contractors",
      "https://sos.ga.gov/how-to-guide/how-guide-general-contractors",
      "https://rules.sos.ga.gov/gac/553-12",
      "https://rules.sos.ga.gov/GAC/553-12-.05",
      "https://rules.sos.ga.gov/gac/553-6-.01"
    ],
    "verifiedAt": "2026-11-25"
  },
  "OH": {
    "licenseTypes": [
      {
        "name": "Electrical Contractor",
        "description": "Commercial electrical contracting; licensed by OCILB's electrical section."
      },
      {
        "name": "Plumbing Contractor",
        "description": "Commercial plumbing contracting; licensed by OCILB's plumbing and hydronics section."
      },
      {
        "name": "Hydronics Contractor",
        "description": "Commercial hydronic heating and piping systems."
      },
      {
        "name": "HVAC Contractor",
        "description": "Commercial heating, ventilating and air conditioning contracting."
      },
      {
        "name": "Refrigeration Contractor",
        "description": "Commercial refrigeration contracting."
      }
    ],
    "fees": [
      {
        "item": "Application for examination",
        "amount": "$25",
        "note": "Non-refundable, payable to the OCILB administrative section.",
        "asOf": "2026-11-24",
        "sourceUrl": "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09"
      },
      {
        "item": "License issuance",
        "amount": "$25",
        "note": "For issuance of any OCILB license.",
        "asOf": "2026-11-24",
        "sourceUrl": "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09"
      },
      {
        "item": "Annual renewal",
        "amount": "$60 per license",
        "note": "Triennial renewal is $180 per license.",
        "asOf": "2026-11-24",
        "sourceUrl": "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09"
      },
      {
        "item": "Late fee",
        "amount": "Up to $120 per license",
        "note": "Assessed when a license is not timely renewed. A late filing fee of up to double the usual renewal fee can also apply if renewal is waived within one year after expiry.",
        "asOf": "2026-11-24",
        "sourceUrl": "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09"
      }
    ],
    "renewal": {
      "cycle": "every year — all licenses a contractor holds expire annually on the same date (the expiration date of the original license)",
      "howTo": "Renew through eLicense Ohio by submitting a renewal application to the appropriate specialty section no more than 90 calendar days before expiration, with the renewal fee and proof of continuing education. A triennial renewal option also exists ($180 per licence); which licensees qualify for it was not settled from the pages opened.",
      "lateFee": "Up to $120 per license; a waived late renewal within one year of expiry can carry a late filing fee of up to double the usual renewal fee.",
      "sourceUrl": "https://codes.ohio.gov/ohio-revised-code/section-4740.06"
    },
    "bondInsurance": {
      "bond": "The official OCILB fee and insurance rule lists a liability insurance requirement and no surety bond.",
      "insurance": "Contractor's liability insurance of at least $500,000, including completed operations coverage, in the licensee's name (required of all licensees except those on inactive status).",
      "note": "No bond amount is set by OCILB in OAC 4101:16-2-09; do not assume a bond is or is not required beyond the $500,000 liability insurance.",
      "sourceUrl": "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09"
    },
    "requirements": {
      "exam": "Trade examination for the licensed trade, administered by a vendor the board contracts with; a failed exam can be retaken after 60 days, and after 5 failures the applicant must reapply.",
      "experience": "5 years as a tradesperson in the trade immediately before applying; or a currently registered Ohio engineer with 3 years of business experience in the construction industry in that trade; or other experience the specialty section accepts.",
      "other": "Must be 18 or older and a US citizen or legal resident; must hold the $500,000 liability insurance in one contracting company name; must not have obtained a license by fraud or engaged in fraud in business. Out-of-state licensees and veterans have separate qualification paths.",
      "sourceUrl": "https://codes.ohio.gov/ohio-revised-code/section-4740.06"
    },
    "recordShows": [
      "Name and mailing/public address",
      "Credential number",
      "License type",
      "Issue date and expiration date",
      "License status",
      "Company",
      "Continuing-education requirements completed flag",
      "Estimated amount due"
    ],
    "complaintProcess": {
      "howTo": "OCILB investigates signed, written complaints only. Mail the Contractor Complaint Form (DIC 3527) with contracts and documents to Ohio Construction Industry Licensing Board, 6606 Tussing Road, Reynoldsburg, OH 43068, or fax it to 614-728-1200; the official complaints page also lists email carol.ross@com.state.oh.us. Workmanship and code complaints go to your local building department or the Ohio Attorney General Consumer Protection Section at 1-800-282-0515.",
      "whatHappens": "The specialty section investigates; if a violation is found it can fine up to $1,000 per violation per day and refer the case to the local prosecutor for criminal prosecution. There is no recovery fund.",
      "sourceUrl": "https://dam.assets.ohio.gov/image/upload/com.ohio.gov/documents/dico_ContractorComplaintForm.pdf"
    },
    "processingTime": "The board must authorise licensure within 90 days after the application was filed once the applicant qualifies and passes the exam. The 30-day examination-application approval duty applies only to out-of-state and uniformed-services applicants (ORC 4740.06(E)), not to standard applications. Renewal licences are processed and mailed within 2 business days of receipt of the renewal notice.",
    "sources": [
      "http://codes.ohio.gov/ohio-administrative-code/rule-4101:16-2-09",
      "https://codes.ohio.gov/ohio-revised-code/section-4740.06",
      "https://codes.ohio.gov/ohio-revised-code/section-4740.04",
      "https://codes.ohio.gov/ohio-revised-code/section-4740.16",
      "https://dam.assets.ohio.gov/image/upload/com.ohio.gov/documents/dico_ContractorComplaintForm.pdf",
      "https://elicense.ohio.gov/oh_verifylicense"
    ],
    "verifiedAt": "2026-11-25"
  }
};
