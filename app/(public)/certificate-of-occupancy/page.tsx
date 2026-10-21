import type { Metadata } from "next";
import Link from "next/link";

const PAGE_URL = "https://permitwarden.com/certificate-of-occupancy";
const TITLE = "Certificate of Occupancy: What It Is, When You Need One & How to Get It";
const DESCRIPTION =
  "A certificate of occupancy (CO) is the final approval that makes a building legal to occupy. Learn when you need one, the 5 steps to get it, how it differs from a building permit, and find your city's permit portal.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - Certificate of occupancy guide",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "What is a certificate of occupancy?",
    "A certificate of occupancy (CO) is a document issued by your local building department certifying that a building complies with building codes, zoning, and its approved plans, and is safe for its intended use. It is the final sign-off at the end of permitted construction — the building permit lets you build; the CO lets people move in.",
  ],
  [
    "When do I need a certificate of occupancy?",
    "You need a CO when a building is newly constructed, when its use or occupancy classification changes (for example, a warehouse becoming a restaurant), after major alterations in many jurisdictions, and often when a commercial property changes tenants or ownership. Exact triggers vary by city — when in doubt, ask the building department before anyone occupies the space.",
  ],
  [
    "How long does it take to get a certificate of occupancy?",
    "Once all final inspections pass and paperwork is complete, many departments issue the CO in days to a few weeks. The real delays come from failed finals, open permits, and missing sign-offs from other agencies (fire, health, public works). Scheduling finals early and closing out every trade permit is what keeps a CO on schedule.",
  ],
  [
    "What is a temporary certificate of occupancy (TCO)?",
    "A TCO lets you occupy part or all of a building for a limited time while minor, non-safety items are finished. It has an expiration date, and if the remaining work isn't completed and the final CO issued before it lapses, occupancy can be revoked. Treat a TCO as a deadline, not a finish line.",
  ],
  [
    "Can I sell or lease a property without a certificate of occupancy?",
    "It depends on the jurisdiction and the property's history. Some cities require a new CO or a certificate of continued occupancy at resale or tenant change; others only require one after permitted work or a change of use. Lenders and insurers often ask for it either way — check with the local building department before closing.",
  ],
  [
    "What does CCO mean in construction?",
    "CCO is short for certificate of continued occupancy. In jurisdictions that use one, a CCO confirms that a building's existing use may legally continue — it is typically checked when ownership or tenancy changes and no construction is planned. It differs from a standard certificate of occupancy, which is issued after new construction, a change of use, or major permitted work.",
  ],
  [
    "What is an occupancy date?",
    "The occupancy date is the date recorded on the certificate of occupancy — the day the building department issued it and legal occupancy of the building began. It shows up in permit and property records, and occasionally in real-estate listings. It is not necessarily the day anyone actually moved in, and on older buildings the recorded date may come from a later CO issued after a renovation or change of use.",
  ],
  [
    "What happens if I occupy a building without a CO?",
    "Penalties vary, but they can include fines, orders to vacate, problems with insurance claims, and trouble selling or refinancing the property. For businesses, occupying without a CO can also block your business license. It is never the place to cut a corner.",
  ],
];

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const COMPARISON: Array<[string, string, string]> = [
  ["Purpose", "Permission to start construction", "Permission to occupy and use the building"],
  ["Issued", "Before work begins", "After all work and final inspections pass"],
  ["Who issues it", "Local building department (AHJ)", "Local building department (AHJ)"],
  ["Tied to", "The approved plans and scope of work", "The building and its occupancy classification"],
  ["Expires", "Yes — typically if work doesn't start or stalls", "No — stays with the building unless use changes or it's substantially altered"],
];

