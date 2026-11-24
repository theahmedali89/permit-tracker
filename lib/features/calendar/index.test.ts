import { describe, expect, it } from "vitest";

// The OAuth state signer needs a secret (production sets
// OAUTH_STATE_SECRET / GOOGLE_CALENDAR_CLIENT_SECRET); without one,
// signState/verifyState refuse to work by design.
process.env.GOOGLE_CALENDAR_CLIENT_SECRET = "test-secret-for-unit-tests";

import {
  allDayEndDate,
  isCalendarAdminRole,
} from "@/lib/features/calendar";
import { signState, verifyState } from "@/lib/features/calendar/oauth";

describe("allDayEndDate", () => {
  it("returns the day after the due date (exclusive end)", () => {
    expect(allDayEndDate("2026-11-24")).toBe("2026-11-25");
    expect(allDayEndDate("2026-12-31")).toBe("2027-01-01");
    expect(allDayEndDate("2027-02-28")).toBe("2027-03-01");
  });
});

describe("isCalendarAdminRole", () => {
  it("is true for owner/admin only", () => {
    expect(isCalendarAdminRole("owner")).toBe(true);
    expect(isCalendarAdminRole("admin")).toBe(true);
    expect(isCalendarAdminRole("member")).toBe(false);
  });
});

describe("OAuth state signing", () => {
  it("round-trips: signState then verifyState returns the org id", () => {
    const state = signState("org-123");
    expect(verifyState(state)).toBe("org-123");
  });

  it("rejects tampered state", () => {
    const state = signState("org-123");
    const tampered = state.slice(0, -2) + "xx";
    expect(verifyState(tampered)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifyState("not-a-state")).toBeNull();
    expect(verifyState("")).toBeNull();
  });
});
