import { describe, expect, it } from "vitest";
import { validateImportRows } from "@/lib/features/import";

describe("validateImportRows", () => {
  it("keeps valid rows and reports missing permit_type with line numbers", () => {
    const { validRows, errors } = validateImportRows([
      { permit_type: "Building", issue_date: "2026-01-15" },
      { permit_type: "", issue_date: "2026-01-15" },
      { permit_type: "Electrical", renewal_deadline: "15/06/2026" },
    ]);
    expect(validRows).toHaveLength(1);
    expect(errors).toEqual([
      "Row 3: missing permit_type, skipped",
      'Row 4: invalid renewal_deadline "15/06/2026" (use YYYY-MM-DD), skipped',
    ]);
  });

  it("accepts empty dates", () => {
    const { validRows, errors } = validateImportRows([
      { permit_type: "Building", issue_date: "" },
    ]);
    expect(validRows).toHaveLength(1);
    expect(errors).toEqual([]);
  });
});
