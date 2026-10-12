"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      {(["light", "dark", "system"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
            theme === t
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "💻 System"}
        </button>
      ))}
    </div>
  );
}
