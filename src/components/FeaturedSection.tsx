"use client";

import {
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";

/* =========================================================
   TYPES
========================================================= */

export type FeaturedImage = {
  alt?: string;

  asset?: {
    _ref?: string;
    _id?: string;
  };
};

export type FeaturedDestination = {
  _id: string;

  title: string;

  slug: {
    current: string;
  };

  excerpt?: string;

  region?: string;

  duration?: string;

  startingCost?: number;

  maxAltitude?: number;

  coverImage?: FeaturedImage;
};

export type FeaturedStory = {
  _id: string;

  title: string;

  slug: {
    current: string;
  };

  excerpt?: string;

  region?: string;

  category?: string;

  author?: string;

  publishedAt?: string;

  readingTime?: number;

  coverImage?: FeaturedImage;
};

/* =========================================================
   IMAGE HELPER
========================================================= */

function getImageUrl(
  image?: FeaturedImage,
  width = 1200,
  height = 800
) {
  if (
    !image?.asset?._ref
  ) {
    return null;
  }

  try {
    return urlForImage(
      image
    )
      .width(width)
      .height(height)
      .quality(75)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

/* =========================================================
   FEATURED DESTINATION CARD
========================================================= */

function DestinationCard({
  destination,
}: {
  destination: FeaturedDestination;
}) {
  const imageUrl =
    getImageUrl(
      destination.coverImage
    );

  const slug =
    destination.slug?.current;

  if (!slug) {
    return null;
  }

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={`/destinations/${slug}`}
        aria-label={`Explore ${destination.title}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={
                destination
                  .coverImage
                  ?.alt ||
                destination.title
              }
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-red-900 via-slate-900 to-amber-700"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
          />

          <div className="absolute left-5 top-5">
            <span className="rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Destination
            </span>
          </div>

          {destination.duration && (
            <div className="absolute right-5 top-5">
              <span className="rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-sm">
                {
                  destination.duration
                }
              </span>
            </div>
          )}

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
            {destination.region && (
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                {
                  destination.region
                }
              </span>
            )}

            {destination.maxAltitude !==
              undefined && (
              <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                ↑{" "}
                {
                  destination.maxAltitude
                }m
              </span>
            )}

            {destination.startingCost !==
              undefined && (
              <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                From $
                {
                  destination.startingCost
                }
              </span>
            )}
          </div>
        </div>

        <div className="p-7 sm:p-8">
          <h3 className="font-serif text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-3xl">
            {
              destination.title
            }
          </h3>

          {destination.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
              {
                destination.excerpt
              }
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Explore guide
            </span>

            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-red-800 transition duration-300 group-hover:border-red-800 group-hover:bg-red-800 group-hover:text-white"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   STORY CARD
========================================================= */

function StoryCard({
  story,
}: {
  story: FeaturedStory;
}) {
  const imageUrl =
    getImageUrl(
      story.coverImage
    );

  const slug =
    story.slug?.current;

  if (!slug) {
    return null;
  }

  const formattedDate =
    story.publishedAt
      ? new Intl.DateTimeFormat(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        ).format(
          new Date(
            story.publishedAt
          )
        )
      : null;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link
        href={`/blog/${slug}`}
        aria-label={`Read ${story.title}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={
                story.coverImage
                  ?.alt ||
                story.title
              }
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 motion-reduce:transition-none motion-safe:group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-red-900 via-slate-900 to-amber-700"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
          />

          <div className="absolute left-5 top-5">
            <span className="rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Story
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
            {story.region && (
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                {
                  story.region
                }
              </span>
            )}

            {story.readingTime !==
              undefined && (
              <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                {
                  story.readingTime
                } min read
              </span>
            )}
          </div>
        </div>

        <div className="p-7 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {story.category && (
              <span>
                {
                  story.category
                }
              </span>
            )}

            {formattedDate && (
              <>
                <span aria-hidden="true">
                  ·
                </span>

                <time
                  dateTime={
                    story.publishedAt
                  }
                >
                  {
                    formattedDate
                  }
                </time>
              </>
            )}
          </div>

          <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-3xl">
            {
              story.title
            }
          </h3>

          {story.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
              {
                story.excerpt
              }
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Read story
            </span>

            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-red-800 transition duration-300 group-hover:border-red-800 group-hover:bg-red-800 group-hover:text-white"
            >
              →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   FEATURED SECTION
========================================================= */

export default function FeaturedSection({
  destinations,
  stories,
}: {
  destinations: FeaturedDestination[];
  stories: FeaturedStory[];
}) {
  const [activeTab, setActiveTab] =
    useState<
      "destinations" | "stories"
    >("destinations");

  return (
    <section
      aria-labelledby="featured-section-title"
      className="relative overflow-hidden border-y border-stone-200 bg-[#f5f2eb]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-900/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-red-800">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />

              Featured on BloggyNepal
            </div>

            <h2
              id="featured-section-title"
              className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
            >
              Places worth the journey
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Handpicked places and experiences
              to help you discover a different
              side of Nepal.
            </p>
          </div>

          <div
            className="inline-flex w-full rounded-full border border-stone-300 bg-white p-1 shadow-sm sm:w-auto"
            role="tablist"
            aria-label="Featured content"
          >
            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab ===
                "destinations"
              }
              aria-controls="featured-destinations"
              id="featured-destinations-tab"
              onClick={() =>
                setActiveTab(
                  "destinations"
                )
              }
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab ===
                "destinations"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-red-800"
              }`}
            >
              Destinations
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={
                activeTab ===
                "stories"
              }
              aria-controls="featured-stories"
              id="featured-stories-tab"
              onClick={() =>
                setActiveTab(
                  "stories"
                )
              }
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab ===
                "stories"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-red-800"
              }`}
            >
              Stories
            </button>
          </div>
        </div>

        <div className="mt-12 h-px bg-stone-200" />

        {/* ===================================================
            DESTINATIONS PANEL
        ==================================================== */}

        <div
          id="featured-destinations"
          role="tabpanel"
          aria-labelledby="featured-destinations-tab"
          hidden={
            activeTab !==
            "destinations"
          }
          className="mt-10"
        >
          <div className="grid gap-7 md:grid-cols-2">
            {destinations.map(
              (destination) => (
                <DestinationCard
                  key={
                    destination._id
                  }
                  destination={
                    destination
                  }
                />
              )
            )}
          </div>

          {destinations.length >
            0 && (
            <div className="mt-12 flex flex-col gap-5 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Start with one place. Let the
                road decide the rest.
              </p>

              <Link
                href="/destinations"
                className="group inline-flex items-center gap-2 self-start rounded-full border border-red-800 px-5 py-2.5 text-sm font-bold text-red-800 transition hover:bg-red-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:self-auto"
              >
                Explore all destinations

                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================
            STORIES PANEL
        ==================================================== */}

        <div
          id="featured-stories"
          role="tabpanel"
          aria-labelledby="featured-stories-tab"
          hidden={
            activeTab !==
            "stories"
          }
          className="mt-10"
        >
          <div className="grid gap-7 md:grid-cols-2">
            {stories.map(
              (story) => (
                <StoryCard
                  key={
                    story._id
                  }
                  story={story}
                />
              )
            )}
          </div>

          {stories.length >
            0 && (
            <div className="mt-12 flex flex-col gap-5 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Read the stories behind the
                places.
              </p>

              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 self-start rounded-full border border-red-800 px-5 py-2.5 text-sm font-bold text-red-800 transition hover:bg-red-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:self-auto"
              >
                Read all stories

                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}