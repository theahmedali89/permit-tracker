import { describe, expect, it } from "vitest";
import { toCSV } from "@/lib/features/export";
import { tallyReportStatuses } from "@/lib/features/reports";

describe("toCSV", () => {
  it("quotes cells with commas/quotes/newlines", () => {
    expect(
      toCSV([{ a: 'say "hi", now', b: "line1\nline2" }], ["a", "b"])
    ).toBe('a,b\n"say ""hi"", now","line1\nline2"');
  });

  it("prefixes formula-injection cells with a single quote", () => {
    expect(toCSV([{ a: "=2+2" }, { a: "@cmd" }, { a: "-5" }, { a: "+7" }], ["a"])).toBe(
      "a\n'=2+2\n'@cmd\n'-5\n'+7"
    );
  });

  it("renders null/undefined as empty cells", () => {
    expect(toCSV([{ a: null, b: undefined, c: 0 }], ["a", "b", "c"])).toBe("a,b,c\n,,0");
  });
});

describe("tallyReportStatuses", () => {
  it("counts active/expiring/expired and totals", () => {
    expect(
      tallyReportStatuses([
        { status: "active" },
        { status: "expiring_soon" },
        { status: "expired" },
        { status: "closed" },
      ])
    ).toEqual({ total: 4, active: 1, expiring_soon: 1, expired: 1 });
  });
});