export default function CertificateOfOccupancyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-teal-50/40 dark:from-blue-950/40 dark:to-teal-950/20">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
          >
            &larr; Back to Permit Warden
          </Link>

          <p className="mt-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Free guide — updated for contractors &amp; owners
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Certificate of Occupancy: What It Is &amp; How to Get One
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            A <strong>certificate of occupancy</strong> (CO) is the building department&apos;s
            final green light: proof that a building matches its approved plans, passes code,
            and is legal to occupy. No CO, no move-in — and usually no final payment, business
            license, or closing.
          </p>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              When do you need a certificate of occupancy?
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["New construction", "Any newly built home or commercial building needs a CO before anyone moves in or opens for business."],
                ["Change of use", "Converting a space to a different occupancy class — retail to restaurant, office to apartments — requires a new CO."],
                ["Major alterations", "Large renovations and additions often trigger a new or amended CO, depending on the city."],
                ["Tenant or ownership change", "Some cities require a new CO or certificate of continued occupancy when a commercial space changes hands."],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to get a certificate of occupancy in 5 steps
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Complete all permitted work", "Finish everything on the approved plans. Open trade permits (electrical, plumbing, mechanical) must be ready for their own finals — one open permit can hold the whole CO."],
                ["Pass every final inspection", "Building, electrical, plumbing, mechanical, and fire finals, plus sign-offs from other agencies the city requires. Fix any corrections and get re-inspections scheduled fast."],
                ["Submit the CO application", "Most departments require a CO application or request form, sometimes with a fee, once finals are approved. Some generate it automatically from the permit — confirm with your AHJ."],
                ["Final review", "The department checks that every permit on the project is finaled, fees are paid, and conditions (site work, landscaping, public improvements) are satisfied."],
                ["Receive and post the CO", "The issued CO lists the address, owner, occupancy classification, and occupant load. Post or keep it with the property records — it stays with the building."],
              ].map(([title, body], i) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Certificate of occupancy vs. building permit
            </h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10">
                    <th className="px-5 py-3 font-semibold text-gray-900 dark:text-white"></th>
                    <th className="px-5 py-3 font-semibold text-gray-900 dark:text-white">Building permit</th>
                    <th className="px-5 py-3 font-semibold text-gray-900 dark:text-white">Certificate of occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(([label, permit, co]) => (
                    <tr key={label} className="border-b border-gray-100 last:border-0 dark:border-white/5">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{label}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{permit}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{co}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              New to permits? Start with our{" "}
              <Link href="/building-permit" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                building permit guide
              </Link>{" "}
              — what a permit is, when you need one, and how to get it.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Beyond the first CO: continued occupancy and reoccupancy
            </h2>
            <h3 className="mt-8 text-xl font-bold text-gray-900 dark:text-white">
              Certificate of continued occupancy (CCO)
            </h3>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">
              A standard CO closes out construction. A <strong>certificate of continued
              occupancy</strong> covers the opposite situation: nothing is being built, but
              the people in the building are changing. In many jurisdictions, when a home is
              sold or a commercial space gets a new tenant, the building department inspects
              the property and issues a CCO confirming that the existing use is still legal
              and the space still meets basic life-safety requirements. If you have seen
              &ldquo;CCO&rdquo; on a permit record and wondered about the CCO construction
              meaning, that is all it is — a continuation check, not a construction approval,
              and it authorizes no work. Not every city uses a CCO; the same check may happen
              under a resale inspection, a rental license, or a fresh CO instead.
            </p>
            <h3 className="mt-10 text-xl font-bold text-gray-900 dark:text-white">
              Reoccupancy: moving back into a vacant or damaged building
            </h3>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">
              <strong>Reoccupancy</strong> means occupying a building again after it has sat
              vacant, been damaged by fire, flood, or storm, or been posted as unsafe. Many
              jurisdictions treat reoccupancy like a brand-new move-in: the space has to pass
              inspection first, a new or amended certificate of occupancy is often required,
              and utilities may not be reconnected until the building department signs off —
              even if the building had a valid CO before it emptied. If a property has been
              empty for a while, ask the building department what reoccupancy requires before
              assuming the old CO still covers it.
            </p>
          </section>

          <section className="mt-14 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              CO requirements are set by your city — find yours
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              There is no national certificate of occupancy. The building department in the
              city or county where the property sits — the Authority Having Jurisdiction
              (AHJ) — sets the requirements, fees, and forms. Browse our directory of
              official permit portals for all 50 states to find yours, then confirm the CO
              process before your finals are scheduled.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/ahj"
                className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Find your permit portal →
              </Link>
              <Link
                href="/blog/certificate-of-occupancy-guide"
                className="inline-block rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-sky-300 dark:border-white/15 dark:bg-gray-900 dark:text-gray-100"
              >
                Read the full CO guide
              </Link>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Certificate of occupancy FAQs
            </h2>
            <div className="mt-6 space-y-4">
              {FAQS.map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white">{q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-600 to-teal-600 p-8 text-center sm:p-10 dark:from-blue-950 dark:via-blue-900 dark:to-teal-900">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Never let a CO deadline sneak up on a project again.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden tracks every permit, inspection, and expiration across your
              projects — with automatic reminders long before a deadline can cost you money.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-block rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
            >
              Start tracking permits free
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
