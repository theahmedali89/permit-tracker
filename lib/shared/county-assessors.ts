/**
 * Curated list of the ~50 most populous US counties and their official
 * county assessor / property appraiser parcel-search homepages.
 * Used by the free APN & Parcel Number Lookup tool as a direct deep link.
 * Counties not on this list fall back to a Google search link.
 */
export interface CountyAssessor {
  county: string; // e.g. "Los Angeles"
  state: string; // 2-letter, e.g. "CA"
  office: string; // display name of the office
  url: string; // official parcel search / assessor homepage
}

export const COUNTY_ASSESSORS: CountyAssessor[] = [
  { county: "Los Angeles", state: "CA", office: "LA County Assessor", url: "https://assessor.lacounty.gov" },
  { county: "Cook", state: "IL", office: "Cook County Assessor", url: "https://www.cookcountyassessor.com" },
  { county: "Harris", state: "TX", office: "Harris County Appraisal District", url: "https://hcad.org" },
  { county: "Maricopa", state: "AZ", office: "Maricopa County Assessor", url: "https://assessor.maricopa.gov" },
  { county: "San Diego", state: "CA", office: "SD County Assessor/Recorder", url: "https://arcc.sdcounty.ca.gov" },
  { county: "Orange", state: "CA", office: "OC Assessor", url: "https://ocassessor.org" },
  { county: "Miami-Dade", state: "FL", office: "Miami-Dade Property Appraiser", url: "https://www.miamidade.gov/pa" },
  { county: "Dallas", state: "TX", office: "Dallas Central Appraisal District", url: "https://www.dallascad.org" },
  { county: "Riverside", state: "CA", office: "Riverside County Assessor", url: "https://www.asrclkrec.com" },
  { county: "San Bernardino", state: "CA", office: "SB County Assessor", url: "https://arc.sbcounty.gov" },
  { county: "King", state: "WA", office: "King County Assessor", url: "https://kingcounty.gov/assessor" },
  { county: "Clark", state: "NV", office: "Clark County Assessor", url: "https://www.clarkcountynv.gov/assessor" },
  { county: "Tarrant", state: "TX", office: "Tarrant Appraisal District", url: "https://www.tad.org" },
  { county: "Santa Clara", state: "CA", office: "Santa Clara County Assessor", url: "https://www.sccassessor.org" },
  { county: "Bexar", state: "TX", office: "Bexar Appraisal District", url: "https://www.bcad.org" },
  { county: "Wayne", state: "MI", office: "Wayne County Assessment", url: "https://www.waynecounty.com/departments/assessment-and-equalization.aspx" },
  { county: "Philadelphia", state: "PA", office: "Philadelphia OPA", url: "https://www.phila.gov/opa" },
  { county: "Alameda", state: "CA", office: "Alameda County Assessor", url: "https://www.acgov.org/assessor" },
  { county: "Broward", state: "FL", office: "Broward County Property Appraiser", url: "https://bcpa.net" },
  { county: "Sacramento", state: "CA", office: "Sacramento County Assessor", url: "https://assessor.saccounty.gov" },
  { county: "Palm Beach", state: "FL", office: "Palm Beach County Property Appraiser", url: "https://www.pbcpao.gov" },
  { county: "Nassau", state: "NY", office: "Nassau County Assessor", url: "https://www.nassaucountyny.gov/3408/Assessment" },
  { county: "Travis", state: "TX", office: "Travis Central Appraisal District", url: "https://traviscad.org" },
  { county: "Hillsborough", state: "FL", office: "Hillsborough County Property Appraiser", url: "https://gis.hcpafl.org" },
  { county: "Orange", state: "FL", office: "Orange County Property Appraiser", url: "https://www.ocpafl.org" },
  { county: "Franklin", state: "OH", office: "Franklin County Auditor", url: "https://franklincountyauditor.com" },
  { county: "Hennepin", state: "MN", office: "Hennepin County Assessor", url: "https://www.hennepin.us/your-government/departments/assessor" },
  { county: "Salt Lake", state: "UT", office: "Salt Lake County Assessor", url: "https://slco.org/assessor" },
  { county: "Fulton", state: "GA", office: "Fulton County Assessor", url: "https://fultonassessor.org" },
  { county: "Cuyahoga", state: "OH", office: "Cuyahoga County Fiscal Officer", url: "https://fiscalofficer.cuyahogacounty.gov" },
  { county: "Allegheny", state: "PA", office: "Allegheny County Property Assessment", url: "https://www.alleghenycounty.us/property" },
  { county: "Fairfax", state: "VA", office: "Fairfax County Tax Administration", url: "https://www.fairfaxcounty.gov/taxes" },
  { county: "Denver", state: "CO", office: "Denver Assessor", url: "https://www.denvergov.org/assessor" },
  { county: "Honolulu", state: "HI", office: "Honolulu Real Property Assessment", url: "https://www.honolulupropertytax.com" },
  { county: "Wake", state: "NC", office: "Wake County Tax Administration", url: "https://www.wake.gov/departments-government/tax-administration" },
  { county: "Mecklenburg", state: "NC", office: "Mecklenburg County Assessor", url: "https://www.mecknc.gov/Tax" },
  { county: "Collin", state: "TX", office: "Collin Central Appraisal District", url: "https://www.collincad.org" },
  { county: "Denton", state: "TX", office: "Denton Central Appraisal District", url: "https://www.dentoncad.com" },
  { county: "Pima", state: "AZ", office: "Pima County Assessor", url: "https://www.asr.pima.gov" },
  { county: "Multnomah", state: "OR", office: "Multnomah County Assessment & Taxation", url: "https://multco.us/info/finance-assessment-taxation" },
  { county: "Shelby", state: "TN", office: "Shelby County Assessor", url: "https://www.assessor.shelbycountytn.gov" },
  { county: "Erie", state: "NY", office: "Erie County Real Property", url: "https://www3.erie.gov/ecrpa" },
  { county: "Kings", state: "NY", office: "NYC Dept. of Finance", url: "https://www.nyc.gov/finance" },
  { county: "Queens", state: "NY", office: "NYC Dept. of Finance", url: "https://www.nyc.gov/finance" },
  { county: "New York", state: "NY", office: "NYC Dept. of Finance", url: "https://www.nyc.gov/finance" },
  { county: "Bronx", state: "NY", office: "NYC Dept. of Finance", url: "https://www.nyc.gov/finance" },
  { county: "Suffolk", state: "NY", office: "Suffolk County Real Property Tax Service", url: "https://www.suffolkcountyny.gov" },
  { county: "Oakland", state: "MI", office: "Oakland County Equalization", url: "https://www.oakgov.com/equalization" },
  { county: "Marion", state: "IN", office: "Marion County Assessor", url: "https://www.indy.gov/activity/find-property-information" },
  { county: "Davidson", state: "TN", office: "Davidson County Assessor of Property", url: "https://www.padctn.org" },
];

/**
 * Find the assessor entry for a county+state. County name matching is
 * case-insensitive and tolerates " County"/" Parish"/" Borough" suffixes.
 */
export function findAssessor(countyName: string, stateAbbr: string): CountyAssessor | null {
  const norm = countyName
    .replace(/\s+(county|parish|borough|census area|municipality)$/i, "")
    .trim()
    .toLowerCase();
  const st = stateAbbr.trim().toUpperCase();
  return (
    COUNTY_ASSESSORS.find(
      (a) =>
        a.state === st &&
        a.county.toLowerCase() === norm
    ) ?? null
  );
}

/** Google fallback link when the county is not in our curated list. */
export function assessorSearchUrl(countyName: string, stateAbbr: string): string {
  const q = encodeURIComponent(
    `${countyName} ${stateAbbr} county assessor parcel search`
  );
  return `https://www.google.com/search?q=${q}`;
}
