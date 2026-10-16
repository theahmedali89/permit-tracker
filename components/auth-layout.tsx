import Link from "next/link";

const HIGHLIGHTS = [
  {
    title: "Never miss a deadline",
    text: "Automatic reminders 30, 14, 7, and 1 day before every permit, license, and inspection expires.",
  },
  {
    title: "Every AHJ in one place",
    text: "Official permit portals for all 50 states — find the right office in seconds.",
  },
  {
    title: "Subcontractor compliance",
    text: "Track COIs and licenses across your entire crew from a single dashboard.",
  },
];

function Logo() {
  return (
    <div className="inline-block rounded-xl bg-white px-3 py-2 shadow-sm">
      <img src="/logo.png" alt="Permit Warden" className="h-8 w-auto" />
    </div>
  );
}

export function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              Every permit. Every license.
              <br />
              <span className="text-blue-200">Never a missed deadline.</span>
            </h1>
            <div className="mt-10 space-y-7">
              {HIGHLIGHTS.map((h) => (
                <div key={h.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">{h.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-blue-100/80">{h.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-blue-100/60">
            Built for small U.S. contractors who can't afford stop-work orders.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {heading}
          </h2>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subheading}</div>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
            <Link href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300">
              Read our permit guides
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
