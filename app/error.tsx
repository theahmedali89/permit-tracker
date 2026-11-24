"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Permit Warden hit an unexpected error. Your data is safe — try again, and if it keeps
          happening, contact support.
        </p>
        {error?.digest ? (
          <p className="text-xs text-gray-400">Error reference: {error.digest}</p>
        ) : null}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
