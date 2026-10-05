import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import {
  client,
  urlForImage,
} from "@/lib/sanity";

import NewsletterSignup from "@/components/NewsletterSignup";
import { Breadcrumb } from "@/components/Breadcrumb";

import type { Destination } from "@/types/destination";

import { siteConfig } from "@/lib/site";

export const revalidate = 3600;

/* =========================================================
   METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase: new URL(
    siteConfig.url.replace(/\/$/, "")
  ),

  title:
    "Nepal Destinations | Travel Guides, Treks & Places to Visit",

  description:
    "Explore Nepal's best destinations with practical travel guides covering routes, itineraries, costs, seasons, safety, maps, and places worth visiting.",

  alternates: {
    canonical: "/destinations",
  },

  openGraph: {
    title:
      "Nepal Destinations | bloggyNepal",

    description:
      "Explore Nepal through practical destination guides, itineraries, maps, costs, seasons, and travel advice.",

    url: "/destinations",

    type: "website",

    images: [
      {
        url: siteConfig.images.og,
        width: 1200,
        height: 630,
        alt:
          "bloggyNepal Nepal destination guides",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Nepal Destinations | bloggyNepal",

    description:
      "Practical Nepal destination guides, itineraries, maps, costs, and travel advice.",

    images: [
      siteConfig.images.og,
    ],
  },
};

/* =========================================================
   REGION OPTIONS
========================================================= */

const REGIONS = [
  "Everest Region",
  "Annapurna Region",
  "Langtang & Helambu",
  "Manaslu Region",
  "Mustang",
  "Dolpo",
  "Kathmandu Valley",
  "Lumbini",
  "Eastern Nepal",
  "Central Nepal",
  "Western Nepal",
  "Karnali",
  "Far West Nepal",
  "Sudurpashchim",
  "Terai",
  "Mid-Hills",
] as const;

const DIFFICULTIES = [
  "Easy",
  "Moderate",
  "Challenging",
  "Strenuous",
] as const;

const allDestinationsQuery = `*[_type == "destination"] | order(featured desc, title asc)`;

/* =========================================================
   HELPERS
========================================================= */

function normalize(
  value: string | undefined
) {
  return (value || "")
    .trim()
    .toLowerCase();
}

