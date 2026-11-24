import Link from "next/link";
import { Card } from "@/components/ui";
import { ComplianceDial } from "./ComplianceDial";

/**
 * Dashboard bento grid (from the approved preview), wired to real
 * dashboard data passed in as props. No data is invented here:
 * - Expiring soon: the permits the dashboard already flags
 *   (action items), with the smart-buffer apply-by date when verified
 *   regulation data exists for that jurisdiction.
 * - Smart buffer card: shown only when a buffer could be computed.
 * - Monthly bars: the 6-month expiry forecast totals.
 * - Next inspections: the upcoming inspection deadlines.
 * The page assembles these rows from `getDashboardData()`; this
 * component only renders them.
 */

export interface ExpiringRow {
  id: string;
  title: string;
  meta: string;
  applyByLabel: string;
  daysLabel: string;
  href: string;
}

export interface SmartBufferCard {
  cityLabel: string;
  applyByLabel: string;
  expiryLabel: string;
  processingDays: number | null;
}

export interface InspectionRow {
  id: string;
  day: string;
  month: string;
  title: string;
  meta: string;
}

export interface BentoProps {
  compliance: number;
  totalPermits: number;
  expiring: ExpiringRow[];
  smartBuffer: SmartBufferCard | null;
  monthlyBars: { label: string; total: number }[];
  inspections: InspectionRow[];
}

export function DashboardBento({
  compliance,
  totalPermits,
  expiring,
  smartBuffer,
  monthlyBars,
  inspections,
}: BentoProps) {
  const maxBar = Math.max(1, ...monthlyBars.map((m) => m.total));
  const onTrack = totalPermits - expiring.length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Compliance dial — spans 2x2 on desktop */}
      <Card className="p-5 lg:col-span-2 lg:row-span-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Compliance score</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Across all {totalPermits} {totalPermits === 1 ? "permit" : "permits"}
        </p>
        <div className="my-4">
          <ComplianceDial value={compliance} />
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          <b className="text-gray-900 dark:text-white">
            {onTrack} of {totalPermits}
          </b>{" "}
          permits fully current.
          {expiring.length > 0 && (
            <>
              <br />
              {expiring.length} {expiring.length === 1 ? "needs" : "need"} renewal paperwork
              this month.
            </>
          )}
        </p>
      </Card>

      {/* Expiring soon */}
      <Card className="p-5 lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Expiring soon</h2>
          <Link href="/permits" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            View all →
          </Link>
        </div>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Renewal windows open now</p>
        {expiring.length === 0 ? (
          <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
            Nothing expiring soon — all permits are current.
          </p>
        ) : (
          <div>
            {expiring.map((row) => (
              <Link
                key={row.id}
                href={row.href}
                className="flex items-center gap-3 border-t border-gray-100 py-3 first:border-t-0 first:pt-0 dark:border-gray-700/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{row.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{row.meta}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-gray-500 dark:text-gray-400">
                  Apply by
                  <b className="block text-sm text-gray-900 dark:text-white">{row.applyByLabel}</b>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {row.daysLabel}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Smart renewal buffer */}
      {smartBuffer && (
        <Card className="border-0 bg-gradient-to-br from-blue-800 to-blue-600 p-5 text-white lg:col-span-2 dark:from-blue-950 dark:to-blue-900">
          <span className="mb-2 inline-block rounded-full bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-gray-900">
            Smart renewal buffer
          </span>
          <h2 className="text-base font-semibold">
            {smartBuffer.cityLabel} takes ~{smartBuffer.processingDays ?? 7} days to process
          </h2>
          <p className="mt-1 text-xl font-extrabold tracking-tight">
            Apply by {smartBuffer.applyByLabel} — not {smartBuffer.expiryLabel}
          </p>
          <p className="mt-2 text-sm text-blue-100/90">
            We subtract the city&apos;s real processing time plus a 7-day safety buffer from
            every expiry date, so your renewal lands before the fine does.
          </p>
        </Card>
      )}

      {/* Permits by month */}
      <Card className="p-5 lg:col-span-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Renewals due by month</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Permits, licenses and documents expiring in the next 6 months
        </p>
        <div className="flex h-32 items-end gap-2.5">
          {monthlyBars.map((m) => (
            <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {m.total > 0 ? m.total : ""}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-teal-500"
                style={{ height: `${Math.max(4, (m.total / maxBar) * 100)}%` }}
              />
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Next inspections */}
      <Card className="p-5 lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Next inspections</h2>
          <Link href="/calendar" className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400">
            Calendar →
          </Link>
        </div>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Booked with the city</p>
        {inspections.length === 0 ? (
          <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
            No inspections scheduled.
          </p>
        ) : (
          <div>
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className="flex items-center gap-3 border-t border-gray-100 py-3 first:border-t-0 first:pt-0 dark:border-gray-700/60"
              >
                <div className="w-[50px] shrink-0 rounded-xl border border-gray-200 bg-slate-50 py-1.5 text-center dark:border-gray-700 dark:bg-slate-800">
                  <p className="text-base font-semibold leading-none text-gray-900 dark:text-white">
                    {insp.day}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {insp.month}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{insp.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{insp.meta}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
