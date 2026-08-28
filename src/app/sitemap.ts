import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

const BASE_URL = "https://bloggy-nepal.vercel.app";

type SitemapDocument = {
  _id: string;
  slug?: {
    current?: string;
  };
  _updatedAt?: string;
  publishedAt?: string;
  seo?: {
    noIndex?: boolean;
  };
};

/**
 * Fetch all indexable districts.
 */
const districtsQuery = `
  *[
    _type == "district" &&
    defined(slug.current)
  ] {
    _id,
    slug,
    _updatedAt
  }
`;

/**
 * Fetch all indexable provinces.
 */
const provincesQuery = `
  *[
    _type == "province" &&
    defined(slug.current)
  ] {
    _id,
    slug,
    _updatedAt
  }
`;

/**
 * Fetch all indexable stories.
 *
 * Stories with seo.noIndex == true are intentionally excluded.
 */
const postsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    !coalesce(seo.noIndex, false)
  ] {
    _id,
    slug,
    _updatedAt,
    publishedAt,
    seo
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [districts, provinces, posts] = await Promise.all([
    client.fetch<SitemapDocument[]>(districtsQuery),
    client.fetch<SitemapDocument[]>(provincesQuery),
    client.fetch<SitemapDocument[]>(postsQuery),
  ]);

  /*
   * ============================================================
   * STATIC PAGES
   * ============================================================
   */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/destinations`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/explore-nepal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/provinces`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  /*
   * ============================================================
   * DISTRICT PAGES
   * ============================================================
   */

  const districtPages: MetadataRoute.Sitemap = districts
    .filter((district) => district.slug?.current)
    .map((district) => ({
      url: `${BASE_URL}/explore-nepal/${district.slug!.current}`,
      lastModified: district._updatedAt
        ? new Date(district._updatedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  /*
   * ============================================================
   * PROVINCE PAGES
   * ============================================================
   */

  const provincePages: MetadataRoute.Sitemap = provinces
    .filter((province) => province.slug?.current)
    .map((province) => ({
      url: `${BASE_URL}/provinces/${province.slug!.current}`,
      lastModified: province._updatedAt
        ? new Date(province._updatedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  /*
   * ============================================================
   * BLOG / STORY PAGES
   * ============================================================
   */

  const postPages: MetadataRoute.Sitemap = posts
    .filter((post) => post.slug?.current)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug!.current}`,
      lastModified: post._updatedAt
        ? new Date(post._updatedAt)
        : post.publishedAt
          ? new Date(post.publishedAt)
          : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  /*
   * ============================================================
   * RETURN EVERYTHING
   * ============================================================
   */

  return [
    ...staticPages,
    ...districtPages,
    ...provincePages,
    ...postPages,
  ];
}