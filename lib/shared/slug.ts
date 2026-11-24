// Generic URL slug generator (shared — used by the Compliance Passport
// slug and the Settings org-update flow). Pure function: lowercase,
// non-alphanumerics → hyphens, max 40 chars, random 6-char suffix so
// collisions are rare (the caller retries once on collision).

export function generateSlug(name: string): string {
  const base = (name || "company")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "company";
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}
