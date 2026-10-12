import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  // Next.js caches the rendered routes. Read fresh published content when
  // regenerating so pages, listings and the sitemap use the same source.
  useCdn: false,
  perspective: "published",
});
