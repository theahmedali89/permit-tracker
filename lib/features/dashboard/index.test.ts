import { describe, expect, it } from "vitest";
import {
  buildForecast,
  computeCompliance,
  tallyStatusCounts,
} from "@/lib/features/dashboard";

describe("tallyStatusCounts", () => {
  it("counts known statuses and ignores unknown ones", () => {
    expect(
      tallyStatusCounts([
        { status: "active" },
        { status: "active" },
        { status: "expired" },
        { status: "renewal_overdue" },
        { status: "closed" },
      ])
    ).toEqual({ active: 2, pending: 0, expiring_soon: 0, expired: 1 });
  });

  it("returns zeros for null", () => {
    expect(tallyStatusCounts(null)).toEqual({
      active: 0,
      pending: 0,
      expiring_soon: 0,
      expired: 0,
    });
  });
});

describe("computeCompliance", () => {
  it("is 100 with no permits", () => {
    expect(
      computeCompliance({ active: 0, pending: 0, expiring_soon: 0, expired: 0 })
    ).toBe(100);
  });

  it("weights expiring_soon at half and expired at zero", () => {
    // 1 active (100) + 1 expiring (50) + 1 expired (0) = 150/300 = 50%
    expect(
      computeCompliance({ active: 1, pending: 0, expiring_soon: 1, expired: 1 })
    ).toBe(50);
  });

  it("never tanks to 0% on expiring permits alone", () => {
    expect(
      computeCompliance({ active: 0, pending: 0, expiring_soon: 2, expired: 0 })
    ).toBe(50);
  });
});

describe("buildForecast", () => {
  it("buckets expiries by YYYY-MM month over 6 months", () => {
    const now = new Date("2026-11-15T12:00:00");
    const forecast = buildForecast(
      [{ expiration_date: "2026-11-20" }, { expiration_date: "2027-01-05" }],
      [{ expiration_date: "2026-12-01" }],
      [{ expiry_date: "2026-11-30" }],
      now
    );
    expect(forecast).toHaveLength(6);
    expect(forecast[0]).toMatchObject({ label: "Nov", permits: 1, documents: 1 });
    expect(forecast[1]).toMatchObject({ label: "Dec", licenses: 1 });
    expect(forecast[2]).toMatchObject({ label: "Jan", permits: 1 });
    expect(forecast[5]).toMatchObject({ label: "Apr", permits: 0 });
  });
});
