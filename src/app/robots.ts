import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const BASE_URL = siteConfig.url;

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
      ],
    },

    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}