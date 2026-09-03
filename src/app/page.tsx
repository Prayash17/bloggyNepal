import type { Metadata } from "next";
import Link from "next/link";

import { client } from "@/lib/sanity";

import { siteConfig } from "@/lib/site";

import HomeClient from "@/components/HomeClient";
import FeaturedSection, {
  type FeaturedDestination,
  type FeaturedStory,
} from "@/components/FeaturedSection";

export const revalidate = 3600;

/* =========================================================
   SITE URL
========================================================= */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  siteConfig.url ||
  "https://bloggy-nepal.vercel.app"
).replace(/\/$/, "");

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title:
    "Nepal Travel Guides & Stories | bloggyNepal",

  description:
    "Explore Nepal beyond the postcard with honest travel guides, destinations, itineraries, local insights, practical budgets, and real travel stories.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title:
      "Nepal Travel Guides & Stories | bloggyNepal",

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    url: "/",

    type: "website",

    images: [
      {
        url: "/nepal-hero-poster.jpg",
        width: 1200,
        height: 630,
        alt:
          "bloggyNepal — Nepal Travel Guides & Stories",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Nepal Travel Guides & Stories | bloggyNepal",

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    images: [
      "/nepal-hero-poster.jpg",
    ],
  },
};

/* =========================================================
   FEATURED CONTENT TYPES
========================================================= */

type FeaturedContent = {
  destinations: FeaturedDestination[];
  stories: FeaturedStory[];
};

/* =========================================================
   HOMEPAGE STATS
========================================================= */

export type HomepageStats = {
  provinceCount: number;
  districtCount: number;
  destinationCount: number;
  storyCount: number;
};

/* =========================================================
   HOMEPAGE DATA
========================================================= */

type HomepageData = {
  content: FeaturedContent;
  stats: HomepageStats;
};

/* =========================================================
   FEATURED CONTENT
========================================================= */

async function getFeaturedContent(): Promise<FeaturedContent> {
  const [
    featuredDestinations,
    latestDestinations,
    featuredStories,
    latestStories,
  ] = await Promise.all([
    client.fetch<FeaturedDestination[]>(`
      *[
        _type == "destination" &&
        featured == true &&
        defined(slug.current)
      ]
      | order(_createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        coverImage,
        excerpt,
        duration,
        startingCost,
        maxAltitude
      }
    `),

    client.fetch<FeaturedDestination[]>(`
      *[
        _type == "destination" &&
        defined(slug.current)
      ]
      | order(_createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        coverImage,
        excerpt,
        duration,
        startingCost,
        maxAltitude
      }
    `),

    client.fetch<FeaturedStory[]>(`
      *[
        _type == "post" &&
        featured == true &&
        defined(slug.current)
      ]
      | order(publishedAt desc, _createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        category,
        author,
        excerpt,
        coverImage,
        publishedAt,
        readingTime
      }
    `),

    client.fetch<FeaturedStory[]>(`
      *[
        _type == "post" &&
        defined(slug.current)
      ]
      | order(publishedAt desc, _createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        category,
        author,
        excerpt,
        coverImage,
        publishedAt,
        readingTime
      }
    `),
  ]);

  return {
    destinations:
      featuredDestinations?.length > 0
        ? featuredDestinations
        : latestDestinations ?? [],

    stories:
      featuredStories?.length > 0
        ? featuredStories
        : latestStories ?? [],
  };
}

/* =========================================================
   HOMEPAGE STATS
========================================================= */

async function getHomepageStats(): Promise<HomepageStats> {
  const stats =
    await client.fetch<HomepageStats>(`
      {
        "provinceCount": count(*[
          _type == "province"
        ]),

        "districtCount": count(*[
          _type == "district"
        ]),

        "destinationCount": count(*[
          _type == "destination"
        ]),

        "storyCount": count(*[
          _type == "post"
        ])
      }
    `);

  return {
    provinceCount:
      stats?.provinceCount ?? 0,

    districtCount:
      stats?.districtCount ?? 0,

    destinationCount:
      stats?.destinationCount ?? 0,

    storyCount:
      stats?.storyCount ?? 0,
  };
}

/* =========================================================
   HOMEPAGE DATA
========================================================= */

async function getHomepageData(): Promise<HomepageData> {
  const [content, stats] =
    await Promise.all([
      getFeaturedContent(),
      getHomepageStats(),
    ]);

  return {
    content,
    stats,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function HomePage() {
  const {
    content,
    stats,
  } = await getHomepageData();

  const canonicalUrl =
    SITE_URL;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type": "WebPage",

    "@id": `${canonicalUrl}#webpage`,

    name:
      "Nepal Travel Guides & Stories | bloggyNepal",

    url: canonicalUrl,

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    inLanguage: "en",

    isPartOf: {
      "@type": "WebSite",

      "@id": `${canonicalUrl}#website`,

      name: siteConfig.name,

      url: canonicalUrl,
    },

    about: {
      "@type": "Country",

      name: "Nepal",
    },

    publisher: {
      "@type": "Organization",

      name: siteConfig.name,

      url: canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(jsonLd),
        }}
      />

      <main className="overflow-x-hidden">
        <HomeClient
          stats={stats}
        />

        <FeaturedSection
          destinations={
            content.destinations
          }
          stories={
            content.stories
          }
        />
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-[#f1ede4] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-stone-300 pb-14 md:grid-cols-[1.2fr_1fr]">
            {/* BRAND */}

            <div>
              <Link
                href="/"
                className="font-serif text-3xl font-bold text-slate-900"
              >
                bloggy
                <span className="text-red-800">
                  Nepal
                </span>
              </Link>

              <p className="mt-4 max-w-md leading-relaxed text-slate-600">
                Honest travel guides and stories
                for people who want to experience
                Nepal more deeply, one journey at
                a time.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  [
                    "Instagram",
                    siteConfig.social.instagram,
                  ],
                  [
                    "TikTok",
                    siteConfig.social.tiktok,
                  ],
                  [
                    "Facebook",
                    siteConfig.social.facebook,
                  ],
                ]
                  .filter(
                    (
                      item
                    ): item is [
                      string,
                      string
                    ] =>
                      typeof item[1] ===
                        "string" &&
                      /^https?:\/\//i.test(
                        item[1]
                      )
                  )
                  .map(
                    ([
                      label,
                      url,
                    ]) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="me noopener noreferrer"
                        className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-800 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        {label}
                      </a>
                    )
                  )}
              </div>
            </div>

            {/* FOOTER NAVIGATION */}

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  Explore
                </p>

                <nav
                  aria-label="Footer explore navigation"
                  className="mt-4 flex flex-col gap-3 text-slate-600"
                >
                  <Link
                    href="/destinations"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Destinations
                  </Link>

                  <Link
                    href="/blog"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Stories
                  </Link>

                  <Link
                    href="/explore-nepal"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Explore Nepal
                  </Link>
                </nav>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  bloggyNepal
                </p>

                <nav
                  aria-label="Footer bloggyNepal navigation"
                  className="mt-4 flex flex-col gap-3 text-slate-600"
                >
                  <a
                    href="/about"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    About
                  </a>

                  <a
                    href="/feedback"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Feedback
                  </a>

                  <Link
                    href="/"
                    className="transition hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    Home
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              ©{" "}
              {new Date().getFullYear()}{" "}
              bloggyNepal. Made for curious
              travellers.
            </p>

            <p>
              Travel slowly. Stay curious.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}