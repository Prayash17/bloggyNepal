import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import {
  allDistrictsQuery,
  districtBySlugQuery,
  districtSlugsQuery,
} from "@/sanity/lib/queries";

import { urlForImage } from "@/sanity/lib/image";

import type { District, Place } from "@/types/district";

import { StatCard } from "@/components/StatCard";
import { PlaceCard } from "@/components/PlaceCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import ReactionBar from "@/components/ReactionBar";
import Comments from "@/components/Comments";
import FeedbackForm from "@/components/FeedbackForm";
import NewsletterSignup from "@/components/NewsletterSignup";
export const revalidate = 3600;

/* =========================================================
   TYPES
========================================================= */

type SanityImageLike = {
  asset?: {
    _ref?: string;
  } | null;
  alt?: string;
  caption?: string;
  credit?: string;
  source?: string;
  license?: string;
};

function hasValidImageAsset(
  image: unknown
): image is SanityImageLike & {
  asset: {
    _ref: string;
  };
} {
  if (!image || typeof image !== "object") {
    return false;
  }

  const value = image as SanityImageLike;

  return Boolean(value.asset && value.asset._ref);
}

/**
 * Build a Sanity image URL safely.
 *
 * Returns null instead of crashing the page when the image
 * is malformed, missing, or partially imported.
 */
function buildImageUrl(
  image: unknown,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "scale";
  }
): string | null {
  if (!hasValidImageAsset(image)) {
    return null;
  }

  try {
    let builder = urlForImage(image);

    if (options?.width) {
      builder = builder.width(options.width);
    }

    if (options?.height) {
      builder = builder.height(options.height);
    }

    if (options?.quality) {
      builder = builder.quality(options.quality);
    }

    if (options?.fit) {
      builder = builder.fit(options.fit);
    }

    return builder.auto("format").url();
  } catch (error) {
    console.error("Failed to build Sanity image URL:", error);
    return null;
  }
}

