import { client, urlForImage } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Destination {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  region: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage: any;
  duration?: string;
  maxAltitude?: string;
  difficulty?: string;
  startingCost?: number;
}

async function getDestinations(): Promise<Destination[]> {
  const query = `*[_type == "destination"] | order(startingCost asc) {
    _id,
    title,
    slug,
    excerpt,
    region,
    coverImage,
    duration,
    maxAltitude,
    difficulty,
    startingCost
  }`;
  return client.fetch(query);
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            Browse
          </p>
          <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Where to Go in Nepal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Complete travel guides with maps, day-by-day itineraries, cost
            breakdowns, and practical tips. Written for solo travelers who
            want the real picture.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>

        {/* Destinations Grid */}
        {destinations.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg text-slate-500">
              No destinations yet. Guides coming soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={dest._id}
                href={`/destinations/${dest.slug.current}`}
                className="group block overflow-hidden rounded-sm bg-white shadow-sm transition hover:shadow-xl"
              >
                {/* Cover Image */}
                {dest.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={urlForImage(dest.coverImage).width(800).height(400).url()}
                      alt={dest.coverImage.alt || dest.title}
                      width={800}
                      height={400}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-300 to-slate-500">
                    <span className="text-6xl text-white/70">🏔️</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                    {dest.region || "Nepal"}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                    {dest.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                    {dest.excerpt}
                  </p>

                  {/* Quick Facts */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {dest.duration && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-slate-700">
                        🕐 {dest.duration}
                      </span>
                    )}
                    {dest.difficulty && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-slate-700">
                        📊 {dest.difficulty}
                      </span>
                    )}
                    {dest.maxAltitude && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-slate-700">
                        📍 {dest.maxAltitude}
                      </span>
                    )}
                    {dest.startingCost !== undefined && (
                      <span className="rounded-full bg-[#8B0000]/10 px-3 py-1 font-medium text-[#8B0000]">
                        💰 from ${dest.startingCost}
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                    View Full Guide →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
