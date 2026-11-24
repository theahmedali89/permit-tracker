import { describe, it, expect } from "vitest";
import {
  applyInspectionFailUpdate,
  computeFinalStatus,
  reinspectionDueDate,
  type InspectionExisting,
} from "./index";

const EXISTING: InspectionExisting = {
  id: "insp-1",
  status: "scheduled",
  scheduled_date: "2026-11-20",
};

describe("computeFinalStatus", () => {
  it("prefers the patched status", () => {
    expect(computeFinalStatus("failed", "scheduled")).toBe("failed");
  });
  it("falls back to the existing status when the patch sets none", () => {
    expect(computeFinalStatus(undefined, "scheduled")).toBe("scheduled");
  });
});

describe("reinspectionDueDate", () => {
  it("returns the requested date when the final status is failed", () => {
    expect(reinspectionDueDate("failed", "2026-12-01")).toBe("2026-12-01");
  });
  it("returns null for a failed inspection with no reinspection date", () => {
    expect(reinspectionDueDate("failed", undefined)).toBeNull();
    expect(reinspectionDueDate("failed", null)).toBeNull();
  });
  it("clears the deadline for any non-failed final status", () => {
    expect(reinspectionDueDate("passed", "2026-12-01")).toBeNull();
    expect(reinspectionDueDate("scheduled", "2026-12-01")).toBeNull();
  });
});

describe("applyInspectionFailUpdate", () => {
  it("fails an inspection: keeps the reinspection date as the deadline", () => {
    const out = applyInspectionFailUpdate(EXISTING, {
      status: "failed",
      correction_notes: "Fix the handrail",
      reinspection_date: "2026-12-01",
    });
    expect(out.filtered).toEqual({
      status: "failed",
      correction_notes: "Fix the handrail",
      reinspection_date: "2026-12-01",
    });
    expect(out.finalStatus).toBe("failed");
    expect(out.newScheduledDate).toBe("2026-11-20");
    expect(out.reinspectionDueDate).toBe("2026-12-01");
  });

  it("clears the reinspection deadline when the inspection passes", () => {
    const out = applyInspectionFailUpdate(
      { ...EXISTING, status: "failed" },
      { status: "passed" }
    );
    expect(out.finalStatus).toBe("passed");
    expect(out.reinspectionDueDate).toBeNull();
  });

  it("keeps the existing status and reinspection deadline when the patch sets no status", () => {
    const out = applyInspectionFailUpdate(
      { ...EXISTING, status: "failed" },
      { reinspection_date: "2026-12-05" }
    );
    expect(out.finalStatus).toBe("failed");
    expect(out.reinspectionDueDate).toBe("2026-12-05");
  });

  it("drops non-allow-listed fields and coerces falsy values to null", () => {
    const out = applyInspectionFailUpdate(EXISTING, {
      status: "scheduled",
      scheduled_date: "",
      organization_id: "org-other",
      notes: "ok",
    });
    expect(out.filtered).toEqual({
      status: "scheduled",
      scheduled_date: null,
      notes: "ok",
    });
    expect(out.newScheduledDate).toBeNull();
  });

  it("uses the patched scheduled date when one is given", () => {
    const out = applyInspectionFailUpdate(EXISTING, {
      scheduled_date: "2026-11-25",
    });
    expect(out.newScheduledDate).toBe("2026-11-25");
    expect(out.finalStatus).toBe("scheduled");
    expect(out.reinspectionDueDate).toBeNull();
  });
});
