// Tests for the reminder cron engine (lib/features/reminders/run-reminder-cron.ts).
// The engine is exercised end-to-end against a fake Supabase client that
// mimics the postgrest chain API (.from().select().eq()… / .insert() /
// .update()), plus a fake Resend client. No network, no real DB.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

class FakeQuery {
  private cols = "*";
  private singleFlag = false;
  private op: "select" | "insert" | "update" = "select";
  private payload: AnyRow | null = null;
  constructor(
    private fake: FakeSupabase,
    private table: string
  ) {}
  select(cols = "*") {
    this.cols = cols;
    return this;
  }
  eq() {
    return this;
  }
  neq() {
    return this;
  }
  in() {
    return this;
  }
  gte() {
    return this;
  }
  lte() {
    return this;
  }
  not() {
    return this;
  }
  order() {
    return this;
  }
  range() {
    return this;
  }
  limit() {
    return this;
  }
  single() {
    this.singleFlag = true;
    return this;
  }
  insert(row: AnyRow) {
    this.op = "insert";
    this.payload = row;
    return this;
  }
  update(patch: AnyRow) {
    this.op = "update";
    this.payload = patch;
    return this;
  }
  // Thenable so `await query` works exactly like a real postgrest builder.
  then(onFulfilled: (v: AnyRow) => void, onRejected?: (e: unknown) => void) {
    try {
      onFulfilled(this.resolve());
    } catch (e) {
      if (onRejected) onRejected(e);
      else throw e;
    }
  }
  private resolve(): AnyRow {
    if (this.op === "insert") {
      this.fake.inserts.push({ table: this.table, row: this.payload });
      const id = `new-${this.table}-${this.fake.inserts.length}`;
      return { data: { id, ...(this.payload ?? {}) }, error: null };
    }
    if (this.op === "update") {
      this.fake.updates.push({ table: this.table, patch: this.payload });
      return { data: null, error: null };
    }
    const canned = this.fake.rowsFor(this.table, this.cols);
    if (canned && !Array.isArray(canned)) {
      return { data: null, error: { message: (canned as AnyRow).error } };
    }
    const rows = (canned as AnyRow[]) ?? [];
    return {
      data: this.singleFlag ? (rows[0] ?? null) : rows,
      error: null,
    };
  }
}

class FakeSupabase {
  inserts: { table: string; row: AnyRow | null }[] = [];
  updates: { table: string; patch: AnyRow | null }[] = [];
  users: AnyRow[] = [];
  constructor(private canned: Record<string, AnyRow[] | { error: string }>) {}
  from(table: string) {
    return new FakeQuery(this, table);
  }
  rowsFor(table: string, cols: string) {
    return (
      this.canned[`${table}|${cols}`] ?? this.canned[table] ?? []
    );
  }
  auth = {
    admin: {
      listUsers: async () => ({ data: { users: this.users }, error: null }),
    },
  };
}

import { describe, expect, it } from "vitest";
import type { Resend } from "resend";
import { ApiError } from "@/lib/shared/http";
import {
  constructionHoursBlock,
  matchCity,
  matchRegulation,
  runReminderCron,
} from "@/lib/features/reminders/run-reminder-cron";

const TODAY = "2026-11-24";

function makeResend() {
  const calls: AnyRow[] = [];
  const resend = {
    emails: {
      send: async (opts: AnyRow) => {
        calls.push(opts);
        return { data: { id: "msg-1" }, error: null };
      },
    },
  } as unknown as Resend;
  return { resend, calls };
}

function baseCanned(extra: Record<string, AnyRow[] | { error: string }> = {}) {
  return {
    "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": [],
    "reminder_rules|organization_id, resource_type, days_before, enabled": [],
    "permits|id, permit_type, permit_number, jurisdiction, organization_id": [],
    "licenses|id, license_name, license_number, organization_id": [],
    "inspections|id, inspection_type, organization_id": [],
    "documents|id, file_name, organization_id": [],
    "subcontractor_documents|id, file_name, doc_type, organization_id, subcontractor_id": [],
    "subcontractors|id, name": [],
    "organizations|id, name": [{ id: "org1", name: "Acme Corp" }],
    "reminder_deliveries|deadline_id, scheduled_for, status": [],
    "reminder_deliveries|id": [],
    "permits|id, organization_id, permit_type, permit_number, renewal_deadline, jurisdiction, organizations!inner(name)": [],
    "documents|id, organization_id, file_name, expiry_date, organizations!inner(name)": [],
    "subcontractor_documents|id, organization_id, file_name, doc_type, expiration_date, subcontractors!inner(name), organizations!inner(name)": [],
    "permits|id, organization_id, expiration_date, renewal_deadline, status": [],
    ...extra,
  };
}

function runWith(canned: Record<string, AnyRow[] | { error: string }>, users: AnyRow[] = []) {
  const fake = new FakeSupabase(canned);
  fake.users = users;
  const { resend, calls } = makeResend();
  return {
    fake,
    calls,
    promise: runReminderCron({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase: fake as any,
      resend,
      fromEmail: "noreply@example.com",
      appUrl: "https://example.com",
      today: TODAY,
    }),
  };
}

