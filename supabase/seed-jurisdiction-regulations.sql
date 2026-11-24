-- Seed: jurisdiction_regulations pilot data — top 20 US cities by population.
-- STRICT RULE: never invent data. Every non-NULL value carries a real source_url
-- copied verbatim from a tool result. Unverifiable values are NULL.
-- Researched 2026-10-16 from city building department pages and municipal code.
--
-- Cities where NO building-permit regulatory data could be verified (all fields NULL):
--   Oklahoma City OK (only; Dallas and Denver were enriched 2026-11-24 — see below)
-- Cities with PARTIAL data only (see source_url for what was verified):
--   Los Angeles CA (validity + extension process verified 2026-11-24; LAMC 98.0602),
--   San Antonio TX (validity + extension process verified 2026-11-24; sa.gov),
--   Charlotte NC (validity only; extension process not found on official pages),
--   Jacksonville FL (validity only; official City FAQ),
--   Indianapolis IN (validity 365 days + extension verified 2026-11-24; Code §536-213),
--   Dallas TX (validity + extension verified 2026-11-24; City Planning & Development Guide),
--   Denver CO (60-day voiding rule verified 2026-11-24; 2025 Denver Building Code §131.7 — no fixed maximum duration)
-- Corrections 2026-11-24: see lib/shared/jurisdiction-data.ts header + AUDIT_REPORT.md §6.1.
-- Pass 2 corrections 2026-11-24: see CONTENT_ENRICHMENT_REPORT.md.
-- The matching UPDATE migration for live DBs is
-- supabase/migration-regulation-corrections-2026-11-24.sql (this seed uses
-- ON CONFLICT DO NOTHING, so re-running it does NOT update existing rows).
-- Pass 2 UPDATEs live in supabase/migration-content-enrichment-2026-11-24.sql.
-- Re-runnable: ON CONFLICT (city, state_code, permit_type) DO NOTHING.

INSERT INTO jurisdiction_regulations
  (jurisdiction_name, state_code, city, permit_type, validity_days, validity_notes,
   extension_allowed, extension_fee_usd, extension_process, processing_days, source_url)
