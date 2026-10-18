import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { STATE_NAMES } from "./(public)/ahj/_lib";

const SITE_URL = "https://permitwarden.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/templates/construction-permit-tracking-spreadsheet`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/compare/permitwarden-vs-excel`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/solutions/solar`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/solutions/roofing`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/solutions/electrical`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools/parcel-lookup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/signin`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true);
    for (const post of posts ?? []) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // AHJ directory: hub + state + jurisdiction pages
    entries.push({
      url: `${SITE_URL}/ahj`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
    const { data: ahj } = await supabase
      .from("ahj_directory")
      .select("state, city, county");
    const seenStates = new Set<string>();
    for (const row of ahj ?? []) {
      const stateName = STATE_NAMES[row.state] || row.state;
      const stateSlug = stateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!seenStates.has(stateSlug)) {
        seenStates.add(stateSlug);
        entries.push({
          url: `${SITE_URL}/ahj/${stateSlug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
      const citySlug = (row.city || "county").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      entries.push({
        url: `${SITE_URL}/ahj/${stateSlug}/${citySlug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // sitemap still serves static entries if DB is unreachable
  }

  return entries;
}
