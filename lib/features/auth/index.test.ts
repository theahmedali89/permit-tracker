import { describe, expect, it } from "vitest";
import {
  AuthRateLimitedError,
  exchangeCodeForSession,
  requestPasswordReset,
  safeNextPath,
  signInWithPassword,
  signUp,
} from "@/lib/features/auth";

function fakeAuth(overrides: Record<string, unknown> = {}) {
  return {
    auth: {
      signInWithPassword: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ error: null }),
      signOut: async () => ({}),
      ...overrides,
    },
  };
}

describe("safeNextPath", () => {
  it("allows in-app paths", () => {
    expect(safeNextPath("/permits")).toBe("/permits");
    expect(safeNextPath("/reset-password/confirm")).toBe("/reset-password/confirm");
  });

  it("rejects protocol-relative, absolute and backslash paths", () => {
    expect(safeNextPath("//evil.com")).toBe("/dashboard");
    expect(safeNextPath("https://evil.com")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.com")).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
  });
});

describe("signInWithPassword", () => {
  it("redirects to /dashboard on success", async () => {
    await expect(
      signInWithPassword(fakeAuth() as never, "10.0.0.1", "a@b.com", "secret")
    ).resolves.toBe("/dashboard");
  });

  it("redirects back with the error on failure", async () => {
    const supabase = fakeAuth({
      signInWithPassword: async () => ({ error: { message: "Invalid login" } }),
    });
    await expect(
      signInWithPassword(supabase as never, "10.0.0.2", "a@b.com", "wrong")
    ).resolves.toBe("/signin?error=Invalid%20login");
  });

  it("rate-limits after 10 attempts from one IP", async () => {
    const ip = `10.0.0.${Math.floor(Math.random() * 100000)}`;
    const supabase = fakeAuth() as never;
    for (let i = 0; i < 10; i++) {
      await signInWithPassword(supabase, ip, "a@b.com", "secret");
    }
    await expect(
      signInWithPassword(supabase, ip, "a@b.com", "secret")
    ).rejects.toBeInstanceOf(AuthRateLimitedError);
  });
});

describe("signUp / requestPasswordReset / exchangeCodeForSession", () => {
  it("signUp redirects to signin with a verify message", async () => {
    await expect(
      signUp(fakeAuth() as never, "10.0.1.1", "a@b.com", "secret")
    ).resolves.toBe("/signin?message=Check your email to verify your account");
  });

  it("requestPasswordReset redirects to signin with a sent message", async () => {
    await expect(
      requestPasswordReset(fakeAuth() as never, "10.0.1.2", "a@b.com")
    ).resolves.toBe("/signin?message=Password reset email sent. Check your inbox.");
  });

  it("exchangeCodeForSession honours a safe next path and rejects failures", async () => {
    await expect(
      exchangeCodeForSession(fakeAuth() as never, "code-1", "/permits")
    ).resolves.toBe("/permits");
    const failing = fakeAuth({
      exchangeCodeForSession: async () => ({ error: { message: "bad code" } }),
    });
    await expect(
      exchangeCodeForSession(failing as never, "code-1", "/permits")
    ).resolves.toBe("/signin?error=Could not verify email");
    await expect(
      exchangeCodeForSession(fakeAuth() as never, null, "/permits")
    ).resolves.toBe("/signin?error=Could not verify email");
  });
});
