import { describe, it, expect } from "vitest";
import {
  DEFAULT_REMINDER_OFFSETS,
  getDueOffset,
  offsetsAlreadySent,
  offsetsFromRules,
  shouldSendReminder,
} from "./reminder-window";

describe("getDueOffset", () => {
  it("returns the smallest offset >= remaining days", () => {
    expect(getDueOffset(45)).toBe(60);
    expect(getDueOffset(30)).toBe(30);
    expect(getDueOffset(8)).toBe(14);
    expect(getDueOffset(1)).toBe(1);
  });

  it("returns null when the deadline is further out than every offset", () => {
    expect(getDueOffset(120)).toBeNull();
    expect(getDueOffset(91)).toBeNull();
  });

  it("maps overdue / due-today deadlines to the smallest offset", () => {
    expect(getDueOffset(0)).toBe(1);
    expect(getDueOffset(-5)).toBe(1);
  });
});

describe("shouldSendReminder (window logic)", () => {
  it("sends when the current window has not been sent yet", () => {
    // 45 days out: inside the 60-day window; only the 90-day went out.
    expect(shouldSendReminder(45, DEFAULT_REMINDER_OFFSETS, new Set([90]))).toBe(true);
  });

  it("does not resend a window that already went out", () => {
    expect(shouldSendReminder(45, DEFAULT_REMINDER_OFFSETS, new Set([90, 60]))).toBe(false);
  });

  it("still sends when a previous window was missed entirely (cron outage)", () => {
    // Cron was down at 60 days; at 45 days the 60-day window is still due.
    expect(shouldSendReminder(45, DEFAULT_REMINDER_OFFSETS, new Set([90]))).toBe(true);
    // And at 25 days the 30-day window is due even though 60 never fired.
    expect(shouldSendReminder(25, DEFAULT_REMINDER_OFFSETS, new Set([90]))).toBe(true);
  });

  it("does not send when no window applies yet", () => {
    expect(shouldSendReminder(200, DEFAULT_REMINDER_OFFSETS, new Set())).toBe(false);
  });
});

describe("offsetsAlreadySent", () => {
  it("derives sent windows from delivery history", () => {
    // Due 2026-06-15. A delivery sent on 2026-03-17 was 90 days out -> 90 window.
    const sent = offsetsAlreadySent(
      [{ scheduled_for: "2026-03-17", status: "sent" }],
      "2026-06-15"
    );
    expect(sent.has(90)).toBe(true);
    expect(sent.has(60)).toBe(false);
  });

  it("ignores failed deliveries so they retry the next day", () => {
    const sent = offsetsAlreadySent(
      [{ scheduled_for: "2026-05-16", status: "failed" }],
      "2026-06-15"
    );
    expect(sent.size).toBe(0);
    // 30 days out, nothing sent -> due.
    expect(shouldSendReminder(30, DEFAULT_REMINDER_OFFSETS, sent)).toBe(true);
  });
});

describe("offsetsFromRules", () => {
  it("uses an org's enabled reminder_rules when present", () => {
    expect(
      offsetsFromRules([
        { days_before: 45, enabled: true },
        { days_before: 10, enabled: true },
        { days_before: 3, enabled: false },
      ])
    ).toEqual([10, 45]);
  });

  it("falls back to the defaults when there are no rules", () => {
    expect(offsetsFromRules([])).toEqual([1, 7, 14, 30, 60, 90]);
    expect(offsetsFromRules(null)).toEqual([1, 7, 14, 30, 60, 90]);
  });
});
