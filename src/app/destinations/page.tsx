import Image from "next/image";
import Link from "next/link";

import { client, urlForImage } from "@/lib/sanity";
import NewsletterSignup from "@/components/NewsletterSignup";

export const revalidate = 60;

interface Destination {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  region?: string;
  coverImage?: {
    alt?: string;
    asset?: {
      _ref?: string;
    };
  };
  duration?: string;
  maxAltitude?: string;
  difficulty?: string;
  bestSeason?: string;
  startingCost?: number;
}

const destinationsQuery = `
  *[_type == "destination" && defined(slug.current)]
    | order(featured desc, startingCost asc, title asc) {
      _id,
      title,
      slug,
      excerpt,
      region,
      coverImage,
      duration,
      maxAltitude,
      difficulty,
      bestSeason,
      startingCost
    }
`;

async function getDestinations(): Promise<Destination[]> {
  try {
    const data =
      await client.fetch<Destination[]>(
        destinationsQuery
      );

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.error(
      "Failed to fetch destinations from Sanity:",
      error
    );

    return [];
  }
}

export default async function DestinationsPage() {
  const destinations =
    await getDestinations();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:py-32">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-7xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Find your next journey
          </p>

          <h1 className="mx-auto mt-7 max-w-4xl font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Where will Nepal
            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              take you next?
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            Explore practical, honest destination
            guides with maps, itineraries, costs,
            travel logistics, and the details that
            make a journey smoother.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-white/75">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md">
              🗺️ Detailed routes
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md">
              💰 Realistic budgets
            </span>

            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md">
              🎒 Helpful travel tips
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          DESTINATIONS
      ====================================================== */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-28">
        <div className="mb-12 flex flex-col gap-4 border-b border-stone-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              <span className="h-px w-8 bg-red-800" />
              Destination guides
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore at your own pace
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {destinations.length}{" "}
            {destinations.length === 1
              ? "guide"
              : "guides"}{" "}
            available
          </p>
        </div>

        {destinations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center shadow-sm">
            <span className="text-6xl">
              ⛰️
            </span>

            <h2 className="mt-5 font-serif text-3xl font-bold text-slate-900">
              New journeys are on their way.
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-600">
              Your destination content exists in
              Sanity, but no published destination
              documents are currently being returned
              by the query.
            </p>

            <Link
              href="/explore-nepal"
              className="mt-7 inline-flex rounded-full bg-red-800 px-6 py-3 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900"
            >
              Explore Nepal
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map(
              (
                destination,
                index
              ) => {
                const imageUrl =
                  destination.coverImage
                    ? urlForImage(
                        destination.coverImage
                      )
                        .width(900)
                        .height(600)
                        .quality(85)
                        .url()
                    : null;

                return (
                  <Link
                    key={
                      destination._id
                    }
                    href={`/destinations/${destination.slug.current}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-slate-900/10"
                  >
                    {/* Bottom hover line */}
                    <span className="absolute inset-x-0 bottom-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-red-700 transition-transform duration-500 group-hover:scale-x-100" />

                    {/* =================================================
                        IMAGE
                    ================================================== */}
                    <div className="relative h-64 overflow-hidden bg-slate-800">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={
                            destination
                              .coverImage
                              ?.alt ||
                            `${destination.title} travel guide in Nepal`
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-900 via-slate-800 to-amber-800">
                          <span className="text-6xl">
                            🏔️
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                      <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 backdrop-blur">
                        {destination.region ||
                          "Nepal"}
                      </span>

                      <span className="absolute bottom-5 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-slate-950 shadow-lg">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    {/* =================================================
                        CONTENT
                    ================================================== */}
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-serif text-2xl font-bold text-slate-900 transition-colors group-hover:text-red-800">
                        {
                          destination.title
                        }
                      </h2>

                      {destination.excerpt && (
                        <p className="mt-3 line-clamp-3 leading-relaxed text-slate-600">
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
                            📍{" "}
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
                          View full guide

                          <span className="transition-transform duration-300 group-hover:translate-x-2">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          NEWSLETTER
      ====================================================== */}
      <section className="bg-[#f1ede4] px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="bg-[#f1ede4] px-6 pb-24 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-3xl bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:p-12">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              Still deciding?
            </p>

            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900">
              Explore all 77 districts of Nepal.
            </h2>

            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
              Discover the people, landscapes,
              culture, and places worth knowing
              across every province.
            </p>
          </div>

          <Link
            href="/explore-nepal"
            className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-slate-950 px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900 hover:shadow-lg"
          >
            Browse all districts

            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}