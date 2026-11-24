"use client";

import { useState } from "react";

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export function PasswordField({
  minLength,
  placeholder = "••••••••",
  autoComplete = "current-password",
  lockIcon = false,
}: {
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
  /** Show a lock icon inside the input (sign-in page only). */
  lockIcon?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      {lockIcon && (
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400 dark:text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      <input
        id="password"
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputCls} pr-16 ${lockIcon ? "pl-11" : ""}`}
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
