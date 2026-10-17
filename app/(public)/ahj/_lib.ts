/**
 * Shared helpers for the public AHJ directory (programmatic SEO).
 * State codes -> full names -> URL slugs.
 */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export function stateSlug(code: string): string {
  return (STATE_NAMES[code] || code).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function stateCodeFromSlug(slug: string): string | null {
  for (const [code, name] of Object.entries(STATE_NAMES)) {
    if (stateSlug(code) === slug) return code;
  }
  return null;
}

export function citySlug(city: string | null): string {
  return (city || "county").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export interface AhjEntry {
  id: string;
  city: string | null;
  county: string | null;
  state: string;
  authority_name: string;
  portal_url: string | null;
  phone: string | null;
  notes: string | null;
  verified_at: string | null;
}
