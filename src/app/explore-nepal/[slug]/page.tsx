import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PortableText } from "@portabletext/react";

import { client } from "@/sanity/lib/client";

import {
  districtBySlugQuery,
  districtNavigationQuery,
  districtSlugsQuery,
} from "@/sanity/lib/queries";

import { urlForImage } from "@/sanity/lib/image";

import type {
  District,
  DistrictFAQ,
  DistrictNavigationItem,
  Place,
  SanityImage,
} from "@/types/district";

import { StatCard } from "@/components/StatCard";
import { PlaceCard } from "@/components/PlaceCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import ReactionBar from "@/components/ReactionBar";
import Comments from "@/components/Comments";
import FeedbackForm from "@/components/FeedbackForm";
import NewsletterSignup from "@/components/NewsletterSignup";

export const revalidate = 3600;

/* =========================================================
   SITE URL
========================================================= */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.bloggynepal.com"
).replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

function absoluteUrl(
  path: string
) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${SITE_URL}${
    path.startsWith("/")
      ? path
      : `/${path}`
  }`;
}

function truncate(
  value: string,
  maxLength: number
) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value
    .slice(0, maxLength)
    .trim()}…`;
}

function hasValidImage(
  image?: SanityImage
): image is SanityImage {
  return Boolean(
    image?.asset?._ref
  );
}

function buildImageUrl(
  image: SanityImage | undefined,
  options: {
    width: number;
    height?: number;
    quality?: number;
    fit?:
      | "clip"
      | "crop"
      | "fill"
      | "fillmax"
      | "max"
      | "scale";
  }
): string | null {
  if (!hasValidImage(image)) {
    return null;
  }

  try {
    let builder =
      urlForImage(image);

    builder = builder.width(
      options.width
    );

    if (options.height) {
      builder = builder.height(
        options.height
      );
    }

    if (options.quality) {
      builder = builder.quality(
        options.quality
      );
    }

    if (options.fit) {
      builder = builder.fit(
        options.fit
      );
    }

    return builder
      .auto("format")
      .url();
  } catch (error) {
    console.error(
      "Failed to build Sanity image URL:",
      error
    );

    return null;
  }
}

