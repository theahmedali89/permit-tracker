import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "Blog - Permit guides & compliance tips",
  description:
    "Practical guides on building permits, licenses, inspections, and renewals for U.S. contractors — plus product updates from Permit Warden.",
  alternates: { canonical: "https://permitwarden.com/blog" },
  openGraph: {
    title: "Permit Warden Blog - Permit guides & compliance tips",
    description:
      "Practical guides on building permits, licenses, inspections, and renewals for U.S. contractors.",
    url: "https://permitwarden.com/blog",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Permit Warden Blog - Permit guides & compliance tips",
      },
    ],
  },
};

export const revalidate = 3600;

function readingTimeMinutes(content: string | null): number {
  if (!content) return 0;
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export default async function BlogIndexPage() {
  const supabase = createPublicClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, published_at, author, category, tags, featured_image, content")
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
            {posts.map((post) => {
              const minutes = readingTimeMinutes(post.content);
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                >
                  {post.featured_image && (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      width={1200}
                      height={630}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{post.excerpt}</p>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
                      {post.category && <span>{post.category} · </span>}
                      {minutes > 0 && <span>{minutes} min read · </span>}
                      {post.published_at &&
                        new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
