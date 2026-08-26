import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";

import ReactionBar from "@/components/ReactionBar";
import Comments from "@/components/Comments";
import FeedbackForm from "@/components/FeedbackForm";
import NewsletterSignup from "@/components/NewsletterSignup";

import {
  client,
  urlForImage,
} from "@/lib/sanity";

/* =========================================================
   PAGE CONFIG
========================================================= */

export const revalidate = 60;

/* =========================================================
   TYPES
========================================================= */

interface StoryImage {
  alt?: string;
  caption?: string;
  credit?: string;

  asset?: {
    _ref?: string;
    _id?: string;
  };
}

interface RelatedDestination {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  region?: string;
  excerpt?: string;
  coverImage?: StoryImage;
}

interface RelatedDistrict {
  _id: string;
  name: string;
  slug?: {
    current?: string;
  };
  headquarter?: string;
  coverImage?: StoryImage;
}

interface RelatedStory {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  excerpt?: string;
  coverImage?: StoryImage;
}

interface Story {
  _id: string;

  title: string;

  subtitle?: string;

  slug: {
    current: string;
  };

  excerpt?: string;

  region?: string;

  category?: string;

  tags?: string[];

  publishedAt: string;

  updatedAt?: string;

  author?: string;

  authorBio?: string;

  readingTime?: number;

  featured?: boolean;

  coverImage?: StoryImage;

  gallery?: StoryImage[];

  body?: any[];

  travelTips?: string[];

  whatILearned?: any[];

  bestTimeToVisit?: string;

  estimatedBudget?: string;

  tripDuration?: string;

  province?: {
    _id: string;
    name?: string;
    slug?: {
      current?: string;
    };
    number?: number;
  };

  district?: {
    _id: string;
    name?: string;
    slug?: {
      current?: string;
    };
  };

  relatedDestinations?: RelatedDestination[];

  relatedDistricts?: RelatedDistrict[];

  relatedStories?: RelatedStory[];

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    noIndex?: boolean;
    ogImage?: StoryImage;
  };
}

/* =========================================================
   QUERY
========================================================= */

const storyBySlugQuery = `
  *[
    _type == "post" &&
    slug.current == $slug
  ][0] {
    _id,
    title,
    subtitle,
    slug,
    excerpt,
    region,
    category,
    tags,
    publishedAt,
    updatedAt,
    author,
    authorBio,
    readingTime,
    featured,

    coverImage,

    gallery,

    body,

    travelTips,

    whatILearned,

    bestTimeToVisit,

    estimatedBudget,

    tripDuration,

    "province": province->{
      _id,
      name,
      slug,
      number
    },

    "district": district->{
      _id,
      name,
      slug
    },

    "relatedDestinations": relatedDestinations[]->{
      _id,
      title,
      slug,
      region,
      excerpt,
      coverImage
    },

    "relatedDistricts": relatedDistricts[]->{
      _id,
      name,
      slug,
      headquarter,
      coverImage
    },

    "relatedStories": relatedStories[]->{
      _id,
      title,
      slug,
      excerpt,
      coverImage
    },

    seo {
      metaTitle,
      metaDescription,
      noIndex,
      ogImage
    }
  }
`;

/* =========================================================
   IMAGE SAFETY
========================================================= */

function hasValidImage(
  image: unknown
): image is StoryImage & {
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
    image as StoryImage;

  return Boolean(
    value.asset?._ref ||
      value.asset?._id
  );
}

/* =========================================================
   FETCH STORY
========================================================= */

