import { describe, it, expect } from "vitest";
import { applyByDate, daysUntil, parseDate, toDateString } from "./dates";

function isoPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

describe("parseDate / toDateString", () => {
  it("round-trips a YYYY-MM-DD date without a UTC shift", () => {
    expect(toDateString(parseDate("2026-11-24"))).toBe("2026-11-24");
    expect(toDateString(parseDate("2026-01-05"))).toBe("2026-01-05");
  });
});

describe("daysUntil", () => {
  it("is 0 for today, 1 for tomorrow, -1 for yesterday", () => {
    expect(daysUntil(isoPlus(0))).toBe(0);
    expect(daysUntil(isoPlus(1))).toBe(1);
    expect(daysUntil(isoPlus(-1))).toBe(-1);
  });
  it("matches lib/permit-status daysUntilDate (local-noon semantics)", async () => {
    const { daysUntilDate } = await import("@/lib/shared/permit-status");
    for (const d of [-30, -1, 0, 1, 7, 30, 90, 365]) {
      expect(daysUntil(isoPlus(d))).toBe(daysUntilDate(isoPlus(d)));
    }
  });
});

describe("applyByDate", () => {
  it("subtracts processing days + the 7-day buffer", () => {
    const out = applyByDate(isoPlus(60), 24);
    expect(out.processingDays).toBe(24);
    expect(daysUntil(out.applyByDate)).toBe(29); // 60 - 24 - 7
  });
  it("applies only the 7-day buffer when processing days are unknown", () => {
    const out = applyByDate(isoPlus(30), null);
    expect(out.processingDays).toBeNull();
    expect(daysUntil(out.applyByDate)).toBe(23);
  });
  it("treats zero/negative processing days as unknown", () => {
    expect(applyByDate(isoPlus(30), 0).processingDays).toBeNull();
    expect(applyByDate(isoPlus(30), -5).processingDays).toBeNull();
    expect(daysUntil(applyByDate(isoPlus(30), 0).applyByDate)).toBe(23);
  });
  it("rounds fractional processing days", () => {
    expect(applyByDate(isoPlus(30), 10.6).processingDays).toBe(11);
  });
});