describe("runReminderCron", () => {
  it("sends nothing when there is nothing due", async () => {
    const { promise, calls } = runWith(baseCanned());
    await expect(promise).resolves.toEqual({
      sent: 0,
      failed: 0,
      skipped: 0,
      renewals_sent: 0,
      status_recomputed: 0,
    });
    expect(calls).toHaveLength(0);
  });

  it("sends a permit deadline reminder due in 1 day to org members", async () => {
    const canned = baseCanned({
      "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": [
        {
          id: "d1",
          organization_id: "org1",
          resource_type: "permit",
          resource_id: "p1",
          deadline_type: "expiration",
          due_date: "2026-11-25",
          status: "pending",
        },
      ],
      "permits|id, permit_type, permit_number, jurisdiction, organization_id": [
        {
          id: "p1",
          permit_type: "Building",
          permit_number: "B-1",
          jurisdiction: "Austin, TX",
          organization_id: "org1",
        },
      ],
      "organization_members|user_id": [{ user_id: "u1" }],
    });
    const { fake, calls, promise } = runWith(canned, [
      { id: "u1", email: "owner@example.com" },
    ]);
    await expect(promise).resolves.toEqual({
      sent: 1,
      failed: 0,
      skipped: 0,
      renewals_sent: 0,
      status_recomputed: 0,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].to).toEqual(["owner@example.com"]);
    expect(calls[0].subject).toContain("Building B-1");
    expect(calls[0].subject).toContain("due in 1 days");
    // Delivery row recorded first as processing, then marked sent.
    const deliveryInsert = fake.inserts.find(
      (i) => i.table === "reminder_deliveries"
    );
    expect(deliveryInsert?.row?.status).toBe("processing");
    expect(deliveryInsert?.row?.deadline_id).toBe("d1");
    expect(
      fake.updates.find(
        (u) =>
          u.table === "reminder_deliveries" && u.patch?.status === "sent"
      )
    ).toBeDefined();
  });

  it("skips a deadline whose current window was already sent today", async () => {
    const canned = baseCanned({
      "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": [
        {
          id: "d1",
          organization_id: "org1",
          resource_type: "permit",
          resource_id: "p1",
          deadline_type: "expiration",
          due_date: "2026-11-25",
          status: "pending",
        },
      ],
      "permits|id, permit_type, permit_number, jurisdiction, organization_id": [
        {
          id: "p1",
          permit_type: "Building",
          permit_number: "B-1",
          jurisdiction: "Austin, TX",
          organization_id: "org1",
        },
      ],
      // Sent on the run date for the 1-day window → already covered.
      "reminder_deliveries|deadline_id, scheduled_for, status": [
        { deadline_id: "d1", scheduled_for: "2026-11-24", status: "sent" },
      ],
    });
    const { calls, promise } = runWith(canned);
    await expect(promise).resolves.toMatchObject({ sent: 0, skipped: 1 });
    expect(calls).toHaveLength(0);
  });

  it("honours a custom reminder_rules offset beyond the defaults", async () => {
    const canned = baseCanned({
      "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": [
        {
          id: "d1",
          organization_id: "org1",
          resource_type: "permit",
          resource_id: "p1",
          deadline_type: "expiration",
          due_date: "2027-03-04", // 100 days out — beyond default 90
          status: "pending",
        },
      ],
      "reminder_rules|organization_id, resource_type, days_before, enabled": [
        {
          organization_id: "org1",
          resource_type: "permit",
          days_before: 100,
          enabled: true,
        },
      ],
      "permits|id, permit_type, permit_number, jurisdiction, organization_id": [
        {
          id: "p1",
          permit_type: "Building",
          permit_number: "B-1",
          jurisdiction: "Austin, TX",
          organization_id: "org1",
        },
      ],
      "organization_members|user_id": [{ user_id: "u1" }],
    });
    const { calls, promise } = runWith(canned, [
      { id: "u1", email: "owner@example.com" },
    ]);
    await expect(promise).resolves.toMatchObject({ sent: 1 });
    expect(calls).toHaveLength(1);
  });

  it("throws ApiError 500 when the deadlines query fails", async () => {
    const canned = baseCanned({
      "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": {
        error: "db down",
      },
    });
    const { promise } = runWith(canned);
    await expect(promise).rejects.toMatchObject({
      status: 500,
    });
    await expect(promise).rejects.toBeInstanceOf(ApiError);
  });

  it("skips a deadline whose org has no reachable members", async () => {
    const canned = baseCanned({
      "deadlines|id, organization_id, resource_type, resource_id, deadline_type, due_date, status": [
        {
          id: "d1",
          organization_id: "org1",
          resource_type: "permit",
          resource_id: "p1",
          deadline_type: "expiration",
          due_date: "2026-11-25",
          status: "pending",
        },
      ],
      "permits|id, permit_type, permit_number, jurisdiction, organization_id": [
        {
          id: "p1",
          permit_type: "Building",
          permit_number: "B-1",
          jurisdiction: "Austin, TX",
          organization_id: "org1",
        },
      ],
      "organization_members|user_id": [],
    });
    const { calls, promise } = runWith(canned);
    await expect(promise).resolves.toMatchObject({ sent: 0, skipped: 1 });
    expect(calls).toHaveLength(0);
  });
});

describe("cron city / regulation matchers", () => {
  it("matchCity finds Austin, TX and returns null for unknown places", () => {
    const austin = matchCity("Austin, TX");
    expect(austin?.city).toBe("Austin");
    expect(matchCity("Nowhereville, ZZ")).toBeNull();
    expect(matchCity(null)).toBeNull();
  });

  it("constructionHoursBlock is empty without a matching city", () => {
    expect(constructionHoursBlock("Nowhereville, ZZ")).toBe("");
    expect(constructionHoursBlock("Austin, TX")).toContain("Austin");
  });

  it("matchRegulation prefers the state-matching row", () => {
    const regs = [
      { city: "Austin", state_code: "TX", processing_days: 20 },
      { city: "Austin", state_code: "OH", processing_days: 5 },
    ];
    expect(matchRegulation("Austin, TX", regs)?.processing_days).toBe(20);
    expect(matchRegulation("Austin, OH", regs)?.processing_days).toBe(5);
    expect(matchRegulation("Dallas, TX", regs)).toBeNull();
  });
});
