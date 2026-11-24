import { describe, expect, it } from "vitest";
import { validateProjectCreate } from "@/lib/features/projects";

describe("validateProjectCreate", () => {
  it("accepts a minimal valid body and defaults status to active", () => {
    expect(validateProjectCreate({ name: "Kitchen Remodel" })).toMatchObject({
      name: "Kitchen Remodel",
      status: "active",
    });
  });

  it("rejects a missing name", () => {
    expect(() => validateProjectCreate({})).toThrow("name");
  });

  it("rejects an unknown status", () => {
    expect(() =>
      validateProjectCreate({ name: "X", status: "bogus" })
    ).toThrow();
  });
});
