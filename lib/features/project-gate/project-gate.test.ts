import { describe, it, expect } from "vitest";
import { parseLinkBody, expiredItems } from "./index";

describe("parseLinkBody", () => {
  it("accepts a subcontractor id and trims it", () => {
    expect(parseLinkBody({ subcontractor_id: "  sub-123 " })).toEqual({
      subcontractorId: "sub-123",
    });
  });
  it("rejects a missing subcontractor_id", () => {
    expect(parseLinkBody({})).toEqual({ error: "subcontractor_id is required" });
    expect(parseLinkBody({ subcontractor_id: "" })).toEqual({
      error: "subcontractor_id is required",
    });
    expect(parseLinkBody({ subcontractor_id: "   " })).toEqual({
      error: "subcontractor_id is required",
    });
    expect(parseLinkBody({ subcontractor_id: 42 })).toEqual({
      error: "subcontractor_id is required",
    });
  });
  it("rejects a non-object body", () => {
    expect(parseLinkBody(null)).toEqual({ error: "Invalid JSON body" });
    expect(parseLinkBody("sub-123")).toEqual({ error: "Invalid JSON body" });
    expect(parseLinkBody(["sub-123"])).toEqual({ error: "Invalid JSON body" });
  });
});

describe("expiredItems (gate input)", () => {
  it("lists expired license and COI dates (field + document entries)", () => {
    const items = expiredItems(
      { license_expiration: "2020-01-05", coi_expiration: "2999-01-01" },
      [{ doc_type: "license", expiration_date: "2020-01-05" }]
    );
    // Legacy field and uploaded document produce differently-worded
    // entries for the same date — both are listed (dedup is exact-string).
    expect(items).toEqual([
      "License expired Jan 5, 2020",
      "License document expired Jan 5, 2020",
    ]);
  });
  it("returns an empty list when nothing is expired", () => {
    expect(
      expiredItems(
        { license_expiration: "2999-01-01", coi_expiration: "2999-06-01" },
        []
      )
    ).toEqual([]);
  });
});
