import { describe, it, expect } from "vitest";
import {
  computeSmartBuffer,
  daysUntil,
  parseJurisdiction,
  smartBufferForPermit,
  urgencyFor,
  BUFFER_DAYS,
} from "./index";

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

describe("computeSmartBuffer", () => {
  it("subtracts processing days + 7-day buffer from the renewal deadline", () => {
    const renewal = isoPlus(60);
    const result = computeSmartBuffer({ renewalDeadline: renewal, processingDays: 24 });
    expect(result).not.toBeNull();
    // 60 - 24 - 7 = 29 days from today
    expect(result!.daysUntilApplyBy).toBe(29);
    expect(result!.processingDays).toBe(24);
    expect(result!.bufferDays).toBe(BUFFER_DAYS);
  });

  it("applies only the 7-day buffer when processing days are unknown", () => {
    const renewal = isoPlus(30);
    const result = computeSmartBuffer({ renewalDeadline: renewal, processingDays: null });
    expect(result).not.toBeNull();
    expect(result!.daysUntilApplyBy).toBe(23);
    expect(result!.processingDays).toBeNull();
  });

  it("returns null without a renewal deadline", () => {
    expect(computeSmartBuffer({ renewalDeadline: null, processingDays: 10 })).toBeNull();
    expect(computeSmartBuffer({ renewalDeadline: undefined })).toBeNull();
  });

  it("marks an apply-by date in the past as overdue", () => {
    const renewal = isoPlus(5); // 5 - 10 processing - 7 buffer = -12 days
    const result = computeSmartBuffer({ renewalDeadline: renewal, processingDays: 10 });
    expect(result!.urgency).toBe("overdue");
    expect(result!.daysUntilApplyBy).toBeLessThan(0);
  });

  it("labels urgency bands correctly", () => {
    expect(urgencyFor(-1)).toBe("overdue");
    expect(urgencyFor(0)).toBe("urgent");
    expect(urgencyFor(7)).toBe("urgent");
    expect(urgencyFor(8)).toBe("soon");
    expect(urgencyFor(30)).toBe("soon");
    expect(urgencyFor(31)).toBe("ok");
  });

  it("daysUntil is 0 for today and 1 for tomorrow", () => {
    expect(daysUntil(isoPlus(0))).toBe(0);
    expect(daysUntil(isoPlus(1))).toBe(1);
  });
});

describe("parseJurisdiction", () => {
  it('parses "Austin, TX" into city + state', () => {
    expect(parseJurisdiction("Austin, TX")).toEqual({ city: "Austin", stateCode: "TX" });
  });

  it("returns nulls for empty input", () => {
    expect(parseJurisdiction(null)).toEqual({ city: null, stateCode: null });
  });
});

describe("smartBufferForPermit", () => {
  it("uses verified Austin regulation data (no invented processing time)", () => {
    const out = smartBufferForPermit({
      renewal_deadline: isoPlus(60),
      jurisdiction: "Austin, TX",
    });
    // Austin's regulation row has no processing_days, so only the 7-day
    // buffer applies — but the regulation itself must be found.
    expect(out).not.toBeNull();
    expect(out!.regulation.city).toBe("Austin");
    expect(out!.buffer.processingDays).toBeNull();
    expect(out!.buffer.daysUntilApplyBy).toBe(53);
  });

  it("uses New York's published 24-day processing time", () => {
    const out = smartBufferForPermit({
      renewal_deadline: isoPlus(90),
      jurisdiction: "New York, NY",
    });
    expect(out).not.toBeNull();
    expect(out!.buffer.processingDays).toBe(24);
    expect(out!.buffer.daysUntilApplyBy).toBe(59); // 90 - 24 - 7
  });

  it("returns null for a jurisdiction with no regulation data", () => {
    expect(
      smartBufferForPermit({ renewal_deadline: isoPlus(60), jurisdiction: "Springfield, ZZ" })
    ).toBeNull();
  });

  it("returns null when the permit has no renewal deadline", () => {
    expect(
      smartBufferForPermit({ renewal_deadline: null, jurisdiction: "Austin, TX" })
    ).toBeNull();
  });
});
