import { describe, expect, it } from "vitest";
import { generateSlug } from "@/lib/shared/slug";

describe("generateSlug", () => {
  it("slugifies a name and appends a random suffix", () => {
    const slug = generateSlug("Acme Construction, LLC");
    expect(slug).toMatch(/^acme-construction-llc-[a-z0-9]{6}$/);
  });

  it("falls back to 'company' for empty input", () => {
    expect(generateSlug("")).toMatch(/^company-[a-z0-9]{6}$/);
    expect(generateSlug("!!!")).toMatch(/^company-[a-z0-9]{6}$/);
  });

  it("truncates the base to 40 chars", () => {
    const slug = generateSlug("a".repeat(100));
    expect(slug.startsWith("a".repeat(40))).toBe(true);
    expect(slug).toMatch(/^a{40}-[a-z0-9]{6}$/);
  });
});
