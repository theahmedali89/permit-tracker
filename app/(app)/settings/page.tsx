import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { ThemeSettings } from "./theme-settings";
import { GoogleCalendarConnect } from "./google-calendar";
import { CompanyEditor } from "./company-editor";
import { PassportSettings } from "./passport-settings";
import { getPlanLimits } from "@/lib/shared/plans";

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

  // Track B columns (plan, passport) — added by
  // supabase/migration-compliance-passport.sql. Fetched separately so
  // settings still loads if the migration has not run yet.
  const { data: orgExtra } = await supabase
    .from("organizations")
    .select("plan, compliance_passport_slug, compliance_passport_public")
    .eq("id", membership.organization_id)
    .single();
  const extra = (orgExtra ?? {}) as any;
  const currentPlan = (extra.plan ?? "free") as string;

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        <CompanyEditor org={org} role={membership.role} />

        <PassportSettings
          enabled={extra.compliance_passport_public ?? false}
          slug={extra.compliance_passport_slug ?? null}
        />

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Billing
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Current plan: <strong className="capitalize">{currentPlan}</strong>
            {" — "}
            {getPlanLimits(currentPlan).maxPermits === -1
              ? "unlimited permits"
              : `${getPlanLimits(currentPlan).maxPermits} permits`}
            {", "}
            {getPlanLimits(currentPlan).maxProjects === -1
              ? "unlimited projects"
              : `${getPlanLimits(currentPlan).maxProjects} projects`}
            . Upgrade to raise your limits; checkout runs through Stripe
            once billing is configured.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Upgrade / Manage billing
          </Link>
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
          <GoogleCalendarConnect isAdmin={membership.role === "owner" || membership.role === "admin"} />
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
