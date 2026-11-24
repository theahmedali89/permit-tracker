import { describe, expect, it } from "vitest";


import { buildOrganizationUpdates } from "@/lib/features/settings";

describe("buildOrganizationUpdates", () => {
  it("trims text fields and nulls blank ones", () => {
    expect(
      buildOrganizationUpdates({ name: "  Acme  ", trade: "", state: "TX" })
    ).toEqual({ name: "Acme", trade: null, state: "TX" });
  });

  it("coerces toggles to strict booleans", () => {
    expect(
      buildOrganizationUpdates({
        compliance_passport_public: "yes",
        sms_escalation_enabled: true,
      })
    ).toEqual({
      compliance_passport_public: false,
      sms_escalation_enabled: true,
    });
  });

  it("ignores unknown fields", () => {
    expect(buildOrganizationUpdates({ plan: "pro", name: "Acme" })).toEqual({
      name: "Acme",
    });
  });

  it("returns {} for an empty body", () => {
    expect(buildOrganizationUpdates({})).toEqual({});
  });
});
