import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  PortableText,
} from "@portabletext/react";

import {
  client,
  urlForImage,
} from "@/lib/sanity";

import {
  destinationBySlugQuery,
  destinationSlugsQuery,
  relatedDestinationsQuery,
} from "@/sanity/lib/destinationQueries";
import type {
  Destination,
  DestinationNavigationItem,
} from "@/types/destination";

import { siteConfig } from "@/lib/site";

import NewsletterSignup from "@/components/NewsletterSignup";
import ReactionBar from "@/components/ReactionBar";
import Comments from "@/components/Comments";
import FeedbackForm from "@/components/FeedbackForm";
import { Breadcrumb } from "@/components/Breadcrumb";

/* =========================================================
   REVALIDATION
========================================================= */

export const revalidate = 3600;

/* =========================================================
   HELPERS
========================================================= */

function buildImageUrl(
  image:
    | Destination["coverImage"]
    | Destination["mapImage"],
  width: number,
  height?: number,
  quality = 80
) {
  if (!image?.asset) {
    return null;
  }

  try {
    let builder =
      urlForImage(image).width(
        width
      );

    if (height) {
      builder =
        builder.height(height);
    }

    return builder
      .quality(quality)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

function absoluteUrl(
  path: string
) {
  return new URL(
    path,
    siteConfig.url
  ).toString();
}

function jsonLdScript(
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
   SECTION
========================================================= */

function Section({
  id,
  eyebrow,
  title,
  icon,
  children,
  className = "",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mb-20 scroll-mt-28 ${className}`}
    >
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-red-800"
          />

          {eyebrow}
        </p>

        <h2 className="mt-3 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
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
   PROSE
========================================================= */

function RichText({
  value,
}: {
  value?: Destination["overview"];
}) {
  if (
    !value ||
    value.length === 0
  ) {
    return null;
  }

  return (
    <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800 prose-a:underline prose-a:decoration-amber-400 prose-a:underline-offset-4 prose-strong:text-slate-900">
      <PortableText
        value={value}
      />
    </div>
  );
}

/* =========================================================
   QUICK FACT
========================================================= */

function QuickFact({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="text-xl"
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 font-semibold leading-6 text-slate-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero({
  destination,
  coverUrl,
}: {
  destination: Destination;
  coverUrl: string | null;
}) {
  const provinceSlug =
    destination.province
      ?.slug?.current;

  const districtSlug =
    destination.district
      ?.slug?.current;

  return (
    <section className="relative isolate min-h-[650px] overflow-hidden sm:min-h-[760px]">
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={
            destination
              .coverImage
              ?.alt ||
            destination.title
          }
          fill
          priority
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
        className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-red-700/20 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col px-6 pb-14 pt-8 sm:min-h-[760px] sm:px-8 sm:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span aria-hidden="true">
              ←
            </span>

            All destinations
          </Link>

          {destination.featured && (
            <span className="rounded-full bg-amber-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg">
              Featured guide
            </span>
          )}
        </div>

        <div className="mt-auto max-w-5xl">
          {destination.region && (
            <span className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-md">
              {destination.region}
            </span>
          )}

          <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-8xl">
            {destination.title}
          </h1>

          {destination.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/80 sm:text-xl">
              {destination.excerpt}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-2">
            {destination.activityTypes
              ?.slice(0, 6)
              .map(
                (activity) => (
                  <span
                    key={activity}
                    className="rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md"
                  >
                    {activity}
                  </span>
                )
              )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#overview"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-3.5 font-bold text-slate-950 shadow-lg transition hover:-translate-y-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              Start planning
              <span aria-hidden="true">
                ↓
              </span>
            </a>

            {destination.coordinates
              ?.lat !==
              undefined &&
              destination.coordinates
                ?.lng !==
                undefined && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${destination.coordinates.lat},${destination.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/25 bg-black/15 px-6 py-3.5 font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Open in Maps
                  <span aria-hidden="true">
                    ↗
                  </span>
                </a>
              )}

            {destination.district
              ?.slug?.current && (
              <Link
                href={`/explore-nepal/${destination.district.slug.current}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-black/15 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Explore district
                <span aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>

          {(destination.province ||
            destination.district) && (
            <p className="mt-5 text-sm text-white/65">
              {destination.district
                ?.name &&
                `District: ${destination.district.name}`}

              {destination.district
                ?.name &&
                destination.province
                  ?.name &&
                " · "}

              {destination.province
                ?.name &&
                `Province: ${destination.province.name}`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ITINERARY
========================================================= */

function Itinerary({
  days,
}: {
  days?: Destination["itinerary"];
}) {
  if (
    !days ||
    days.length === 0
  ) {
    return null;
  }

  const sortedDays =
    [...days].sort(
      (a, b) =>
        a.day - b.day
    );

  return (
    <div className="space-y-5">
      {sortedDays.map(
        (item, index) => (
          <article
            key={`${item.day}-${item.title}-${index}`}
            className="relative rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex gap-5">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-800 text-sm font-bold text-white shadow-sm">
                  {item.day}
                </span>

                {index <
                  sortedDays.length -
                    1 && (
                  <span
                    aria-hidden="true"
                    className="mt-2 h-full min-h-10 w-px bg-stone-200"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
                  Day {item.day}
                </p>

                <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                  {item.description}
                </p>

                {item.overnight && (
                  <div className="mt-5 inline-flex rounded-2xl bg-stone-100 px-4 py-3 text-sm text-slate-700">
                    <strong className="mr-2">
                      Overnight:
                    </strong>

                    {item.overnight}
                  </div>
                )}
              </div>
            </div>
          </article>
        )
      )}
    </div>
  );
}

/* =========================================================
   GALLERY
========================================================= */

function Gallery({
  destination,
}: {
  destination: Destination;
}) {
  const images =
    Array.isArray(
      destination.gallery
    )
      ? destination.gallery
      : [];

  if (
    images.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map(
        (image, index) => {
          const imageUrl =
            buildImageUrl(
              image,
              1400,
              1000,
              78
            );

          if (!imageUrl) {
            return null;
          }

          return (
            <figure
              key={
                image.asset?._ref
                  ? `${image.asset._ref}-${index}`
                  : `gallery-${index}`
              }
              className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={
                    image.alt ||
                    `${destination.title} gallery image ${index + 1}`
                  }
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />
              </div>

              {(image.caption ||
                image.credit) && (
                <figcaption className="space-y-1 p-4">
                  {image.caption && (
                    <p className="text-sm leading-6 text-slate-600">
                      {
                        image.caption
                      }
                    </p>
                  )}

                  {image.credit && (
                    <p className="text-xs text-slate-400">
                      Photo:{" "}
                      {
                        image.credit
                      }
                    </p>
                  )}
                </figcaption>
              )}
            </figure>
          );
        }
      )}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export async function generateStaticParams() {
  const slugs =
    await client.fetch<
      string[]
    >(
      destinationSlugsQuery
    );

  return (
    slugs || []
  )
    .filter(
      (
        slug
      ): slug is string =>
        typeof slug ===
          "string" &&
        slug.trim()
          .length > 0
    )
    .map(
      (slug) => ({
        slug,
      })
    );
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

  const destination =
    await client.fetch<Destination | null>(
      destinationBySlugQuery,
      { slug }
    );

  if (!destination) {
    return {
      title:
        "Destination Not Found | bloggyNepal",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    destination.seo
      ?.metaTitle ||
    `${destination.title} | Nepal Travel Guide`;

  const description =
    destination.seo
      ?.metaDescription ||
    destination.excerpt ||
    `Plan a trip to ${destination.title} with practical travel information, routes, itinerary, costs, seasons, safety and things to do.`;

  const image =
    buildImageUrl(
      destination.seo
        ?.ogImage,
      1600,
      900,
      82
    ) ||
    buildImageUrl(
      destination.coverImage,
      1600,
      900,
      82
    );

  const canonical =
    `/destinations/${destination.slug.current}`;

  return {
    metadataBase:
      new URL(
        siteConfig.url.replace(
          /\/$/,
          ""
        )
      ),

    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,

      images: image
        ? [
            {
              url: image,
              width: 1600,
              height: 900,
              alt:
                destination
                  .seo
                  ?.ogImage
                  ?.alt ||
                destination
                  .coverImage
                  ?.alt ||
                destination.title,
            },
          ]
        : [],
    },

    twitter: {
      card:
        "summary_large_image",

      title,
      description,

      images: image
        ? [image]
        : [],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview":
          "large",
        "max-snippet": -1,
        "max-video-preview":
          -1,
      },
    },
  };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default async function DestinationPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  const destination =
    await client.fetch<Destination | null>(
      destinationBySlugQuery,
      { slug }
    );

  if (!destination) {
    notFound();
  }

  const related =
    await client.fetch<
      DestinationNavigationItem[]
    >(
      relatedDestinationsQuery,
      {
        destinationId:
          destination._id,
        region:
          destination.region ||
          "",
      }
    );

  const coverUrl =
    buildImageUrl(
      destination.coverImage,
      2400,
      1500,
      84
    );

  const mapUrl =
    buildImageUrl(
      destination.mapImage,
      1600,
      1000,
      80
    );

  const provinceSlug =
    destination.province
      ?.slug?.current;

  const districtSlug =
    destination.district
      ?.slug?.current;

  const canonicalUrl =
    absoluteUrl(
      `/destinations/${destination.slug.current}`
    );

  /* =======================================================
     STRUCTURED DATA
  ======================================================== */

  const breadcrumbItems = [
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
      name: "Destinations",
      item: absoluteUrl(
        "/destinations"
      ),
    },

    ...(destination.province &&
    provinceSlug
      ? [
          {
            "@type":
              "ListItem",
            position: 3,
            name:
              destination
                .province
                .name ||
              "Province",
            item: absoluteUrl(
              `/provinces/${provinceSlug}`
            ),
          },
        ]
      : []),

    ...(destination.district &&
    districtSlug
      ? [
          {
            "@type":
              "ListItem",
            position:
              destination.province
                ? 4
                : 3,
            name:
              destination
                .district
                .name ||
              "District",
            item: absoluteUrl(
              `/explore-nepal/${districtSlug}`
            ),
          },
        ]
      : []),

    {
      "@type":
        "ListItem",
      position:
        destination.province &&
        destination.district
          ? 5
          : 3 +
            Number(
              Boolean(
                destination.province
              )
            ),
      name:
        destination.title,
      item: canonicalUrl,
    },
  ];

  const structuredData = [
    {
      "@context":
        "https://schema.org",

      "@type":
        "TouristDestination",

      "@id": `${canonicalUrl}#destination`,

      name:
        destination.title,

      description:
        destination.excerpt,

      url:
        canonicalUrl,

      touristType:
        destination.activityTypes,

      image:
        coverUrl
          ? [coverUrl]
          : undefined,

      containedInPlace:
        destination.province
          ? {
              "@type":
                "AdministrativeArea",
              name:
                destination
                  .province
                  .name,
            }
          : undefined,

      geo:
        destination.coordinates
          ?.lat !==
          undefined &&
        destination.coordinates
          ?.lng !==
          undefined
          ? {
              "@type":
                "GeoCoordinates",
              latitude:
                destination
                  .coordinates
                  .lat,
              longitude:
                destination
                  .coordinates
                  .lng,
            }
          : undefined,
    },

    {
      "@context":
        "https://schema.org",

      "@type":
        "BreadcrumbList",

      itemListElement:
        breadcrumbItems,
    },

    {
      "@context":
        "https://schema.org",

      "@type":
        "WebPage",

      "@id": `${canonicalUrl}#webpage`,

      name:
        destination.title,

      url:
        canonicalUrl,

      description:
        destination.excerpt,

      isPartOf: {
        "@type":
          "WebSite",

        name:
          siteConfig.name,

        url:
          siteConfig.url,
      },

      about: {
        "@type":
          "TouristDestination",

        name:
          destination.title,
      },
    },

    ...(destination.faqs &&
    destination.faqs.length > 0
      ? [
          {
            "@context":
              "https://schema.org",

            "@type":
              "FAQPage",

            mainEntity:
              destination
                .faqs
                .map(
                  (faq) => ({
                    "@type":
                      "Question",

                    name:
                      faq.question,

                    acceptedAnswer: {
                      "@type":
                        "Answer",

                      text:
                        faq.answer,
                    },
                  })
                ),
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <Hero
        destination={
          destination
        }
        coverUrl={coverUrl}
      />

      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-7 sm:px-8">
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },

            {
              label:
                "Destinations",
              href: "/destinations",
            },

            ...(destination
              .province &&
            provinceSlug
              ? [
                  {
                    label:
                      destination
                        .province
                        .name ||
                      "Province",
                    href: `/provinces/${provinceSlug}`,
                  },
                ]
              : []),

            ...(destination
              .district &&
            districtSlug
              ? [
                  {
                    label:
                      destination
                        .district
                        .name ||
                      "District",
                    href: `/explore-nepal/${districtSlug}`,
                  },
                ]
              : []),

            {
              label:
                destination.title,
            },
          ]}
        />
      </div>

      {/* =====================================================
          QUICK FACTS
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickFact
            icon="🕐"
            label="Typical duration"
            value={
              destination.duration
            }
          />

          <QuickFact
            icon="⛰️"
            label="Difficulty"
            value={
              destination.difficulty
            }
          />

          <QuickFact
            icon="↑"
            label="Maximum altitude"
            value={
              destination.maxAltitude
            }
          />

          <QuickFact
            icon="🌤️"
            label="Best season"
            value={
              destination.bestSeason
            }
          />
        </div>
      </section>

      {/* =====================================================
          CONTENT LAYOUT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                Plan your trip
              </p>

              <h2 className="mt-2 font-serif text-xl font-bold text-slate-900">
                On this page
              </h2>

              <nav
                aria-label="Destination sections"
                className="mt-6 space-y-1"
              >
                {[
                  [
                    "overview",
                    "Overview",
                  ],
                  [
                    "things",
                    "Things to Do",
                  ],
                  [
                    "route",
                    "How to Get There",
                  ],
                  [
                    "itinerary",
                    "Itinerary",
                  ],
                  [
                    "cost",
                    "Budget & Costs",
                  ],
                  [
                    "season",
                    "Best Time",
                  ],
                  [
                    "accommodation",
                    "Accommodation",
                  ],
                  [
                    "culture",
                    "Culture & History",
                  ],
                  [
                    "planning",
                    "Planning & Safety",
                  ],
                  [
                    "faq",
                    "FAQs",
                  ],
                  [
                    "nearby",
                    "Nearby",
                  ],
                  [
                    "gallery",
                    "Gallery",
                  ],
                  [
                    "community",
                    "Community",
                  ],
                ].map(
                  ([id, label]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      {label}
                    </a>
                  )
                )}
              </nav>

              {(provinceSlug ||
                districtSlug) && (
                <div className="mt-6 space-y-2 border-t border-stone-100 pt-6">
                  {provinceSlug && (
                    <Link
                      href={`/provinces/${provinceSlug}`}
                      className="block rounded-2xl bg-slate-950 p-4 text-white transition hover:bg-red-900"
                    >
                      <p className="text-xs uppercase tracking-wider text-amber-300">
                        Province
                      </p>

                      <p className="mt-1 font-bold">
                        {
                          destination
                            .province
                            ?.name
                        }
                      </p>
                    </Link>
                  )}

                  {districtSlug && (
                    <Link
                      href={`/explore-nepal/${districtSlug}`}
                      className="block rounded-2xl border border-stone-200 p-4 transition hover:border-amber-300 hover:bg-amber-50"
                    >
                      <p className="text-xs uppercase tracking-wider text-red-800">
                        District
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {
                          destination
                            .district
                            ?.name
                        }
                      </p>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* =================================================
              MAIN CONTENT
          ================================================== */}

          <div className="min-w-0">
            {/* =================================================
                MOBILE NAV
            ================================================== */}

            <div className="mb-12 overflow-x-auto lg:hidden">
              <nav
                aria-label="Destination section navigation"
                className="flex min-w-max gap-2"
              >
                {[
                  [
                    "overview",
                    "Overview",
                  ],
                  [
                    "things",
                    "Things",
                  ],
                  [
                    "route",
                    "Getting There",
                  ],
                  [
                    "itinerary",
                    "Itinerary",
                  ],
                  [
                    "cost",
                    "Costs",
                  ],
                  [
                    "season",
                    "Best Time",
                  ],
                  [
                    "culture",
                    "Culture",
                  ],
                  [
                    "planning",
                    "Safety",
                  ],
                  [
                    "faq",
                    "FAQs",
                  ],
                  [
                    "nearby",
                    "Nearby",
                  ],
                  [
                    "gallery",
                    "Gallery",
                  ],
                ].map(
                  ([id, label]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-amber-300 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      {label}
                    </a>
                  )
                )}
              </nav>
            </div>

            {/* =================================================
                OVERVIEW
            ================================================== */}

            {destination.overview &&
              destination
                .overview
                .length > 0 && (
                <Section
                  id="overview"
                  eyebrow="Know the place"
                  title={`${destination.title} Overview`}
                  icon="🏔️"
                >
                  <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                    <RichText
                      value={
                        destination.overview
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                HIGHLIGHTS
            ================================================== */}

            {destination.highlights &&
              destination.highlights
                .length > 0 && (
                <Section
                  eyebrow="Why go"
                  title="Destination Highlights"
                  icon="✨"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {destination.highlights.map(
                      (
                        highlight,
                        index
                      ) => (
                        <div
                          key={`${highlight}-${index}`}
                          className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
                        >
                          <div className="flex gap-4">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                              {index +
                                1}
                            </span>

                            <p className="leading-7 text-slate-700">
                              {
                                highlight
                              }
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Section>
              )}

            {/* =================================================
                THINGS TO DO
            ================================================== */}

            {destination.thingsToDo &&
              destination
                .thingsToDo
                .length > 0 && (
                <Section
                  id="things"
                  eyebrow="Experiences"
                  title="Things to Do"
                  icon="🎒"
                >
                  <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                    <RichText
                      value={
                        destination.thingsToDo
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                LOCATION & MAP
            ================================================== */}

            {(mapUrl ||
              destination.mapEmbedUrl) && (
              <Section
                eyebrow="Find your way"
                title="Location & Map"
                icon="🗺️"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {mapUrl && (
                    <figure className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          src={mapUrl}
                          alt={
                            destination
                              .mapImage
                              ?.alt ||
                            `${destination.title} map`
                          }
                          width={1600}
                          height={1000}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="h-auto w-full"
                        />
                      </div>
                    </figure>
                  )}

                  {destination.mapEmbedUrl && (
                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
                      <iframe
                        src={
                          destination.mapEmbedUrl
                        }
                        width="100%"
                        height="500"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${destination.title}`}
                        className="min-h-[360px] w-full rounded-2xl border-0"
                      />
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* =================================================
                HOW TO GET THERE
            ================================================== */}

            {destination.howToGetThere &&
              destination
                .howToGetThere
                .length > 0 && (
                <Section
                  id="route"
                  eyebrow="Plan the journey"
                  title="How to Get There"
                  icon="🚗"
                >
                  <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                    <RichText
                      value={
                        destination.howToGetThere
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                ITINERARY
            ================================================== */}

            {destination.itinerary &&
              destination.itinerary
                .length > 0 && (
                <Section
                  id="itinerary"
                  eyebrow="A realistic pace"
                  title="Suggested Itinerary"
                  icon="📋"
                >
                  <Itinerary
                    days={
                      destination.itinerary
                    }
                  />
                </Section>
              )}

            {/* =================================================
                COSTS
            ================================================== */}

            {(destination
              .costBreakdown
              ?.length ||
              destination.budgetNotes
                ?.length) && (
              <Section
                id="cost"
                eyebrow="Know before you go"
                title="Budget & Costs"
                icon="💰"
              >
                {destination
                  .costBreakdown &&
                  destination
                    .costBreakdown
                    .length >
                    0 && (
                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] border-collapse">
                          <thead className="bg-stone-100 text-left">
                            <tr>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Expense
                              </th>

                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Typical cost
                              </th>

                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Notes
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {destination.costBreakdown.map(
                              (
                                item,
                                index
                              ) => (
                                <tr
                                  key={`${item.item}-${index}`}
                                  className="border-t border-stone-100"
                                >
                                  <td className="px-6 py-5 font-semibold text-slate-900">
                                    {
                                      item.item
                                    }
                                  </td>

                                  <td className="px-6 py-5 font-bold text-red-800">
                                    {
                                      item.amount
                                    }
                                  </td>

                                  <td className="px-6 py-5 text-sm leading-6 text-slate-600">
                                    {
                                      item.notes ||
                                      "Costs may vary by season and travel style."
                                    }
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {destination.budgetNotes &&
                  destination.budgetNotes.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-9">
                    <RichText
                      value={
                        destination.budgetNotes
                      }
                    />
                  </div>
                )}
              </Section>
            )}

            {/* =================================================
                BEST TIME
            ================================================== */}

            {destination.bestTimeToVisit &&
              destination
                .bestTimeToVisit
                .length > 0 && (
                <Section
                  id="season"
                  eyebrow="Choose your window"
                  title="Best Time to Visit"
                  icon="🌤️"
                >
                  <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-7 shadow-sm sm:p-10">
                    <div className="mb-5 rounded-2xl border border-amber-200/70 bg-white/60 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">
                        Quick answer
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold text-slate-900">
                        {destination.bestSeason ||
                          "Check seasonal conditions before travel"}
                      </p>
                    </div>

                    <RichText
                      value={
                        destination.bestTimeToVisit
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                ACCOMMODATION
            ================================================== */}

            {destination.accommodation &&
              destination
                .accommodation
                .length > 0 && (
                <Section
                  id="accommodation"
                  eyebrow="Where to stay"
                  title="Accommodation & Food"
                  icon="🏡"
                >
                  <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                    <RichText
                      value={
                        destination.accommodation
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                CULTURE
            ================================================== */}

            {destination.cultureAndHistory &&
              destination
                .cultureAndHistory
                .length > 0 && (
                <Section
                  id="culture"
                  eyebrow="The deeper story"
                  title="Culture & History"
                  icon="🏛️"
                >
                  <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                    <RichText
                      value={
                        destination.cultureAndHistory
                      }
                    />
                  </div>
                </Section>
              )}

            {/* =================================================
                PLANNING
            ================================================== */}

            {(destination.permits
                ?.length ||
              destination.packingList
                ?.length ||
              destination.safetyTips
                ?.length ||
              destination.proTips
                ?.length) && (
              <Section
                id="planning"
                eyebrow="Prepare properly"
                title="Planning & Safety"
                icon="🎒"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {destination.permits &&
                    destination.permits
                      .length > 0 && (
                      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                        <h3 className="font-serif text-2xl font-bold text-slate-900">
                          Permits & Entry
                        </h3>

                        <ul className="mt-5 space-y-3">
                          {destination.permits.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-7 text-slate-600"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-800"
                                />

                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {destination.packingList &&
                    destination.packingList
                      .length > 0 && (
                      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
                        <h3 className="font-serif text-2xl font-bold text-slate-900">
                          What to Pack
                        </h3>

                        <ul className="mt-5 space-y-3">
                          {destination.packingList.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-7 text-slate-600"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500"
                                />

                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {destination.safetyTips &&
                    destination.safetyTips
                      .length > 0 && (
                      <div className="rounded-3xl border border-red-100 bg-red-50 p-7 shadow-sm">
                        <h3 className="font-serif text-2xl font-bold text-slate-900">
                          Safety
                        </h3>

                        <ul className="mt-5 space-y-3">
                          {destination.safetyTips.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-7 text-slate-700"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-1.5 font-bold text-red-800"
                                >
                                  ✓
                                </span>

                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {destination.proTips &&
                    destination.proTips
                      .length > 0 && (
                      <div className="rounded-3xl border border-stone-200 bg-slate-950 p-7 text-white shadow-sm">
                        <h3 className="font-serif text-2xl font-bold">
                          Pro Tips
                        </h3>

                        <ul className="mt-5 space-y-3">
                          {destination.proTips.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-7 text-white/75"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-1 text-amber-300"
                                >
                                  →
                                </span>

                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </Section>
            )}

            {/* =================================================
                FAQ
            ================================================== */}

            {destination.faqs &&
              destination.faqs
                .length > 0 && (
                <Section
                  id="faq"
                  eyebrow="Common questions"
                  title="Frequently Asked Questions"
                  icon="❓"
                >
                  <div className="space-y-3">
                    {destination.faqs.map(
                      (
                        faq,
                        index
                      ) => (
                        <details
                          key={`${faq.question}-${index}`}
                          className="group rounded-2xl border border-stone-200 bg-white shadow-sm"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-semibold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset sm:px-7"
                          >
                            <span>
                              {
                                faq.question
                              }
                            </span>

                            <span
                              aria-hidden="true"
                              className="shrink-0 text-xl text-red-800 transition-transform duration-300 group-open:rotate-45"
                            >
                              +
                            </span>
                          </summary>

                          <div className="border-t border-stone-100 px-6 py-5 text-sm leading-7 text-slate-600 sm:px-7">
                            {
                              faq.answer
                            }
                          </div>
                        </details>
                      )
                    )}
                  </div>
                </Section>
              )}

            {/* =================================================
                NEARBY
            ================================================== */}

            {related.length >
              0 && (
              <Section
                id="nearby"
                eyebrow="Continue the journey"
                title="Nearby Destinations"
                icon="📍"
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related
                    .filter(
                      (
                        item
                      ) =>
                        item.slug
                          ?.current
                    )
                    .map(
                      (item) => {
                        const imageUrl =
                          buildImageUrl(
                            item.coverImage,
                            1000,
                            700,
                            78
                          );

                        return (
                          <Link
                            key={
                              item._id
                            }
                            href={`/destinations/${item.slug.current}`}
                            className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                              {imageUrl ? (
                                <Image
                                  src={
                                    imageUrl
                                  }
                                  alt={
                                    item
                                      .coverImage
                                      ?.alt ||
                                    item.title
                                  }
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                                />
                              ) : (
                                <div
                                  aria-hidden="true"
                                  className="absolute inset-0 bg-gradient-to-br from-red-900 to-slate-950"
                                />
                              )}

                              <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
                              />

                              <h3 className="absolute bottom-4 left-4 right-4 font-serif text-xl font-bold text-white">
                                {
                                  item.title
                                }
                              </h3>
                            </div>

                            <div className="p-5">
                              <p className="text-sm leading-6 text-slate-600">
                                {[
                                  item.region,
                                  item.difficulty,
                                  item.duration,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    " · "
                                  )}
                              </p>

                              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-800">
                                Explore destination
                                <span
                                  aria-hidden="true"
                                  className="transition-transform group-hover:translate-x-1"
                                >
                                  →
                                </span>
                              </span>
                            </div>
                          </Link>
                        );
                      }
                    )}
                </div>
              </Section>
            )}

            {/* =================================================
                GALLERY
            ================================================== */}

            {destination.gallery &&
              destination.gallery
                .length > 0 && (
                <Section
                  id="gallery"
                  eyebrow="A closer look"
                  title="Gallery"
                  icon="📸"
                >
                  <Gallery
                    destination={
                      destination
                    }
                  />
                </Section>
              )}

            {/* =================================================
                EDITORIAL VERIFICATION
            ================================================== */}

            {destination
              .factCheckedAt && (
              <section className="mb-20 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
                      Editorial note
                    </p>

                    <h2 className="mt-2 font-serif text-2xl font-bold text-slate-900">
                      Travel information checked
                    </h2>
                  </div>

                  <time
                    dateTime={
                      destination.factCheckedAt
                    }
                    className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-slate-600"
                  >
                    {new Intl.DateTimeFormat(
                      "en-US",
                      {
                        year: "numeric",
                        month:
                          "long",
                        day: "numeric",
                      }
                    ).format(
                      new Date(
                        destination.factCheckedAt
                      )
                    )}
                  </time>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  Travel information can change.
                  Reconfirm transport,
                  permits, prices,
                  accommodation and local
                  conditions before departure,
                  especially for remote or
                  seasonal destinations.
                </p>

                {destination.sources &&
                  destination.sources
                    .length > 0 && (
                    <div className="mt-6 border-t border-stone-100 pt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Sources
                      </p>

                      <ul className="mt-3 space-y-2">
                        {destination.sources.map(
                          (
                            source,
                            index
                          ) => (
                            <li
                              key={`${source.name}-${index}`}
                              className="text-sm"
                            >
                              <a
                                href={
                                  source.url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-800 underline decoration-amber-400 underline-offset-4 hover:text-red-950"
                              >
                                {
                                  source.name
                                }
                              </a>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </section>
            )}

            {/* =================================================
                COMMUNITY
            ================================================== */}

            <Section
              id="community"
              eyebrow="From travelers"
              title="Share your experience"
              icon="💬"
            >
              <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                <p className="max-w-2xl leading-7 text-slate-600">
                  Have you been here? Share what
                  you learned, what surprised you,
                  or what another traveler should
                  know before going.
                </p>

                <div className="mt-8">
                  <ReactionBar
                    postId={
                      destination._id
                    }
                    postSlug={
                      destination.slug?.current ??
                      destination._id
                    }
                    contentType="destination"
                  />
                </div>

                <div className="mt-10">
                  <Comments
                    postSlug={
                      destination.slug?.current ??
                      destination._id
                    }
                    contentType="destination"
                  />
                </div>

                <div className="mt-10">
                  <FeedbackForm />
                </div>
              </div>
            </Section>

            {/* =================================================
                NEWSLETTER
            ================================================== */}

            <section className="mb-20">
              <NewsletterSignup />
            </section>

            {/* =================================================
                FINAL CTA
            ================================================== */}

            <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"
              />

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Keep exploring Nepal
                </p>

                <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  One destination is only the beginning.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                  Discover more places, districts,
                  cultures and journeys across
                  Nepal.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/destinations"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Browse destinations

                    <span aria-hidden="true">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/explore-nepal"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    Explore districts
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* =====================================================
          JSON-LD
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            structuredData
              .map(
                (item) =>
                  jsonLdScript(
                    item
                  )
              )
              .join(""),
        }}
      />
    </main>
  );
}