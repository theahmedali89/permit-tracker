// HTML escaping for values interpolated into emails / HTML responses.
// Never interpolate user-controlled strings (org names, permit numbers,
// file names) into HTML without passing them through escapeHtml first.

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a value for use as HTML text content. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

/** Escape a value for use inside a double-quoted HTML attribute. */
export function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
