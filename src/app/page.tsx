import type { Metadata } from "next";

import { client } from "@/lib/sanity";
import { siteConfig } from "@/lib/site";

import HomeClient from "@/components/HomeClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nepal Travel Guides & Stories",

  description:
    "Explore Nepal beyond the postcard with honest travel guides, destinations, itineraries, local insights, practical budgets, and real travel stories.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Nepal Travel Guides & Stories | bloggyNepal",

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    url: "/",

    type: "website",

    images: [
      {
        url: siteConfig.images.og,
        width: 1200,
        height: 630,
        alt: "bloggyNepal — Nepal Travel Guides & Stories",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Nepal Travel Guides & Stories | bloggyNepal",

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    images: [siteConfig.images.og],
  },
};

type FeaturedContent = {
  destinations: any[];
  stories: any[];
};

async function getFeaturedContent(): Promise<FeaturedContent> {
  const [
    featuredDestinations,
    latestDestinations,
    featuredStories,
    latestStories,
  ] = await Promise.all([
    // --------------------------------------------------------
    // FEATURED DESTINATIONS
    // --------------------------------------------------------
    client.fetch(`
      *[
        _type == "destination" &&
        featured == true
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

    // --------------------------------------------------------
    // FALLBACK DESTINATIONS
    // --------------------------------------------------------
    client.fetch(`
      *[
        _type == "destination"
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

    // --------------------------------------------------------
    // FEATURED STORIES
    // --------------------------------------------------------
    client.fetch(`
      *[
        _type == "post" &&
        featured == true
      ]
      | order(publishedAt desc, _createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        excerpt,
        coverImage,
        publishedAt
      }
    `),

    // --------------------------------------------------------
    // FALLBACK STORIES
    // --------------------------------------------------------
    client.fetch(`
      *[
        _type == "post"
      ]
      | order(publishedAt desc, _createdAt desc)[0...4] {
        _id,
        title,
        slug,
        region,
        excerpt,
        coverImage,
        publishedAt
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

export default async function HomePage() {
  const content = await getFeaturedContent();

  const jsonLd = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    name: "Nepal Travel Guides & Stories | bloggyNepal",

    url: siteConfig.url,

    description:
      "Honest Nepal travel guides, destinations, itineraries, local insights, and real travel stories.",

    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },

    about: {
      "@type": "Country",
      name: "Nepal",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <HomeClient content={content} />
    </>
  );
}