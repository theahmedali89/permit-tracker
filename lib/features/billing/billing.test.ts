import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  enforcePlanLimit,
  enforcePlanLimitWithGraceMode,
  enforceBulkPlanLimitWithGraceMode,
  wouldExceedLimit,
  handleWebhookEvent,
} from "./index";

const ORIGINAL_KEY = process.env.STRIPE_SECRET_KEY;

/** Minimal Supabase mock: plan lookup + exact-count query. */
function mockSupabase(plan: string, count: number) {
  return {
    from: (table: string) => {
      if (table === "organizations") {
        return {
          select: () => ({
            eq: () => ({ single: async () => ({ data: { plan }, error: null }) }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({ count, error: null }),
        }),
      };
    },
  };
}

describe("wouldExceedLimit", () => {
  it("allows within the limit and blocks over it", () => {
    expect(wouldExceedLimit(9, 10, 1)).toBe(false); // exactly at limit: ok
    expect(wouldExceedLimit(9, 10, 2)).toBe(true);
    expect(wouldExceedLimit(10, 10, 1)).toBe(true);
    expect(wouldExceedLimit(0, 10, 0)).toBe(false);
  });
  it("never blocks when max is -1 (unlimited)", () => {
    expect(wouldExceedLimit(9999, -1, 500)).toBe(false);
  });
});

describe("enforcePlanLimit", () => {
  it("returns 402-shaped denial at the free permit limit", async () => {
    const check = await enforcePlanLimit(mockSupabase("free", 10), "org-1", "permits");
    expect(check.allowed).toBe(false);
    expect(check.plan).toBe("free");
    expect(check.current).toBe(10);
    expect(check.max).toBe(10);
    expect(check.message).toMatch(/Upgrade/);
  });
  it("allows below the limit", async () => {
    const check = await enforcePlanLimit(mockSupabase("free", 3), "org-1", "projects");
    expect(check.allowed).toBe(true);
    expect(check.max).toBe(5);
  });
});

describe("enforcePlanLimitWithGraceMode", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
  });

  it("grace mode: allows an over-limit org without Stripe keys and never touches the DB", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const explodingDb = {
      from: () => {
        throw new Error("DB must not be called in grace mode");
      },
    };
    const check = await enforcePlanLimitWithGraceMode(explodingDb, "org-1", "permits");
    expect(check.allowed).toBe(true);
    expect(check.graceMode).toBe(true);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("grace mode"));
  });

  it("configured mode: enforces the limit (402 path) when Stripe keys exist", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const check = await enforcePlanLimitWithGraceMode(
      mockSupabase("free", 10),
      "org-1",
      "permits"
    );
    expect(check.allowed).toBe(false);
    expect(check.graceMode).toBeUndefined();
  });

  it("configured mode: allows below the limit", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const check = await enforcePlanLimitWithGraceMode(
      mockSupabase("starter", 10),
      "org-1",
      "permits"
    );
    expect(check.allowed).toBe(true);
    expect(check.max).toBe(50);
  });
});

describe("enforceBulkPlanLimitWithGraceMode", () => {
  beforeEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });
  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
  });

  it("grace mode: allows a bulk import without Stripe keys", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const check = await enforceBulkPlanLimitWithGraceMode(
      { from: () => { throw new Error("DB must not be called in grace mode"); } },
      "org-1",
      "permits",
      500
    );
    expect(check.allowed).toBe(true);
    expect(check.graceMode).toBe(true);
    expect(warn).toHaveBeenCalled();
  });

  it("configured mode: blocks an import that would exceed the limit", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const check = await enforceBulkPlanLimitWithGraceMode(
      mockSupabase("free", 9),
      "org-1",
      "permits",
      2
    );
    expect(check.allowed).toBe(false);
    expect(check.message).toMatch(/importing 2 more would exceed/);
  });

  it("configured mode: allows an import that fits exactly", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    const check = await enforceBulkPlanLimitWithGraceMode(
      mockSupabase("free", 9),
      "org-1",
      "permits",
      1
    );
    expect(check.allowed).toBe(true);
  });
});

