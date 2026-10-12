import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  // Check if user already has an organization
  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships && memberships.length > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Set up your company
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Tell us about your contracting business
          </p>
        </div>
        <form className="mt-8 space-y-6" action="/api/organizations" method="post">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="ABC Construction LLC"
              />
            </div>
            <div>
              <label htmlFor="trade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Trade *
              </label>
              <select
                id="trade"
                name="trade"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select trade</option>
                <option value="general">General Contractor</option>
                <option value="roofing">Roofing</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="hvac">HVAC</option>
                <option value="solar">Solar</option>
                <option value="remodeling">Remodeling</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                State *
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                maxLength={2}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="TX"
              />
            </div>
            <div>
              <label htmlFor="team_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Team Size (optional)
              </label>
              <select
                id="team_size"
                name="team_size"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select...</option>
                <option value="1">Just me</option>
                <option value="2-5">2-5</option>
                <option value="6-10">6-10</option>
                <option value="11-20">11-20</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Company & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
