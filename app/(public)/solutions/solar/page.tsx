import type { Metadata } from "next";
import { solutionMetadata, SolutionPage, type SolutionContent } from "../_shared";

const content: SolutionContent = {
  slug: "solar",
  trade: "Solar",
  title: "Solar permit tracking for installers — AHJ approvals, interconnection & inspections",
  description:
    "Solar contractors juggle AHJ permits, utility interconnection approvals, and inspection windows. Permit Warden tracks every deadline with automatic reminders — free to start.",
  ogAlt: "Permit Warden - Solar permit and interconnection deadline tracking",
  intro:
    "A residential or commercial solar install touches more deadlines than the panels on the roof suggest: the building or electrical permit from the local AHJ, the utility's interconnection application and permission to operate, and inspections that have to land in the right order. Miss one and the project slips — sometimes by weeks.",
  painPoints: [
    [
      "AHJ + utility timelines don't line up",
      "The city or county permit and the utility's interconnection process run on separate clocks, with separate paperwork. It's easy to be ready on one side and stalled on the other because an application expired or a follow-up got missed.",
    ],
    [
      "Permission-to-operate arrives by email",
      "Utility approvals and inspection scheduling confirmations land in the same inbox as everything else. When the person who filed the application isn't the person checking email, things get lost.",
    ],
    [
      "Inspections have to happen in sequence",
      "Rough inspection, final inspection, and utility witness tests often have a required order — and re-inspection windows if something fails. Keeping the sequence straight across several active jobs is a lot to hold in someone's head.",
    ],
    [
      "Multiple jurisdictions, multiple rules",
      "Solar crews frequently work across city and county lines, and each AHJ has its own permit types and timelines. One list per jurisdiction is one list too many to check by hand.",
    ],
  ],
  features: [
    ["Track every approval in one dashboard", "Log the AHJ permit, the interconnection application, permission-to-operate, and each inspection as separate deadlines — all visible on one screen per project."],
    ["Reminders before things lapse", "Get email reminders ahead of permit expirations, inspection windows, and follow-up dates, so an expired approval never stalls a job."],
    ["Forward notices into one place", "AHJ and utility emails forward into your account instead of getting buried under quotes and invoices."],
    ["Shared visibility for the team", "Office staff, project managers, and field crews see the same status — no more calling the office to ask whether the permit cleared."],
  ],
  faqs: [
    [
      "Can Permit Warden track utility interconnection applications?",
      "Yes. Anything with a deadline works — interconnection applications, permission-to-operate, net metering approvals, and the permits and inspections around them. You set the dates and the reminder schedule; Permit Warden watches them.",
    ],
    [
      "We work in several cities and counties. Can we track them all?",
      "Yes. Each deadline records its jurisdiction, so you can track permits from every AHJ and utility you work with in one dashboard and filter by jurisdiction when needed.",
    ],
    [
      "Does this replace our CRM or project management software?",
      "No — it complements them. Permit Warden is focused specifically on permit, license, and inspection deadlines and the reminders around them, which most CRMs don't handle well.",
    ],
    [
      "Is there really a free option?",
      "Yes — you can create an account and start tracking deadlines free. See the signup page for current plan details.",
    ],
  ],
};

export const metadata: Metadata = solutionMetadata(content);

export default function SolarSolutionPage() {
  return <SolutionPage content={content} />;
}
