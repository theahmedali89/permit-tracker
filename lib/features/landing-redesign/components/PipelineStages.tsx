import type { PipelineStage } from "../lib";

/**
 * Permit pipeline — the four stages from the approved preview,
 * driven by real counts from `buildPipelineStages()`. Stage cards
 * rise step by step (translateY) on desktop and stack vertically on
 * mobile, with the arrow rotating down. No invented data: a stage
 * with no example simply shows no example line.
 */
export function PipelineStages({ stages }: { stages: PipelineStage[] }) {
  const lifts = ["lg:translate-y-[30px]", "lg:translate-y-5", "lg:translate-y-2.5", "lg:translate-y-0"];
  const gradients = [
    "from-[#3B82F6] to-[#2563EB]",
    "from-[#2563EB] to-[#1D4ED8]",
    "from-[#1D4ED8] to-[#1E40AF]",
    "from-[#0E9488] to-[#14B8A6]",
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
        Your permit pipeline
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Every permit moves through the same four stages.
      </p>
      <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 lg:gap-3.5">
        {stages.map((stage, i) => (
          <li
            key={stage.key}
            className={`relative rounded-[18px] bg-gradient-to-[150deg] ${gradients[i]} p-5 text-white shadow-[0_16px_30px_rgba(30,64,175,0.25)] ${lifts[i]}`}
          >
            {i < stages.length - 1 && (
              <span
                className="absolute -bottom-[13px] right-6 z-10 grid h-[26px] w-[26px] place-items-center rounded-full border border-gray-200 bg-white text-sm font-black text-blue-600 shadow-md lg:-right-[13px] lg:bottom-auto lg:top-[22px] lg:rotate-0 dark:border-white/10"
                aria-hidden="true"
              >
                <span className="rotate-90 lg:rotate-0">→</span>
              </span>
            )}
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-white/85">
              {stage.stepNo}
            </p>
            <h3 className="mt-1 text-xl font-bold">{stage.label}</h3>
            <p className="mt-2.5 text-4xl font-black leading-none">
              {stage.count}{" "}
              <small className="text-sm font-semibold text-white/90">{stage.countLabel}</small>
            </p>
            {stage.example && (
              <p className="mt-3 border-t border-white/30 pt-3 text-[0.82rem] leading-relaxed">
                <b className="block text-[0.86rem]">{stage.example.title}</b>
                <span className="text-white/90">{stage.example.meta}</span>
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
