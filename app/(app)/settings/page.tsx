import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { ThemeSettings } from "./theme-settings";
import { GoogleCalendarConnect } from "./google-calendar";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(name, trade, state)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/onboarding");

  const org = membership.organizations as any;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Company
          </h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{org.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Trade</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{
                ({ general: "General Contractor", roofing: "Roofing", electrical: "Electrical", plumbing: "Plumbing", hvac: "HVAC", solar: "Solar", remodeling: "Remodeling", other: "Other" } as Record<string, string>)[org.trade] || org.trade || "Not set"
              }</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">State</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">{org.state || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-400">Your Role</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white capitalize">{membership.role}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Invite teammates and manage who can access your workspace.
          </p>
          <Link
            href="/settings/team"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Manage Team
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Blog
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Write and publish articles for the public blog at /blog.
          </p>
          <Link
            href="/settings/blog"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Manage Blog
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>
          <ThemeSettings />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Google Calendar
          </h2>
          <GoogleCalendarConnect />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Sign out
            </button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
