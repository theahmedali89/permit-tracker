import { describe, it, expect } from "vitest";
import { calculatePermitStatus } from "./permit-status";

describe("calculatePermitStatus", () => {
  it("returns pending when no expiration date", () => {
    expect(calculatePermitStatus(null, null)).toBe("pending");
  });

  it("returns expired for past dates", () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    expect(calculatePermitStatus(past.toISOString().split("T")[0], null)).toBe("expired");
  });

  it("returns expiring_soon for dates within 30 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 15);
    expect(calculatePermitStatus(soon.toISOString().split("T")[0], null)).toBe("expiring_soon");
  });

  it("returns active for dates beyond 30 days", () => {
    const future = new Date();
    future.setDate(future.getDate() + 60);
    expect(calculatePermitStatus(future.toISOString().split("T")[0], null)).toBe("active");
  });
});
