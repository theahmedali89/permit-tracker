import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { PasswordField } from "../signin/password-field";

export const metadata: Metadata = {
  title: "Sign up - Start tracking permits in minutes",
  description:
    "Create a free Permit Warden account. Track building permits, licenses, inspections, and renewal deadlines with automatic email reminders for U.S. contractors.",
  alternates: { canonical: "https://permitwarden.com/signup" },
  openGraph: {
    title: "Permit Warden - Start tracking permits in minutes",
    description:
      "Free permit, license, and inspection tracking for small U.S. contractors with automatic renewal reminders.",
    url: "https://permitwarden.com/signup",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden - Never miss a permit deadline",
      },
    ],
  },
};

const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Permit Warden",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Permit, license, and inspection deadline tracking with automatic renewal reminders for small U.S. contractors.",
  url: "https://permitwarden.com/signup",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const inputCls =
  "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30";

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
          <PasswordField minLength={8} placeholder="Min 8 characters" autoComplete="new-password" />
          </div>
          <button
            type="submit"
            className="pw-float-btn w-full rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
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
