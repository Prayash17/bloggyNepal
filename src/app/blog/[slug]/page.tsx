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
   CONFIG
========================================================= */

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://bloggy-nepal.vercel.app";

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

  publishedAt?: string;
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
  if (!image || typeof image !== "object") {
    return false;
  }

  const value = image as StoryImage;

  return Boolean(
    value.asset?._ref ||
      value.asset?._id
  );
}

/* =========================================================
   FETCH
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
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
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
      description:
        "The requested blog story could not be found.",
    };
  }

  const title =
    story.seo?.metaTitle ||
    `${story.title} | bloggyNepal`;

  const description =
    story.seo?.metaDescription ||
    story.excerpt ||
    `Read ${story.title} on bloggyNepal — stories, journeys, people and places from Nepal.`;

  const cover =
    hasValidImage(
      story.seo?.ogImage
    )
      ? story.seo.ogImage
      : story.coverImage;

  const ogImage =
    hasValidImage(cover)
      ? urlForImage(cover)
          .width(1600)
          .height(900)
          .quality(90)
          .fit("crop")
          .auto("format")
          .url()
      : undefined;

  return {
    title,
    description,

    robots: story.seo?.noIndex
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },

    alternates: {
      canonical: `/blog/${story.slug.current}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/blog/${story.slug.current}`,

      publishedTime:
        story.publishedAt,

      modifiedTime:
        story.updatedAt ||
        story.publishedAt,

      authors: story.author
        ? [story.author]
        : undefined,

      images: ogImage
        ? [
            {
              url: ogImage,
              alt:
                story.coverImage?.alt ||
                story.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: ogImage
        ? [ogImage]
        : undefined,
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
          <figure className="my-12 overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm">
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

            {(value.caption ||
              value.credit) && (
              <figcaption className="border-t border-stone-100 px-5 py-4">
                {value.caption && (
                  <p className="text-sm leading-6 text-slate-600">
                    {value.caption}
                  </p>
                )}

                {value.credit && (
                  <p className="mt-1 text-xs text-slate-400">
                    Photo: {value.credit}
                  </p>
                )}
              </figcaption>
            )}
          </figure>
        );
      },
    },

    marks: {
      link: ({
        children,
        value,
      }) => {
        const href = value?.href;

        if (!href) {
          return <>{children}</>;
        }

        const isExternal =
          /^https?:\/\//i.test(
            href
          );

        if (!isExternal) {
          return (
            <Link
              href={href}
              className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 transition hover:text-red-950"
            >
              {children}
            </Link>
          );
        }

        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 transition hover:text-red-950"
          >
            {children}
          </a>
        );
      },

      strong: ({
        children,
      }) => (
        <strong className="font-bold text-slate-950">
          {children}
        </strong>
      ),

      em: ({
        children,
      }) => (
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
        <h2 className="mt-16 font-serif text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          {children}
        </h2>
      ),

      h2: ({ children }) => (
        <h2 className="mt-14 font-serif text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
          {children}
        </h2>
      ),

      h3: ({ children }) => (
        <h3 className="mt-12 font-serif text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
          {children}
        </h3>
      ),

      h4: ({ children }) => (
        <h4 className="mt-10 text-xl font-bold text-slate-950">
          {children}
        </h4>
      ),

      blockquote: ({
        children,
      }) => (
        <blockquote className="my-12 rounded-r-[1.75rem] border-l-4 border-amber-400 bg-amber-50 px-7 py-7 font-serif text-2xl italic leading-relaxed text-slate-800 sm:px-9 sm:text-3xl">
          {children}
        </blockquote>
      ),

      normal: ({
        children,
      }) => (
        <p className="mb-7 text-[1.08rem] leading-[1.95] text-slate-700 sm:text-lg">
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
      bullet: ({
        children,
      }) => (
        <li>{children}</li>
      ),

      number: ({
        children,
      }) => (
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
          .width(2200)
          .height(1400)
          .quality(90)
          .fit("crop")
          .auto("format")
          .url()
      : null;

  const coverAlt =
    story.coverImage?.alt ||
    story.title;

  const gallery =
    Array.isArray(story.gallery)
      ? story.gallery.filter(
          hasValidImage
        )
      : [];

  const travelTips =
    Array.isArray(
      story.travelTips
    )
      ? story.travelTips.filter(Boolean)
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

  const articleUrl =
    `${SITE_URL}/blog/${story.slug.current}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: story.title,

    description:
      story.excerpt ||
      story.subtitle ||
      `A travel story from Nepal.`,

    url: articleUrl,

    datePublished:
      story.publishedAt,

    dateModified:
      story.updatedAt ||
      story.publishedAt,

    author: {
      "@type": "Person",
      name:
        story.author ||
        "bloggyNepal",
    },

    publisher: {
      "@type": "Organization",
      name: "bloggyNepal",
    },

    image: coverUrl
      ? [coverUrl]
      : undefined,

    articleSection:
      story.category,

    keywords:
      tags.length > 0
        ? tags.join(", ")
        : undefined,

    inLanguage: "en",
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          STRUCTURED DATA
      ====================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              structuredData
            ).replace(
              /</g,
              "\\u003c"
            ),
        }}
      />

      {/* =====================================================
          HERO
      ====================================================== */}

      <header className="relative isolate overflow-hidden bg-slate-950 text-white">
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(185,28,28,0.45),transparent_35%),linear-gradient(135deg,#020617,#450a0a,#78350f)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col px-6 pb-20 pt-7 sm:min-h-[780px] sm:px-8 sm:pb-24">
          {/* BREADCRUMB */}

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-white/60"
          >
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <Link
              href="/blog"
              className="transition hover:text-white"
            >
              Journal
            </Link>

            <span aria-hidden="true">
              /
            </span>

            <span className="max-w-[220px] truncate text-white/80">
              {story.title}
            </span>
          </nav>

          <div className="mt-auto max-w-5xl">
            {/* META */}

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/75">
              {story.category && (
                <span className="rounded-full bg-amber-300 px-3 py-1.5 text-slate-950">
                  {story.category}
                </span>
              )}

              {story.region && (
                <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 backdrop-blur-md">
                  {story.region}
                </span>
              )}

              {story.publishedAt && (
                <time
                  dateTime={
                    story.publishedAt
                  }
                  className="px-1"
                >
                  {formatDate(
                    story.publishedAt
                  )}
                </time>
              )}

              {story.readingTime && (
                <>
                  <span
                    aria-hidden="true"
                    className="text-white/35"
                  >
                    •
                  </span>

                  <span>
                    {story.readingTime} min read
                  </span>
                </>
              )}
            </div>

            {/* TITLE */}

            <h1 className="mt-7 max-w-5xl font-serif text-5xl font-bold leading-[0.94] tracking-tight text-white sm:text-6xl lg:text-[6.2rem]">
              {story.title}
            </h1>

            {story.subtitle && (
              <p className="mt-7 max-w-3xl text-xl font-medium leading-relaxed text-white/80 sm:text-2xl">
                {story.subtitle}
              </p>
            )}

            {story.author && (
              <div className="mt-8 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm backdrop-blur-md">
                  {story.author
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/50">
                    Written by
                  </p>

                  <p className="font-semibold text-white">
                    {story.author}
                  </p>
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags
                  .slice(0, 8)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/15 bg-black/15 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          STORY FACTS
      ====================================================== */}

      <section className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8">
        <div className="-mt-10 rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-2xl shadow-slate-950/10 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                Location
              </span>

              {story.district?.slug
                ?.current && (
                <>
                  <span
                    aria-hidden="true"
                    className="text-stone-300"
                  >
                    →
                  </span>

                  <Link
                    href={`/explore-nepal/${story.district.slug.current}`}
                    className="font-semibold text-red-800 underline decoration-red-200 underline-offset-4 hover:text-red-950"
                  >
                    {story.district.name}
                  </Link>
                </>
              )}

              {story.province?.slug
                ?.current && (
                <>
                  <span
                    aria-hidden="true"
                    className="text-stone-300"
                  >
                    →
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
          ARTICLE
      ====================================================== */}

      <article className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[220px_minmax(0,780px)] lg:justify-center">
          {/* DESKTOP NAVIGATION */}

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-800">
                In this story
              </p>

              <nav
                aria-label="Story sections"
                className="mt-4 space-y-1"
              >
                <a
                  href="#story"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-amber-50 hover:text-red-800"
                >
                  The story
                </a>

                {travelTips.length > 0 && (
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

                {gallery.length > 0 && (
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

          {/* ARTICLE CONTENT */}

          <div className="min-w-0">
            <section
              id="story"
              className="scroll-mt-28"
            >
              {story.excerpt && (
                <p className="mb-10 font-serif text-2xl leading-relaxed text-slate-900 sm:text-3xl">
                  {story.excerpt}
                </p>
              )}

              {story.body &&
              story.body.length > 0 ? (
                <div>
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
                <EmptyArticleState />
              )}
            </section>

            {/* =================================================
                TRAVEL TIPS
            ================================================== */}

            {travelTips.length > 0 && (
              <section
                id="travel-tips"
                className="mt-20 scroll-mt-28"
              >
                <SectionHeading
                  eyebrow="Practical notes"
                  title="Travel tips from the journey"
                />

                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-7 shadow-sm sm:p-10">
                  <ol className="space-y-5">
                    {travelTips.map(
                      (tip, index) => (
                        <li
                          key={`${tip}-${index}`}
                          className="flex gap-4"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-red-800">
                            {index + 1}
                          </span>

                          <p className="pt-1 leading-7 text-slate-700">
                            {tip}
                          </p>
                        </li>
                      )
                    )}
                  </ol>
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
                  className="mt-20 scroll-mt-28"
                >
                  <SectionHeading
                    eyebrow="Reflection"
                    title="What I learned"
                  />

                  <div className="rounded-[1.75rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-[#f8f0df] p-7 shadow-sm sm:p-10">
                    <PortableText
                      value={
                        story.whatILearned
                      }
                      components={
                        portableTextComponents
                      }
                    />
                  </div>
                </section>
              )}

            {/* =================================================
                GALLERY
            ================================================== */}

            {gallery.length > 0 && (
              <section
                id="gallery"
                className="mt-20 scroll-mt-28"
              >
                <SectionHeading
                  eyebrow="A closer look"
                  title="Moments from the journey"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {gallery.map(
                    (
                      image,
                      index
                    ) => {
                      const imageUrl =
                        urlForImage(
                          image
                        )
                          .width(1400)
                          .height(950)
                          .quality(88)
                          .fit("crop")
                          .auto("format")
                          .url();

                      return (
                        <figure
                          key={
                            image.asset
                              ?._ref ||
                            image.asset
                              ?._id ||
                            `gallery-${index}`
                          }
                          className={`group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm ${
                            index === 0
                              ? "sm:col-span-2"
                              : ""
                          }`}
                        >
                          <div
                            className={`relative overflow-hidden ${
                              index === 0
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
                                  index + 1
                                }`
                              }
                              fill
                              sizes={
                                index === 0
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
                className="mt-24 scroll-mt-28"
              >
                <SectionHeading
                  eyebrow="Plan the journey"
                  title="Related destinations"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  {relatedDestinations.map(
                    (destination) => {
                      if (
                        !destination.slug
                          ?.current
                      ) {
                        return null;
                      }

                      return (
                        <RelatedDestinationCard
                          key={
                            destination._id
                          }
                          destination={
                            destination
                          }
                        />
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
              <section className="mt-24">
                <SectionHeading
                  eyebrow="Discover more"
                  title="Related districts"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  {relatedDistricts.map(
                    (district) => {
                      if (
                        !district.slug
                          ?.current
                      ) {
                        return null;
                      }

                      return (
                        <RelatedDistrictCard
                          key={
                            district._id
                          }
                          district={
                            district
                          }
                        />
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
              <section className="mt-24">
                <SectionHeading
                  eyebrow="Keep reading"
                  title="More stories"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  {relatedStories.map(
                    (related) => {
                      if (
                        !related.slug
                          ?.current
                      ) {
                        return null;
                      }

                      return (
                        <RelatedStoryCard
                          key={
                            related._id
                          }
                          story={
                            related
                          }
                        />
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
              <section className="mt-24 border-t border-stone-200 pt-12">
                <div className="rounded-[1.75rem] border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    About the writer
                  </p>

                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-800 text-lg font-bold text-white">
                      {story.author
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2 className="font-serif text-2xl font-bold text-slate-950">
                        {story.author}
                      </h2>

                      <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                        {story.authorBio ||
                          "Sharing stories, places and experiences from Nepal."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* =================================================
                COMMUNITY
            ================================================== */}

            <section
              id="community"
              className="mt-24 scroll-mt-28 border-t border-stone-200 pt-16"
            >
              <SectionHeading
                eyebrow="Community"
                title="What did you think?"
                description="Share your reaction, join the conversation, or help us improve this story for future travellers."
              />

              <ReactionBar
                postId={story._id}
                postSlug={
                  story.slug.current
                }
                contentType="story"
              />

              <div className="mt-12">
                <Comments
                  postSlug={
                    story.slug.current
                  }
                  contentType="story"
                />
              </div>

              <div className="mt-12">
                <FeedbackForm />
              </div>

              <div className="mt-12">
                <NewsletterSignup />
              </div>
            </section>

            {/* =================================================
                FINAL CTA
            ================================================== */}

            <section className="relative mt-24 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  Keep wandering
                </p>

                <h2 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight sm:text-5xl">
                  There is always another road to
                  take.
                </h2>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
                  Discover another story, explore
                  another district, or start planning
                  your next journey through Nepal.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200"
                  >
                    More stories
                    <span aria-hidden="true">
                      →
                    </span>
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
        <span
          aria-hidden="true"
          className="text-xl"
        >
          {icon}
        </span>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 font-semibold leading-6 text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
        <span className="h-px w-8 bg-red-800" />
        {eyebrow}
      </p>

      <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY ARTICLE
========================================================= */

function EmptyArticleState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white p-10 text-center">
      <span className="text-5xl">
        ✍️
      </span>

      <p className="mt-5 text-lg font-medium text-slate-700">
        This story is still being written.
      </p>
    </div>
  );
}

/* =========================================================
   RELATED DESTINATION
========================================================= */

function RelatedDestinationCard({
  destination,
}: {
  destination: RelatedDestination;
}) {
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
      href={`/destinations/${destination.slug!.current}`}
      className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden bg-slate-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              destination
                .coverImage?.alt ||
              destination.title
            }
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <FallbackImage />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {destination.region && (
          <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
            {destination.region}
          </span>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-serif text-2xl font-bold text-slate-950 transition-colors group-hover:text-red-800">
          {destination.title}
        </h3>

        {destination.excerpt && (
          <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
            {destination.excerpt}
          </p>
        )}

        <span className="mt-5 inline-flex items-center gap-2 font-bold text-red-800">
          Explore guide
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

/* =========================================================
   RELATED DISTRICT
========================================================= */

function RelatedDistrictCard({
  district,
}: {
  district: RelatedDistrict;
}) {
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
      href={`/explore-nepal/${district.slug!.current}`}
      className="group flex overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
    >
      <div className="relative h-32 w-36 shrink-0 overflow-hidden bg-slate-900 sm:h-40 sm:w-48">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              district
                .coverImage?.alt ||
              `${district.name} District`
            }
            fill
            sizes="192px"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <FallbackImage />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center p-5">
        <h3 className="font-serif text-xl font-bold text-slate-950 transition-colors group-hover:text-red-800">
          {district.name}
        </h3>

        {district.headquarter && (
          <p className="mt-1 text-sm text-slate-500">
            HQ: {district.headquarter}
          </p>
        )}

        <span className="mt-3 text-sm font-bold text-red-800">
          Explore district →
        </span>
      </div>
    </Link>
  );
}

/* =========================================================
   RELATED STORY
========================================================= */

function RelatedStoryCard({
  story,
}: {
  story: RelatedStory;
}) {
  const imageUrl =
    hasValidImage(
      story.coverImage
    )
      ? urlForImage(
          story.coverImage
        )
          .width(1000)
          .height(650)
          .quality(85)
          .fit("crop")
          .auto("format")
          .url()
      : null;

  return (
    <Link
      href={`/blog/${story.slug!.current}`}
      className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden bg-slate-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              story.coverImage?.alt ||
              story.title
            }
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <FallbackImage />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="font-serif text-2xl font-bold text-slate-950 transition-colors group-hover:text-red-800">
          {story.title}
        </h3>

        {story.excerpt && (
          <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
            {story.excerpt}
          </p>
        )}

        <span className="mt-5 inline-flex items-center gap-2 font-bold text-red-800">
          Read story
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

/* =========================================================
   FALLBACK IMAGE
========================================================= */

function FallbackImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(185,28,28,0.5),transparent_35%),linear-gradient(135deg,#0f172a,#450a0a,#78350f)]">
      <span className="text-5xl opacity-80">
        📖
      </span>
    </div>
  );
}