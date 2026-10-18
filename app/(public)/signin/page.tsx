import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { PasswordField } from "./password-field";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Permit Warden to manage your permits, licenses, inspections, and renewal deadlines.",
  robots: { index: false, follow: true },
};

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <AuthLayout
      heading="Welcome back"
      subheading={
        <>
          Sign in to pick up where you left off. New here?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-5 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        </div>
      )}
      <form className="space-y-5" action="/auth/signin" method="post">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input id="email" name="email" type="email" required placeholder="you@company.com" className={inputCls} />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot password?
            </Link>
          </div>
          <PasswordField />
        </div>
        <button
          type="submit"
          className="pw-float-btn w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