function portableTextToPlainText(
  blocks:
    | District["body"]
    | undefined
): string {
  if (!Array.isArray(blocks)) {
    return "";
  }

  return blocks
    .map(
      (block) =>
        block.children
          ?.map(
            (child) =>
              child.text || ""
          )
          .join("") || ""
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeJsonLd(
  value: unknown
) {
  return JSON.stringify(
    value
  ).replace(
    /</g,
    "\\u003c"
  );
}

/* =========================================================
   SECTION NAVIGATION
========================================================= */

interface SectionLink {
  id: string;
  label: string;
}

function SectionNavigation({
  items,
  mobile = false,
}: {
  items: SectionLink[];
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <nav
        aria-label="District sections"
        className="sticky top-16 z-30 -mx-2 mb-12 overflow-x-auto bg-[#fbfaf7]/95 px-2 py-3 backdrop-blur lg:hidden"
      >
        <div className="flex min-w-max gap-2">
          {items.map(
            (item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-amber-300 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
              >
                {item.label}
              </a>
            )
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="On this page"
      className="mt-6 space-y-1"
    >
      {items.map(
        (item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span
              aria-hidden="true"
              className="mr-3 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300 transition group-hover:bg-red-800"
            />

            {item.label}
          </a>
        )
      )}
    </nav>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  id,
  eyebrow,
  title,
  icon,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-20 scroll-mt-28"
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-red-800"
          />

          {eyebrow}
        </p>

        <h2
          id={`${id}-title`}
          className="mt-3 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-xl shadow-sm"
          >
            {icon}
          </span>

          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   CATEGORY BADGES
========================================================= */

function CategoryBadges({
  category,
}: {
  category?: string;
}) {
  if (!category) {
    return null;
  }

  const categories =
    category
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);

  if (!categories.length) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {categories.map(
        (item) => (
          <span
            key={item}
            className="rounded-full border border-amber-300/30 bg-amber-200/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md"
          >
            {item}
          </span>
        )
      )}
    </div>
  );
}

/* =========================================================
   TRIP PLANNING
========================================================= */

function TripPlanning({
  district,
  placesCount,
}: {
  district: District;
  placesCount: number;
}) {
  const bestTime =
    portableTextToPlainText(
      district.bestTimeToVisit
    );

  const transport =
    portableTextToPlainText(
      district.howToGetThere
    );

  return (
    <section
      id="planning"
      className="mb-20 scroll-mt-28"
      aria-labelledby="planning-title"
    >
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-red-800"
          />

          Plan ahead
        </p>

        <h2
          id="planning-title"
          className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Plan your visit
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          Start with the essentials below, then
          use the full guide to build a route that
          matches your time and interests.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* LOCATION */}

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
            Start here
          </p>

          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {district.headquarter ||
              "District headquarters"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {district.headquarter
              ? `${district.headquarter} is the administrative headquarters of the district and a useful reference point for planning local travel.`
              : "Use the district's major towns and transport connections as your starting points."}
          </p>

          <a
            href="#map"
            className="mt-4 inline-flex font-bold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Check the map →
          </a>
        </div>

        {/* SEASON */}

        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
            Best time
          </p>

          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            Choose your season carefully
          </h3>

          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-700">
            {bestTime ||
              "Seasonal information is provided in the Best Time to Visit section below."}
          </p>

          <a
            href="#season"
            className="mt-4 inline-flex font-bold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Read seasonal guidance →
          </a>
        </div>

        {/* TRANSPORT */}

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
            Getting there
          </p>

          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            Check the route before you leave
          </h3>

          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
            {transport ||
              "See the How to Get There section for available routes and practical transport information."}
          </p>

          <a
            href="#transport"
            className="mt-4 inline-flex font-bold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            See transport details →
          </a>
        </div>

        {/* PLACES */}

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
            Build your day
          </p>

          <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
            {placesCount > 0
              ? `${placesCount} places featured`
              : "Discover the district"}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Start with the featured places, then
            connect them using the map and nearby
            attractions sections.
          </p>

          <a
            href={
              placesCount > 0
                ? "#places"
                : "#nearby"
            }
            className="mt-4 inline-flex font-bold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Start exploring →
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FAQ
========================================================= */

function DistrictFaq({
  items,
}: {
  items: DistrictFAQ[];
}) {
  if (!items.length) {
    return null;
  }

  return (
    <Section
      id="faq"
      eyebrow="Common questions"
      title="Frequently Asked Questions"
      icon="❓"
    >
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        {items.map(
          (item, index) => {
            const question =
              item.question?.trim();

            const answer =
              item.answer?.trim();

            if (!question || !answer) {
              return null;
            }

            return (
              <details
                key={
                  item._key ||
                  `${question}-${index}`
                }
                className="group border-b border-stone-200 last:border-b-0"
              >
                <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-slate-900 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:px-8">
                  <div className="flex items-center justify-between gap-6">
                    <span>
                      {question}
                    </span>

                    <span
                      aria-hidden="true"
                      className="shrink-0 text-xl text-red-800 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </div>
                </summary>

                <div className="px-6 pb-6 text-sm leading-7 text-slate-600 sm:px-8">
                  {answer}
                </div>
              </details>
            );
          }
        )}
      </div>
    </Section>
  );
}

/* =========================================================
   STATIC PARAMS
========================================================= */

export async function generateStaticParams() {
  try {
    const slugs =
      await client.fetch<string[]>(
        districtSlugsQuery
      );

    return (
      slugs || []
    )
      .filter(
        (
          slug
        ): slug is string =>
          typeof slug === "string" &&
          slug.trim().length > 0
      )
      .map((slug) => ({
        slug,
      }));
  } catch (error) {
    console.error(
      "Failed to generate district static params:",
      error
    );

    return [];
  }
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } =
    await params;

  const district =
    await client.fetch<District | null>(
      districtBySlugQuery,
      { slug }
    );

  if (!district) {
    return {
      title:
        "District Not Found | BloggyNepal",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const provinceName =
    district.province?.name;

  const title =
    district.seo?.metaTitle ||
    `${district.name} District, Nepal | Travel Guide & Places to Visit`;

  const description =
    district.seo?.metaDescription ||
    truncate(
      `Explore ${district.name} District${
        provinceName
          ? ` in ${provinceName} Province`
          : ""
      }, Nepal. Discover places to visit, things to do, culture, history, transport, maps, the best time to visit, and practical travel information.`,
      160
    );

  const slugValue =
    district.slug?.current ||
    slug;

  const canonicalPath =
    `/explore-nepal/${slugValue}`;

  const canonicalUrl =
    absoluteUrl(
      canonicalPath
    );

  const ogImage =
    buildImageUrl(
      district.seo?.ogImage,
      {
        width: 1600,
        height: 900,
        quality: 80,
        fit: "crop",
      }
    ) ||
    buildImageUrl(
      district.coverImage,
      {
        width: 1600,
        height: 900,
        quality: 80,
        fit: "crop",
      }
    );

  return {
    metadataBase:
      new URL(SITE_URL),

    title,

    description,

    alternates: {
      canonical:
        canonicalUrl,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,

      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1600,
              height: 900,
              alt: `${district.name} District, Nepal`,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: ogImage
        ? [ogImage]
        : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ExploreNepalDistrictPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  /* =======================================================
     FETCH
  ======================================================= */

  const [
    district,
    navigationItems,
  ] = await Promise.all([
    client.fetch<District | null>(
      districtBySlugQuery,
      { slug }
    ),

    client.fetch<DistrictNavigationItem[]>(
      districtNavigationQuery
    ),
  ]);

  if (!district) {
    notFound();
  }

  /* =======================================================
     BASIC VALUES
  ======================================================= */

  const province =
    district.province ||
    null;

  const provinceSlug =
    province?.slug?.current;

  const districts =
    Array.isArray(
      navigationItems
    )
      ? navigationItems
      : [];

  const places =
    Array.isArray(
      district.places
    )
      ? district.places
      : [];

  /* =======================================================
     PREVIOUS / NEXT
  ======================================================= */

  const currentIndex =
    districts.findIndex(
      (item) =>
        item._id ===
        district._id
    );

  const previousDistrict =
    currentIndex > 0
      ? districts[
          currentIndex - 1
        ]
      : null;

  const nextDistrict =
    currentIndex >= 0 &&
    currentIndex <
      districts.length - 1
      ? districts[
          currentIndex + 1
        ]
      : null;

  /* =======================================================
     RELATED DISTRICTS
  ======================================================= */

  const relatedDistricts =
    districts
      .filter(
        (item) =>
          item._id !==
            district._id &&
          item.province?.slug
            ?.current ===
            provinceSlug
      )
      .slice(0, 4);

  /* =======================================================
     IMAGES
  ======================================================= */

  const coverUrl =
    buildImageUrl(
      district.coverImage,
      {
        width: 2400,
        quality: 80,
        fit: "crop",
      }
    );

  const mapUrl =
    buildImageUrl(
      district.mapImage,
      {
        width: 1600,
        height: 1100,
        quality: 75,
        fit: "crop",
      }
    );

  const coverAlt =
    district.coverImage?.alt ||
    `${district.name} District, Nepal`;

  /* =======================================================
     STATS
  ======================================================= */

  const calculatedDensity =
    district.density ||
    (
      district.population &&
      district.area
        ? Math.round(
            district.population /
              district.area
          )
        : null
    );

  /* =======================================================
     GALLERY
  ======================================================= */

  const gallery =
    Array.isArray(
      district.gallery
    )
      ? district.gallery.filter(
          (image) =>
            hasValidImage(image)
        )
      : [];

  /*
   * When an editor hasn't populated a dedicated
   * gallery yet, use place images as a visual fallback.
   */
  const fallbackGallery =
    places
      .filter((place: Place) =>
        hasValidImage(
          place.image
        )
      )
      .map((place: Place) => ({
        image:
          place.image as SanityImage,
        label:
          place.name,
      }));

  const galleryItems =
    gallery.length > 0
      ? gallery.map(
          (image) => ({
            image,
            label:
              image.caption ||
              district.name,
          })
        )
      : fallbackGallery;

  /* =======================================================
     FALLBACK FAQS
  ======================================================= */

  const customFaqs =
    Array.isArray(
      district.faqs
    )
      ? district.faqs.filter(
          (faq) =>
            Boolean(
              faq.question?.trim() &&
                faq.answer?.trim()
            )
        )
      : [];

  const transportText =
    portableTextToPlainText(
      district.howToGetThere
    );

  const bestTimeText =
    portableTextToPlainText(
      district.bestTimeToVisit
    );

  const faqItems: DistrictFAQ[] =
    customFaqs.length > 0
      ? customFaqs
      : [
          {
            question: `Where is ${district.name} District?`,
            answer: `${district.name} District is in ${
              province?.name ||
              "Nepal"
            }. The district headquarters is ${
              district.headquarter ||
              "provided in the district guide"
            }.`,
          },

          {
            question: `What is ${district.name} District known for?`,
            answer:
              district.category
                ? `${district.name} is highlighted for ${district.category.toLowerCase()}, along with its local landscapes, communities, culture, and places to explore.`
                : `The district guide highlights its landscapes, communities, culture, history, and places worth exploring.`,
          },

          {
            question: `How do I get to ${district.name} District?`,
            answer:
              transportText ||
              "See the How to Get There section for the available routes and practical transport information.",
          },

          {
            question: `When is the best time to visit ${district.name} District?`,
            answer:
              bestTimeText ||
              "Travel conditions vary by season and location. Check the Best Time to Visit section before setting your travel dates.",
          },

          {
            question: `Does ${district.name} District have a map?`,
            answer:
              district.mapImage ||
              district.mapEmbedUrl ||
              district.coordinates
                ? "Yes. The Location & Map section provides available map information and, where available, an interactive map or external map link."
                : "Map information is currently limited on this guide. Check the location and transport sections for available route information.",
          },
        ];

  /* =======================================================
     SECTION NAV
  ======================================================= */

  const sectionItems: SectionLink[] = [
    {
      id: "planning",
      label: "Plan Your Visit",
    },

    ...(district.body
      ? [
          {
            id: "overview",
            label: "Overview",
          },
        ]
      : []),

    ...(mapUrl ||
    district.mapEmbedUrl ||
    district.coordinates
      ? [
          {
            id: "map",
            label: "Location & Map",
          },
        ]
      : []),

    ...(places.length > 0
      ? [
          {
            id: "places",
            label: "Places to Visit",
          },
        ]
      : []),

    ...(district.thingsToDo
      ? [
          {
            id: "things",
            label: "Things to Do",
          },
        ]
      : []),

    ...(district.howToGetThere
      ? [
          {
            id: "transport",
            label: "Getting There",
          },
        ]
      : []),

    ...(district.cultureAndHistory
      ? [
          {
            id: "culture",
            label: "Culture & History",
          },
        ]
      : []),

    ...(district.bestTimeToVisit
      ? [
          {
            id: "season",
            label: "Best Time",
          },
        ]
      : []),

    ...(district.nearbyAttractions
      ? [
          {
            id: "nearby",
            label: "Nearby Attractions",
          },
        ]
      : []),

    ...(galleryItems.length > 0
      ? [
          {
            id: "gallery",
            label: "Gallery",
          },
        ]
      : []),

    {
      id: "faq",
      label: "FAQ",
    },

    {
      id: "community",
      label: "Community",
    },
  ];

  /* =======================================================
     CANONICAL URL
  ======================================================= */

  const canonicalUrl =
    absoluteUrl(
      `/explore-nepal/${
        district.slug.current
      }`
    );

  /* =======================================================
     JSON-LD
  ======================================================= */

  const webpageJsonLd = {
    "@context":
      "https://schema.org",

    "@type": "WebPage",

    "@id": `${canonicalUrl}#webpage`,

    url: canonicalUrl,

    name:
      district.seo?.metaTitle ||
      `${district.name} District, Nepal | Travel Guide`,

    description:
      district.seo
        ?.metaDescription ||
      `Explore ${district.name} District in Nepal with practical travel information, places to visit, culture, maps, transportation, and more.`,

    inLanguage: "en",

    isPartOf: {
      "@type": "WebSite",

      name: "BloggyNepal",

      url: SITE_URL,
    },

    about: {
      "@type":
        "AdministrativeArea",

      name: `${district.name} District`,

      ...(province?.name
        ? {
            containedInPlace: {
              "@type":
                "AdministrativeArea",

              name: `${province.name} Province`,
            },
          }
        : {}),

      ...(district.coordinates &&
      typeof district
        .coordinates.lat ===
        "number" &&
      typeof district
        .coordinates.lng ===
        "number"
        ? {
            geo: {
              "@type":
                "GeoCoordinates",

              latitude:
                district.coordinates
                  .lat,

              longitude:
                district.coordinates
                  .lng,
            },
          }
        : {}),
    },

    ...(coverUrl
      ? {
          primaryImageOfPage: {
            "@type":
              "ImageObject",

            contentUrl:
              coverUrl,

            caption:
              coverAlt,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position: 1,

        name: "Home",

        item: absoluteUrl("/"),
      },

      {
        "@type":
          "ListItem",

        position: 2,

        name: "Explore Nepal",

        item: absoluteUrl(
          "/explore-nepal"
        ),
      },

      ...(provinceSlug
        ? [
            {
              "@type":
                "ListItem",

              position: 3,

              name:
                province?.name ||
                "Province",

              item: absoluteUrl(
                `/provinces/${provinceSlug}`
              ),
            },

            {
              "@type":
                "ListItem",

              position: 4,

              name:
                district.name,

              item: canonicalUrl,
            },
          ]
        : [
            {
              "@type":
                "ListItem",

              position: 3,

              name:
                district.name,

              item: canonicalUrl,
            },
          ]),
    ],
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-700">
      {/* =================================================
          STRUCTURED DATA
      ================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            escapeJsonLd(
              webpageJsonLd
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            escapeJsonLd(
              breadcrumbJsonLd
            ),
        }}
      />

      {/* =================================================
          HERO
      ================================================== */}

      <section className="relative isolate min-h-[540px] overflow-hidden sm:min-h-[640px] lg:min-h-[720px]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            preload
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-amber-900"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10"
        />

        <div
          aria-hidden="true"
          className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-red-700/20 blur-3xl"
        />

        <div className="relative mx-auto flex min-h-[540px] max-w-7xl flex-col px-6 pb-12 pt-7 sm:min-h-[640px] sm:px-8 sm:pb-16 lg:min-h-[720px] lg:pb-20">
          {/* TOP NAV */}

          <div className="flex items-center justify-between gap-4">
            <Link
              href="/explore-nepal"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              <span aria-hidden="true">
                ←
              </span>

              All districts
            </Link>

            {provinceSlug && (
              <Link
                href={`/provinces/${provinceSlug}`}
                className="hidden rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:inline-flex"
              >
                {province?.name ||
                  "Province"}{" "}
                Province
              </Link>
            )}
          </div>

          {/* HERO CONTENT */}

          <div className="mt-auto max-w-5xl">
            {province && (
              <Link
                href={
                  provinceSlug
                    ? `/provinces/${provinceSlug}`
                    : "/explore-nepal"
                }
                className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-md transition hover:bg-amber-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Province{" "}
                {province.number || ""}{" "}
                · {province.name}
              </Link>
            )}

            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-8xl">
              {district.name}
            </h1>

            {district.headquarter && (
              <p className="mt-5 text-base text-white/80 sm:mt-6 sm:text-xl">
                District headquarters:{" "}
                <strong className="text-white">
                  {district.headquarter}
                </strong>
              </p>
            )}

            <CategoryBadges
              category={
                district.category
              }
            />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#planning"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-amber-900/20 transition motion-safe:hover:-translate-y-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Plan your visit

                <span aria-hidden="true">
                  ↓
                </span>
              </a>

              {district.coordinates &&
                typeof district
                  .coordinates.lat ===
                  "number" &&
                typeof district
                  .coordinates.lng ===
                  "number" && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${district.coordinates.lat},${district.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/25 bg-black/20 px-6 py-3.5 font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Open in Maps

                    <span aria-hidden="true">
                      ↗
                    </span>
                  </a>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          BREADCRUMB
      ================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-7 sm:px-8">
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },

            {
              label: "Explore Nepal",
              href: "/explore-nepal",
            },

            ...(province &&
            provinceSlug
              ? [
                  {
                    label:
                      province.name ||
                      "Province",
                    href: `/provinces/${provinceSlug}`,
                  },
                ]
              : []),

            {
              label:
                district.name,
            },
          ]}
        />
      </div>

      {/* =================================================
          QUICK FACTS
      ================================================== */}

      <section
        aria-label={`${district.name} quick facts`}
        className="mx-auto max-w-7xl px-6 py-10 sm:px-8"
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon="👥"
            label="Population"
            value={
              district.population
                ? district.population.toLocaleString(
                    "en-US"
                  )
                : "N/A"
            }
          />

          <StatCard
            icon="📏"
            label="Area"
            value={
              district.area
                ? `${district.area.toLocaleString(
                    "en-US"
                  )} km²`
                : "N/A"
            }
          />

          <StatCard
            icon="⛰️"
            label="Reference elevation"
            value={
              district.elevation
                ? `${district.elevation.toLocaleString(
                    "en-US"
                  )} m`
                : "N/A"
            }
          />

          <StatCard
            icon="🏙️"
            label="Density"
            value={
              calculatedDensity
                ? `${calculatedDensity.toLocaleString(
                    "en-US"
                  )}/km²`
                : "N/A"
            }
          />
        </div>

        {district._updatedAt && (
          <p className="mt-4 text-center text-xs text-slate-500">
            Last updated{" "}
            {new Intl.DateTimeFormat(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            ).format(
              new Date(
                district._updatedAt
              )
            )}
          </p>
        )}
      </section>

      {/* =================================================
          CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* =================================================
              DESKTOP SIDEBAR
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                Explore
              </p>

              <h2 className="mt-2 font-serif text-xl font-bold text-slate-900">
                On this page
              </h2>

              <SectionNavigation
                items={sectionItems}
              />

              {province &&
                provinceSlug && (
                  <div className="mt-6 border-t border-stone-100 pt-6">
                    <Link
                      href={`/provinces/${provinceSlug}`}
                      className="block rounded-2xl bg-slate-950 p-4 text-white transition hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <p className="text-xs uppercase tracking-wider text-amber-300">
                        Explore more
                      </p>

                      <p className="mt-1 font-bold">
                        {province.name}{" "}
                        Province
                      </p>

                      <span className="mt-3 block text-sm text-white/70">
                        View province →
                      </span>
                    </Link>
                  </div>
                )}
            </div>
          </aside>

          {/* =================================================
              MAIN CONTENT
          ================================================== */}

          <div className="min-w-0">
            {/* MOBILE NAV */}

            <SectionNavigation
              items={sectionItems}
              mobile
            />

            {/* =================================================
                PLANNING
            ================================================== */}

            <TripPlanning
              district={district}
              placesCount={
                places.length
              }
            />

            {/* =================================================
                OVERVIEW
            ================================================== */}

            {district.body && (
              <Section
                id="overview"
                eyebrow="Introduction"
                title={`${district.name} Overview`}
                icon="🏔️"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline-offset-4 hover:prose-a:text-red-900">
                    <PortableText
                      value={
                        district.body
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                MAP
            ================================================== */}

            {(mapUrl ||
              district.mapEmbedUrl ||
              district.coordinates) && (
              <Section
                id="map"
                eyebrow="Find your way"
                title="Location & Map"
                icon="🗺️"
              >
                <div className="space-y-5">
                  {mapUrl && (
                    <figure className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          src={mapUrl}
                          alt={
                            district
                              .mapImage
                              ?.alt ||
                            `${district.name} District map, Nepal`
                          }
                          width={1600}
                          height={1100}
                          sizes="(max-width: 768px) 100vw, 900px"
                          className="h-auto w-full"
                        />
                      </div>

                      {district
                        .mapImage
                        ?.caption && (
                        <figcaption className="px-4 py-4 text-sm leading-6 text-slate-600">
                          {
                            district
                              .mapImage
                              .caption
                          }
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {district.mapEmbedUrl && (
                    <details className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                      <summary className="cursor-pointer px-6 py-5 font-semibold text-slate-900 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                        View interactive map
                      </summary>

                      <div className="border-t border-stone-100 p-2">
                        <iframe
                          src={
                            district.mapEmbedUrl
                          }
                          width="100%"
                          height="500"
                          style={{
                            border: 0,
                          }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Interactive map of ${district.name} District`}
                          className="rounded-2xl"
                        />
                      </div>
                    </details>
                  )}

                  {district.coordinates &&
                    typeof district
                      .coordinates.lat ===
                      "number" &&
                    typeof district
                      .coordinates.lng ===
                      "number" && (
                      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Coordinates
                        </p>

                        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-900">
                            {district.coordinates.lat.toFixed(
                              5
                            )}
                            ,{" "}
                            {district.coordinates.lng.toFixed(
                              5
                            )}
                          </p>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${district.coordinates.lat},${district.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          >
                            Open in Google Maps ↗
                          </a>
                        </div>
                      </div>
                    )}
                </div>
              </Section>
            )}

            {/* =================================================
                PLACES
            ================================================== */}

            {places.length > 0 && (
              <Section
                id="places"
                eyebrow="Worth the journey"
                title="Places to Visit"
                icon="✨"
              >
                <div className="grid gap-7 md:grid-cols-2">
                  {places.map(
                    (place) => (
                      <PlaceCard
                        key={
                          place._key ||
                          place.name
                        }
                        place={place}
                      />
                    )
                  )}
                </div>
              </Section>
            )}

            {/* =================================================
                THINGS TO DO
            ================================================== */}

            {district.thingsToDo && (
              <Section
                id="things"
                eyebrow="Experiences"
                title="Things to Do"
                icon="🎒"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline-offset-4">
                    <PortableText
                      value={
                        district.thingsToDo
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                TRANSPORT
            ================================================== */}

            {district.howToGetThere && (
              <Section
                id="transport"
                eyebrow="Plan your route"
                title="How to Get There"
                icon="🚗"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline-offset-4">
                    <PortableText
                      value={
                        district.howToGetThere
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                CULTURE
            ================================================== */}

            {district.cultureAndHistory && (
              <Section
                id="culture"
                eyebrow="The deeper story"
                title="Culture & History"
                icon="🏛️"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline-offset-4">
                    <PortableText
                      value={
                        district.cultureAndHistory
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                BEST TIME
            ================================================== */}

            {district.bestTimeToVisit && (
              <Section
                id="season"
                eyebrow="Choose your season"
                title="Best Time to Visit"
                icon="🌤️"
              >
                <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline-offset-4">
                    <PortableText
                      value={
                        district.bestTimeToVisit
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                NEARBY
            ================================================== */}

            {district.nearbyAttractions && (
              <Section
                id="nearby"
                eyebrow="Continue your journey"
                title="Nearby Attractions"
                icon="📍"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800">
                    <p className="whitespace-pre-line">
                      {
                        district.nearbyAttractions
                      }
                    </p>
                  </div>

                  {/* INTERNAL LINKING */}

                  <div className="mt-8 border-t border-stone-100 pt-6">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Continue exploring
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {provinceSlug && (
                        <Link
                          href={`/provinces/${provinceSlug}`}
                          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          Explore{" "}
                          {province?.name ||
                            "province"}{" "}
                          Province →
                        </Link>
                      )}

                      {relatedDistricts
                        .slice(0, 3)
                        .map(
                          (
                            related
                          ) => {
                            const relatedSlug =
                              related
                                .slug
                                ?.current;

                            if (
                              !relatedSlug
                            ) {
                              return null;
                            }

                            return (
                              <Link
                                key={
                                  related._id
                                }
                                href={`/explore-nepal/${relatedSlug}`}
                                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                              >
                                {
                                  related.name
                                }{" "}
                                →
                              </Link>
                            );
                          }
                        )}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* =================================================
                GALLERY
            ================================================== */}

            {galleryItems.length >
              0 && (
              <Section
                id="gallery"
                eyebrow="A closer look"
                title={
                  gallery.length >
                  0
                    ? "Gallery"
                    : "Places in Pictures"
                }
                icon="📸"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {galleryItems.map(
                    (
                      item,
                      index
                    ) => {
                      const imageUrl =
                        buildImageUrl(
                          item.image,
                          {
                            width: 1100,
                            height: 825,
                            quality: 75,
                            fit: "crop",
                          }
                        );

                      if (!imageUrl) {
                        return null;
                      }

                      return (
                        <figure
                          key={
                            item.image
                              .asset?._ref
                              ? `${item.image.asset._ref}-${index}`
                              : `gallery-${index}`
                          }
                          className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                            <Image
                              src={
                                imageUrl
                              }
                              alt={
                                item.image
                                  .alt ||
                                `${district.name} District, Nepal`
                              }
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:scale-105"
                            />
                          </div>

                          {item.image
                            .caption && (
                            <figcaption className="p-4 text-sm leading-6 text-slate-600">
                              {
                                item.image
                                  .caption
                              }
                            </figcaption>
                          )}

                          {(item.image
                            .credit ||
                            item.image
                              .source) && (
                            <p className="px-4 pb-4 text-xs text-slate-400">
                              {item.image
                                .credit
                                ? `Photo: ${item.image.credit}`
                                : `Source: ${item.image.source}`}
                            </p>
                          )}
                        </figure>
                      );
                    }
                  )}
                </div>

                {gallery.length ===
                  0 && (
                  <p className="mt-5 text-sm text-slate-500">
                    These visuals are
                    drawn from the
                    places featured in
                    this district guide.
                  </p>
                )}
              </Section>
            )}

            {/* =================================================
                PREVIOUS / NEXT
            ================================================== */}

            {(previousDistrict ||
              nextDistrict) && (
              <section
                aria-label="District navigation"
                className="mb-20 border-y border-stone-200 py-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {previousDistrict ? (
                    <Link
                      href={`/explore-nepal/${
                        previousDistrict.slug
                          ?.current || ""
                      }`}
                      className="group rounded-3xl border border-stone-200 bg-white p-6 transition motion-safe:hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Previous district
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                        ←{" "}
                        {
                          previousDistrict.name
                        }
                      </p>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextDistrict && (
                    <Link
                      href={`/explore-nepal/${
                        nextDistrict.slug
                          ?.current || ""
                      }`}
                      className="group rounded-3xl border border-stone-200 bg-white p-6 text-right transition motion-safe:hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Next district
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                        {
                          nextDistrict.name
                        }{" "}
                        →
                      </p>
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                RELATED DISTRICTS
            ================================================== */}

            {relatedDistricts.length >
              0 && (
              <section
                aria-labelledby="related-title"
                className="mb-20"
              >
                <div className="mb-8">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span
                      aria-hidden="true"
                      className="h-px w-8 bg-red-800"
                    />

                    Continue exploring
                  </p>

                  <h2
                    id="related-title"
                    className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl"
                  >
                    More from{" "}
                    {province?.name ||
                      "this province"}
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedDistricts.map(
                    (
                      related
                    ) => {
                      const relatedSlug =
                        related.slug
                          ?.current;

                      if (
                        !relatedSlug
                      ) {
                        return null;
                      }

                      return (
                        <Link
                          key={
                            related._id
                          }
                          href={`/explore-nepal/${relatedSlug}`}
                          className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition motion-safe:hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        >
                          <div className="relative flex h-40 items-end overflow-hidden bg-gradient-to-br from-red-900 via-slate-900 to-amber-700">
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                            />

                            <h3 className="relative z-10 p-4 font-serif text-xl font-bold text-white transition-colors group-hover:text-amber-200">
                              {
                                related.name
                              }
                            </h3>
                          </div>
                        </Link>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                FAQ
            ================================================== */}

            <DistrictFaq
              items={faqItems}
            />

            {/* =================================================
                COMMUNITY
            ================================================== */}

            <section
              id="community"
              className="mb-20 scroll-mt-28"
              aria-labelledby="community-title"
            >
              <div className="mb-8">
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-red-800"
                  />

                  Community
                </p>

                <h2
                  id="community-title"
                  className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
                >
                  Share your experience
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Tell us what you discovered,
                  share useful local knowledge, or
                  help another traveller find
                  something worth experiencing.
                </p>
              </div>

              <ReactionBar
                postId={
                  district._id
                }
                postSlug={
                  district.slug.current ||
                  ""
                }
                contentType="district"
              />

              <div className="mt-12">
                <Comments
                  postSlug={
                    district.slug.current ||
                    ""
                  }
                  contentType="district"
                />
              </div>

              <div className="mt-12">
                <FeedbackForm />
              </div>
            </section>

            {/* =================================================
                NEWSLETTER
            ================================================== */}

            <section className="mb-20">
              <NewsletterSignup />
            </section>

            {/* =================================================
                FINAL CTA
            ================================================== */}

            <section
              aria-labelledby="district-final-cta"
              className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12"
            >
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"
              />

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Keep exploring Nepal
                </p>

                <h2
                  id="district-final-cta"
                  className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl"
                >
                  Every district has
                  another story to tell.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
                  Continue through Nepal's
                  landscapes, communities, history,
                  traditions, food, and remarkable
                  places — one district at a time.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/explore-nepal#districts"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition motion-safe:hover:-translate-y-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Explore another district

                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/destinations"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    View travel guides
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}