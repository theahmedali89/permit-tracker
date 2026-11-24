// Reminder window logic (pure, unit-testable).
//
// Old behaviour matched an exact day (`remaining === offset`): one missed
// cron run lost that reminder forever. New behaviour is window-based:
// for a deadline `remaining` days away, the "current window" is the
// smallest configured offset that is still >= remaining. The reminder is
// due when that window's offset has not been sent yet. A failed delivery
// does not count as sent, so it is retried the next day.

export const DEFAULT_REMINDER_OFFSETS = [90, 60, 30, 14, 7, 1] as const;

export type ReminderDeliveryRow = {
  scheduled_for: string; // YYYY-MM-DD the delivery was scheduled/sent for
  status: string; // 'sent' | 'failed' | 'processing' | 'pending'
};

function sortedUniqueOffsets(offsets: readonly number[]): number[] {
  return [...new Set(offsets.filter((o) => Number.isFinite(o) && o > 0))].sort(
    (a, b) => a - b
  );
}

/**
 * The offset whose window a deadline is currently inside, or null when the
 * deadline is further out than every configured offset.
 * remaining <= 0 (overdue / due today) maps to the smallest offset.
 */
export function getDueOffset(
  remainingDays: number,
  offsets: readonly number[] = DEFAULT_REMINDER_OFFSETS
): number | null {
  const sorted = sortedUniqueOffsets(offsets);
  if (sorted.length === 0) return null;
  for (const offset of sorted) {
    if (remainingDays <= offset) return offset;
  }
  return null;
}

/** Whole days between two YYYY-MM-DD dates (due - from). */
export function daysBetween(fromYmd: string, dueYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = dueYmd.split("-").map(Number);
  const from = Date.UTC(fy, fm - 1, fd, 12);
  const due = Date.UTC(ty, tm - 1, td, 12);
  return Math.round((due - from) / (1000 * 60 * 60 * 24));
}

/**
 * Which offsets were already sent for a deadline, derived from its
 * delivery history: a delivery sent on date D covered the window that
 * was current on D. Only status 'sent' counts — 'failed' (and stale
 * 'processing') rows are ignored so they retry.
 */
export function offsetsAlreadySent(
  deliveries: ReminderDeliveryRow[],
  dueDate: string,
  offsets: readonly number[] = DEFAULT_REMINDER_OFFSETS
): Set<number> {
  const sent = new Set<number>();
  for (const d of deliveries) {
    if (d.status !== "sent") continue;
    const remainingThen = daysBetween(d.scheduled_for, dueDate);
    const offset = getDueOffset(remainingThen, offsets);
    if (offset !== null) sent.add(offset);
  }
  return sent;
}

/** True when the current window's reminder still needs to go out. */
export function shouldSendReminder(
  remainingDays: number,
  offsets: readonly number[],
  sentOffsets: ReadonlySet<number>
): boolean {
  const due = getDueOffset(remainingDays, offsets);
  if (due === null) return false;
  return !sentOffsets.has(due);
}

/**
 * Offsets for an org + resource type from its reminder_rules rows
 * (enabled rules' days_before), falling back to the defaults when the
 * org has no rules. Returned ascending.
 */
export function offsetsFromRules(
  rules: { days_before: number; enabled?: boolean | null }[] | null | undefined,
  fallback: readonly number[] = DEFAULT_REMINDER_OFFSETS
): number[] {
  const fromRules = (rules || [])
    .filter((r) => r.enabled !== false && Number.isFinite(r.days_before) && r.days_before > 0)
    .map((r) => r.days_before);
  if (fromRules.length === 0) return sortedUniqueOffsets(fallback);
  return sortedUniqueOffsets(fromRules);
}
