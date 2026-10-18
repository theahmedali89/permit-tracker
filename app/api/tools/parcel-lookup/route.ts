import { NextRequest, NextResponse } from "next/server";
import { findAssessor, assessorSearchUrl } from "@/lib/county-assessors";

const CENSUS_GEOCODE =
  "https://geocoding.geo.census.gov/geocoder/geographies/address";

interface CensusMatch {
  addressComponents?: {
    city?: string;
    state?: string;
    zip?: string;
  };
  geographies?: {
    Counties?: Array<{ NAME?: string; STATE?: string }>;
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const street = searchParams.get("street")?.trim();
  const city = searchParams.get("city")?.trim();
  const state = searchParams.get("state")?.trim();
  const zip = searchParams.get("zip")?.trim();

  if (!street || !zip) {
    return NextResponse.json(
      { error: "Street address and ZIP code are required." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({
    street,
    benchmark: "Public_AR_Current",
    vintage: "Current_Current",
    format: "json",
  });
  if (city) params.set("city", city);
  if (state) params.set("state", state);
  params.set("zip", zip);

  let data: { result?: { addressMatches?: CensusMatch[] } };
  try {
    const res = await fetch(`${CENSUS_GEOCODE}?${params.toString()}`, {
      headers: { "User-Agent": "PermitWarden/1.0 (parcel lookup tool)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Address lookup service is temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }
    data = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Address lookup service is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  const match = data?.result?.addressMatches?.[0];
  const counties = match?.geographies?.Counties ?? [];
  if (!match || counties.length === 0) {
    return NextResponse.json(
      {
        error:
          "We couldn't find that address. Double-check the street, city, and ZIP — or try the address exactly as it appears on official mail.",
      },
      { status: 404 }
    );
  }

  const countyName = counties[0].NAME ?? "";
  const stateAbbr = match.addressComponents?.state ?? state?.toUpperCase() ?? "";
  const assessor = countyName && stateAbbr ? findAssessor(countyName, stateAbbr) : null;

  return NextResponse.json({
    county: countyName,
    state: stateAbbr,
    matchedAddress: {
      city: match.addressComponents?.city ?? city ?? "",
      zip: match.addressComponents?.zip ?? zip,
    },
    assessor: assessor
      ? { office: assessor.office, url: assessor.url, curated: true }
      : {
          office: `${countyName} County Assessor`,
          url: assessorSearchUrl(countyName, stateAbbr),
          curated: false,
        },
  });
}
