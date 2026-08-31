"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/lib/sanity";

/* =========================================================
   TYPES
========================================================= */

export type FeaturedSlug =
  | string
  | {
      current?: string;
    }
  | null
  | undefined;

export interface FeaturedImage {
  alt?: string;
  caption?: string;
  credit?: string;

  asset?: {
    _ref?: string;
    _id?: string;
  };
}

export interface FeaturedDestination {
  _id: string;
  title: string;

  slug?: FeaturedSlug;

  excerpt?: string;
  region?: string;
  duration?: string;

  startingCost?: number | string;
  maxAltitude?: number | string;

  /*
    We intentionally accept unknown here because Sanity data
    can arrive in different shapes depending on the query.
    It is narrowed safely before rendering.
  */
  coverImage?: unknown;
}

export interface FeaturedStory {
  _id: string;
  title: string;

  slug?: FeaturedSlug;

  excerpt?: string;
  region?: string;
  category?: string;
  author?: string;

  publishedAt?: string;
  readingTime?: number | string;

  coverImage?: unknown;
}

export interface FeaturedSectionProps {
  destinations?: FeaturedDestination[];
  stories?: FeaturedStory[];
}

type ActiveTab =
  | "destinations"
  | "stories";

/* =========================================================
   HELPERS
========================================================= */

function getSlug(
  slug: FeaturedSlug
): string | null {
  if (typeof slug === "string") {
    return slug.trim() || null;
  }

  if (
    slug &&
    typeof slug === "object" &&
    typeof slug.current === "string"
  ) {
    return (
      slug.current.trim() || null
    );
  }

  return null;
}

function hasValidImage(
  image: unknown
): image is FeaturedImage & {
  asset: {
    _ref?: string;
    _id?: string;
  };
} {
  if (
    !image ||
    typeof image !== "object"
  ) {
    return false;
  }

  const value =
    image as FeaturedImage;

  return Boolean(
    value.asset?._ref ||
      value.asset?._id
  );
}

function getImageAlt(
  image: unknown,
  fallback: string
): string {
  if (
    hasValidImage(image) &&
    typeof image.alt === "string" &&
    image.alt.trim()
  ) {
    return image.alt.trim();
  }

  return fallback;
}

function getImageUrl(
  image: unknown,
  width: number,
  height: number
): string | null {
  if (!hasValidImage(image)) {
    return null;
  }

  try {
    return urlForImage(image)
      .width(width)
      .height(height)
      .quality(88)
      .fit("crop")
      .auto("format")
      .url();
  } catch (error) {
    console.error(
      "Failed to generate Sanity image URL:",
      error
    );

    return null;
  }
}

function formatDate(
  value?: string
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date);
}

