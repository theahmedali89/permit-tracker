import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog - Permit guides & compliance tips",
  description:
    "Practical guides on building permits, licenses, inspections, and renewals for U.S. contractors — plus product updates from Permit Warden.",
  openGraph: {
    title: "Permit Warden Blog - Permit guides & compliance tips",
    description:
      "Practical guides on building permits, licenses, inspections, and renewals for U.S. contractors.",
  },
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/signup"
          className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
        >
          &larr; Back to Permit Warden
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Blog
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Permit guides, compliance tips, and renewal reminders for U.S. contractors.
        </p>

        {!posts || posts.length === 0 ? (
          <div className="mt-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No articles yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{post.excerpt}</p>
                {post.published_at && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
