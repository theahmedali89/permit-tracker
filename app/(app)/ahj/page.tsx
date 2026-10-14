import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AhjDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; state?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const params = await searchParams;
  const searchQuery = params.search || "";
  const stateFilter = params.state || "";

  let query = supabase
    .from("ahj_directory")
    .select("*")
    .order("state", { ascending: true })
    .order("city", { ascending: true });

  if (stateFilter) query = query.eq("state", stateFilter.toUpperCase());
  if (searchQuery) {
    query = query.or(
      `authority_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,county.ilike.%${searchQuery}%`
    );
  }

  const { data: entries } = await query;

  const { data: states } = await supabase
    .from("ahj_directory")
    .select("state")
    .order("state");
  const distinctStates = [...new Set((states || []).map((s: any) => s.state))];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AHJ Directory
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Authority Having Jurisdiction — find permit portals and renewal links by city, county, or state.
        </p>
      </div>

      <Card className="p-4 mb-6">
        <form method="get" className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search city, county, or authority..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <select
            name="state"
            defaultValue={stateFilter}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">All states</option>
            {distinctStates.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Search
          </button>
          {(searchQuery || stateFilter) && (
            <Link
              href="/ahj"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
            >
              Clear
            </Link>
          )}
        </form>
      </Card>

      {!entries || entries.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No jurisdictions found. Try a different search.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map((entry: any) => (
            <Card key={entry.id} className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {entry.authority_name}
                </h3>
                <Badge color="blue">{entry.state}</Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {[entry.city, entry.county ? `${entry.county} County` : null]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="space-y-2 text-sm">
                {entry.portal_url && (
                  <a
                    href={entry.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    🌐 Permit Portal ↗
                  </a>
                )}
                {entry.phone && (
                  <p className="text-gray-600 dark:text-gray-400">
                    📞 {entry.phone}
                  </p>
                )}
                {entry.notes && (
                  <p className="text-gray-500 dark:text-gray-500 text-xs">
                    {entry.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-6 text-center">
        {entries?.length || 0} jurisdiction{(entries?.length || 0) !== 1 ? "s" : ""} listed.
        Know a missing AHJ? Contact support to add it.
      </p>
    </AppShell>
  );
}
