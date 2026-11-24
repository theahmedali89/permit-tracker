import { describe, expect, it } from "vitest";
import { isAdminRole, validateInvite } from "@/lib/features/team";

describe("validateInvite", () => {
  it("accepts a valid email + role and lowercases the email", () => {
    expect(validateInvite({ email: "Teammate@Example.com", role: "admin" })).toEqual({
      email: "teammate@example.com",
      role: "admin",
    });
  });

  it("rejects a bad email", () => {
    expect(() => validateInvite({ email: "not-an-email", role: "admin" })).toThrow(
      "Valid email required"
    );
  });

  it("rejects owner as an invitable role", () => {
    expect(() => validateInvite({ email: "a@b.com", role: "owner" })).toThrow(
      "Role must be admin or member"
    );
  });
});

describe("isAdminRole", () => {
  it("is true for owner/admin only", () => {
    expect(isAdminRole("owner")).toBe(true);
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("member")).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });
});
