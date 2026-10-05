import type { MetadataRoute } from "next";

import { client } from "@/sanity/lib/client";
import { siteConfig } from "@/lib/site";

const BASE_URL = siteConfig.url;

export const revalidate = 3600;

type SitemapDocument = {
  _id: string;

  slug?: {
    current?: string;
  };

  _updatedAt?: string;
  publishedAt?: string;
};

type PostSitemapDocument =
  SitemapDocument & {
    seo?: {
      noIndex?: boolean;
    };
  };

/*
 * ============================================================
 * SANITY QUERIES
 * ============================================================
 *
 * Draft documents are excluded explicitly.
 *
 * This is intentionally conservative:
 * only documents with a valid slug are included.
 * ============================================================
 */

const destinationsQuery = `
  *[
    _type == "destination" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ] {
    _id,
    slug,
    _updatedAt
  }
`;

const districtsQuery = `
  *[
    _type == "district" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ] {
    _id,
    slug,
    _updatedAt
  }
`;

const provincesQuery = `
  *[
    _type == "province" &&
    defined(slug.current) &&
    !(_id in path("drafts.**"))
  ] {
    _id,
    slug,
    _updatedAt
  }
`;

const postsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    !coalesce(seo.noIndex, false) &&
    !(_id in path("drafts.**"))
  ] {
    _id,
    slug,
    _updatedAt,
    publishedAt,
    seo
  }
`;

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function toDate(
  value?: string
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? undefined
    : date;
}

function absoluteUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

/*
 * ============================================================
 * SITEMAP
 * ============================================================
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    destinations,
    districts,
    provinces,
    posts,
  ] = await Promise.all([
    client.fetch<SitemapDocument[]>(
      destinationsQuery
    ),

    client.fetch<SitemapDocument[]>(
      districtsQuery
    ),

    client.fetch<SitemapDocument[]>(
      provincesQuery
    ),

    client.fetch<PostSitemapDocument[]>(
      postsQuery
    ),
  ]);

  /*
   * ==========================================================
   * STATIC PAGES
   * ==========================================================
   *
   * We intentionally do NOT use new Date() here.
   * A sitemap lastModified date should reflect a real
   * meaningful page update.
   * ==========================================================
   */

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },

    {
      url: absoluteUrl("/destinations"),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: absoluteUrl("/explore-nepal"),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: absoluteUrl("/blog"),
      changeFrequency: "weekly",
      priority: 0.9,
    },

    {
      url: absoluteUrl("/provinces"),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  /*
   * ==========================================================
   * DESTINATION PAGES
   * ==========================================================
   */

  const destinationPages: MetadataRoute.Sitemap =
    destinations
      .filter(
        (destination) =>
          destination.slug?.current
      )
      .map((destination) => ({
        url: absoluteUrl(
          `/destinations/${destination.slug!.current}`
        ),

        lastModified: toDate(
          destination._updatedAt
        ),

        changeFrequency: "monthly" as const,
        priority: 0.9,
      }));

  /*
   * ==========================================================
   * DISTRICT PAGES
   * ==========================================================
   */

  const districtPages: MetadataRoute.Sitemap =
    districts
      .filter(
        (district) =>
          district.slug?.current
      )
      .map((district) => ({
        url: absoluteUrl(
          `/explore-nepal/${district.slug!.current}`
        ),

        lastModified: toDate(
          district._updatedAt
        ),

        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

  /*
   * ==========================================================
   * PROVINCE PAGES
   * ==========================================================
   */

  const provincePages: MetadataRoute.Sitemap =
    provinces
      .filter(
        (province) =>
          province.slug?.current
      )
      .map((province) => ({
        url: absoluteUrl(
          `/provinces/${province.slug!.current}`
        ),

        lastModified: toDate(
          province._updatedAt
        ),

        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

  /*
   * ==========================================================
   * STORY / BLOG PAGES
   * ==========================================================
   */

  const postPages: MetadataRoute.Sitemap =
    posts
      .filter(
        (post) =>
          post.slug?.current &&
          !post.seo?.noIndex
      )
      .map((post) => ({
        url: absoluteUrl(
          `/blog/${post.slug!.current}`
        ),

        lastModified:
          toDate(post._updatedAt) ??
          toDate(post.publishedAt),

        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));

  /*
   * ==========================================================
   * COMBINE
   * ==========================================================
   */

  const allUrls: MetadataRoute.Sitemap = [
    ...staticPages,
    ...destinationPages,
    ...districtPages,
    ...provincePages,
    ...postPages,
  ];

  /*
   * ==========================================================
   * DEDUPLICATE
   * ==========================================================
   *
   * Protects against accidental duplicate sitemap entries.
   * ==========================================================
   */

  const seen = new Set<string>();

  return allUrls.filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }

    seen.add(entry.url);

    return true;
  });
}