describe("handleWebhookEvent", () => {
  /** Fake Supabase admin client recording every call. */
  function mockAdmin() {
    const calls: Record<string, unknown>[] = [];
    const client = {
      from: (table: string) => ({
        upsert: async (row: any, opts: any) => {
          calls.push({ table, op: "upsert", row, opts });
          return { error: null };
        },
        update: (updates: any) => ({
          eq: async (col: string, val: any) => {
            calls.push({ table, op: "update", updates, eq: [col, val] });
            return { error: null };
          },
        }),
        select: (..._args: any[]) => ({
          eq: (_col: string, _val: any) => ({
            single: async () => ({ data: { organization_id: "org-1" }, error: null }),
          }),
        }),
      }),
    };
    return { calls, client };
  }

  /** Fake Stripe SDK: retrieve() returns a subscription on the starter price. */
  const mockStripe = {
    subscriptions: {
      retrieve: async (_id: string) => ({
        id: "sub_1",
        status: "active",
        customer: "cus_1",
        current_period_end: 1780000000,
        items: { data: [{ price: { id: "price_starter" } }] },
      }),
    },
  };

  beforeEach(() => {
    process.env.STRIPE_PRICE_STARTER = "price_starter";
    process.env.STRIPE_PRICE_PROFESSIONAL = "price_pro";
    process.env.STRIPE_PRICE_BUSINESS = "price_biz";
  });
  afterEach(() => {
    delete process.env.STRIPE_PRICE_STARTER;
    delete process.env.STRIPE_PRICE_PROFESSIONAL;
    delete process.env.STRIPE_PRICE_BUSINESS;
  });

  it("checkout.session.completed upserts the subscription and sets the org plan", async () => {
    const { calls, client } = mockAdmin();
    await handleWebhookEvent(
      {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "org-1",
            subscription: "sub_1",
            customer: "cus_1",
          },
        },
      },
      { admin: client, stripe: mockStripe }
    );
    const upsert = calls.find((c) => c.op === "upsert");
    expect(upsert?.table).toBe("subscriptions");
    expect((upsert?.row as any).organization_id).toBe("org-1");
    expect((upsert?.row as any).plan).toBe("starter");
    expect((upsert?.row as any).status).toBe("active");
    const orgUpdate = calls.find(
      (c) => c.table === "organizations" && c.op === "update"
    );
    expect((orgUpdate?.updates as any).plan).toBe("starter");
  });

  it("customer.subscription.deleted cancels the subscription and frees the org plan", async () => {
    const { calls, client } = mockAdmin();
    await handleWebhookEvent(
      {
        type: "customer.subscription.deleted",
        data: { object: { id: "sub_1" } },
      },
      { admin: client, stripe: mockStripe }
    );
    const subUpdate = calls.find(
      (c) => c.table === "subscriptions" && c.op === "update"
    );
    expect((subUpdate?.updates as any)).toEqual({ status: "cancelled", plan: "free" });
    const orgUpdate = calls.find(
      (c) => c.table === "organizations" && c.op === "update"
    );
    expect((orgUpdate?.updates as any).plan).toBe("free");
  });

  it("customer.subscription.updated with an unknown price updates status but not the plan", async () => {
    const { calls, client } = mockAdmin();
    await handleWebhookEvent(
      {
        type: "customer.subscription.updated",
        data: {
          object: {
            id: "sub_1",
            status: "past_due",
            current_period_end: 1780000000,
            items: { data: [{ price: { id: "price_unknown" } }] },
          },
        },
      },
      { admin: client, stripe: mockStripe }
    );
    const subUpdate = calls.find(
      (c) => c.table === "subscriptions" && c.op === "update"
    );
    expect((subUpdate?.updates as any).status).toBe("past_due");
    expect((subUpdate?.updates as any).plan).toBeUndefined();
    expect(calls.some((c) => c.table === "organizations")).toBe(false);
  });

  it("invoice.payment_failed marks the subscription past_due", async () => {
    const { calls, client } = mockAdmin();
    await handleWebhookEvent(
      {
        type: "invoice.payment_failed",
        data: { object: { subscription: "sub_1" } },
      },
      { admin: client, stripe: mockStripe }
    );
    const subUpdate = calls.find(
      (c) => c.table === "subscriptions" && c.op === "update"
    );
    expect((subUpdate?.updates as any)).toEqual({ status: "past_due" });
  });

  it("ignores unhandled event types without touching the DB", async () => {
    const { calls, client } = mockAdmin();
    await handleWebhookEvent(
      { type: "payment_intent.succeeded", data: { object: {} } },
      { admin: client, stripe: mockStripe }
    );
    expect(calls).toEqual([]);
  });
});