/* =========================================================
   STATIC PARAMS
========================================================= */

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<string[]>(
      districtSlugsQuery
    );

    return (slugs || [])
      .filter(
        (slug): slug is string =>
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const district: District | null = await client.fetch(
    districtBySlugQuery,
    { slug }
  );

  if (!district) {
    return {
      title: "District Not Found | bloggyNepal",
    };
  }

  const title =
    district.seo?.metaTitle ||
    `${district.name} District, Nepal | Travel Guide & Places to Visit`;

  const description =
    district.seo?.metaDescription ||
    `Explore ${district.name} District in Nepal — places to visit, things to do, local culture, history, transportation, maps, the best time to visit, and travel inspiration.`;

  const ogImage =
    buildImageUrl(district.seo?.ogImage, {
      width: 1600,
      height: 900,
      quality: 90,
      fit: "crop",
    }) ||
    buildImageUrl(district.coverImage, {
      width: 1600,
      height: 900,
      quality: 90,
      fit: "crop",
    });

  const slugValue = district.slug?.current || slug;

  return {
    title,
    description,

    alternates: {
      canonical: `/explore-nepal/${slugValue}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: `/explore-nepal/${slugValue}`,
      images: ogImage ? [ogImage] : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
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
  id?: string;
  eyebrow: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mb-20 scroll-mt-28"
    >
      <div className="mb-8">
        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
          <span className="h-px w-8 bg-red-800" />
          {eyebrow}
        </p>

        <h2 className="mt-3 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-xl shadow-sm">
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

  const categories = category
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {categories.map((item) => (
        <span
          key={item}
          className="rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-100 backdrop-blur-md"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function ExploreNepalDistrictPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const district: District | null = await client.fetch(
    districtBySlugQuery,
    { slug }
  );

  if (!district) {
    notFound();
  }

  const allDistricts =
    await client.fetch<District[]>(allDistrictsQuery);

  const districts = Array.isArray(allDistricts)
    ? allDistricts
    : [];

  const province = district.province || null;
  const provinceSlug = province?.slug?.current;

  /* =======================================================
     RELATED DISTRICTS
  ======================================================= */

  const relatedDistricts = districts
    .filter(
      (item) =>
        item._id !== district._id &&
        item.province?.slug?.current === provinceSlug
    )
    .slice(0, 4);

  /* =======================================================
     PREVIOUS / NEXT
  ======================================================= */

  const currentIndex = districts.findIndex(
    (item) => item._id === district._id
  );

  const previousDistrict =
    currentIndex > 0
      ? districts[currentIndex - 1]
      : null;

  const nextDistrict =
    currentIndex >= 0 &&
    currentIndex < districts.length - 1
      ? districts[currentIndex + 1]
      : null;

  /* =======================================================
     IMAGE URLS
  ======================================================= */

  const coverUrl = buildImageUrl(
    district.coverImage,
    {
      width: 2400,
      quality: 90,
      fit: "crop",
    }
  );

  const mapUrl = buildImageUrl(
    district.mapImage,
    {
      width: 1600,
      height: 1100,
      quality: 90,
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
    (district.population && district.area
      ? Math.round(
          district.population / district.area
        )
      : null);

  /* =======================================================
     SAFE CONTENT ARRAYS
  ======================================================= */

  const places = Array.isArray(district.places)
    ? district.places
    : [];

  const gallery = Array.isArray(district.gallery)
    ? district.gallery.filter(hasValidImageAsset)
    : [];

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate min-h-[680px] overflow-hidden sm:min-h-[760px]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-amber-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col px-6 pb-14 pt-8 sm:min-h-[760px] sm:px-8 sm:pb-20">
          {/* TOP NAV */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/explore-nepal"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-x-1 hover:bg-white hover:text-slate-950"
            >
              <span>←</span>
              All districts
            </Link>

            {provinceSlug && (
              <Link
                href={`/provinces/${provinceSlug}`}
                className="hidden rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 sm:inline-flex"
              >
                {province?.name || "Province"} Province
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
                className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-md transition hover:bg-amber-300 hover:text-slate-950"
              >
                Province {province.number || ""} ·{" "}
                {province.name}
              </Link>
            )}

            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl">
              {district.name}
            </h1>

            {district.headquarter && (
              <p className="mt-6 text-lg text-white/75 sm:text-xl">
                District headquarters:{" "}
                <strong className="text-white">
                  {district.headquarter}
                </strong>
              </p>
            )}

            <CategoryBadges
              category={district.category}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#overview"
                className="inline-flex items-center gap-3 rounded-full bg-amber-300 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-amber-900/20 transition hover:-translate-y-1 hover:bg-amber-200"
              >
                Discover this district
                <span>↓</span>
              </a>

              {district.coordinates &&
                typeof district.coordinates.lat ===
                  "number" &&
                typeof district.coordinates.lng ===
                  "number" && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${district.coordinates.lat},${district.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-black/10 px-6 py-3.5 font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950"
                  >
                    Open in Maps
                    <span>↗</span>
                  </a>
                )}
            </div>
          </div>
        </div>
      </section>

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
              label: "Explore Nepal",
              href: "/explore-nepal",
            },
            ...(province && provinceSlug
              ? [
                  {
                    label:
                      province.name || "Province",
                    href: `/provinces/${provinceSlug}`,
                  },
                ]
              : []),
            {
              label: district.name,
            },
          ]}
        />
      </div>

      {/* =====================================================
          QUICK FACTS
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon="👥"
            label="Population"
            value={
              district.population
                ? district.population.toLocaleString()
                : "N/A"
            }
          />

          <StatCard
            icon="📏"
            label="Area"
            value={
              district.area
                ? `${district.area.toLocaleString()} km²`
                : "N/A"
            }
          />

          <StatCard
            icon="⛰️"
            label="Elevation"
            value={
              district.elevation
                ? `${district.elevation.toLocaleString()} m`
                : "N/A"
            }
          />

          <StatCard
            icon="🏙️"
            label="Density"
            value={
              calculatedDensity
                ? `${calculatedDensity.toLocaleString()}/km²`
                : "N/A"
            }
          />
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                Explore
              </p>

              <h3 className="mt-2 font-serif text-xl font-bold text-slate-900">
                On this page
              </h3>

              <nav className="mt-6 space-y-1">
                {[
  ["overview", "Overview"],
  ["map", "Location & Map"],
  ["places", "Places to Visit"],
  ["things", "Things to Do"],
  ["transport", "How to Get There"],
  ["culture", "Culture & History"],
  ["season", "Best Time to Visit"],
  ["nearby", "Nearby Attractions"],
  ["gallery", "Gallery"],
  ["community", "Community"],
].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                  >
                    <span className="mr-3 h-1.5 w-1.5 rounded-full bg-stone-300 transition group-hover:bg-red-800" />
                    {label}
                  </a>
                ))}
              </nav>

              {province && provinceSlug && (
                <div className="mt-6 border-t border-stone-100 pt-6">
                  <Link
                    href={`/provinces/${provinceSlug}`}
                    className="block rounded-2xl bg-slate-950 p-4 text-white transition hover:bg-red-900"
                  >
                    <p className="text-xs uppercase tracking-wider text-amber-300">
                      Explore more
                    </p>

                    <p className="mt-1 font-bold">
                      {province.name} Province
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
            {/* ===============================================
                MOBILE SECTION NAVIGATION
            ================================================ */}

            <div className="mb-12 overflow-x-auto lg:hidden">
              <div className="flex min-w-max gap-2">
                {[
  ["overview", "Overview"],
  ["map", "Map"],
  ["places", "Places"],
  ["things", "Things to Do"],
  ["transport", "Getting There"],
  ["culture", "Culture"],
  ["season", "Best Time"],
  ["nearby", "Nearby"],
  ["gallery", "Gallery"],
  ["community", "Community"],
].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 whitespace-nowrap transition hover:border-amber-300 hover:text-red-800"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* ===============================================
                OVERVIEW
            ================================================ */}

            {district.body && (
              <Section
                id="overview"
                eyebrow="Introduction"
                title={`${district.name} Overview`}
                icon="🏔️"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-p:text-slate-700 prose-a:text-red-800">
                    <PortableText value={district.body} />
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                MAP
            ================================================ */}

            {(mapUrl || district.mapEmbedUrl) && (
              <Section
                id="map"
                eyebrow="Find your way"
                title="Location & Map"
                icon="🗺️"
              >
                <div
                  className={`grid gap-6 ${
                    mapUrl && district.mapEmbedUrl
                      ? "md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {mapUrl && (
                    <div className="group overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
                      <div className="overflow-hidden rounded-2xl">
                        <Image
                          src={mapUrl}
                          alt={
                            district.mapImage?.alt ||
                            `${district.name} district map`
                          }
                          width={1600}
                          height={1100}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="h-auto w-full transition duration-700 group-hover:scale-[1.02]"
                        />
                      </div>
                    </div>
                  )}

                  {district.mapEmbedUrl && (
                    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-sm">
                      <iframe
                        src={district.mapEmbedUrl}
                        width="100%"
                        height="500"
                        style={{
                          border: 0,
                        }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Map of ${district.name}`}
                        className="rounded-2xl"
                      />
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* ===============================================
                PLACES
            ================================================ */}

            {places.length > 0 && (
              <Section
                id="places"
                eyebrow="Worth the journey"
                title="Places to Visit"
                icon="✨"
              >
                <div className="grid gap-7 md:grid-cols-2">
                  {places.map((place: Place) => {
                    // Transform place to match PlaceCard prop type (slug as string)
                    const placeForCard = {
                      ...place,
                      slug: place.slug?.current || place.name,
                    };
                    return (
                      <PlaceCard
                        key={
                          place._key ||
                          place.slug?.current ||
                          place.name
                        }
                        place={placeForCard}
                      />
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ===============================================
                THINGS TO DO
            ================================================ */}

            {district.thingsToDo && (
              <Section
                id="things"
                eyebrow="Experiences"
                title="Things to Do"
                icon="🎒"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-a:text-red-800">
                    <PortableText
                      value={district.thingsToDo}
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                TRANSPORT
            ================================================ */}

            {district.howToGetThere && (
              <Section
                id="transport"
                eyebrow="Plan your route"
                title="How to Get There"
                icon="🚗"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-a:text-red-800">
                    <PortableText
                      value={district.howToGetThere}
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                CULTURE
            ================================================ */}

            {district.cultureAndHistory && (
              <Section
                id="culture"
                eyebrow="The deeper story"
                title="Culture & History"
                icon="🏛️"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-a:text-red-800">
                    <PortableText
                      value={
                        district.cultureAndHistory
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                BEST TIME
            ================================================ */}

            {district.bestTimeToVisit && (
              <Section
                id="season"
                eyebrow="Choose your season"
                title="Best Time to Visit"
                icon="🌤️"
              >
                <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8 prose-a:text-red-800">
                    <PortableText
                      value={
                        district.bestTimeToVisit
                      }
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                NEARBY
            ================================================ */}

            {district.nearbyAttractions && (
              <Section
                id="nearby"
                eyebrow="Continue your journey"
                title="Nearby Attractions"
                icon="📍"
              >
                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-p:leading-8">
                    <p className="whitespace-pre-line">
                      {district.nearbyAttractions}
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* ===============================================
                GALLERY
            ================================================ */}

            {gallery.length > 0 && (
              <Section
                id="gallery"
                eyebrow="A closer look"
                title="Gallery"
                icon="📸"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gallery.map((image, index) => {
                    const imageUrl =
                      buildImageUrl(image, {
                        width: 1400,
                        height: 1000,
                        quality: 88,
                        fit: "crop",
                      });

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
                              `${district.name} gallery image ${index + 1}`
                            }
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition duration-700 group-hover:scale-110"
                          />
                        </div>

                        {image.caption && (
                          <figcaption className="p-4 text-sm leading-6 text-slate-600">
                            {image.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* ===============================================
                PREVIOUS / NEXT
            ================================================ */}

            {(previousDistrict || nextDistrict) && (
              <section className="mb-20 border-y border-stone-200 py-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {previousDistrict ? (
                    <Link
                      href={`/explore-nepal/${previousDistrict.slug.current}`}
                      className="group rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Previous district
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                        ← {previousDistrict.name}
                      </p>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextDistrict && (
                    <Link
                      href={`/explore-nepal/${nextDistrict.slug.current}`}
                      className="group rounded-3xl border border-stone-200 bg-white p-6 text-right transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Next district
                      </p>

                      <p className="mt-2 font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                        {nextDistrict.name} →
                      </p>
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* ===============================================
                RELATED DISTRICTS
            ================================================ */}

            {relatedDistricts.length > 0 && (
              <section className="mb-20">
                <div className="mb-8">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Continue exploring
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    More from {province?.name || "this province"}
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedDistricts.map(
                    (related) => {
                      const relatedImage =
                        buildImageUrl(
                          related.coverImage,
                          {
                            width: 1000,
                            height: 700,
                            quality: 85,
                            fit: "crop",
                          }
                        );

                      return (
                        <Link
                          key={related._id}
                          href={`/explore-nepal/${related.slug.current}`}
                          className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-red-900 to-slate-950">
                            {relatedImage ? (
                              <Image
                                src={relatedImage}
                                alt={
                                  related.coverImage?.alt ||
                                  `${related.name} District, Nepal`
                                }
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover transition duration-700 group-hover:scale-110"
                              />
                            ) : null}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                            <h3 className="absolute bottom-4 left-4 right-4 font-serif text-xl font-bold text-white">
                              {related.name}
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
    COMMUNITY ENGAGEMENT
================================================= */}

<section
  id="community"
  className="mb-20 scroll-mt-28"
>
  <div className="mb-8">
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
      <span className="h-px w-8 bg-red-800" />
      Community
    </p>

    <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
      Share your experience
    </h2>

    <p className="mt-3 max-w-2xl leading-7 text-slate-600">
      Tell us how you felt about this district,
      share your experience, or help another
      traveller discover something worth seeing.
    </p>
  </div>

  {/* Reactions */}
  <ReactionBar
    postId={district._id}
    postSlug={district.slug.current}
    contentType="district"
  />

  {/* Comments */}
  <div className="mt-12">
    <Comments
      postSlug={district.slug.current}
      contentType="district"
    />
  </div>

  {/* Feedback */}
  <div className="mt-12">
    <FeedbackForm />
  </div>
</section>

{/* =================================================
    NEWSLETTER
================================================= */}

<section className="mb-20">
  <NewsletterSignup />
</section>

            {/* ===============================================
                CTA
            ================================================ */}

            <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Keep exploring Nepal
                </p>

                <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  Every district has another story to tell.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/65">
                  Keep discovering Nepal's people, landscapes,
                  history, traditions, food, and remarkable places —
                  one district at a time.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/explore-nepal"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200"
                  >
                    Browse all districts
                    <span>→</span>
                  </Link>

                  <Link
                    href="/destinations"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white hover:text-slate-950"
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