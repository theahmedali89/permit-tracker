// Calculate permit status from dates (deterministic, no AI)
export function calculatePermitStatus(expirationDate: string | null, renewalDeadline: string | null): string {
  if (!expirationDate) return "pending";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expirationDate);
  const daysUntil = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return "expired";
  if (daysUntil <= 30) return "expiring_soon";
  return "active";
}
