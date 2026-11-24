import { describe, it, expect } from "vitest";
import { parseCsv } from "./csv-parser";

describe("parseCsv", () => {
  it("parses a simple CSV with headers", () => {
    const { rows, errors } = parseCsv("permit_type,permit_number\nBuilding,2026-001\n");
    expect(errors).toEqual([]);
    expect(rows).toEqual([{ permit_type: "Building", permit_number: "2026-001" }]);
  });

  it("handles quoted fields containing commas (the Austin, TX case)", () => {
    const { rows } = parseCsv(
      'permit_type,jurisdiction\nBuilding,"Austin, TX"\n'
    );
    expect(rows[0].jurisdiction).toBe("Austin, TX");
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const { rows } = parseCsv('notes\n"Say ""hello"" to the inspector"\n');
    expect(rows[0].notes).toBe('Say "hello" to the inspector');
  });

  it("handles CRLF line endings", () => {
    const { rows } = parseCsv("a,b\r\n1,2\r\n3,4\r\n");
    expect(rows).toEqual([
      { a: "1", b: "2" },
      { a: "3", b: "4" },
    ]);
  });

  it("handles newlines inside quoted fields", () => {
    const { rows } = parseCsv('a,b\n"line one\nline two",2\n');
    expect(rows[0].a).toBe("line one\nline two");
  });

  it("reports rows with the wrong column count and skips them", () => {
    const { rows, errors } = parseCsv("a,b\n1,2,3\n4,5\n");
    expect(rows).toEqual([{ a: "4", b: "5" }]);
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/Row 2/);
  });

  it("enforces the row cap", () => {
    const text = "a\n" + Array.from({ length: 5 }, (_, i) => String(i)).join("\n");
    const { rows, errors } = parseCsv(text, { maxRows: 3 });
    expect(rows.length).toBe(3);
    expect(errors[0]).toMatch(/Row limit of 3 exceeded/);
  });

  it("returns an error for empty input", () => {
    const { rows, errors } = parseCsv("   \n");
    expect(rows).toEqual([]);
    expect(errors).toEqual(["CSV is empty"]);
  });

  it("lower-cases and trims headers", () => {
    const { rows } = parseCsv(" Permit_Type , Jurisdiction \nBuilding,Austin\n");
    expect(rows[0]).toEqual({ permit_type: "Building", jurisdiction: "Austin" });
  });
});
