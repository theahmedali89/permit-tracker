import type { Metadata } from "next";
import { solutionMetadata, SolutionPage, type SolutionContent } from "../_shared";

const content: SolutionContent = {
  slug: "roofing",
  trade: "Roofing",
  title: "Roofing permit tracking — storm-season inspections & multi-job deadlines",
  description:
    "Roofing contractors face storm-season inspection backlogs and permits across many jobs at once. Permit Warden tracks every permit, license, and inspection deadline with automatic reminders.",
  ogAlt: "Permit Warden - Roofing permit and inspection deadline tracking",
  intro:
    "Roofing work runs on volume and timing: several jobs at different stages, permits pulled in multiple jurisdictions, and inspections that decide when the next phase starts. When storm season hits, inspection schedules back up — and any permit you forgot about becomes a problem at the worst possible moment.",
  painPoints: [
    [
      "Storm season swamps inspection schedules",
      "After major storms, everyone is filing permits and requesting inspections at once. Backlogs mean longer waits — and a permit that expired while you waited for the inspector is a headache you don't need.",
    ],
    [
      "Many jobs, many permits, one person keeping track",
      "A busy roofing crew can have a dozen or more active jobs, each with its own permit status. Tracking that in a spreadsheet — or worse, in someone's head — breaks down exactly when business is best.",
    ],
    [
      "Emergency repairs still need permits",
      "Storm-damage and emergency repair work often qualifies for expedited or emergency permits, but the paperwork and any follow-up inspections still have deadlines attached.",
    ],
    [
      "Licenses and insurance renewals run in the background",
      "Contractor licenses, trade registrations, and the insurance certificates jurisdictions ask for all renew on their own schedules — separate from any job's permits.",
    ],
  ],
  features: [
    ["One dashboard for every active job", "Log each job's permits and inspections with their jurisdiction and dates. See at a glance what's active, what's due, and what's overdue."],
    ["Reminders ahead of expirations", "Email reminders before permits and licenses expire — especially useful when inspection backlogs push schedules out."],
    ["Forward AHJ notices into one place", "Permit approvals, inspection results, and renewal notices forward into your account instead of getting buried in the inbox."],
    ["Shared visibility for office and field", "Crews see which permits are active before they roll; the office sees what's pending without phone calls."],
  ],
  faqs: [
    [
      "Can we track permits for many jobs at once?",
      "Yes. That's the core use case — each permit or inspection is its own deadline with its own dates, jurisdiction, and reminder schedule, all on one dashboard.",
    ],
    [
      "Does Permit Warden schedule inspections with the AHJ?",
      "No — scheduling stays with the jurisdiction's own system or phone line. Permit Warden tracks the dates and windows around those inspections and reminds you before they lapse.",
    ],
    [
      "We also do gutters and siding. Can we track those permits too?",
      "Yes. Any permit, license, or inspection with a deadline works — roofing, gutters, siding, or anything else your crew pulls permits for.",
    ],
    [
      "Is there really a free option?",
      "Yes — you can create an account and start tracking deadlines free. See the signup page for current plan details.",
    ],
  ],
};

export const metadata: Metadata = solutionMetadata(content);

export default function RoofingSolutionPage() {
  return <SolutionPage content={content} />;
}
