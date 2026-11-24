import { describe, it, expect } from "vitest";
import {
  FEATURE_REGISTRY,
  FeatureDisabledError,
  isFeatureEnabled,
  requireFeatureEnabled,
} from "./registry";

describe("isFeatureEnabled", () => {
  it("returns true for enabled features", () => {
    expect(isFeatureEnabled("billing")).toBe(true);
    expect(isFeatureEnabled("reminders")).toBe(true);
    expect(isFeatureEnabled("import")).toBe(true);
  });
  it("returns false for the disabled sms-escalation feature", () => {
    expect(isFeatureEnabled("sms-escalation")).toBe(false);
  });
  it("defaults unknown ids to enabled so unregistered code keeps working", () => {
    expect(isFeatureEnabled("does-not-exist")).toBe(true);
  });
  it("has no duplicate entry ids", () => {
    const ids = FEATURE_REGISTRY.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("registers the reminders and import entries with their routes", () => {
    const reminders = FEATURE_REGISTRY.find((f) => f.id === "reminders");
    expect(reminders?.routes).toEqual(["/api/cron/reminders"]);
    expect(reminders?.envKeys).toContain("CRON_SECRET");
    const imp = FEATURE_REGISTRY.find((f) => f.id === "import");
    expect(imp?.routes).toEqual(["/api/permits/import"]);
    expect(imp?.tables).toEqual(["permits", "deadlines", "audit_events"]);
  });
});

describe("requireFeatureEnabled", () => {
  it("does not throw for an enabled feature", () => {
    expect(() => requireFeatureEnabled("billing")).not.toThrow();
  });
  it("throws a 503 FeatureDisabledError for a disabled feature", () => {
    let caught: unknown;
    try {
      requireFeatureEnabled("sms-escalation");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(FeatureDisabledError);
    expect((caught as FeatureDisabledError).status).toBe(503);
    expect((caught as Error).message).toContain("sms-escalation");
  });
  it("does not throw for unknown ids (default enabled)", () => {
    expect(() => requireFeatureEnabled("does-not-exist")).not.toThrow();
  });
});