async function getStory(
  slug: string
): Promise<Story | null> {
  try {
    const story =
      await client.fetch<Story | null>(
        storyBySlugQuery,
        { slug }
      );

    return story;
  } catch (error) {
    console.error(
      "Failed to fetch story:",
      error
    );

    return null;
  }
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
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

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
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
  const { slug } = await params;

  const story = await getStory(slug);

  if (!story) {
    return {
      title:
        "Story Not Found | bloggyNepal",
    };
  }

  const title =
    story.seo?.metaTitle ||
    `${story.title} | bloggyNepal`;

  const description =
    story.seo?.metaDescription ||
    story.excerpt ||
    `Read ${story.title} on bloggyNepal — personal journeys, people, places and experiences from Nepal.`;

  const ogImage =
    hasValidImage(
      story.seo?.ogImage
    )
      ? urlForImage(
          story.seo!.ogImage!
        )
          .width(1600)
          .height(900)
          .quality(90)
          .fit("crop")
          .auto("format")
          .url()
      : hasValidImage(
          story.coverImage
        )
        ? urlForImage(
            story.coverImage
          )
            .width(1600)
            .height(900)
            .quality(90)
            .fit("crop")
            .auto("format")
            .url()
        : undefined;

  const robots =
    story.seo?.noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        };

  return {
    title,
    description,

    robots,

    alternates: {
      canonical: `/blog/${story.slug.current}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${story.slug.current}`,
      publishedTime:
        story.publishedAt,
      modifiedTime:
        story.updatedAt ||
        story.publishedAt,
      authors: story.author
        ? [story.author]
        : undefined,
      images: ogImage
        ? [ogImage]
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

    keywords:
      story.tags?.length
        ? story.tags
        : undefined,
  };
}

/* =========================================================
   PORTABLE TEXT
========================================================= */

