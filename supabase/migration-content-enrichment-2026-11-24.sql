-- Migration: content enrichment (2026-11-24 audit-fix pass 2).
--
-- Applies the pass-2 content changes to a live database. The seed files
-- (supabase/seed-jurisdiction-regulations.sql, seed-blog-posts*.sql) were
-- corrected in the same change, but all seeds use ON CONFLICT DO NOTHING,
-- so re-running them does NOT update rows that already exist.
-- Idempotent: safe to re-run (each UPDATE is guarded so a second run
-- matches zero rows). No new tables, no schema change.
-- Full per-item evidence (source URLs + access date 2026-11-24) is in
-- CONTENT_ENRICHMENT_REPORT.md (pass 2 staging).
--
-- Run AFTER the pass-2 seed files have been applied at least once.

-- 1. Dallas: validity newly verified (was all-NULL). City of Dallas
--    Planning & Development Guide: permits expire after 2 years from
--    issuance, or after 120 days of no inspection activity — whichever
--    comes first; $200 extension fee for issued permits.
--    https://dallascityhall.com/departments/sustainabledevelopment/guide/Pages/default.aspx
UPDATE jurisdiction_regulations
SET validity_days = 730,
    validity_notes = 'Permits expire after 2 years from issuance, or after 120 days of no inspection activity — whichever comes first (City of Dallas Planning & Development Guide; verified November 24, 2026)',
    extension_allowed = true,
    extension_fee_usd = 200,
    extension_process = 'Request an Extension in DallasNow before the permit expires; $200 fee for issued permits, no fee for applications (City of Dallas Planning & Development Guide)',
    source_url = 'https://dallascityhall.com/departments/sustainabledevelopment/guide/Pages/default.aspx'
WHERE city = 'Dallas' AND state_code = 'TX' AND permit_type = 'building'
  AND validity_days IS NULL;

-- 2. Denver: 60-day voiding rule newly verified (was all-NULL). 2025 Denver
--    Building Code §131.7: a construction permit may be voided when work is
--    not commenced within 60 days of issuance, suspended/abandoned 60 days,
--    or no inspection requested for 60 days. No fixed maximum duration, so
--    validity_days stays NULL and only validity_notes + source_url are set.
--    https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf
UPDATE jurisdiction_regulations
SET validity_notes = 'No fixed maximum duration in the 2025 Denver Building Code §131. A construction permit may be voided when work is not commenced within 60 days of issuance, work is suspended or abandoned for 60 days, or no inspection has been requested for 60 days (§131.7). Before work recommences, new plans may be required and a new permit obtained (verified November 24, 2026)',
    source_url = 'https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf'
WHERE city = 'Denver' AND state_code = 'CO' AND permit_type = 'building'
  AND validity_notes IS NULL;

-- 3. Fort Worth: source URL upgraded http → https. The official host serves
--    the same council-packet PDF over HTTPS (verified 2026-11-24).
UPDATE jurisdiction_regulations
SET source_url = 'https://apps.fortworthtexas.gov/council_packet/render_file.asp?filename=Zoning_cases/3713/ZC-16-035.pdf'
WHERE city = 'Fort Worth' AND state_code = 'TX' AND permit_type = 'building'
  AND source_url LIKE '%http://apps.fortworthtexas.gov%';

