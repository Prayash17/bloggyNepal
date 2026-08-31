import Image from "next/image";
import Link from "next/link";

import { client, urlForImage } from "@/lib/sanity";
import NewsletterSignup from "@/components/NewsletterSignup";

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
  readingTime?: number;
  featured?: boolean;

  coverImage?: StoryImage;
}

/* =========================================================
   QUERY
========================================================= */

const storiesQuery = `
  *[
    _type == "post" &&
    defined(slug.current)
  ]
  | order(featured desc, publishedAt desc) {
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
    readingTime,
    featured,
    coverImage
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

async function getStories(): Promise<Story[]> {
  try {
    const stories = await client.fetch<Story[]>(
      storiesQuery
    );

    return Array.isArray(stories)
      ? stories.filter(
          (story) =>
            Boolean(
              story?.slug?.current
            )
        )
      : [];
  } catch (error) {
    console.error(
      "Failed to fetch blog stories:",
      error
    );

    return [];
  }
}

/* =========================================================
   DATE
========================================================= */

function formatDate(value?: string): string {
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
   PAGE
========================================================= */

export default async function BlogPage() {
  const stories = await getStories();

  const featuredStory =
    stories.find(
      (story) => story.featured
    ) || stories[0];

  const remainingStories =
    featuredStory
      ? stories.filter(
          (story) =>
            story._id !==
            featuredStory._id
        )
      : [];

  const categories = Array.from(
    new Set(
      stories
        .map(
          (story) =>
            story.category
        )
        .filter(Boolean)
    )
  ).slice(0, 5);

  const regions = Array.from(
    new Set(
      stories
        .map(
          (story) =>
            story.region
        )
        .filter(Boolean)
    )
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        aria-labelledby="blog-page-title"
        className="relative isolate overflow-hidden bg-slate-950"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(185,28,28,0.34),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(245,158,11,0.16),transparent_34%)]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-8 lg:pb-32 lg:pt-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              The BloggyNepal Journal
            </div>

            <h1
              id="blog-page-title"
              className="mt-8 max-w-5xl font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl"
            >
              Stories from the
              <span className="block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                roads of Nepal.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
              First-hand journeys, unexpected
              encounters, quiet places, local
              experiences, and the stories behind
              the destinations we travel to.
            </p>

            {stories.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/55">
                <span>
                  <strong className="text-white">
                    {stories.length}
                  </strong>{" "}
                  published{" "}
                  {stories.length === 1
                    ? "story"
                    : "stories"}
                </span>

                {regions.length > 0 && (
                  <span>
                    <strong className="text-white">
                      {regions.length}
                    </strong>{" "}
                    regions covered
                  </span>
                )}

                <span>
                  Real journeys · Local perspective
                </span>
              </div>
            )}

            {categories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {categories.map(
                  (category) => (
                    <span
                      key={category}
                      className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/65 backdrop-blur"
                    >
                      {category}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED STORY
      ====================================================== */}

      {featuredStory && (
        <section
          aria-labelledby="featured-story-heading"
          className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24"
        >
          <div className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                <span className="h-px w-8 bg-red-800" />
                Editor&apos;s pick
              </p>

              <h2
                id="featured-story-heading"
                className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl"
              >
                Featured journey
              </h2>
            </div>

            <Link
              href="#latest-stories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-800"
            >
              Browse the journal
              <span aria-hidden="true">
                ↓
              </span>
            </Link>
          </div>

          <Link
            href={`/blog/${featuredStory.slug.current}`}
            className="group grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl lg:grid-cols-[1.15fr_0.85fr]"
          >
            <div className="relative min-h-[430px] overflow-hidden bg-slate-900 sm:min-h-[540px]">
              {hasValidImage(
                featuredStory.coverImage
              ) ? (
                <Image
                  src={urlForImage(
                    featuredStory.coverImage
                  )
                    .width(1600)
                    .height(1100)
                    .quality(88)
                    .fit("crop")
                    .auto("format")
                    .url()}
                  alt={
                    featuredStory
                      .coverImage?.alt ||
                    featuredStory.title
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition duration-1000 group-hover:scale-105"
                />
              ) : (
                <FallbackImage />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

              {featuredStory.category && (
                <span className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  {featuredStory.category}
                </span>
              )}

              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                {featuredStory.region && (
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                    {featuredStory.region}
                  </span>
                )}

                {featuredStory.readingTime && (
                  <span className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    {featuredStory.readingTime} min
                    read
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                {featuredStory.publishedAt && (
                  <time
                    dateTime={
                      featuredStory.publishedAt
                    }
                  >
                    {formatDate(
                      featuredStory.publishedAt
                    )}
                  </time>
                )}

                {featuredStory.author && (
                  <>
                    <span aria-hidden="true">
                      •
                    </span>

                    <span>
                      By{" "}
                      {featuredStory.author}
                    </span>
                  </>
                )}
              </div>

              <h3 className="mt-6 font-serif text-4xl font-bold leading-[1.03] tracking-tight text-slate-950 transition-colors group-hover:text-red-800 sm:text-5xl">
                {featuredStory.title}
              </h3>

              {featuredStory.subtitle && (
                <p className="mt-5 text-lg font-medium leading-8 text-slate-500">
                  {featuredStory.subtitle}
                </p>
              )}

              {featuredStory.excerpt && (
                <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                  {featuredStory.excerpt}
                </p>
              )}

              {featuredStory.tags &&
                featuredStory.tags.length > 0 && (
                  <div className="mt-7 flex flex-wrap gap-2">
                    {featuredStory.tags
                      .slice(0, 5)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

              <div className="mt-10 inline-flex items-center gap-3 font-bold text-red-800">
                Read the full story
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-2"
                >
                  →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* =====================================================
          LATEST STORIES
      ====================================================== */}

      <section
        id="latest-stories"
        aria-labelledby="latest-stories-heading"
        className="mx-auto max-w-7xl px-6 pb-24 sm:px-8 lg:pb-32"
      >
        <div className="mb-10 border-b border-stone-200 pb-7">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
            <span className="h-px w-8 bg-red-800" />
            Latest from Nepal
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="latest-stories-heading"
                className="font-serif text-3xl font-bold text-slate-950 sm:text-4xl"
              >
                More journeys
              </h2>

              <p className="mt-2 max-w-2xl text-slate-500">
                Stories about the places we visit,
                the people we meet, and the moments
                that make a journey worth remembering.
              </p>
            </div>
          </div>
        </div>

        {remainingStories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-x-7 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {remainingStories.map(
              (story, index) => (
                <StoryCard
                  key={story._id}
                  story={story}
                  featured={
                    index === 0
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          EDITORIAL PHILOSOPHY
      ====================================================== */}

      <section className="border-y border-stone-200 bg-[#f1ede4]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                The idea behind the journal
              </p>

              <h2 className="mt-4 max-w-lg font-serif text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Nepal is more than a destination.
              </h2>
            </div>

            <div className="max-w-3xl">
              <p className="text-xl leading-9 text-slate-700">
                A journey is also the road that
                surprised you, the tea shared with a
                stranger, the meal you did not expect,
                the mountain morning you still think
                about, and the small moments between
                destinations.
              </p>

              <p className="mt-6 leading-8 text-slate-600">
                That is what we try to document here:
                useful experiences wrapped in honest
                stories, so travellers can discover
                Nepal with a little more context and a
                little less guesswork.
              </p>

              <Link
                href="/destinations"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-red-800 px-6 py-3.5 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900"
              >
                Explore Nepal
                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}

      <section
        aria-labelledby="journal-newsletter-heading"
        className="bg-[#fbfaf7] px-6 py-20 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
              Stay in the loop
            </p>

            <h2
              id="journal-newsletter-heading"
              className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl"
            >
              Stories worth opening.
            </h2>

            <p className="mt-3 text-slate-500">
              New journeys, useful travel notes, and
              stories from Nepal — without filling your
              inbox.
            </p>
          </div>

          <NewsletterSignup />
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   STORY CARD
========================================================= */

function StoryCard({
  story,
  featured = false,
}: {
  story: Story;
  featured?: boolean;
}) {
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl ${
        featured
          ? "md:col-span-2 xl:col-span-1"
          : ""
      }`}
    >
      <Link
        href={`/blog/${story.slug.current}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {hasValidImage(
            story.coverImage
          ) ? (
            <Image
              src={urlForImage(
                story.coverImage
              )
                .width(1200)
                .height(760)
                .quality(85)
                .fit("crop")
                .auto("format")
                .url()}
              alt={
                story.coverImage?.alt ||
                story.title
              }
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <FallbackImage />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            {story.category && (
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-900">
                {story.category}
              </span>
            )}

            {story.readingTime && (
              <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                {story.readingTime} min
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {story.region && (
              <span>{story.region}</span>
            )}

            {story.publishedAt && (
              <>
                {story.region && (
                  <span aria-hidden="true">
                    •
                  </span>
                )}

                <time
                  dateTime={
                    story.publishedAt
                  }
                >
                  {formatDate(
                    story.publishedAt
                  )}
                </time>
              </>
            )}
          </div>

          <h3 className="mt-4 font-serif text-2xl font-bold leading-tight tracking-tight text-slate-950 transition-colors group-hover:text-red-800">
            {story.title}
          </h3>

          {story.subtitle && (
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
              {story.subtitle}
            </p>
          )}

          {story.excerpt && (
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
              {story.excerpt}
            </p>
          )}

          {story.author && (
            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-6 w-6 rounded-full bg-stone-100" />
              <span>
                Written by{" "}
                <strong className="font-semibold text-slate-600">
                  {story.author}
                </strong>
              </span>
            </div>
          )}

          <div className="mt-auto pt-7">
            <span className="inline-flex items-center gap-2 font-bold text-red-800">
              Read story
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1.5"
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

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-20 text-center shadow-sm">
      <span className="text-5xl">
        ✍️
      </span>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
        The journal is just beginning
      </p>

      <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950">
        More stories are on the way.
      </h2>

      <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
        New journeys, local encounters, travel
        experiences, and stories from Nepal will
        appear here as they are published.
      </p>

      <Link
        href="/destinations"
        className="mt-8 inline-flex rounded-full bg-red-800 px-6 py-3.5 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900"
      >
        Explore destinations
      </Link>
    </div>
  );
}

/* =========================================================
   FALLBACK
========================================================= */

function FallbackImage() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(185,28,28,0.5),transparent_35%),linear-gradient(135deg,#0f172a,#450a0a,#78350f)]">
      <span className="text-6xl opacity-80">
        📖
      </span>
    </div>
  );
}