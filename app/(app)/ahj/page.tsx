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

  // Jurisdiction regulations (building-permit validity / extensions / processing).
  // The table may not exist yet (Ahmed runs migrations separately) — degrade
  // gracefully: on any failure we simply show no regulatory info.
  let regulationsByCity: Record<string, any> = {};
  try {
    const { data: regs, error } = await supabase
      .from("jurisdiction_regulations")
      .select("*");
    if (!error && regs) {
      for (const r of regs as any[]) {
        const key = `${(r.city || "").toLowerCase()}|${(r.state_code || "").toLowerCase()}`;
        // Prefer the building-permit row if several permit types exist for a city.
        if (!regulationsByCity[key] || r.permit_type === "building") {
          regulationsByCity[key] = r;
        }
      }
    }
  } catch {
    regulationsByCity = {};
  }

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
          {entries.map((entry: any) => {
            const reg =
              regulationsByCity[
                `${(entry.city || "").toLowerCase()}|${(entry.state || "").toLowerCase()}`
              ];
            return (
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
              {reg && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs space-y-1">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    🏛️ Building permit rules
                  </p>
                  {reg.validity_days != null && (
                    <p className="text-gray-600 dark:text-gray-400">
                      ⏳ Valid {reg.validity_days} days
                      {reg.validity_notes ? ` — ${reg.validity_notes}` : ""}
                    </p>
                  )}
                  {reg.validity_days == null && reg.validity_notes && (
                    <p className="text-gray-600 dark:text-gray-400">
                      ⏳ {reg.validity_notes}
                    </p>
                  )}
                  {reg.processing_days != null && (
                    <p className="text-gray-600 dark:text-gray-400">
                      🕐 Typical plan review: {reg.processing_days} days
                    </p>
                  )}
                  {reg.extension_allowed === true && (
                    <p className="text-gray-600 dark:text-gray-400">
                      🔁 Extensions allowed
                      {reg.extension_fee_usd != null
                        ? ` ($${reg.extension_fee_usd})`
                        : ""}
                      {reg.extension_process ? ` — ${reg.extension_process}` : ""}
                    </p>
                  )}
                  {reg.extension_allowed === false && (
                    <p className="text-gray-600 dark:text-gray-400">
                      🔁 Extensions not allowed
                    </p>
                  )}
                  {reg.source_url && (
                    <p className="pt-1">
                      {(reg.source_url as string)
                        .split(/\s+/)
                        .filter(Boolean)
                        .map((u: string, i: number) => (
                          <a
                            key={i}
                            href={u}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 mr-3"
                          >
                            📄 Source{i > 0 ? ` ${i + 1}` : ""} ↗
                          </a>
                        ))}
                    </p>
                  )}
                </div>
              )}
            </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-6 text-center">
        {entries?.length || 0} jurisdiction{(entries?.length || 0) !== 1 ? "s" : ""} listed.
        Know a missing AHJ? Contact support to add it.
      </p>
    </AppShell>
  );
}
