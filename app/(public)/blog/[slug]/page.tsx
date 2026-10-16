import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

async function getPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  const url = `https://permitwarden.com/blog/${slug}`;
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      url,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: ["/og-image.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const url = `https://permitwarden.com/blog/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Permit Warden", url: "https://permitwarden.com" },
    publisher: {
      "@type": "Organization",
      name: "Permit Warden",
      logo: { "@type": "ImageObject", url: "https://permitwarden.com/logo.png" },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://permitwarden.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://permitwarden.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/blog"
          className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400"
        >
          &larr; All articles
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {" · Permit Warden"}
          </p>
        )}
        <article className="mt-8 prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-sky-600 dark:prose-a:text-sky-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </article>
        <div className="mt-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Never miss a permit deadline again
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track permits, licenses, inspections, and renewals with automatic reminders.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start free
          </Link>
        </div>
      </div>
    </div>
  );
}
