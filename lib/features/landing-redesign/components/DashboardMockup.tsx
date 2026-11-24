/**
 * Glass dashboard mockup for the hero — same data as the original
 * `DashboardMockup` in LandingPage.tsx, restyled to the approved
 * preview's high-contrast version: stronger glass opacity (so it no
 * longer looks washed out), solid white text, vivid solid pills.
 * Illustrative sample data, as before — aria-hidden.
 */

const ROWS: [string, string, string, string][] = [
  ["BLD-2026-0418", "Austin, TX", "12 days left", "warn"],
  ["ELEC-2026-0902", "Denver, CO", "45 days left", "ok"],
  ["PLB-2026-0117", "Baltimore, MD", "3 days left", "warn"],
  ["HVAC-2026-0731", "Chicago, IL", "Expired 2d ago", "bad"],
];

const PILL: Record<string, string> = {
  ok: "bg-[#0F766E] text-[#ECFDF5] border-[1.5px] border-[#5EEAD4]",
  warn: "bg-[#B45309] text-[#FFFBEB] border-[1.5px] border-[#FDE68A]",
  bad: "bg-[#0F172A] text-[#FDE68A] border-[1.5px] border-[#F59E0B]",
};

export function DashboardMockup() {
  return (
    <div
      className="pw-float-soft rounded-[20px] border-[1.5px] border-white/60 bg-white/[0.42] p-[18px] shadow-[0_24px_50px_rgba(2,6,23,0.45)] backdrop-blur-[8px] dark:border-[#93C5FD]/[.55] dark:bg-[#0B1B3A]/[.78]"
      role="img"
      aria-label="Dashboard preview: 24 active permits, 2 expiring, 1 expired, with an alert that 2 permits expire within 14 days"
    >
      {/* mock window bar */}
      <div className="flex items-center gap-1.5 pb-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
        <span className="ml-2 text-[11px] font-bold text-white">Permit Warden — Dashboard</span>
      </div>
      {/* alert banner */}
      <div
        className="mb-3 flex items-center gap-2 rounded-xl border-[1.5px] border-[#FDE68A] bg-amber-500/50 px-3 py-2"
        aria-hidden="true"
      >
        <svg
          className="h-4 w-4 shrink-0 text-amber-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM12 3.75l7.5 13.5h-15L12 3.75z"
          />
        </svg>
        <p className="text-[11px] font-extrabold text-amber-50 sm:text-xs">
          2 permits expiring within 14 days — reminders sent
        </p>
      </div>
      {/* mini KPI row */}
      <div className="mb-3 grid grid-cols-3 gap-2" aria-hidden="true">
        {[
          ["24", "Active"],
          ["2", "Expiring"],
          ["1", "Expired"],
        ].map(([n, l]) => (
          <div
            key={l}
            className="rounded-xl border-[1.5px] border-white/55 bg-white/[0.42] px-2 py-2 text-center dark:border-[#93C5FD]/[.55] dark:bg-[#0B1B3A]/[.78]"
          >
            <p className="text-base font-bold text-white sm:text-lg">{n}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-white">{l}</p>
          </div>
        ))}
      </div>
      {/* permit rows */}
      <div className="space-y-2" aria-hidden="true">
        {ROWS.map(([id, city, left, tone]) => (
          <div
            key={id}
            className="flex items-center justify-between gap-2 rounded-xl border-[1.5px] border-white/55 bg-white/[0.42] px-3 py-2 dark:border-[#93C5FD]/[.55] dark:bg-[#0B1B3A]/[.78]"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-extrabold text-white sm:text-xs">{id}</p>
              <p className="text-[10px] font-semibold text-white/95">{city}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${PILL[tone]}`}
            >
              {left}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
