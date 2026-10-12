import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year || String(now.getFullYear()));
  const month = parseInt(params.month || String(now.getMonth() + 1));

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDate = firstDay.toISOString().split("T")[0];
  const endDate = lastDay.toISOString().split("T")[0];

  const { data: deadlines } = await supabase
    .from("deadlines")
    .select("*")
    .eq("organization_id", membership.organization_id)
    .gte("due_date", startDate)
    .lte("due_date", endDate)
    .order("due_date");

  // Group by date
  const byDate: Record<string, any[]> = {};
  (deadlines || []).forEach((d: any) => {
    if (!byDate[d.due_date]) byDate[d.due_date] = [];
    byDate[d.due_date].push(d);
  });

  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();
  const monthName = firstDay.toLocaleString("default", { month: "long" });

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {monthName} {year}
        </h1>
        <div className="flex gap-2">
          <a
            href={`/calendar?month=${prevMonth}&year=${prevYear}`}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-sm"
          >
            ← Prev
          </a>
          <a
            href={`/calendar?month=${nextMonth}&year=${nextYear}`}
            className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-sm"
          >
            Next →
          </a>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const items = byDate[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day}
                className={`aspect-square border rounded-md p-1 overflow-hidden ${
                  isToday
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <div className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-700 dark:text-gray-300"}`}>
                  {day}
                </div>
                {items.slice(0, 2).map((d: any) => (
                  <div
                    key={d.id}
                    className="text-[10px] truncate mt-0.5 px-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                    title={`${d.deadline_type} - ${d.resource_type}`}
                  >
                    {d.deadline_type}
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-[10px] text-gray-500">+{items.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* List view below */}
      {deadlines && deadlines.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Deadlines this month
          </h2>
          {deadlines.map((d: any) => (
            <Card key={d.id} className="p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {d.deadline_type} ({d.resource_type})
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(d.due_date).toLocaleDateString()}
                </p>
              </div>
              <Badge color={d.status === "overdue" ? "red" : "blue"}>{d.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
