import { describe, expect, it } from "vitest";
import { validateLicenseCreate } from "@/lib/features/licenses";

describe("validateLicenseCreate", () => {
  it("accepts a minimal valid body", () => {
    expect(validateLicenseCreate({ license_name: "GC License" })).toMatchObject({
      license_name: "GC License",
      license_number: null,
    });
  });

  it("rejects a missing license_name", () => {
    expect(() => validateLicenseCreate({})).toThrow("license_name");
  });

  it("rejects a bad renewal_date", () => {
    expect(() =>
      validateLicenseCreate({ license_name: "X", renewal_date: "not-a-date" })
    ).toThrow();
  });
});
