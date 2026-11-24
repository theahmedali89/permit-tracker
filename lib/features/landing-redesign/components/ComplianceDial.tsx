import { complianceTone } from "../lib";

/**
 * Compliance dial — conic-gradient ring (blue → teal) over a track
 * circle, with the score in the middle. The track is the outer
 * circle's background; the gradient layer is transparent past the
 * score so the track shows through in both themes. Purely
 * presentational; pass the real score in.
 */
export function ComplianceDial({
  value,
  size = 184,
  label = "ON TRACK",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const tone = complianceTone(clamped);
  const inner = size - 42;
  return (
    <div
      className="relative mx-auto rounded-full bg-slate-200 dark:bg-[#1E3A5F]"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Compliance score ${clamped} percent`}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, #2563EB 0%, #14B8A6 ${clamped}%, transparent ${clamped}% 100%)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 grid place-items-center">
        <div
          className="grid place-items-center rounded-full bg-white text-center dark:bg-gray-800"
          style={{ width: inner, height: inner }}
        >
          <div>
            <b
              className={`block leading-none ${
                tone === "good"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : tone === "warn"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
              }`}
              style={{ fontSize: size >= 180 ? "2.2rem" : "1.6rem", letterSpacing: "-0.03em" }}
            >
              {clamped}%
            </b>
            <span className="mt-1 block text-[0.72rem] font-extrabold tracking-[0.08em] text-gray-500 dark:text-gray-400">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
