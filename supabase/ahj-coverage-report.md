# AHJ Directory Coverage Report

Research completed 2026-10-16. Every portal_url in the migration was verified against an official government source (city/county .gov page, official permitting subdomain, or official agency document). Jurisdictions that could not be verified were skipped — nothing was invented.

**Total new entries: 186** across **50 states**. (Texas and Florida seed rows — Austin, Houston, Dallas, Miami, Orlando, Tampa — are already in the seed and were excluded from re-verification; new TX/FL cities are included below.)

## Entries per state

| State | Entries |
|---|---|
| AK | 3 |
| AL | 4 |
| AR | 4 |
| AZ | 4 |
| CA | 6 |
| CO | 4 |
| CT | 5 |
| DE | 3 |
| FL | 1 |
| GA | 5 |
| HI | 4 |
| IA | 3 |
| ID | 3 |
| IL | 4 |
| IN | 3 |
| KS | 3 |
| KY | 3 |
| LA | 3 |
| MA | 3 |
| MD | 3 |
| ME | 3 |
| MI | 5 |
| MN | 4 |
| MO | 5 |
| MS | 4 |
| MT | 3 |
| NC | 5 |
| ND | 4 |
| NE | 2 |
| NH | 2 |
| NJ | 2 |
| NM | 3 |
| NV | 3 |
| NY | 5 |
| OH | 5 |
| OK | 5 |
| OR | 5 |
| PA | 5 |
| RI | 4 |
| SC | 5 |
| SD | 4 |
| TN | 5 |
| TX | 2 |
| UT | 4 |
| VA | 5 |
| VT | 3 |
| WA | 5 |
| WI | 3 |
| WV | 2 |
| WY | 3 |

## Coverage by state

**Fully covered** (3–5 top jurisdictions verified, none skipped): AK, AL, AR, AZ, CA, CO, CT, DE, FL, GA, HI, IA, ID, IL, IN, KS, KY, LA, MA, MD, ME, MI, MO, NC, ND, NY, OH, OK, OR, PA, SC, SD, TN, TX, UT, VA, WA, WY

**Partially covered** (some jurisdictions verified, some skipped — see skipped list): VT, WV, WI, RI, MN, MS, NJ, NM, MT, NE, NV, NH

**Fully skipped**: none.

## Skipped jurisdictions (portal URL not verifiable)

| State | Jurisdiction | Reason |
|---|---|---|
| VT | Colchester | official 'Apply for Permit Online' page returned HTTP 429; URL unverified |
| VT | Essex (Town) | new online portal announced Sept 2026 but exact URL not found |
| WV | Huntington | no verifiable online portal; email/PDF-based only |
| WV | Morgantown | no verifiable online portal; in-person/email only |
| WI | Green Bay | could not verify official portal URL after reasonable searching |
| RI | Warwick | could not verify official permit portal URL after multiple searches |
| MN | Bloomington | permits.bloomingtonmn.gov returns default IIS page; no working portal verified |
| MS | Hattiesburg | no official permits/portal page found, only PDFs |
| MT | Billings | rate limit 429 during verification; candidate not confirmed |
| MT | Bozeman | rate limit 429 during verification |
| MT | Great Falls | rate limit 429 during verification |
| MT | Helena | rate limit 429; verification incomplete |
| MT | Missoula | rate limit 429; verification incomplete |
| NE | Bellevue | candidate found via search; verification incomplete (rate limit) |
| NE | Grand Island | candidates found via search; verification incomplete (rate limit) |
| NE | Kearney | candidate found via search; verification incomplete (rate limit) |
| NE | Lincoln | candidate found via search; verification incomplete (rate limit) |
| NE | Omaha | candidate found via search; verification incomplete (rate limit) |
| NV | Henderson | candidate found via search; verification incomplete (rate limit) |
| NV | Las Vegas | candidate found via search; verification incomplete (rate limit) |
| NV | North Las Vegas | candidate found via search; verification incomplete (rate limit) |
| NV | Reno | candidate found via search; verification incomplete (rate limit) |
| NV | Sparks | no dedicated page verified; only regional ONE portal (onenv.us) references; rate limit |
| NH | Concord | candidate found via search; verification incomplete (rate limit) |
| NH | Derry | candidate found; verification incomplete (rate limit) |
| NH | Dover | candidate found; verification incomplete (rate limit) |
| NH | Manchester | candidate found via search; verification incomplete (rate limit) |
| NH | Nashua | candidate found via search; verification incomplete (rate limit) |
| NJ | Edison | no official building-permits page found; only engineering/zoning docs |
| NJ | Elizabeth | no official permits page found; only planning docs/PDFs |
| NJ | Jersey City | candidate found via search; verification incomplete (rate limit) |
| NJ | Newark | candidate found via search; verification incomplete (rate limit) |
| NJ | Paterson | candidate found via search; verification incomplete (rate limit) |
| NM | Albuquerque | candidate found via search; verification incomplete (rate limit) |
| NM | Las Cruces | candidate found via search; verification incomplete (rate limit) |
| NM | Rio Rancho | candidate found via search; verification incomplete (rate limit) |
| NM | Roswell | candidate found via search; verification incomplete (rate limit) |
| NM | Santa Fe | candidate found via search; verification incomplete (rate limit) |

## Verification method notes

- Most URLs were verified by opening them directly in the browser.
- A subset was verified via official-site search results only (403 bot protection blocked direct fetch): Chicago IL, Louisville KY, Seattle WA, Madison WI, Providence RI, Fayetteville AR, San Diego CA, Sacramento CA, Savannah GA, Macon GA, Kahului HI, Chandler AZ.
- Retry pass (rate-limited states MT/NE/NV/NH/NJ/NM) verified via official government sources found in web search: 15 jurisdictions recovered.
- VA independent cities (Virginia Beach, Norfolk, Chesapeake, Richmond) have no county — stored as NULL.
- County-level entries (Kenosha County WI; Baltimore City, Montgomery, Prince George's MD) have no city — stored as NULL.
- URLs normalized to lowercase scheme+host; path case preserved.
