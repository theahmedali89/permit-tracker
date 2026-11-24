import { describe, expect, it } from "vitest";
import { validateInspectionCreate } from "@/lib/features/inspections";
import { applyInspectionFailUpdate } from "@/lib/features/inspections/fail-workflow";

describe("validateInspectionCreate", () => {
  it("accepts a minimal valid body", () => {
    expect(
      validateInspectionCreate({ inspection_type: "Framing" })
    ).toMatchObject({ inspection_type: "Framing", project_id: null });
  });

  it("rejects a missing inspection_type", () => {
    expect(() => validateInspectionCreate({})).toThrow("inspection_type");
  });
});

describe("fail-workflow (moved from inspection-workflow)", () => {
  it("is the same implementation the inspection-workflow shim re-exports", async () => {
    const shim = await import("@/lib/features/inspection-workflow");
    expect(shim.applyInspectionFailUpdate).toBe(applyInspectionFailUpdate);
  });
});
