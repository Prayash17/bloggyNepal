import Image from "next/image";
import Link from "next/link";

import {
  client,
  urlForImage,
} from "@/lib/sanity";

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

  publishedAt: string;

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
   FETCH STORIES
========================================================= */

async function getStories(): Promise<Story[]> {
  try {
    const stories =
      await client.fetch<Story[]>(
        storiesQuery
      );

    return Array.isArray(stories)
      ? stories
      : [];
  } catch (error) {
    console.error(
      "Failed to fetch stories:",
      error
    );

    return [];
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
   PAGE
========================================================= */

export default async function BlogPage() {
  const stories =
    await getStories();

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:py-32">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-red-700/30 blur-3xl" />

        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Stories from Nepal
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Journeys,
            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              people & places.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            First-hand journeys, quiet
            discoveries, local encounters
            and stories that reveal another
            side of Nepal.
          </p>

          {stories.length > 0 && (
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
                {stories.length}{" "}
                {stories.length === 1
                  ? "story"
                  : "stories"}
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
                Real experiences
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
                Nepal travel
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          STORY CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        {stories.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ===============================================
                FEATURED STORY
            ================================================ */}

            {featuredStory && (
              <section className="mb-24">
                <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-red-800">
                      <span className="h-px w-8 bg-red-800" />
                      Featured story
                    </p>

                    <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                      From the road
                    </h2>
                  </div>

                  <Link
                    href="/blog"
                    className="hidden text-sm font-semibold text-slate-500 transition hover:text-red-800 sm:block"
                  >
                    {stories.length}{" "}
                    {stories.length === 1
                      ? "story"
                      : "stories"}{" "}
                    in the collection
                  </Link>
                </div>

                <Link
                  href={`/blog/${featuredStory.slug.current}`}
                  className="group grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl lg:grid-cols-2"
                >
                  {/* IMAGE */}

                  <div className="relative min-h-[380px] overflow-hidden bg-slate-900 lg:min-h-[560px]">
                    {hasValidImage(
                      featuredStory.coverImage
                    ) ? (
                      <Image
                        src={urlForImage(
                          featuredStory.coverImage
                        )
                          .width(1400)
                          .height(1100)
                          .quality(88)
                          .fit("crop")
                          .auto("format")
                          .url()}
                        alt={
                          featuredStory
                            .coverImage
                            ?.alt ||
                          featuredStory.title
                        }
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition duration-1000 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-[380px] items-center justify-center bg-gradient-to-br from-red-950 via-slate-900 to-amber-800">
                        <span className="text-7xl">
                          📖
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                    {featuredStory.category && (
                      <span className="absolute left-6 top-6 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                        {
                          featuredStory.category
                        }
                      </span>
                    )}

                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap gap-2">
                      {featuredStory.region && (
                        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800">
                          {
                            featuredStory.region
                          }
                        </span>
                      )}

                      {featuredStory.readingTime && (
                        <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                          {
                            featuredStory.readingTime
                          }{" "}
                          min read
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      {featuredStory.publishedAt && (
                        <span>
                          {formatDate(
                            featuredStory.publishedAt
                          )}
                        </span>
                      )}

                      {featuredStory.author && (
                        <>
                          <span className="text-stone-300">
                            •
                          </span>

                          <span>
                            By{" "}
                            {
                              featuredStory.author
                            }
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-red-800 sm:text-5xl">
                      {
                        featuredStory.title
                      }
                    </h3>

                    {featuredStory.subtitle && (
                      <p className="mt-4 text-lg font-medium leading-relaxed text-slate-500">
                        {
                          featuredStory.subtitle
                        }
                      </p>
                    )}

                    {featuredStory.excerpt && (
                      <p className="mt-5 text-lg leading-8 text-slate-600">
                        {
                          featuredStory.excerpt
                        }
                      </p>
                    )}

                    {featuredStory.tags &&
                      featuredStory.tags
                        .length > 0 && (
                        <div className="mt-7 flex flex-wrap gap-2">
                          {featuredStory.tags
                            .slice(0, 4)
                            .map(
                              (
                                tag
                              ) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                                >
                                  #
                                  {
                                    tag
                                  }
                                </span>
                              )
                            )}
                        </div>
                      )}

                    <span className="mt-9 inline-flex items-center gap-3 font-bold text-red-800">
                      Read the full story

                      <span className="transition-transform duration-300 group-hover:translate-x-2">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* ===============================================
                STORY GRID
            ================================================ */}

            {remainingStories.length >
              0 && (
              <section>
                <div className="mb-9">
                  <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-red-800">
                    <span className="h-px w-8 bg-red-800" />
                    More from Nepal
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    Continue reading
                  </h2>
                </div>

                <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                  {remainingStories.map(
                    (story) => (
                      <Link
                        key={story._id}
                        href={`/blog/${story.slug.current}`}
                        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl"
                      >
                        {/* IMAGE */}

                        <div className="relative h-64 overflow-hidden bg-slate-900">
                          {hasValidImage(
                            story.coverImage
                          ) ? (
                            <Image
                              src={urlForImage(
                                story.coverImage
                              )
                                .width(1000)
                                .height(700)
                                .quality(85)
                                .fit("crop")
                                .auto(
                                  "format"
                                )
                                .url()}
                              alt={
                                story
                                  .coverImage
                                  ?.alt ||
                                story.title
                              }
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-amber-800">
                              <span className="text-6xl">
                                📖
                              </span>
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                            {story.category && (
                              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 backdrop-blur">
                                {
                                  story.category
                                }
                              </span>
                            )}

                            {story.readingTime && (
                              <span className="rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                                {
                                  story.readingTime
                                }{" "}
                                min
                              </span>
                            )}
                          </div>
                        </div>

                        {/* CARD CONTENT */}

                        <div className="flex flex-1 flex-col p-7">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            {story.region && (
                              <span>
                                {
                                  story.region
                                }
                              </span>
                            )}

                            {story.publishedAt && (
                              <>
                                <span>
                                  •
                                </span>

                                <span>
                                  {formatDate(
                                    story.publishedAt
                                  )}
                                </span>
                              </>
                            )}
                          </div>

                          <h3 className="mt-3 font-serif text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-red-800">
                            {
                              story.title
                            }
                          </h3>

                          {story.subtitle && (
                            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-500">
                              {
                                story.subtitle
                              }
                            </p>
                          )}

                          {story.excerpt && (
                            <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                              {
                                story.excerpt
                              }
                            </p>
                          )}

                          <div className="mt-auto pt-7">
                            <span className="inline-flex items-center gap-2 font-bold text-red-800">
                              Read story

                              <span className="transition-transform duration-300 group-hover:translate-x-2">
                                →
                              </span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}

      <section className="bg-[#fbfaf7] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </section>

      {/* =====================================================
          STORY PHILOSOPHY
      ====================================================== */}

      <section className="bg-[#f1ede4] px-6 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12 lg:p-16">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Why we tell stories
            </p>

            <h2 className="mt-4 font-serif text-3xl font-bold leading-tight sm:text-5xl">
              Nepal is more than the
              places on a map.
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
              A journey is also the people you
              meet, the food you remember, the roads
              that surprise you, the silence of a
              mountain morning, and the moments that
              stay with you long after you return
              home.
            </p>

            <Link
              href="/destinations"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-amber-300 px-6 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200"
            >
              Explore Nepal

              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white px-6 py-24 text-center shadow-sm">
      <span className="text-6xl">
        ✍️
      </span>

      <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-red-800">
        The collection is beginning
      </p>

      <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
        No stories have been published yet.
      </h2>

      <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
        New journeys, encounters and experiences
        from Nepal will appear here as they are
        published.
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