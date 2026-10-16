import type { Metadata } from "next";
import { solutionMetadata, SolutionPage, type SolutionContent } from "../_shared";

const content: SolutionContent = {
  slug: "electrical",
  trade: "Electrical",
  title: "Electrical permit tracking — trade licenses, permits & inspection windows",
  description:
    "Electrical contractors track trade-license renewals, permits per job, and inspection windows across jurisdictions. Permit Warden tracks every deadline with automatic reminders.",
  ogAlt: "Permit Warden - Electrical permit and license deadline tracking",
  intro:
    "Electricians manage two kinds of deadlines at once: the trade licenses and registrations that keep you legally working, and the permits and inspections tied to each job. They renew on different cycles, through different agencies — and letting either one lapse can stop work cold.",
  painPoints: [
    [
      "Trade-license renewals sneak up",
      "Journeyman and master licenses, contractor registrations, and local business licenses each renew on their own cycle. The renewal notice arrives by mail or email months ahead — and is easy to forget until the work stops.",
    ],
    [
      "Permits and inspections per job, per jurisdiction",
      "Electrical permits, rough-in inspections, and final inspections attach to each job, in each city or county's system. Small jobs get the same paperwork burden as big ones.",
    ],
    [
      "Continuing education tied to renewals",
      "Many states tie license renewal to continuing-education hours. Tracking when the hours are due alongside the license itself keeps renewals from getting rejected.",
    ],
    [
      "Apprentice registrations add another list",
      "Shops with apprentices often carry apprentice registrations or trainee cards with their own renewal dates — one more list that nobody wants to maintain by hand.",
    ],
  ],
  features: [
    ["Licenses and permits in one place", "Track trade licenses, contractor registrations, permits, and inspections together — each with its own jurisdiction, dates, and reminder schedule."],
    ["Renewal reminders with lead time", "Set reminders weeks or months ahead of renewals, with room to complete continuing education or gather paperwork first."],
    ["Forward notices into one place", "Renewal notices, approval emails, and inspection results forward into your account instead of getting buried in the inbox."],
    ["Shared visibility for the shop", "Office staff and field electricians see the same status — which licenses are current and which jobs are permitted.",
    ],
  ],
  faqs: [
    [
      "Can Permit Warden track our trade licenses and continuing-education deadlines?",
      "Yes. Any deadline works — state licenses, local registrations, apprentice cards, continuing-education due dates, permits, and inspections. You set the dates and reminder lead times.",
    ],
    [
      "We do work in several states. Is that supported?",
      "Yes. Each deadline records its jurisdiction, so multi-state and multi-city tracking lives in one dashboard and can be filtered by jurisdiction.",
    ],
    [
      "Does Permit Warden file renewals or permits for us?",
      "No — filing stays with you through the AHJ or licensing board. Permit Warden tracks the deadlines and reminds you before they arrive.",
    ],
    [
      "Is there really a free option?",
      "Yes — you can create an account and start tracking deadlines free. See the signup page for current plan details.",
    ],
  ],
};

export const metadata: Metadata = solutionMetadata(content);

export default function ElectricalSolutionPage() {
  return <SolutionPage content={content} />;
}
