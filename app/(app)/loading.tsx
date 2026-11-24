export default function AppLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4" aria-busy="true">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading Permit Warden…</p>
      </div>
    </div>
  );
}
