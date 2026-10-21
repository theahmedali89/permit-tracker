import type { Metadata } from "next";
import Link from "next/link";

const PAGE_URL = "https://permitwarden.com/building-permit";
const TITLE = "What Is a Building Permit? How to Get One (Complete Guide)";
const DESCRIPTION =
  "A building permit is your local government's written approval to build, remodel, or demolish — issued before work starts and closed out by inspections. Learn when you need one, the 6 steps to get one, and what happens if you skip it.";

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
        alt: "Permit Warden - Building permit guide",
      },
    ],
  },
};

const FAQS: Array<[string, string]> = [
  [
    "What is a building permit?",
    "A building permit is official written approval from your local building department (the Authority Having Jurisdiction, or AHJ) to construct, alter, repair, move, or demolish a structure exactly as shown on approved plans. It starts the inspection process that ends, for most projects, with a certificate of occupancy.",
  ],
  [
    "How do I get a building permit?",
    "Confirm the requirements with your local building department, prepare plans and documents, submit the application and pay the fees, respond to plan-review corrections, and receive the issued permit. Then build to the approved plans, call for inspections at each stage, and pass the final to close the permit out.",
  ],
  [
    "Where do I obtain a building permit?",
    "From the building department of the city or county where the property is located — the Authority Having Jurisdiction (AHJ). There is no state or national permit office. Most departments accept applications through an online portal, and many still take paper applications at the counter. Find your AHJ's official portal in our directory, and confirm which application route it currently uses before you prepare your plans.",
  ],
  [
    "How much does a building permit cost?",
    "Fees are set locally and usually scale with the project's value, size, or type — a bathroom remodel and a warehouse pay very different amounts, and extra fees (plan review, school, utility, impact) can apply. There is no national price. Your building department publishes a fee schedule; find the official portal for your city in our AHJ directory.",
  ],
  [
    "How long does it take to get a building permit?",
    "Simple over-the-counter permits can issue the same day, while projects needing plan review commonly take a few weeks — and large or complex projects can take months, especially if the review comes back with corrections. Complete plans and fast responses to corrections are the biggest schedule levers you control.",
  ],
  [
    "What happens if I build without a permit?",
    "Expect stop-work orders, fines that can exceed the original permit fee, and possible removal of the unpermitted work. Unpermitted work also surfaces at resale — it can stall a closing, void insurance claims, and force you to open walls so inspectors can see what was done. Pulling the permit first is always cheaper.",
  ],
  [
    "Who pulls the permit — the owner or the contractor?",
    "Either can apply, but most departments expect the licensed contractor doing the work to pull trade permits, and owners often let the general contractor pull the building permit. Whoever signs is responsible for the work complying. Never let a contractor ask you to pull an \"owner-builder\" permit for their work to dodge licensing — that shifts the legal risk to you.",
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

const NEEDS = [
  ["New buildings & additions", "Houses, garages, commercial buildings, and any added square footage."],
  ["Structural changes", "Removing or moving walls, changing the roof structure, cutting new openings."],
  ["Major systems work", "Electrical service changes, new plumbing, HVAC installs — usually as separate trade permits."],
  ["Decks, fences & pools", "Most jurisdictions permit decks and pools; fence rules vary by height and location."],
  ["Demolition", "Tearing down a structure (or part of one) needs a demolition permit and utility sign-offs."],
  ["Change of use", "Turning a garage into a living space or a shop into a restaurant changes the occupancy — permit required."],
] as const;

const NO_NEED = [
  "Cosmetic work: painting, flooring, cabinets, countertops, and fixtures swapped like-for-like",
  "Minor repairs that don't touch structure or systems — patching drywall, fixing a leaky faucet",
  "Small accessory structures below your city's size threshold (many use 120–200 sq ft — verify locally)",
  "Appliance replacements that don't alter wiring, gas, or venting",
] as const;

export default function BuildingPermitPage() {
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
            Free guide — the permit process, explained plainly
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            What Is a Building Permit?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            A <strong>building permit</strong> is your local government&apos;s written approval
            to build, remodel, or demolish — granted <em>before</em> work starts, based on
            plans the building department has reviewed for code and zoning compliance. It is
            not a tax or a formality: it is the trigger for the inspections that prove the
            work is safe.
          </p>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              When do you need a building permit?
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              The exact list is set by your city or county, but these projects need a permit
              almost everywhere:
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {NEEDS.map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{body}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-10 text-xl font-bold text-gray-900 dark:text-white">
              Usually no permit needed
            </h3>
            <ul className="mt-4 space-y-2">
              {NO_NEED.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/60 bg-white/70 px-5 py-3 text-sm text-gray-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-300"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Thresholds differ by jurisdiction — always confirm with your{" "}
              <Link href="/ahj" className="font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
                local permit office
              </Link>{" "}
              before assuming. Five minutes of checking beats a stop-work order.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to get a building permit in 6 steps
            </h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Confirm what your project needs", "Talk to the building department (or read its portal) to learn which permits, plans, and licensed contractors your project requires. Many projects need trade permits alongside the building permit."],
                ["Prepare plans and documents", "Scaled drawings, a site plan, and product specifications. Bigger projects need plans stamped by a licensed architect or engineer — and the property's APN, which our free parcel lookup can help you find."],
                ["Submit the application and pay fees", "Apply through the department's portal or counter. Fees are calculated from the local fee schedule and are usually due at submittal or issuance."],
                ["Plan review and corrections", "Reviewers check structure, zoning, energy, and life-safety. Most applications get a correction list — respond completely and resubmit promptly."],
                ["Receive the issued permit", "Post the permit card visibly at the job site. Work must match the approved plans; changes usually need a revision approved before you build them."],
                ["Build, inspect, and close out", "Call for inspections at each required stage. Passing the final inspection closes the permit — and for occupiable buildings, leads to the certificate of occupancy."],
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

          <section className="mt-14 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                A permit is not a license
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                A <strong>permit</strong> approves a specific project at a specific address. A{" "}
                <strong>license</strong> approves a contractor to do a category of work.
                Departments check both — which is why verifying your contractor&apos;s license
                comes first.
              </p>
              <Link
                href="/tools/license-lookup"
                className="mt-3 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Verify a contractor&apos;s license free →
              </Link>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                The permit ends with the CO
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                For buildings people will occupy, the permit process finishes with a{" "}
                <strong>certificate of occupancy</strong> — the document that makes the space
                legal to use. See what it is and how the final steps work.
              </p>
              <Link
                href="/certificate-of-occupancy"
                className="mt-3 inline-block text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
              >
                Certificate of occupancy guide →
              </Link>
            </div>
          </section>

          <section className="mt-14 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Start at your local permit portal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Permits are issued locally — the city or county building department (the AHJ) is
              where applications, fee schedules, and inspection requests live. Our directory
              links the official permit portals for jurisdictions across all 50 states.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/ahj"
                className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95"
              >
                Find your permit portal →
              </Link>
              <Link
                href="/tools/parcel-lookup"
                className="inline-block rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-sky-300 dark:border-white/15 dark:bg-gray-900 dark:text-gray-100"
              >
                Look up a parcel number (APN)
              </Link>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Building permit FAQs
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
              Permits expire. Deadlines sneak up. We watch both.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Permit Warden tracks every permit, inspection, and renewal across your projects
              and jurisdictions — with automatic reminders before anything lapses.
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