VALUES
  ('New York', 'NY', 'New York', 'building', 730,
   'Max 2 yrs from issuance (AC 28-105.8.1); expires if work not commenced within 12 mo or lapsed 12 mo (AC 28-105.9); DOB NOW:Build permits expire at earliest of insurance/license expiry or 1 yr',
   true, 130,
   'Renew online via DOB NOW:Build/eFiling about 2 weeks before expiration; Commissioner may grant additional 12-month periods',
   24,
   'https://www.nyc.gov/site/buildings/property-or-business-owner/permit-renewal.page https://www.Nyc.gov/assets/buildings/pdf/reinstatement_fees-sn.pdf https://transparent.city/c/new-york-city/stories/9gq6eB81'),

  ('Los Angeles', 'CA', 'Los Angeles', 'building', 730,
   'Valid 2 yrs from issuance (LAMC 98.0602, as amended Ord. 187,719 eff. 1/23/23); expires 12 mo after issuance if work not commenced, or after 12 continuous months suspended/discontinued/abandoned. Note: LADBS FAQ still states 6-month no-start/no-work windows — the current code says 12 months.',
   true, NULL,
   'File within 30 days of expiration via Request for Modification Form 41a or 42; each extension 6 months within the 2-year limit (LADBS FAQ)',
   NULL,
   'https://codelibrary.amlegal.com/codes/los_angeles/latest/lamc/0-0-0-190414 https://dbs.lacity.gov/node/4081'),

  ('Chicago', 'IL', 'Chicago', 'building', 180,
   '6 mo from payment to begin work and request first inspection (14A-4-413.9); on hold/no inspection for more than 365 days requires reinstatement',
   true, NULL,
   'Up to 2 x 180-day extensions pre-construction, up to 4 x 180 days post-start; cumulative max 720 days (14A-4-413.9.1)',
   87,
   'https://www.chicago.gov/content/dam/city/depts/bldgs/general/CodeModernization/07242020codeQandA.pdf https://www.illinoispolicy.org/what-does-it-take-to-get-a-building-permit-in-chicago/'),

  ('Houston', 'TX', 'Houston', 'building', 730,
   'Invalid/inactive on 180th day unless commenced and inspected; hard expiry at 2 yrs if never commenced or abandoned 2 yrs (R105.5)',
   true, NULL,
   'One or more extensions of up to 180 days each; written request with justifiable cause (R105.5.1)',
   NULL,
   'https://www.houstonpermittingcenter.org/media/9056/download'),

  ('Phoenix', 'AZ', 'Phoenix', 'building', 180,
   'Null/void if work not started within or ceased for 180 days; Section 114 violation permits must complete within 12 months of issuance',
   true, NULL,
   'One-time 90-day extension plus one-time 90-day reinstatement for Section 114 permits; fire permits: one or more 180-day extensions; written application before expiration (TRT/DOC/00021P)',
   NULL,
   'https://www.cityofphoenix.org/content/dam/phoenix/pddsite/documents/trt/external/dsd_trt_pdf_00021p.pdf'),

  ('Philadelphia', 'PA', 'Philadelphia', 'building', 180,
   'Invalid if not commenced within 6 mo or suspended/abandoned 6 mo; construction/demolition permits valid max 5 yrs (A-302.2)',
   true, NULL,
   'Written request; code official may extend in writing: up to 2 extensions (12 mo total) to commence work, up to 1 extension (6 mo) for suspended work; expired permits require a new permit (A-302.2)',
   15,
   'https://www.phila.gov/media/20260707130349/P_052_INF_Building-permit-extension-info-sheet-WebUI.pdf https://phila.gov/media/20220616124113/StartRight-FINAL-6.16.2022.pdf'),

  ('San Antonio', 'TX', 'San Antonio', 'building', 180,
   'Every permit application and permit will expire within 180 days if no proof of work or progress has been shown (City of San Antonio, Permit Process)',
   true, NULL,
   'One or more 180-day extensions when you can prove a valid, justifiable reason for the project suspension or abandonment (City of San Antonio, Permit Process)',
   NULL,
   'https://www.sa.gov/Directory/Departments/DSD/Constructing/Business-Commercial/Permit-Process http://docsonline.sanantonio.gov/DSDDocsOnline/?document=Form%2C+Applications'),

  ('San Diego', 'CA', 'San Diego', 'building', 365,
   'One-year utilization period (IB 117); void if work not begun within 180 days or suspended/abandoned 180 days (SDMC sections 129.0216/129.0217)',
   true, NULL,
   'Form DS-117 filed at least 1 month before end of utilization period; Building Official may grant up to 180 days plus one additional extension under conditions',
   NULL,
   'https://www.sandiego.gov/development-services/forms-publications/information-bulletin/117'),

  ('Dallas', 'TX', 'Dallas', 'building', 730,
   'Permits expire after 2 years from issuance, or after 120 days of no inspection activity — whichever comes first (City of Dallas Planning & Development Guide; verified November 24, 2026)',
   true, 200,
   'Request an Extension in DallasNow before the permit expires; $200 fee for issued permits, no fee for applications (City of Dallas Planning & Development Guide)',
   NULL,
   'https://dallascityhall.com/departments/sustainabledevelopment/guide/Pages/default.aspx'),

  ('San Jose', 'CA', 'San Jose', 'building', 365,
   'Expires 12 months from issuance or 180 days from last inspection approval/partial approval',
   true, NULL,
   'Request before expiry via Permit Center (408-535-3555) or buildingpermits@sanjoseca.gov; approved first extension adds 180 days; second extension via Letter of Request to Chief Building Official, up to 360 days, discretionary, non-appealable',
   NULL,
   'https://www.sanjoseca.gov/home/showpublisheddocument/25887/636965525550970000'),

  ('Austin', 'TX', 'Austin', 'building', 180,
   'Expires on the 181st day if no inspection scheduled/received; passing inspection extends expiration 180 days',
   true, NULL,
   'One-time extension of up to 180 days; written request before expiration (Section 25-12-268); via AB+C portal or DSD form',
   NULL,
   'https://www.austintexas.gov/development-services/apply-standalone-permit https://austin.widen.net/content/dlenjownlx/original/DSD_RequestForExtensionWithdrawalOrReactivation.pdf?u=x8lbbe&download=true'),

  ('Jacksonville', 'FL', 'Jacksonville', 'building', 180,
   'HOW LONG ARE PERMITS GOOD FOR? 180 days. (City of Jacksonville, Building Inspection Division FAQs; Division enforces Florida Building Code 8th Edition (2023). Permit may become void if no work done during a six-month period — FBC 105.4.1.)',
   NULL, NULL, NULL, NULL,
   'https://www.jacksonville.gov/departments/public-works/building-inspection-division/faqs'),

  ('Fort Worth', 'TX', 'Fort Worth', 'building', 180,
   'Building permits expire 180 days from date issued unless work has begun or an extension is requested (City building code Sec. 105.5; stated in official zoning case record)',
   true, NULL,
   'One 180-day extension may be requested; per Sec. 105.5 a permit shall not extend more than once when no work has proceeded',
   NULL,
   'https://apps.fortworthtexas.gov/council_packet/render_file.asp?filename=Zoning_cases/3713/ZC-16-035.pdf'),

  ('Columbus', 'OH', 'Columbus', 'building', 365,
   'Work must begin within 1 year of issuance; once begun, no delays in progress over 6 months; all related building/mechanical/electrical/plumbing permits treated as a single project for expiration',
   true, NULL,
   'Limited permit extensions allowed under the building code; contact ExpiredPermits@columbus.gov or 614-645-8563',
   NULL,
   'https://www.columbus.gov/Business-Development/Get-a-Permit/Get-or-Track-a-Building-Permit'),

  ('Charlotte', 'NC', 'Charlotte', 'building', 180,
   'Expires 6 months after issue if no inspections ever requested/performed; 1 year after latest inspection if inspections begun but not completed (Mecklenburg County Code Enforcement)',
   NULL, NULL, NULL, NULL,
   'https://code.mecknc.gov/site-menu/permitting/expired-permits'),

  ('San Francisco', 'CA', 'San Francisco', 'building', 180,
   'Work suspended/abandoned 180+ days renders permit expired and null and void (SFBC 106A.4.4); overall maximum time to complete per Table B by valuation; demolition permits expire 180 days after issuance',
   true, NULL,
   'Request before expiration via Service Request Form emailed to dbi.inspectionservices@sfgov.org; second extension requires a letter to the Chief Building Inspector; invoice sent after approval',
   NULL,
   'https://www.sf.gov/documents/38140/26.07.12__Permit_Extension_How_To.pdf https://sfgov.legistar.com/View.ashx?M=F&ID=2287597&GUID=82ACD390-690C-4F44-B31A-6164F04DD972&From=Granicus'),

  ('Indianapolis', 'IN', 'Indianapolis', 'building', 365,
   'Expires by operation of law if construction not commenced within 365 days of issuance, or if commenced but substantially no construction occurs over 365 days (Indianapolis Code §536-213, as amended through G.O. 40, 2025, §6)',
   true, NULL,
   'Administrator may extend for good cause shown in writing for an additional period reasonable under the circumstances (§536-213); use the City''s Request for Permit Amendment/Update, Extension, Renewal or Cancellation form',
   NULL,
   'https://us-east-1-indy.graphassets.com/ActDBC5rvRWeCZlNNnLrDz/cmq9ljhkd06ua07llx9fclvja'),

  ('Seattle', 'WA', 'Seattle', 'building', 540,
   '18 months from issuance (Seattle Building Code section 106.10)',
   true, NULL,
   'Renew up to 30 days before expiration via Seattle Services Portal; renewed permit valid 18 months from prior expiration; permits expired less than 1 year can be reestablished; expired 1+ year requires new application',
   NULL,
   'https://Seattle.gov/documents/Departments/SDCI/Permits/ConstructionPermitRenewals.pdf http://www.seattle.gov/sdci/permits/changes-to-your-issued-permit/building-permit-renewals'),

  ('Denver', 'CO', 'Denver', 'building', NULL,
   'No fixed maximum duration in the 2025 Denver Building Code §131. A construction permit may be voided when work is not commenced within 60 days of issuance, work is suspended or abandoned for 60 days, or no inspection has been requested for 60 days (§131.7). Before work recommences, new plans may be required and a new permit obtained (verified November 24, 2026)',
   NULL, NULL, NULL, NULL,
   'https://denvergov.org/files/assets/public/community-planning-and-development/documents/ds/building-codes/2025_denver_building_code.pdf'),

  ('Oklahoma City', 'OK', 'Oklahoma City', 'building', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (city, state_code, permit_type) DO NOTHING;
