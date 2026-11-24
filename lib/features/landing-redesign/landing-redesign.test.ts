import { describe, expect, it } from "vitest";
import {
  buildJourneySteps,
  buildPipelineStages,
  complianceTone,
  monthlyBarTotals,
  shortDate,
} from "./lib";

describe("complianceTone", () => {
  it("is good at 90 and above", () => {
    expect(complianceTone(100)).toBe("good");
    expect(complianceTone(90)).toBe("good");
  });
  it("is warn from 70 to 89", () => {
    expect(complianceTone(89)).toBe("warn");
    expect(complianceTone(70)).toBe("warn");
  });
  it("is bad below 70", () => {
    expect(complianceTone(69)).toBe("bad");
    expect(complianceTone(0)).toBe("bad");
  });
});

describe("shortDate", () => {
  it("formats a valid date", () => {
    expect(shortDate("2026-12-18")).toBe("Dec 18, 2026");
  });
  it("returns null for missing or invalid dates", () => {
    expect(shortDate(null)).toBeNull();
    expect(shortDate(undefined)).toBeNull();
    expect(shortDate("not-a-date")).toBeNull();
  });
});

describe("buildPipelineStages", () => {
  it("maps real counts to the four stages", () => {
    const stages = buildPipelineStages({
      applied: { count: 9 },
      approved: { count: 7 },
      inspection: { count: 5, example: { title: "Rough-in", meta: "Nov 5, 9 AM" } },
      renewal: { count: 3 },
    });
    expect(stages.map((s) => s.label)).toEqual([
      "Applied",
      "Approved",
      "Inspection",
      "Renewal due",
    ]);
    expect(stages.map((s) => s.count)).toEqual([9, 7, 5, 3]);
    expect(stages[2].example?.title).toBe("Rough-in");
  });
  it("labels a stage with no example as having none", () => {
    const stages = buildPipelineStages({
      applied: { count: 0 },
      approved: { count: 0 },
      inspection: { count: 0 },
      renewal: { count: 0 },
    });
    expect(stages.every((s) => s.example === undefined)).toBe(true);
    expect(stages[0].countLabel).toBe("permits filed");
  });
  it("uses the singular label for one permit", () => {
    const stages = buildPipelineStages({
      applied: { count: 1 },
      approved: { count: 1 },
      inspection: { count: 1 },
      renewal: { count: 1 },
    });
    expect(stages[0].countLabel).toBe("permit filed");
    expect(stages[3].countLabel).toBe("needs renewal");
  });
});

describe("buildJourneySteps", () => {
  it("marks a pending permit as under review now, approved next", () => {
    const steps = buildJourneySteps(
      { status: "pending", created_at: "2026-08-28", expiration_date: null },
      null
    );
    expect(steps[0]).toMatchObject({ title: "Applied", state: "done", pill: "Done" });
    expect(steps[0].detail).toContain("Aug 28, 2026");
    expect(steps[1]).toMatchObject({ title: "Under review", state: "now", pill: "In progress" });
    expect(steps[2]).toMatchObject({ title: "Approved", state: "next", pill: "Up next" });
    expect(steps[3]).toMatchObject({ title: "Inspection", state: "next" });
    expect(steps[3].detail).toBe("No inspection scheduled yet.");
    expect(steps[4]).toMatchObject({ title: "Complete", state: "next" });
  });

  it("marks an active permit approved and an inspection with a date as now", () => {
    const steps = buildJourneySteps(
      { status: "active", created_at: "2026-08-28", expiration_date: "2027-09-14" },
      "2026-12-03"
    );
    expect(steps[1]).toMatchObject({ state: "done" });
    expect(steps[2]).toMatchObject({ state: "done" });
    expect(steps[2].detail).toContain("Sep 14, 2027");
    expect(steps[3]).toMatchObject({ state: "now", pill: "In progress" });
    expect(steps[3].detail).toContain("Dec 3, 2026");
    // Complete is never marked done — no completed status exists in the data.
    expect(steps[4].state).toBe("next");
  });

  it("does not invent dates when none exist", () => {
    const steps = buildJourneySteps({ status: "active" }, null);
    expect(steps[0].detail).toBe("Application on file.");
    expect(steps[2].detail).toBe("Permit issued.");
  });
});

describe("monthlyBarTotals", () => {
  it("sums permits + licenses + documents per month", () => {
    expect(
      monthlyBarTotals([
        { label: "Nov", permits: 2, licenses: 1, documents: 0 },
        { label: "Dec", permits: 0, licenses: 0, documents: 0 },
      ])
    ).toEqual([
      { label: "Nov", total: 3 },
      { label: "Dec", total: 0 },
    ]);
  });
});