const portableTextComponents: PortableTextComponents =
  {
    types: {
      image: ({ value }) => {
        if (!hasValidImage(value)) {
          return null;
        }

        const imageUrl =
          urlForImage(value)
            .width(1400)
            .height(900)
            .quality(88)
            .fit("max")
            .auto("format")
            .url();

        return (
          <figure className="my-12 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <Image
              src={imageUrl}
              alt={
                value.alt ||
                "Photo from this Nepal travel story"
              }
              width={1400}
              height={900}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full"
            />

            {value.caption && (
              <figcaption className="border-t border-stone-100 px-5 py-4 text-sm leading-6 text-slate-500">
                {value.caption}
              </figcaption>
            )}

            {value.credit && (
              <p className="px-5 pb-4 text-xs text-slate-400">
                Photo:{" "}
                {value.credit}
              </p>
            )}
          </figure>
        );
      },
    },

    marks: {
      link: ({ children, value }) => {
        const href = value?.href;

        if (!href) {
          return <>{children}</>;
        }

        const isExternal =
          href.startsWith(
            "http://"
          ) ||
          href.startsWith(
            "https://"
          );

        return (
          <a
            href={href}
            target={
              isExternal
                ? "_blank"
                : undefined
            }
            rel={
              isExternal
                ? "noopener noreferrer"
                : undefined
            }
            className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 transition hover:text-red-950"
          >
            {children}
          </a>
        );
      },

      strong: ({ children }) => (
        <strong className="font-bold text-slate-900">
          {children}
        </strong>
      ),

      em: ({ children }) => (
        <em>{children}</em>
      ),

      underline: ({
        children,
      }) => (
        <span className="underline underline-offset-4">
          {children}
        </span>
      ),
    },

    block: {
      h1: ({ children }) => (
        <h2 className="mt-14 font-serif text-4xl font-bold leading-tight text-slate-900">
          {children}
        </h2>
      ),

      h2: ({ children }) => (
        <h2 className="mt-14 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="mt-10 font-serif text-2xl font-bold leading-tight text-slate-900">
          {children}
        </h3>
      ),

      h4: ({ children }) => (
        <h4 className="mt-8 text-xl font-bold text-slate-900">
          {children}
        </h4>
      ),

      blockquote: ({
        children,
      }) => (
        <blockquote className="my-10 rounded-r-3xl border-l-4 border-amber-400 bg-amber-50 px-6 py-6 font-serif text-2xl italic leading-relaxed text-slate-800 sm:text-3xl">
          {children}
        </blockquote>
      ),

      normal: ({ children }) => (
        <p className="mb-7 text-lg leading-[1.9] text-slate-700">
          {children}
        </p>
      ),
    },

    list: {
      bullet: ({
        children,
      }) => (
        <ul className="mb-8 ml-6 list-disc space-y-3 text-lg leading-8 text-slate-700 marker:text-red-800">
          {children}
        </ul>
      ),

      number: ({
        children,
      }) => (
        <ol className="mb-8 ml-6 list-decimal space-y-3 text-lg leading-8 text-slate-700 marker:font-bold marker:text-red-800">
          {children}
        </ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => (
        <li>{children}</li>
      ),

      number: ({ children }) => (
        <li>{children}</li>
      ),
    },
  };

/* =========================================================
   PAGE
========================================================= */

export default async function StoryPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const story = await getStory(slug);

  if (!story) {
    notFound();
  }

  const coverUrl =
    hasValidImage(
      story.coverImage
    )
      ? urlForImage(
          story.coverImage
        )
          .width(2000)
          .height(1200)
          .quality(90)
          .fit("crop")
          .auto("format")
          .url()
      : null;

  const coverAlt =
    story.coverImage?.alt ||
    story.title;

  const gallery =
    Array.isArray(
      story.gallery
    )
      ? story.gallery.filter(
          hasValidImage
        )
      : [];

  const travelTips =
    Array.isArray(
      story.travelTips
    )
      ? story.travelTips.filter(
          Boolean
        )
      : [];

  const tags =
    Array.isArray(story.tags)
      ? story.tags.filter(Boolean)
      : [];

  const relatedDestinations =
    Array.isArray(
      story.relatedDestinations
    )
      ? story.relatedDestinations
      : [];

  const relatedDistricts =
    Array.isArray(
      story.relatedDistricts
    )
      ? story.relatedDistricts
      : [];

  const relatedStories =
    Array.isArray(
      story.relatedStories
    )
      ? story.relatedStories.filter(
          (related) =>
            related._id !==
            story._id
        )
      : [];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        {coverUrl ? (
          <div className="absolute inset-0">
            <Image
              src={coverUrl}
              alt={coverAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-slate-950 to-amber-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col px-6 pb-16 pt-8 sm:min-h-[760px] sm:px-8 sm:pb-20">
          {/* TOP NAV */}

          <div className="flex items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-x-1 hover:bg-white hover:text-slate-950"
            >
              <span>←</span>
              All stories
            </Link>

            {story.category && (
              <span className="hidden rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md sm:inline-flex">
                {story.category}
              </span>
            )}
          </div>

          {/* HERO CONTENT */}

          <div className="mt-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              {story.region && (
                <span className="rounded-full bg-amber-300 px-3 py-1.5 text-slate-950">
                  {story.region}
                </span>
              )}

              {story.publishedAt && (
                <span>
                  {formatDate(
                    story.publishedAt
                  )}
                </span>
              )}

              {story.readingTime && (
                <>
                  <span className="text-white/40">
                    •
                  </span>

                  <span>
                    {story.readingTime}{" "}
                    min read
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-8xl">
              {story.title}
            </h1>

            {story.subtitle && (
              <p className="mt-6 max-w-3xl text-xl font-medium leading-relaxed text-white/80 sm:text-2xl">
                {story.subtitle}
              </p>
            )}

            {story.author && (
              <p className="mt-7 text-sm text-white/65">
                Written by{" "}
                <span className="font-semibold text-white">
                  {story.author}
                </span>
              </p>
            )}

            {tags.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {tags
                  .slice(0, 8)
                  .map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-xs font-medium text-white/75 backdrop-blur-md"
                      >
                        #{tag}
                      </span>
                    )
                  )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY HEADER / META
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8">
        <div className="-mt-10 rounded-3xl border border-white/60 bg-white p-6 shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {story.author && (
              <StoryFact
                label="Author"
                value={story.author}
                icon="✍️"
              />
            )}

            {story.tripDuration && (
              <StoryFact
                label="Journey"
                value={
                  story.tripDuration
                }
                icon="🗓️"
              />
            )}

            {story.bestTimeToVisit && (
              <StoryFact
                label="Best time"
                value={
                  story.bestTimeToVisit
                }
                icon="🌤️"
              />
            )}

            {story.estimatedBudget && (
              <StoryFact
                label="Estimated budget"
                value={
                  story.estimatedBudget
                }
                icon="💰"
              />
            )}
          </div>

          {(story.district ||
            story.province) && (
            <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-6 text-sm">
              <span className="font-bold text-slate-500">
                This story takes place in:
              </span>

              {story.district?.slug
                ?.current && (
                <Link
                  href={`/explore-nepal/${story.district.slug.current}`}
                  className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 hover:text-red-950"
                >
                  {story.district.name}
                </Link>
              )}

              {story.province?.slug
                ?.current && (
                <>
                  <span className="text-stone-300">
                    /
                  </span>

                  <Link
                    href={`/provinces/${story.province.slug.current}`}
                    className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 hover:text-red-950"
                  >
                    {
                      story.province
                        .name
                    }
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MAIN ARTICLE
      ====================================================== */}

      <article className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* SIDEBAR */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                Story
              </p>

              <nav className="mt-5 space-y-1">
                <a
                  href="#story"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                >
                  The story
                </a>

                {travelTips.length >
                  0 && (
                  <a
                    href="#travel-tips"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                  >
                    Travel tips
                  </a>
                )}

                {story.whatILearned &&
                  story.whatILearned
                    .length > 0 && (
                  <a
                    href="#what-i-learned"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                  >
                    What I learned
                  </a>
                )}

                {gallery.length >
                  0 && (
                  <a
                    href="#gallery"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                  >
                    Gallery
                  </a>
                )}

                {relatedDestinations.length >
                  0 && (
                  <a
                    href="#destinations"
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                  >
                    Related guides
                  </a>
                )}

                <a
                  href="#community"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                >
                  Community
                </a>
              </nav>
            </div>
          </aside>

          {/* MAIN ARTICLE COLUMN */}

          <div className="min-w-0">
            {/* MOBILE META */}

            <div className="mb-10 lg:hidden">
              <div className="flex flex-wrap gap-2">
                {story.category && (
                  <span className="rounded-full bg-red-800/10 px-3 py-1.5 text-xs font-bold text-red-800">
                    {story.category}
                  </span>
                )}

                {story.readingTime && (
                  <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {story.readingTime}{" "}
                    min read
                  </span>
                )}
              </div>
            </div>

            {/* STORY */}

            <section
              id="story"
              className="scroll-mt-28"
            >
              {story.excerpt && (
                <p className="mb-10 font-serif text-2xl leading-relaxed text-slate-800 sm:text-3xl">
                  {story.excerpt}
                </p>
              )}

              {story.body &&
              story.body.length > 0 ? (
                <div className="prose-content">
                  <PortableText
                    value={
                      story.body
                    }
                    components={
                      portableTextComponents
                    }
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
                  <span className="text-5xl">
                    ✍️
                  </span>

                  <p className="mt-5 text-lg font-medium text-slate-700">
                    This story is still
                    being written.
                  </p>
                </div>
              )}
            </section>

            {/* =================================================
                TRAVEL TIPS
            ================================================== */}

            {travelTips.length >
              0 && (
              <section
                id="travel-tips"
                className="mt-16 scroll-mt-28"
              >
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Practical notes
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    Travel tips from the journey
                  </h2>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <ul className="space-y-4">
                    {travelTips.map(
                      (
                        tip,
                        index
                      ) => (
                        <li
                          key={`${tip}-${index}`}
                          className="flex gap-4"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-red-800">
                            {index +
                              1}
                          </span>

                          <span className="pt-1 leading-7 text-slate-700">
                            {tip}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </section>
            )}

            {/* =================================================
                WHAT I LEARNED
            ================================================== */}

            {story.whatILearned &&
              story.whatILearned.length >
                0 && (
              <section
                id="what-i-learned"
                className="mt-16 scroll-mt-28"
              >
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Reflection
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    What I learned
                  </h2>
                </div>

                <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-7 shadow-sm sm:p-10">
                  <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-8">
                    <PortableText
                      value={
                        story.whatILearned
                      }
                      components={
                        portableTextComponents
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                GALLERY
            ================================================== */}

            {gallery.length >
              0 && (
              <section
                id="gallery"
                className="mt-16 scroll-mt-28"
              >
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    A closer look
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    From the journey
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map(
                    (
                      image,
                      index
                    ) => {
                      if (
                        !hasValidImage(
                          image
                        )
                      ) {
                        return null;
                      }

                      const imageUrl =
                        urlForImage(
                          image
                        )
                          .width(1200)
                          .height(900)
                          .quality(88)
                          .fit("crop")
                          .auto("format")
                          .url();

                      return (
                        <figure
                          key={
                            image.asset?._ref ||
                            image.asset?._id ||
                            `story-image-${index}`
                          }
                          className={`group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm ${
                            index ===
                            0
                              ? "sm:col-span-2"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden ${
                              index ===
                              0
                                ? "aspect-[16/9]"
                                : "aspect-[4/3]"
                            }`}
                          >
                            <Image
                              src={
                                imageUrl
                              }
                              alt={
                                image.alt ||
                                `${story.title} photo ${
                                  index +
                                  1
                                }`
                              }
                              fill
                              sizes={
                                index ===
                                0
                                  ? "100vw"
                                  : "(max-width: 768px) 100vw, 50vw"
                              }
                              className="object-cover transition duration-700 group-hover:scale-105"
                            />
                          </div>

                          {(image.caption ||
                            image.credit) && (
                            <figcaption className="px-5 py-4">
                              {image.caption && (
                                <p className="text-sm leading-6 text-slate-600">
                                  {
                                    image.caption
                                  }
                                </p>
                              )}

                              {image.credit && (
                                <p className="mt-1 text-xs text-slate-400">
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
              </section>
            )}

            {/* =================================================
                RELATED DESTINATIONS
            ================================================== */}

            {relatedDestinations.length >
              0 && (
              <section
                id="destinations"
                className="mt-20 scroll-mt-28"
              >
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Plan the journey
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    Related destinations
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {relatedDestinations.map(
                    (
                      destination
                    ) => {
                      if (
                        !destination
                          .slug
                          ?.current
                      ) {
                        return null;
                      }

                      const imageUrl =
                        hasValidImage(
                          destination.coverImage
                        )
                          ? urlForImage(
                              destination.coverImage
                            )
                              .width(1000)
                              .height(700)
                              .quality(85)
                              .fit("crop")
                              .auto("format")
                              .url()
                          : null;

                      return (
                        <Link
                          key={
                            destination._id
                          }
                          href={`/destinations/${destination.slug.current}`}
                          className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                        >
                          <div className="relative h-56 overflow-hidden bg-slate-900">
                            {imageUrl ? (
                              <Image
                                src={
                                  imageUrl
                                }
                                alt={
                                  destination
                                    .coverImage
                                    ?.alt ||
                                  destination.title
                                }
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-900 to-slate-950">
                                <span className="text-5xl">
                                  🏔️
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                            {destination.region && (
                              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800">
                                {
                                  destination.region
                                }
                              </span>
                            )}
                          </div>

                          <div className="p-6">
                            <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-red-800">
                              {
                                destination.title
                              }
                            </h3>

                            {destination.excerpt && (
                              <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                                {
                                  destination.excerpt
                                }
                              </p>
                            )}

                            <span className="mt-5 inline-flex items-center gap-2 font-bold text-red-800">
                              Explore guide →
                            </span>
                          </div>
                        </Link>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                RELATED DISTRICTS
            ================================================== */}

            {relatedDistricts.length >
              0 && (
              <section className="mt-20">
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Discover more
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    Related districts
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {relatedDistricts.map(
                    (district) => {
                      if (
                        !district.slug
                          ?.current
                      ) {
                        return null;
                      }

                      const imageUrl =
                        hasValidImage(
                          district.coverImage
                        )
                          ? urlForImage(
                              district.coverImage
                            )
                              .width(900)
                              .height(600)
                              .quality(85)
                              .fit("crop")
                              .auto("format")
                              .url()
                          : null;

                      return (
                        <Link
                          key={
                            district._id
                          }
                          href={`/explore-nepal/${district.slug.current}`}
                          className="group flex overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                        >
                          <div className="relative h-32 w-36 shrink-0 overflow-hidden bg-slate-900 sm:h-40 sm:w-48">
                            {imageUrl ? (
                              <Image
                                src={
                                  imageUrl
                                }
                                alt={
                                  district
                                    .coverImage
                                    ?.alt ||
                                  `${district.name} District`
                                }
                                fill
                                sizes="192px"
                                className="object-cover transition duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-900 to-slate-950">
                                <span className="text-4xl">
                                  📍
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col justify-center p-5">
                            <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-red-800">
                              {
                                district.name
                              }
                            </h3>

                            {district.headquarter && (
                              <p className="mt-1 text-sm text-slate-500">
                                HQ:{" "}
                                {
                                  district.headquarter
                                }
                              </p>
                            )}

                            <span className="mt-3 text-sm font-bold text-red-800">
                              Explore district →
                            </span>
                          </div>
                        </Link>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                RELATED STORIES
            ================================================== */}

            {relatedStories.length >
              0 && (
              <section className="mt-20">
                <div className="mb-7">
                  <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    Keep reading
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    More stories
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {relatedStories.map(
                    (related) => {
                      if (
                        !related.slug
                          ?.current
                      ) {
                        return null;
                      }

                      const imageUrl =
                        hasValidImage(
                          related.coverImage
                        )
                          ? urlForImage(
                              related.coverImage
                            )
                              .width(900)
                              .height(600)
                              .quality(85)
                              .fit("crop")
                              .auto("format")
                              .url()
                          : null;

                      return (
                        <Link
                          key={
                            related._id
                          }
                          href={`/blog/${related.slug.current}`}
                          className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                        >
                          <div className="relative h-52 overflow-hidden bg-slate-900">
                            {imageUrl ? (
                              <Image
                                src={
                                  imageUrl
                                }
                                alt={
                                  related
                                    .coverImage
                                    ?.alt ||
                                  related.title
                                }
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-amber-800">
                                <span className="text-5xl">
                                  📖
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          </div>

                          <div className="p-6">
                            <h3 className="font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                              {
                                related.title
                              }
                            </h3>

                            {related.excerpt && (
                              <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                                {
                                  related.excerpt
                                }
                              </p>
                            )}

                            <span className="mt-5 inline-flex items-center gap-2 font-bold text-red-800">
                              Read story →
                            </span>
                          </div>
                        </Link>
                      );
                    }
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                AUTHOR
            ================================================== */}

            {story.author && (
              <section className="mt-20 border-t border-stone-200 pt-10">
                <div className="rounded-3xl border border-stone-200 bg-white p-7 sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    About the writer
                  </p>

                  <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900">
                    {story.author}
                  </h2>

                  {story.authorBio ? (
                    <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                      {story.authorBio}
                    </p>
                  ) : (
                    <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                      Sharing stories, places and
                      experiences from Nepal.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                COMMUNITY ENGAGEMENT
            ================================================== */}

            <section
              id="community"
              className="mt-20 scroll-mt-28 border-t border-stone-200 pt-16"
            >
              <div className="mb-8">
                <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                  <span className="h-px w-8 bg-red-800" />
                  Community
                </p>

                <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                  What did you think?
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Share your reaction, join the
                  conversation, or help us improve
                  this story for future travellers.
                </p>
              </div>

              {/* REACTIONS */}

              <ReactionBar
                postId={story._id}
                postSlug={
                  story.slug.current
                }
                contentType="story"
              />

              {/* COMMENTS */}

              <div className="mt-12">
                <Comments
                  postSlug={
                    story.slug.current
                  }
                  contentType="story"
                />
              </div>

              {/* FEEDBACK */}

              <div className="mt-12">
                <FeedbackForm />
              </div>

              {/* NEWSLETTER */}

              <div className="mt-12">
                <NewsletterSignup />
              </div>
            </section>

            {/* =================================================
                FINAL CTA
            ================================================== */}

            <section className="relative mt-20 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
                  Keep wandering
                </p>

                <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  There is always another road
                  to take.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                  Explore more stories, discover
                  new destinations, or start
                  planning your next journey
                  through Nepal.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200"
                  >
                    More stories
                    <span>→</span>
                  </Link>

                  <Link
                    href="/destinations"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white hover:text-slate-950"
                  >
                    Explore destinations
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

/* =========================================================
   STORY FACT
========================================================= */

function StoryFact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-[#fbfaf7] p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl">
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 font-semibold leading-6 text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}