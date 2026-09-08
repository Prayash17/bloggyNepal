import type { MetadataRoute } from "next";

const BASE_URL = "https://www.bloggynepal.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      allow: "/",

      disallow: [
        "/api/",
        "/admin/",
        "/studio/",
        "/login",
        "/_next/",
      ],
    },

    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}