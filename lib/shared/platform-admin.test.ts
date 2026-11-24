import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getPlatformAdminEmails, isPlatformAdmin } from "./platform-admin";

const ORIGINAL_ENV = process.env.PLATFORM_ADMIN_EMAILS;

describe("getPlatformAdminEmails", () => {
  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = ORIGINAL_ENV;
  });

  it("parses a comma-separated list, lower-cased and trimmed", () => {
    process.env.PLATFORM_ADMIN_EMAILS = " Admin@Example.com , ops@example.com,, ";
    expect(getPlatformAdminEmails()).toEqual([
      "admin@example.com",
      "ops@example.com",
    ]);
  });
  it("returns an empty list when unset", () => {
    delete process.env.PLATFORM_ADMIN_EMAILS;
    expect(getPlatformAdminEmails()).toEqual([]);
  });
});

describe("isPlatformAdmin", () => {
  beforeEach(() => {
    process.env.PLATFORM_ADMIN_EMAILS = "admin@example.com";
  });
  afterEach(() => {
    if (ORIGINAL_ENV === undefined) delete process.env.PLATFORM_ADMIN_EMAILS;
    else process.env.PLATFORM_ADMIN_EMAILS = ORIGINAL_ENV;
    vi.restoreAllMocks();
  });

  it("returns true for an env-listed email (case-insensitive, no DB call)", async () => {
    // Env allow-list short-circuits before any DB lookup.
    expect(await isPlatformAdmin("ADMIN@example.com")).toBe(true);
    expect(await isPlatformAdmin(" admin@example.com ")).toBe(true);
  });
  it("returns false for null/undefined/empty email without touching the DB", async () => {
    expect(await isPlatformAdmin(null)).toBe(false);
    expect(await isPlatformAdmin(undefined)).toBe(false);
    expect(await isPlatformAdmin("")).toBe(false);
  });
  it("returns false for a non-listed email when the DB lookup fails", async () => {
    // No service-role keys in this test env, so the platform_admins
    // lookup fails and the check must fail closed (false), not throw.
    expect(await isPlatformAdmin("customer@example.com")).toBe(false);
  });
});
