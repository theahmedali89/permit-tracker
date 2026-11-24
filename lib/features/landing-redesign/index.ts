/**
 * Landing redesign — merged 3D hero + bento dashboard + modern
 * sign-in, built from the approved preview
 * (permit-warden-complete.html) as real project code.
 *
 * Pure logic lives in `./lib`; components live in `./components`.
 * Pages import from this barrel only. This feature never imports
 * another feature — the dashboard page assembles real data itself
 * (via `lib/features/dashboard` + `lib/features/smart-buffer`) and
 * passes it in as props.
 */
export {
  buildJourneySteps,
  buildPipelineStages,
  complianceTone,
  monthlyBarTotals,
  shortDate,
} from "./lib";
export type {
  ComplianceTone,
  JourneyPermit,
  JourneyState,
  JourneyStep,
  PipelineInput,
  PipelineStage,
  StageExample,
} from "./lib";

export { ThemeToggle } from "./components/ThemeToggle";
export { HeroScene } from "./components/HeroScene";
export { DashboardMockup } from "./components/DashboardMockup";
export { ComplianceDial } from "./components/ComplianceDial";
export { DashboardBento } from "./components/DashboardBento";
export type {
  BentoProps,
  ExpiringRow,
  InspectionRow,
  SmartBufferCard,
} from "./components/DashboardBento";
export { PipelineStages } from "./components/PipelineStages";
export { JourneyTimeline } from "./components/JourneyTimeline";
export { LoginArt } from "./components/LoginArt";
