import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";

export const metadata: Metadata = {
  title: "Sign up - Start tracking permits in minutes",
  description:
    "Create a free Permit Tracker account. Track building permits, licenses, inspections, and renewal deadlines with automatic email reminders for U.S. contractors.",
  openGraph: {
    title: "Permit Tracker - Start tracking permits in minutes",
    description:
      "Free permit, license, and inspection tracking for small U.S. contractors with automatic renewal reminders.",
  },
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Permit Tracker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Permit, license, and inspection deadline tracking with automatic renewal reminders for small U.S. contractors.",
  url: "https://permit-tracker-azure.vercel.app/signup",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params.error;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }}
      />
      <AuthLayout
        heading="Create your account"
        subheading={
          <>
            Start tracking permits in minutes — free. Already have an account?{" "}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </>
        }
      >
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
        <form className="space-y-5" action="/auth/signup" method="post">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Work email
            </label>
            <input id="email" name="email" type="email" required placeholder="you@company.com" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input id="password" name="password" type="password" required minLength={8} placeholder="Min 8 characters" className={inputCls} />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create free account
          </button>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-500">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>
      </AuthLayout>
    </>
  );
}
