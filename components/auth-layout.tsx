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
    <Link href="/" className="inline-flex items-center gap-2.5 rounded-2xl px-3 py-2">
      <img src="/logo-mark.png" alt="Permit Warden" className="h-11 w-11 rounded-xl shadow-lg" />
      <span className="text-lg font-bold tracking-tight text-white">
        Permit Warden
      </span>
    </Link>
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
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-teal-700 lg:block">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* soft glow blobs */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal-400/30 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-blue-400/30 blur-3xl" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl">
              Every permit. Every license.
              <br />
              <span className="text-teal-200">Never a missed deadline.</span>
            </h1>
            {/* real-number trust stats */}
            <div className="mt-8 flex gap-6">
              <div>
                <p className="text-2xl font-bold text-white">186</p>
                <p className="text-xs text-teal-100/70">AHJ portals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50</p>
                <p className="text-xs text-teal-100/70">States covered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">30·14·7·1</p>
                <p className="text-xs text-teal-100/70">Day reminders</p>
              </div>
            </div>
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
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 sm:px-8">
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-800/70 sm:p-8">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <img src="/logo-mark.png" alt="Permit Warden" className="h-10 w-10 rounded-xl shadow" />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Permit Warden</span>
            </Link>
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