function formatValue(
  value: number | string | undefined
): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value);
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function FeaturedSection({
  destinations = [],
  stories = [],
}: FeaturedSectionProps) {
  const [activeTab, setActiveTab] =
    useState<ActiveTab>(
      "destinations"
    );

  const isDestinations =
    activeTab === "destinations";

  const items = isDestinations
    ? destinations
    : stories;

  const visibleItems = useMemo(
    () => items.slice(0, 4),
    [items]
  );

  const sectionTitle =
    isDestinations
      ? "Places worth the journey"
      : "Stories worth reading";

  const sectionDescription =
    isDestinations
      ? "Handpicked places and experiences to help you discover a different side of Nepal."
      : "Personal journeys, local encounters, and experiences from across Nepal.";

  const allHref =
    isDestinations
      ? "/destinations"
      : "/blog";

  return (
    <section
      aria-labelledby="featured-section-title"
      className="relative overflow-hidden border-y border-stone-200 bg-[#f5f2eb]"
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-red-900/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl"
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:py-28">
        {/* ===================================================
            HEADER
        ==================================================== */}

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
              {sectionTitle}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {sectionDescription}
            </p>
          </div>

          {/* =================================================
              TABS
          ================================================== */}

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
              aria-controls="featured-content"
              onClick={() =>
                setActiveTab(
                  "destinations"
                )
              }
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
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
                activeTab === "stories"
              }
              aria-controls="featured-content"
              onClick={() =>
                setActiveTab("stories")
              }
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
                activeTab === "stories"
                  ? "bg-red-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-red-800"
              }`}
            >
              Stories
            </button>
          </div>
        </div>

        {/* ===================================================
            DIVIDER
        ==================================================== */}

        <div className="mt-12 h-px bg-stone-200" />

        {/* ===================================================
            GRID
        ==================================================== */}

        <div
          id="featured-content"
          role="tabpanel"
          aria-live="polite"
          className="mt-10"
        >
          {visibleItems.length > 0 ? (
            <div className="grid gap-7 md:grid-cols-2">
              {isDestinations
                ? visibleItems.map(
                    (item, index) => (
                      <DestinationCard
                        key={item._id}
                        item={
                          item as FeaturedDestination
                        }
                        featured={
                          index === 0
                        }
                      />
                    )
                  )
                : visibleItems.map(
                    (item, index) => (
                      <StoryCard
                        key={item._id}
                        item={
                          item as FeaturedStory
                        }
                        featured={
                          index === 0
                        }
                      />
                    )
                  )}
            </div>
          ) : (
            <EmptyFeaturedState
              type={activeTab}
            />
          )}
        </div>

        {/* ===================================================
            FOOTER CTA
        ==================================================== */}

        <div className="mt-12 flex flex-col gap-5 border-t border-stone-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {isDestinations
              ? "Start with one place. Let the road decide the rest."
              : "Every journey leaves a story behind."}
          </p>

          <Link
            href={allHref}
            className="group inline-flex items-center gap-2 self-start rounded-full border border-red-800 px-5 py-2.5 text-sm font-bold text-red-800 transition hover:bg-red-800 hover:text-white sm:self-auto"
          >
            {isDestinations
              ? "Explore all destinations"
              : "Read all stories"}

            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DESTINATION CARD
========================================================= */

function DestinationCard({
  item,
  featured,
}: {
  item: FeaturedDestination;
  featured: boolean;
}) {
  const slug = getSlug(
    item.slug
  );

  if (!slug) {
    return null;
  }

  const href =
    `/destinations/${slug}`;

  const imageUrl =
    getImageUrl(
      item.coverImage,
      1200,
      850
    );

  const region =
    item.region
      ? String(item.region)
      : "";

  const duration =
    item.duration
      ? String(item.duration)
      : "";

  const startingCost =
    formatValue(
      item.startingCost
    );

  const maxAltitude =
    formatValue(
      item.maxAltitude
    );

  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl ${
        featured
          ? "md:row-span-1"
          : ""
      }`}
    >
      <Link
        href={href}
        className="block"
        aria-label={`Explore ${item.title}`}
      >
        {/* IMAGE */}

        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={getImageAlt(
                item.coverImage,
                item.title
              )}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <FallbackVisual
              emoji="🏔️"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* LABEL */}

          <div className="absolute left-5 top-5">
            <span className="rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
              Destination
            </span>
          </div>

          {/* DURATION */}

          {duration && (
            <div className="absolute right-5 top-5">
              <span className="rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-sm">
                {duration}
              </span>
            </div>
          )}

          {/* META */}

          {(region ||
            maxAltitude ||
            startingCost) && (
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
              {region && (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                  {region}
                </span>
              )}

              {maxAltitude && (
                <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  ↑ {maxAltitude}
                </span>
              )}

              {startingCost && (
                <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  From $
                  {startingCost}
                </span>
              )}
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="p-7 sm:p-8">
          <h3 className="font-serif text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-3xl">
            {item.title}
          </h3>

          {item.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
              {item.excerpt}
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
  item,
  featured,
}: {
  item: FeaturedStory;
  featured: boolean;
}) {
  const slug = getSlug(
    item.slug
  );

  if (!slug) {
    return null;
  }

  const href =
    `/blog/${slug}`;

  const imageUrl =
    getImageUrl(
      item.coverImage,
      1200,
      850
    );

  const category =
    item.category
      ? String(item.category)
      : "";

  const region =
    item.region
      ? String(item.region)
      : "";

  const readingTime =
    item.readingTime !==
      undefined &&
    item.readingTime !==
      null
      ? String(
          item.readingTime
        )
      : "";

  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:border-amber-300 hover:shadow-2xl ${
        featured
          ? "md:row-span-1"
          : ""
      }`}
    >
      <Link
        href={href}
        className="block"
        aria-label={`Read ${item.title}`}
      >
        {/* IMAGE */}

        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={getImageAlt(
                item.coverImage,
                item.title
              )}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <FallbackVisual
              emoji="📖"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* TOP META */}

          <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3">
            {category ? (
              <span className="rounded-full border border-white/15 bg-black/25 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                {category}
              </span>
            ) : (
              <span />
            )}

            {readingTime && (
              <span className="rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-slate-900 shadow-sm">
                {readingTime} min read
              </span>
            )}
          </div>

          {/* BOTTOM META */}

          {(region ||
            item.publishedAt) && (
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
              {region && (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                  {region}
                </span>
              )}

              {item.publishedAt && (
                <time
                  dateTime={
                    item.publishedAt
                  }
                  className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
                >
                  {formatDate(
                    item.publishedAt
                  )}
                </time>
              )}
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="p-7 sm:p-8">
          <h3 className="font-serif text-2xl font-bold leading-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-3xl">
            {item.title}
          </h3>

          {item.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 sm:text-base">
              {item.excerpt}
            </p>
          )}

          {item.author && (
            <p className="mt-5 text-xs text-slate-400">
              Written by{" "}
              <span className="font-semibold text-slate-600">
                {item.author}
              </span>
            </p>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Read the story
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
   EMPTY STATE
========================================================= */

function EmptyFeaturedState({
  type,
}: {
  type: ActiveTab;
}) {
  const isDestination =
    type === "destinations";

  return (
    <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">
        {isDestination
          ? "🏔️"
          : "📖"}
      </div>

      <h3 className="mt-5 font-serif text-2xl font-bold text-slate-950">
        No featured{" "}
        {isDestination
          ? "destinations"
          : "stories"}{" "}
        yet.
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
        {isDestination
          ? "New places will appear here as they are added to BloggyNepal."
          : "New journeys and experiences will appear here as they are published."}
      </p>
    </div>
  );
}

/* =========================================================
   FALLBACK VISUAL
========================================================= */

function FallbackVisual({
  emoji,
}: {
  emoji: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(185,28,28,0.5),transparent_35%),linear-gradient(135deg,#0f172a,#450a0a,#78350f)]">
      <span
        aria-hidden="true"
        className="text-6xl opacity-80"
      >
        {emoji}
      </span>
    </div>
  );
}