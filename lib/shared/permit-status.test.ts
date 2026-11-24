import { describe, it, expect } from "vitest";
import { calculatePermitStatus, daysUntilDate, parseLocalNoon } from "./permit-status";

/** YYYY-MM-DD string for a local date `offsetDays` from today. */
function localDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("calculatePermitStatus", () => {
  it("returns pending when no expiration date", () => {
    expect(calculatePermitStatus(null, null)).toBe("pending");
  });

  it("returns expired for past dates", () => {
    expect(calculatePermitStatus(localDateStr(-5), null)).toBe("expired");
  });

  it("returns expiring_soon for dates within 30 days", () => {
    expect(calculatePermitStatus(localDateStr(15), null)).toBe("expiring_soon");
  });

  it("returns active for dates beyond 30 days", () => {
    expect(calculatePermitStatus(localDateStr(60), null)).toBe("active");
  });

  it("returns renewal_overdue when the renewal deadline passed but expiry has not", () => {
    expect(calculatePermitStatus(localDateStr(60), localDateStr(-1))).toBe("renewal_overdue");
  });

  it("never returns plain active once the renewal deadline has passed", () => {
    const status = calculatePermitStatus(localDateStr(90), localDateStr(-10));
    expect(status).not.toBe("active");
    expect(status).toBe("renewal_overdue");
  });

  it("returns expiring_soon when the renewal deadline is within 30 days", () => {
    expect(calculatePermitStatus(localDateStr(90), localDateStr(10))).toBe("expiring_soon");
  });

  it("returns expired even when the renewal deadline is still in the future", () => {
    expect(calculatePermitStatus(localDateStr(-2), localDateStr(30))).toBe("expired");
  });

  it("returns active when both expiry and renewal are far out", () => {
    expect(calculatePermitStatus(localDateStr(120), localDateStr(90))).toBe("active");
  });

  it("treats today as expiring_soon, not expired", () => {
    expect(calculatePermitStatus(localDateStr(0), null)).toBe("expiring_soon");
  });
});

describe("daysUntilDate / parseLocalNoon (timezone safety)", () => {
  it("parses YYYY-MM-DD as local noon, not UTC midnight", () => {
    const parsed = parseLocalNoon("2026-01-15");
    expect(parsed.getHours()).toBe(12);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(0);
    expect(parsed.getDate()).toBe(15);
  });

  it("counts whole days from today", () => {
    expect(daysUntilDate(localDateStr(7))).toBe(7);
    expect(daysUntilDate(localDateStr(-3))).toBe(-3);
    expect(daysUntilDate(localDateStr(0))).toBe(0);
  });
});
