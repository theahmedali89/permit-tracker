import { describe, it, expect } from "vitest";
import { escapeHtml, escapeAttr } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes angle brackets, quotes and ampersands", () => {
    expect(escapeHtml('<a href="x">&\'y\'</a>')).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;y&#39;&lt;/a&gt;"
    );
  });

  it("leaves plain text unchanged", () => {
    expect(escapeHtml("Monthly Budget Template")).toBe("Monthly Budget Template");
  });

  it("neutralises a script-injection payload", () => {
    const evil = '<script>alert("xss")</script>';
    const out = escapeHtml(evil);
    expect(out).not.toContain("<script>");
    expect(out).toBe("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
  });

  it("handles null/undefined/numbers without throwing", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("escapeAttr", () => {
  it("escapes quotes and backticks for attribute context", () => {
    expect(escapeAttr('" onload="alert(1)')).toBe("&quot; onload=&quot;alert(1)");
    expect(escapeAttr("a`b")).toBe("a&#96;b");
  });
});