function buildDestinationImage(
  destination: Destination
) {
  if (
    !destination.coverImage?.asset
  ) {
    return null;
  }

  try {
    return urlForImage(
      destination.coverImage
    )
      .width(1200)
      .height(800)
      .quality(82)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    region?: string;
    difficulty?: string;
  }>;
}) {
  const params =
    searchParams
      ? await searchParams
      : {};

  const query =
    (params.q || "").trim();

  const selectedRegion =
    (params.region || "").trim();

  const selectedDifficulty =
    (params.difficulty || "").trim();

  const destinations =
    await client.fetch<
      Destination[]
    >(allDestinationsQuery);

  const all =
    Array.isArray(destinations)
      ? destinations
      : [];

  const normalizedQuery =
    normalize(query);

  const filtered =
    all.filter(
      (destination) => {
        const searchable = [
          destination.title,
          destination.excerpt,
          destination.region,
          destination.difficulty,
          destination.bestSeason,
          ...(destination.activityTypes ||
            []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQuery =
          !normalizedQuery ||
          searchable.includes(
            normalizedQuery
          );

        const matchesRegion =
          !selectedRegion ||
          destination.region ===
            selectedRegion;

        const matchesDifficulty =
          !selectedDifficulty ||
          destination.difficulty ===
            selectedDifficulty;

        return (
          matchesQuery &&
          matchesRegion &&
          matchesDifficulty
        );
      }
    );

  const featuredCount =
    all.filter(
      (destination) =>
        destination.featured
    ).length;

  const jsonLd = {
    "@context":
      "https://schema.org",

    "@type": "CollectionPage",

    name:
      "Nepal Destinations | bloggyNepal",

    url: `${siteConfig.url.replace(
      /\/$/,
      ""
    )}/destinations`,

    description:
      "Explore Nepal through practical destination guides, itineraries, maps, costs, seasons, and travel advice.",

    isPartOf: {
      "@type": "WebSite",

      name:
        siteConfig.name,

      url:
        siteConfig.url,
    },

    about: {
      "@type": "Country",

      name: "Nepal",
    },
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:py-32">
        <div
          aria-hidden="true"
          className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-size-[32px_32px] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] opacity-[0.05]"
        />

        <div className="relative mx-auto max-w-7xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-amber-300"
            />

            Plan the journey
          </p>

          <h1 className="mx-auto mt-7 max-w-5xl font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover the places
            <span className="mt-2 block bg-linear-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              that make Nepal.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">
            Explore practical destination guides
            built around real journeys — routes,
            itineraries, costs, seasons, maps,
            culture, safety, and the details that
            help you decide whether a place is right
            for you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-white/75">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              🗺️ Practical routes
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              📋 Real itineraries
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              💰 Travel costs
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
              🎒 Local planning tips
            </span>
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
              label:
                "Destinations",
            },
          ]}
        />
      </div>

      {/* =====================================================
          DIRECTORY HEADER + FILTER
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-5 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />

              Destination guides
            </p>

            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Choose where the road leads
            </h2>

            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Browse our growing collection of
              Nepal destination guides, then use
              the practical information to plan a
              trip that actually fits your time,
              budget and travel style.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-stone-200">
              <p className="font-serif text-3xl font-bold text-slate-900">
                {all.length}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Guides
              </p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-stone-200">
              <p className="font-serif text-3xl font-bold text-slate-900">
                {featuredCount}
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Featured
              </p>
            </div>

            <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-stone-200">
              <p className="font-serif text-3xl font-bold text-slate-900">
                Nepal
              </p>

              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                One country
              </p>
            </div>
          </div>
        </div>

        <form
          method="GET"
          action="/destinations"
          className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_230px_190px_auto]">
            <label className="block">
              <span className="sr-only">
                Search destinations
              </span>

              <input
                type="search"
                name="q"
                defaultValue={
                  params.q || ""
                }
                placeholder="Search destinations, activities or regions..."
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-700 focus:ring-4 focus:ring-red-700/10"
              />
            </label>

            <label className="block">
              <span className="sr-only">
                Filter by region
              </span>

              <select
                name="region"
                defaultValue={
                  selectedRegion
                }
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10"
              >
                <option value="">
                  All regions
                </option>

                {REGIONS.map(
                  (region) => (
                    <option
                      key={region}
                      value={region}
                    >
                      {region}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="block">
              <span className="sr-only">
                Filter by difficulty
              </span>

              <select
                name="difficulty"
                defaultValue={
                  selectedDifficulty
                }
                className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-red-700 focus:ring-4 focus:ring-red-700/10"
              >
                <option value="">
                  All difficulty
                </option>

                {DIFFICULTIES.map(
                  (difficulty) => (
                    <option
                      key={difficulty}
                      value={
                        difficulty
                      }
                    >
                      {difficulty}
                    </option>
                  )
                )}
              </select>
            </label>

            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-7 py-4 font-bold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/50"
            >
              Search
            </button>
          </div>

          {(query ||
            selectedRegion ||
            selectedDifficulty) && (
            <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <strong className="text-slate-900">
                  {
                    filtered.length
                  }
                </strong>{" "}
                matching{" "}
                {filtered.length ===
                1
                  ? "destination"
                  : "destinations"}
                .
              </p>

              <Link
                href="/destinations"
                className="text-sm font-bold text-red-800 hover:underline"
              >
                Clear filters
              </Link>
            </div>
          )}
        </form>
      </section>

      {/* =====================================================
          DESTINATION GRID
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:pb-28">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-14 text-center shadow-sm sm:p-20">
            <div
              aria-hidden="true"
              className="text-6xl"
            >
              🏔️
            </div>

            <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">
              No destinations found
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Try a different destination,
              activity, region, or difficulty.
            </p>

            <Link
              href="/destinations"
              className="mt-7 inline-flex rounded-full bg-red-800 px-6 py-3.5 font-bold text-white transition hover:bg-red-900"
            >
              Show all destinations
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">
                Showing{" "}
                <strong className="text-slate-900">
                  {filtered.length}
                </strong>{" "}
                {filtered.length ===
                1
                  ? "destination"
                  : "destinations"}
              </p>

              <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm ring-1 ring-stone-200">
                Explore Nepal
              </span>
            </div>

            <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map(
                (
                  destination,
                  index
                ) => {
                  const imageUrl =
                    buildDestinationImage(
                      destination
                    );

                  const slug =
                    destination.slug
                      ?.current;

                  if (!slug) {
                    return null;
                  }

                  return (
                    <article
                      key={
                        destination._id
                      }
                      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl motion-reduce:transition-none"
                    >
                      <Link
                        href={`/destinations/${slug}`}
                        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                          {imageUrl ? (
                            <Image
                              src={
                                imageUrl
                              }
                              alt={
                                destination
                                  .coverImage
                                  ?.alt ||
                                `${destination.title} travel destination in Nepal`
                              }
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                            />
                          ) : (
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-linear-to-br from-red-950 via-slate-900 to-amber-800"
                            >
                              <div className="flex h-full items-center justify-center text-6xl">
                                🏔️
                              </div>
                            </div>
                          )}

                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent"
                          />

                          {destination.featured && (
                            <span className="absolute left-5 top-5 rounded-full bg-amber-300 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-950 shadow-lg">
                              Featured
                            </span>
                          )}

                          <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                            {destination.region ||
                              "Nepal"}
                          </span>

                          <span className="absolute bottom-5 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-slate-900 shadow-lg">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-7">
                          <h2 className="font-serif text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-3xl">
                            {
                              destination.title
                            }
                          </h2>

                          {destination.excerpt && (
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
                              {
                                destination.excerpt
                              }
                            </p>
                          )}

                          <div className="mt-6 flex flex-wrap gap-2">
                            {destination.duration && (
                              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                                🕐{" "}
                                {
                                  destination.duration
                                }
                              </span>
                            )}

                            {destination.difficulty && (
                              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                                ⛰️{" "}
                                {
                                  destination.difficulty
                                }
                              </span>
                            )}

                            {destination.maxAltitude && (
                              <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                                ↑{" "}
                                {
                                  destination.maxAltitude
                                }
                              </span>
                            )}

                            {destination.startingCost !==
                              undefined && (
                              <span className="rounded-full bg-red-800/10 px-3 py-1.5 text-xs font-bold text-red-800">
                                From $
                                {
                                  destination.startingCost
                                }
                              </span>
                            )}
                          </div>

                          <div className="mt-auto pt-7">
                            <span className="inline-flex items-center gap-2 font-bold text-red-800">
                              Read full guide

                              <span
                                aria-hidden="true"
                                className="transition-transform duration-300 group-hover:translate-x-2"
                              >
                                →
                              </span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                }
              )}
            </div>
          </>
        )}
      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}

      <section className="bg-[#f1ede4] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </section>

      {/* =====================================================
          FINAL INTERNAL LINK
      ====================================================== */}

      <section className="bg-[#f1ede4] px-6 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-4xl bg-slate-950 p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Go beyond individual destinations
            </p>

            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold sm:text-4xl">
              Explore Nepal district by district.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/65">
              Discover the people, landscapes,
              culture and places that connect
              Nepal&apos;s destinations together.
            </p>
          </div>

          <Link
            href="/explore-nepal"
            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-amber-300 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            Explore Nepal
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* =====================================================
          JSON-LD
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />
    </main>
  );
}