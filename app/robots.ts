import type { MetadataRoute } from "next";

const SITE_URL = "https://permitwarden.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/signin", "/signup", "/blog"],
        disallow: [
          "/dashboard",
          "/projects",
          "/permits",
          "/licenses",
          "/inspections",
          "/ahj",
          "/subcontractors",
          "/reports",
          "/calendar",
          "/settings",
          "/onboarding",
          "/portal/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
