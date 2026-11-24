import { describe, expect, it } from "vitest";
import {
  sanitizeCustomFields,
  validatePermitCreate,
} from "@/lib/features/permits";

describe("validatePermitCreate", () => {
  it("accepts a minimal valid body and defaults source_type", () => {
    expect(
      validatePermitCreate({ permit_type: "Building" })
    ).toMatchObject({
      permit_type: "Building",
      project_id: null,
      source_type: "user_provided",
    });
  });

  it("rejects a missing permit_type", () => {
    expect(() => validatePermitCreate({})).toThrow("permit_type");
  });

  it("rejects an unknown source_type", () => {
    expect(() =>
      validatePermitCreate({ permit_type: "Building", source_type: "bogus" })
    ).toThrow("source_type must be one of");
  });

  it("rejects a bad date", () => {
    expect(() =>
      validatePermitCreate({ permit_type: "Building", issue_date: "15/01/2026" })
    ).toThrow();
  });
});

describe("sanitizeCustomFields", () => {
  it("keeps only string values, trims keys to 64 and values to 500 chars", () => {
    expect(
      sanitizeCustomFields({
        "  job  ": "x".repeat(600),
        count: 3,
        nested: { a: 1 },
        arr: ["a"],
        ok: "fine",
      })
    ).toEqual({ job: "x".repeat(500), ok: "fine" });
  });

  it("returns {} for non-objects", () => {
    expect(sanitizeCustomFields(null)).toEqual({});
    expect(sanitizeCustomFields("nope")).toEqual({});
    expect(sanitizeCustomFields(["a"])).toEqual({});
  });
});
