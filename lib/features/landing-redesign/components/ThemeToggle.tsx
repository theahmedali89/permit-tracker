"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

/**
 * Day/night toggle — icon only, white circular button, blue sun/moon
 * icon, no text, no yellow — matching the other header icon buttons.
 * Toggles the existing ThemeProvider between explicit light and dark
 * (never touches the provider's storage or the "system" option itself:
 * if the user had "system", the first tap pins an explicit choice).
 * Rendered sun-first to avoid a hydration mismatch; the effect syncs
 * the icon once mounted.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const systemDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(theme === "dark" || (theme === "system" && systemDark));
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:-translate-y-px hover:bg-blue-50 ${className}`}
    >
      {dark ? (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