-- 4. Philadelphia: source updated to the current July 2026 revision of the
--    L&I P_052 extension information sheet. The old URL's 20260107 stamp is
--    the Jan 7, 2026 upload date (it predates the Oct 2026 research — the
--    audit's 'postdates by ~3 months' was a misreading); the sheet's content
--    (6-month rule, 5-year max, extensions) is unchanged.
UPDATE jurisdiction_regulations
SET source_url = REPLACE(source_url,
  'https://www.phila.gov/media/20260107101229/P_052_INF_Building-permit-extension-info-sheet-rev-1.2026.pdf',
  'https://www.phila.gov/media/20260707130349/P_052_INF_Building-permit-extension-info-sheet-WebUI.pdf')
WHERE city = 'Philadelphia' AND state_code = 'PA' AND permit_type = 'building'
  AND source_url LIKE '%20260107101229%';

-- 5. Indianapolis: amendment citation corrected G.O. 38, 2025 → G.O. 40, 2025, §6
--    (per the current-code history in the Corpus Law full text of §536-213,
--    codified through Ord. No. 42, 2026). The 365-day figure is unchanged;
--    it is now corroborated by two independent mirrors of the current
--    Municode-published code (Zoneomics + Corpus Law). Direct
--    library.municode.com access was blocked (HTTP 403) on 2026-11-24 —
--    a direct Municode confirmation is still outstanding.
UPDATE jurisdiction_regulations
SET validity_notes = REPLACE(validity_notes,
  'as amended through G.O. 38, 2025', 'as amended through G.O. 40, 2025, §6')
WHERE city = 'Indianapolis' AND state_code = 'IN' AND permit_type = 'building'
  AND validity_notes LIKE '%G.O. 38, 2025%';

-- 6. Blog posts: append the cited “Sources” section (verified 2026-11-24)
--    to the 11 ENRICH posts. Guarded by content NOT LIKE '%## Sources%',
--    so re-running is a no-op. The validity-by-city post is NOT touched
--    here (it was corrected in pass 1).
-- 6. assessors-parcel-number-guide
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. Parcel numbers are assigned and published county by county — there is no national APN database. The sources below are official county assessor publications; the lookup tool links to the assessor for each county.

- [Los Angeles County Assessor, Property Search Portal](https://portal.assessor.lacounty.gov/) — search by address or Assessor’s Identification Number (AIN) to find a parcel’s APN, legal description and assessment record.
- [Los Angeles County Assessor](https://assessor.lacounty.gov/) — the office that assigns an APN (AIN) to every parcel in the county.
- [Cook County Assessor’s Office](https://www.cookcountyassessor.com/) — example of a county assessor’s parcel search. Parcel numbers are assigned and published county by county, and formats differ.
- [Permit Warden, APN & Parcel Number Lookup](/tools/parcel-lookup) — free tool linking to the official county assessor parcel search for the 50 most populous US counties.
$$,
    updated_at = NOW()
WHERE slug = 'assessors-parcel-number-guide'
  AND content NOT LIKE '%## Sources%';

-- 6. building-permit-renewal-guide
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The 180-day commencement rule below comes from the model building code; the city figures come from each city’s own publication. Extension rules vary by jurisdiction — always confirm with the AHJ that issued the permit.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [NYC Department of Buildings, Permit Renewal](https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page) — New York permits valid up to 2 years; renew online via DOB NOW:Build about 2 weeks before expiration; $130 renewal fee.
- [Los Angeles Municipal Code §98.0602 (American Legal Publishing)](https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414) — Los Angeles permits valid 2 years from issuance.
- [City of San Antonio, Permit Process](https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process) — permits expire within 180 days with no proof of work or progress; one or more 180-day extensions for a valid, justifiable reason.
- [City of Jacksonville, Building Inspection Division FAQs](https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs) — “HOW LONG ARE PERMITS GOOD FOR? 180 days.”
$$,
    updated_at = NOW()
WHERE slug = 'building-permit-renewal-guide'
  AND content NOT LIKE '%## Sources%';

-- 6. building-permit-validity-periods-explained
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The common 180-day rule comes from the model building code (and Florida’s adoption of it); the exceptions below are each city’s own code.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [Florida Building Code, 8th Edition (2023), Ch. 1, §105.5 (as reproduced in the City of Palm Bay local amendments, Florida Building Commission)](https://www.floridabuilding.org/Upload/FBC/CodeID_7672_679f_City%20of%20Palm%20Bay%20Local%20Amend%202020%20FBC-Bldg%20Ch%201%20annotated%202021-0910.pdf) — permits become invalid unless work commences within 180 days, or is suspended or abandoned for 180 days.
- [Los Angeles Municipal Code §98.0602 (American Legal Publishing)](https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414) — Los Angeles permits valid 2 years from issuance.
- [NYC Department of Buildings, Permit Renewal](https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page) — New York permits valid up to 2 years; renew online via DOB NOW:Build about 2 weeks before expiration; $130 renewal fee.
- [2025 Denver Building Code §131.7 (City and County of Denver, PDF)](https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf) — a Denver construction permit may be voided when work is not commenced within 60 days of issuance, suspended or abandoned for 60 days, or no inspection is requested for 60 days.
- [City of Dallas, Planning & Development Guide](https://dallascityhall.com/departments/sustainabledevelopment/guide/Pages/default.aspx) — Dallas permits expire after 2 years from issuance, or after 120 days of no inspection activity, whichever comes first; extensions $200 for issued permits.
- [Indianapolis Code of Ordinances §536-213, Expiration of building permits by operation of law; extensions (full text as published in the Municode code)](https://corpuslaw.us/city/IN-INDIANAPOLIS/ordinances/536-213-expiration-of-building-permits-by-operation) — 365 days to commence, 365 days of substantially no construction once started; good-cause written extension. Text corroborated 2026-11-24 against two independent mirrors of the current Municode-published code; direct library.municode.com access was blocked (HTTP 403) on 2026-11-24.
$$,
    updated_at = NOW()
WHERE slug = 'building-permit-validity-periods-explained'
  AND content NOT LIKE '%## Sources%';

-- 6. certificate-of-occupancy-guide
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The CO rules below come from the NYC Department of Buildings, which publishes the clearest official CO guidance; the penalty figure is the city’s published schedule. Note: the fee ranges quoted in this guide ($50–$500 for residential COs; $50–$200 re-inspection fees) are typical ranges, not verified figures from a single official source — check the current fee schedule with your AHJ.

- [NYC Department of Buildings, Obtain a Certificate of Occupancy](https://www.nyc.gov/site/buildings/industry/obtain-a-co.page) — a CO states the legal use and/or type of permitted occupancy; no one may legally occupy a building until the Department has issued a CO or Temporary Certificate of Occupancy; TCOs typically expire 90 days after issuance.
- [NYC Department of Buildings, Code Notes: Certificate of Occupancy & Temporary Certificate of Occupancy (PDF)](https://www.nyc.gov/assets/buildings/pdf/code_notes_cofo.pdf) — CO requirements under NYC Administrative Code §28-118; a final CO issues when the completed work substantially conforms to the approved plans.
- [NYC DOB/ECB Buildings Penalty Schedule (PDF)](https://www.nyc.gov/html/ecb/downloads/pdf/BuildingsPenaltySchedule.pdf) — building violations $800–$4,000 per violation (Class 2).
$$,
    updated_at = NOW()
WHERE slug = 'certificate-of-occupancy-guide'
  AND content NOT LIKE '%## Sources%';

-- 6. how-to-extend-expired-building-permit
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. Extension rules start from the model code and are then set city by city — the sources below are the official publication for each city named in this guide.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [Florida Building Code, 8th Edition (2023), Ch. 1, §105.5 (as reproduced in the City of Palm Bay local amendments, Florida Building Commission)](https://www.floridabuilding.org/Upload/FBC/CodeID_7672_679f_City%20of%20Palm%20Bay%20Local%20Amend%202020%20FBC-Bldg%20Ch%201%20annotated%202021-0910.pdf) — permits become invalid unless work commences within 180 days, or is suspended or abandoned for 180 days.
- [NYC Department of Buildings, Permit Renewal](https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page) — New York permits valid up to 2 years; renew online via DOB NOW:Build about 2 weeks before expiration; $130 renewal fee.
- [Los Angeles Department of Building and Safety, Permit extensions](https://dbs.lacity.gov/node/4081) — file within 30 days of expiration via Form 41a/42; each extension 6 months within the 2-year limit.
- [City of San Antonio, Permit Process](https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process) — permits expire within 180 days with no proof of work or progress; one or more 180-day extensions for a valid, justifiable reason.
- [City of Jacksonville, Building Inspection Division FAQs](https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs) — “HOW LONG ARE PERMITS GOOD FOR? 180 days.”
- [City of Indianapolis, Request for Permit Amendment/Update, Extension, Renewal or Cancellation (official form)](https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja) — the City’s extension form.
$$,
    updated_at = NOW()
WHERE slug = 'how-to-extend-expired-building-permit'
  AND content NOT LIKE '%## Sources%';

-- 6. how-to-reinstate-expired-building-permit
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. Every city figure in the table in this guide comes from that city’s own official publication, listed below. Fees and processes change — confirm with the AHJ before filing.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [NYC Department of Buildings, Permit Renewal](https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page) — New York permits valid up to 2 years; renew online via DOB NOW:Build about 2 weeks before expiration; $130 renewal fee.
- [City of Chicago, Building Code Modernization Q&A (PDF)](https://www.chicago.gov/content/dam/city/depts/bldgs/general/CodeModernization/07242020codeQandA.pdf) — Chicago permit validity and extension rules.
- [City of San Diego, Information Bulletin 117](https://www.sandiego.gov/development-services/forms-publications/information-bulletin/117) — one-year utilization period; Form DS-117 filed at least 1 month before the end of the period; up to 180 days plus one additional extension.
- [City of Austin, Apply for a Standalone Permit](https://www.austintexas.gov/development-services/apply-standalone-permit) — Austin permit application and extension process.
- [City of Fort Worth, Council Packet ZC-16-035 (PDF)](https://apps.fortworthtexas.gov/council_packet/render_file.asp?filename=Zoning_cases/3713/ZC-16-035.pdf) — building permits expire 180 days from issuance unless work has begun or an extension is requested (City building code Sec. 105.5); a permit shall not extend more than once when no work has proceeded.
- [City of Houston, Permitting Center (PDF)](https://www.houstonpermittingcenter.org/media/9056/download) — Houston permit validity and extension rules.
- [City of San José, Building Permit document](https://www.sanjoseca.gov/home/showpublisheddocument/25887/636965525550970000) — permits expire 12 months from issuance or 180 days from last inspection approval; first extension adds 180 days.
- [City of San Antonio, Permit Process](https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process) — permits expire within 180 days with no proof of work or progress; one or more 180-day extensions for a valid, justifiable reason.
- [City of Indianapolis, Request for Permit Amendment/Update, Extension, Renewal or Cancellation (official form)](https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja) — the City’s extension form.
$$,
    updated_at = NOW()
WHERE slug = 'how-to-reinstate-expired-building-permit'
  AND content NOT LIKE '%## Sources%';

-- 6. permit-types-explained
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The permit-type definitions below come from official city planning publications. Note: the fee and timeline ranges in this guide ($50–$500 for right-of-way permits; $500–$5,000+ for variances; 6–18 months and $10,000–$100,000+ for rezonings) are typical ranges, not verified figures — confirm the current fee schedule and timeline with the planning department.

- [City of Fayetteville, NC, Rezoning, Conditional Zoning & Special Use Permits](https://www.fayettevillenc.gov/City-Departments/Development-Services/Planning-Zoning/Rezoning-Conditional-Zoning-Special-Use-Permits) — rezoning changes a property’s zoning classification; a Special Use Permit allows a use not automatically permitted in a district, under defined conditions.
- [City of Cibolo, TX, Common Application Types](https://www.cibolotx.gov/business/planning/development_process/common_application_types/index.php) — Conditional Use Permit, Zoning Map Amendment (Rezoning) and Zoning Variance defined.
- [City of San Diego, Information Bulletin: How to Obtain a Permit for Encroachments in the Right-of-Way](https://www.sandiego.gov/development-services/forms-publications/information-bulletins/576) — a Public Right-of-Way Permit is required for any work, construction or use within a public street, alley or easement (SDMC §129.0703).
- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
$$,
    updated_at = NOW()
WHERE slug = 'permit-types-explained'
  AND content NOT LIKE '%## Sources%';

-- 6. what-happens-when-building-permit-expires
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The 180-day rule and the penalty figures below are each sourced from the official publication named. Note: the reinstatement examples for Chicago, Seattle and Philadelphia in the FAQ above are not yet verified against an official source — confirm with the relevant building department before relying on them.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [NYC DOB/ECB Buildings Penalty Schedule (PDF)](https://www.nyc.gov/html/ecb/downloads/pdf/BuildingsPenaltySchedule.pdf) — building violations $800–$4,000 per violation (Class 2).
- [Baltimore City Building Code §114](https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/114) — civil fines up to $500 per day, each day a separate offense.
- [Los Angeles Municipal Code §98.0602 (American Legal Publishing)](https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414) — Los Angeles permits valid 2 years from issuance.
- [2025 Denver Building Code §131.7 (City and County of Denver, PDF)](https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf) — a Denver construction permit may be voided when work is not commenced within 60 days of issuance, suspended or abandoned for 60 days, or no inspection is requested for 60 days.
- [Permit Warden, How Long Is a Building Permit Valid? 20 Major US Cities Compared](/blog/building-permit-validity-by-city) — our 20-city comparison table, built from verified municipal sources.
$$,
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires'
  AND content NOT LIKE '%## Sources%';

-- 6. what-happens-when-building-permit-expires-before-inspection
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The expiration rule below comes from the model building code; the penalty figures are each city’s published schedule.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [NYC DOB/ECB Buildings Penalty Schedule (PDF)](https://www.nyc.gov/html/ecb/downloads/pdf/BuildingsPenaltySchedule.pdf) — building violations $800–$4,000 per violation (Class 2).
- [Baltimore City Building Code §114](https://codes.baltimorecity.gov/us/md/cities/baltimore/code/building-codes/II/114) — civil fines up to $500 per day, each day a separate offense.
- [Municipal Code of Chicago, Construction Codes Table 14A-12-1203.1 (American Legal Publishing)](https://codelibrary.amlegal.com/codes/chicago/latest/chicago_il/0-0-0-2661915) — fines up to $1,000 per day, escalating to $10,000 for repeat violations.
- [Permit Warden, How Long Is a Building Permit Valid? 20 Major US Cities Compared](/blog/building-permit-validity-by-city) — our 20-city comparison table, built from verified municipal sources.
$$,
    updated_at = NOW()
WHERE slug = 'what-happens-when-building-permit-expires-before-inspection'
  AND content NOT LIKE '%## Sources%';

-- 6. what-is-ahj-authority-having-jurisdiction
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The definition of an AHJ comes from NFPA; the permit-administration rules come from the model building code. Our own AHJ directory lists the authority for each jurisdiction with its official portal link.

- [NFPA, Official Definitions §3.2.2, Authority Having Jurisdiction (AHJ) (nfpa.org)](https://docinfofiles.nfpa.org/files/AboutTheCodes/17/17_A2026_DRY_AAA_FD_PIResponses.pdf) — “An organization, office, or individual responsible for enforcing the requirements of a code or standard, or for approving equipment, materials, an installation, or a procedure.”
- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [Permit Warden, AHJ Directory](/ahj) — permit authorities by state and city, with official portal links.
$$,
    updated_at = NOW()
WHERE slug = 'what-is-ahj-authority-having-jurisdiction'
  AND content NOT LIKE '%## Sources%';

-- 6. why-contractors-miss-permit-renewal-deadlines
UPDATE blog_posts
SET content = content || $$

## Sources

Sources verified November 24, 2026. The seven reasons in this post are process observations from working across jurisdictions, not sourced figures. The deadline rules they refer to come from the sources below.

- [International Code Council, 2021 I-Codes: Application and Administration (Section 105.5, Expiration of Permit)](https://www.iccsafe.org/wp-content/uploads/Session-146-2021-Application-and-Administration-of-the-I-Codes.pdf) — the model-code root of the 180-day rule: a permit becomes invalid unless work commences within 180 days of issuance, or is suspended or abandoned for 180 days; the building official may grant one or more written extensions of up to 180 days each.
- [Permit Warden, How Long Is a Building Permit Valid? 20 Major US Cities Compared](/blog/building-permit-validity-by-city) — our 20-city comparison table, built from verified municipal sources.
- [NYC Department of Buildings, Permit Renewal](https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page) — New York permits valid up to 2 years; renew online via DOB NOW:Build about 2 weeks before expiration; $130 renewal fee.
$$,
    updated_at = NOW()
WHERE slug = 'why-contractors-miss-permit-renewal-deadlines'
  AND content NOT LIKE '%## Sources%';
