import type { Metadata } from "next";
import Link from "next/link";
import { PublicPage } from "../_components/PublicPage";

const PAGE_URL = "https://permitwarden.com/glossary";
const TITLE = "Construction Permit Glossary — AHJ, CO, APN, Variance & More";
const DESCRIPTION =
  "Plain-English definitions of the permit terms contractors run into: AHJ, building permit, certificate of occupancy (CO), APN, variance, setback, and rezoning.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Permit Warden glossary" }],
  },
};

// Definitions are drawn only from Permit Warden's own guides and blog posts
// (building-permit and certificate-of-occupancy pages, permit-types,
// certificate-of-occupancy, APN, and AHJ guides). No outside claims.
const TERMS: Array<[string, string, string?]> = [
  [
    "AHJ (Authority Having Jurisdiction)",
    "The organization, office, or individual responsible for enforcing a code or standard, or for approving equipment, materials, an installation, or a procedure — in practice, usually the city or county building department that issues your permits and conducts inspections. It can also be a fire marshal or another agency, depending on the project.",
    "/blog/what-is-ahj-authority-having-jurisdiction",
  ],
  [
    "Building permit",
    "Official written approval from your local building department (the AHJ) to construct, alter, repair, move, or demolish a structure exactly as shown on approved plans. It starts the inspection process that ends, for most projects, with a certificate of occupancy.",
    "/building-permit",
  ],
  [
    "Certificate of occupancy (CO)",
    "A document issued by your local building department certifying that a building complies with building codes, zoning, and its approved plans, and is safe for its intended use. It is the final sign-off at the end of permitted construction — the building permit lets you build; the CO lets people move in.",
    "/certificate-of-occupancy",
  ],
  [
    "Certificate of continued occupancy (CCO)",
    "A certificate confirming that a building's existing use may legally continue. It is typically checked when ownership or tenancy changes and no construction is planned. It differs from a standard CO, which is issued after new construction, a change of use, or major permitted work.",
    "/certificate-of-occupancy",
  ],
  [
    "Temporary certificate of occupancy (TCO)",
    "A certificate that lets you occupy part or all of a building for a limited time while minor, non-safety items are finished. It has an expiration date, and if the remaining work isn't completed and the final CO issued before it lapses, occupancy can be revoked.",
    "/certificate-of-occupancy",
  ],
  [
    "APN (Assessor's Parcel Number)",
    "A unique number the county tax assessor assigns to every piece of land in their jurisdiction — the property's fingerprint. Every official record about that land is filed under it, and almost every permit application asks for it.",
    "/blog/assessors-parcel-number-guide",
  ],
  [
    "Variance (zoning variance)",
    "Official permission to deviate from specific dimensional requirements of the zoning code — setbacks, height limits, lot coverage, parking ratios, sign sizes. It doesn't change what the land can be used for; it changes how the rules apply to a specific property. An area (dimensional) variance deviates from physical requirements; a use variance would change the allowed use.",
    "/blog/permit-types-explained",
  ],
  [
    "Setback",
    "The minimum distance a building must sit back from a property line, as required by the zoning code — for example, a 20-foot front setback. Setbacks are one of the dimensional rules a variance can deviate from, and a wrong setback is a common reason a certificate of occupancy gets delayed.",
    "/blog/permit-types-explained",
  ],
  [
    "Conditional use permit (CUP)",
    "Permission for a specific use that is listed as conditionally acceptable in a zone — a different use than the zone normally allows, granted after review (often including a public hearing) and subject to conditions.",
    "/blog/permit-types-explained",
  ],
  [
    "Right-of-way permit (ROW permit)",
    "A permit for work in public right-of-way — streets, sidewalks, and other public land — such as road construction, utility work, or anything that occupies or alters the public street.",
    "/blog/permit-types-explained",
  ],
  [
    "Rezoning (zone change)",
    "Changing the zoning designation of a parcel of land itself — a longer, legislative process, distinct from a variance (which bends the dimensional rules for an already-allowed use) or a conditional use permit (which allows a specific conditionally-acceptable use).",
    "/blog/permit-types-explained",
  ],
  [
    "Permit extension / reinstatement",
    "An extension lengthens a permit that is still valid (where the AHJ allows it, sometimes for a fee); reinstatement brings back a permit that has already expired, where the AHJ offers that path. A third path is reapplying for a new permit. Which paths exist, and what they cost, is set by each AHJ.",
    "/blog/how-to-extend-expired-building-permit",
  ],
  [
    "License (contractor license)",
    "Approval for a contractor to do a category of work. A permit approves a specific project at a specific address; a license approves a contractor to do a category of work. Departments check both.",
    "/tools/license-lookup",
  ],
  [
    "Inspection",
    "A visit by the building department (or another AHJ) to verify that work matches the approved plans and code at a required stage — for example, rough, final, electrical, plumbing, or fire finals. Passing the final inspection closes the permit out and, for occupiable buildings, leads to the certificate of occupancy.",
    "/building-permit",
  ],
];

export default function GlossaryPage() {
  return (
    <PublicPage
      eyebrow="Permit glossary"
      title="Construction permit glossary"
      intro={
        <p>
          Plain-English definitions of the terms on a permit application, a
          plan-review letter, or a CO — drawn from our own guides, so the
          wording matches what you will read elsewhere on this site.
        </p>
      }
    >
      <div className="mt-10 space-y-4">
        {TERMS.map(([term, def, href]) => (
          <div
            key={term}
            className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
          >
            <h2 className="font-semibold text-gray-900 dark:text-white">{term}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {def}
            </p>
            {href && (
              <Link
                href={href}
                className="mt-3 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Read the full guide →
              </Link>
            )}
          </div>
        ))}
      </div>
    </PublicPage>
  );
}
