import Image from "next/image";
import Link from "next/link";
import { LoginArt } from "@/lib/features/landing-redesign";

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
      <Image src="/logo-mark.png" alt="Permit Warden" width={44} height={44} className="h-11 w-11 rounded-xl shadow-lg" />
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
  eyebrow,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: React.ReactNode;
  /** Small pill above the heading (sign-in page: "Secure sign in"). */
  eyebrow?: string;
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
            <LoginArt />
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white xl:text-4xl">
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
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-800/70 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-blue-600 via-teal-500 to-amber-400" aria-hidden="true" />
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/logo-mark.png" alt="Permit Warden" width={40} height={40} className="h-10 w-10 rounded-xl shadow" />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Permit Warden</span>
            </Link>
          </div>
          {eyebrow && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-600/25 bg-blue-600/10 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-blue-600 dark:border-blue-300/25 dark:bg-blue-300/10 dark:text-blue-300">
              {eyebrow}
            </span>
          )}
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {heading}
          </h2>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subheading}</div>
          <div className="mt-8">{children}</div>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
            <svg className="h-[15px] w-[15px] shrink-0 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            186 AHJ portals · All 50 states
          </p>
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
            <Link href="/blog" className="hover:text-gray-700 dark:hover:text-gray-300">
              Read our permit guides
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
