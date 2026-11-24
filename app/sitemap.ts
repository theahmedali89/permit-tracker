import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { LICENSE_BOARDS } from "@/lib/shared/license-boards";
import { STATE_NAMES, stateSlug } from "./(public)/ahj/_lib";
import { getRegulation, hasRegulationContent } from "./(public)/ahj/_regulations";
import { CITIES } from "./(public)/tools/_data/noise-shed";

const SITE_URL = "https://permitwarden.com";

/**
 * Last-modified for purely static pages that have no database row to date
 * them. This is the date the v2 trust/tool pages were published — a fixed
 * date, never `new Date()`, so the signal does not change on every build.
 */
const STATIC_LAST_MODIFIED = new Date("2026-11-24T00:00:00Z");

function staticEntry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    staticEntry("/", 1.0, "weekly"),
    staticEntry("/signup", 0.9, "yearly"),
    staticEntry("/pricing", 0.9, "monthly"),
    staticEntry("/features", 0.8, "monthly"),
    staticEntry("/about", 0.7, "yearly"),
    staticEntry("/contact", 0.7, "yearly"),
    staticEntry("/privacy", 0.5, "yearly"),
    staticEntry("/terms", 0.5, "yearly"),
    staticEntry("/faq", 0.8, "monthly"),
    staticEntry("/glossary", 0.8, "monthly"),
    staticEntry("/tools", 0.9, "weekly"),
    staticEntry("/tools/permit-timeline-calculator", 0.8, "monthly"),
    staticEntry("/tools/permit-fee-calculator", 0.8, "monthly"),
    staticEntry("/changelog", 0.6, "monthly"),
    staticEntry("/verified-sources", 0.7, "monthly"),
    staticEntry("/templates/construction-permit-tracking-spreadsheet", 0.7, "yearly"),
    staticEntry("/compare/permitwarden-vs-excel", 0.7, "yearly"),
    staticEntry("/solutions/solar", 0.7, "yearly"),
    staticEntry("/solutions/roofing", 0.7, "yearly"),
    staticEntry("/solutions/electrical", 0.7, "yearly"),
    staticEntry("/tools/parcel-lookup", 0.8, "yearly"),
    staticEntry("/tools/license-lookup", 0.8, "monthly"),
    staticEntry("/tools/noise-ordinance-lookup", 0.8, "monthly"),
    staticEntry("/tools/shed-permit-checker", 0.8, "monthly"),
    ...CITIES.map((c) =>
      staticEntry(`/tools/noise-ordinance/${c.slug}`, 0.7, "monthly")
    ),
    ...LICENSE_BOARDS.map((b) =>
      staticEntry(`/tools/license-lookup/${stateSlug(b.code)}`, 0.7, "monthly")
    ),
    staticEntry("/building-permit", 0.8, "monthly"),
    staticEntry("/certificate-of-occupancy", 0.8, "monthly"),
    staticEntry("/blog", 0.9, "weekly"),
    // NOTE: /signin is intentionally absent — it is noindex and must not be
    // in the sitemap. /verify/[slug] is per-organization and is never listed.
  ];

  try {
    const supabase = createPublicClient();
    const { data: posts, error: postsError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true);
    if (postsError) throw postsError;
    for (const post of posts ?? []) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at
          ? new Date(post.updated_at)
          : STATIC_LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // AHJ directory: hub + state pages + ONLY city pages that have verified
    // regulation data (thin portal-only pages are noindex and excluded here).
    entries.push(staticEntry("/ahj", 0.9, "weekly"));
    const { data: ahj, error: ahjError } = await supabase
      .from("ahj_directory")
      .select("state, city, county, verified_at, created_at");
    if (ahjError) throw ahjError;
    const seenStates = new Set<string>();
    for (const row of ahj ?? []) {
      const stateName = STATE_NAMES[row.state] || row.state;
      const slug = stateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!seenStates.has(slug)) {
        seenStates.add(slug);
        entries.push(staticEntry(`/ahj/${slug}`, 0.8, "monthly"));
      }
      const reg = getRegulation(row.state, row.city);
      if (!reg || !hasRegulationContent(reg)) continue;
      const citySlug = (row.city || "county").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      entries.push({
        url: `${SITE_URL}/ahj/${slug}/${citySlug}`,
        lastModified: row.verified_at
          ? new Date(row.verified_at)
          : row.created_at
            ? new Date(row.created_at)
            : STATIC_LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch (err) {
    // Log loudly and still return the static entries — never silently drop
    // the ~250 DB-backed URLs without a trace.
    console.error("[sitemap] DB fetch failed, serving static entries only:", err);
  }

  return entries;
}
