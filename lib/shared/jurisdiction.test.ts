import { describe, it, expect } from "vitest";
import { parseJurisdiction } from "./jurisdiction";
import { getRegulation, hasRegulationContent, REGULATION_DATA } from "./jurisdiction-data";

describe("parseJurisdiction", () => {
  it('parses "Austin, TX" into city + state', () => {
    expect(parseJurisdiction("Austin, TX")).toEqual({ city: "Austin", stateCode: "TX" });
  });
  it("returns a city with no state when there is no comma", () => {
    expect(parseJurisdiction("Austin")).toEqual({ city: "Austin", stateCode: null });
  });
  it("returns nulls for empty input", () => {
    expect(parseJurisdiction(null)).toEqual({ city: null, stateCode: null });
    expect(parseJurisdiction(undefined)).toEqual({ city: null, stateCode: null });
    expect(parseJurisdiction("")).toEqual({ city: null, stateCode: null });
  });
  it("uses the last segment as the state for multi-comma input", () => {
    expect(parseJurisdiction("New York, NY, USA")).toEqual({
      city: "New York",
      stateCode: "USA",
    });
  });
});

describe("getRegulation", () => {
  it("finds a regulation by state + city, case-insensitively", () => {
    expect(getRegulation("NY", "New York")?.city).toBe("New York");
    expect(getRegulation("ny", "new york")?.processing_days).toBe(24);
    expect(getRegulation("TX", "Austin")?.validity_days).toBe(180);
  });
  it("returns undefined for unknown jurisdictions and null cities", () => {
    expect(getRegulation("ZZ", "Springfield")).toBeUndefined();
    expect(getRegulation("TX", null)).toBeUndefined();
  });
  it("still covers all 20 cities", () => {
    expect(Object.keys(REGULATION_DATA)).toHaveLength(20);
  });
});

describe("hasRegulationContent", () => {
  it("is true when any substantive field is present", () => {
    expect(hasRegulationContent(getRegulation("NY", "New York")!)).toBe(true);
  });
  it("is true for Dallas and Denver after the 2026-11-24 enrichment", () => {
    expect(hasRegulationContent(getRegulation("TX", "Dallas")!)).toBe(true);
    expect(hasRegulationContent(getRegulation("CO", "Denver")!)).toBe(true);
  });
  it("is false for a bare row (Oklahoma City still has no verified fields)", () => {
    expect(hasRegulationContent(getRegulation("OK", "Oklahoma City")!)).toBe(false);
  });
});
