"use client";

import { useState } from "react";

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export function PasswordField({
  minLength,
  placeholder = "••••••••",
  autoComplete = "current-password",
}: {
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputCls} pr-16`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 px-3.5 text-sm font-medium text-blue-600 hover:text-teal-600 dark:text-blue-400 dark:hover:text-teal-400"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
