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

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${light ? "bg-blue-600" : "bg-white/15 backdrop-blur"}`}>
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      </div>
      <span className={`text-lg font-semibold tracking-tight ${light ? "text-gray-900 dark:text-white" : "text-white"}`}>Permit Warden</span>
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
            <Logo light />
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
