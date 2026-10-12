import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const BASE_URL = siteConfig.url;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",

      // The public login page must be crawlable for its noindex tag to be read.
      // Protected dashboard paths remain disallowed and require authentication.
      allow: ["/", "/admin/login"],

      disallow: [
        "/api/",
        "/admin/",
        "/studio/",
        "/login",
      ],
    },

    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
