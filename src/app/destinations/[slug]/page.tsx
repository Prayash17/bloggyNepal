import { client, urlForImage } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Destination {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  region: string;
  coverImage: any;
  duration?: string;
  maxAltitude?: string;
  difficulty?: string;
  bestSeason?: string;
  startingCost?: number;
  mapImage?: any;
  howToGetThere?: any[];
  itinerary?: Array<{ day: number; title: string; description: string }>;
  costBreakdown?: Array<{ item: string; amount: string; notes?: string }>;
  permits?: string[];
  packingList?: string[];
  safetyTips?: string[];
  accommodation?: any[];
  proTips?: string[];
  gallery?: any[];
}

async function getDestination(slug: string): Promise<Destination | null> {
  const query = `*[_type == "destination" && slug.current == $slug][0] {
    _id, title, slug, excerpt, region, coverImage, duration, maxAltitude,
    difficulty, bestSeason, startingCost, mapImage, howToGetThere,
    itinerary, costBreakdown, permits, packingList, safetyTips,
    accommodation, proTips, gallery
  }`;
  return client.fetch(query, { slug });
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getDestination(slug);

  if (!destination) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      {/* HERO */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        {destination.coverImage && (
          <Image
            src={urlForImage(destination.coverImage).width(2000).height(1000).url()}
            alt={destination.coverImage.alt || destination.title}
            fill
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 z-10 p-8 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="mb-3 text-sm uppercase tracking-widest text-white/80">
              {destination.region || "Nepal"}
            </p>
            <h1 className="text-5xl font-bold md:text-6xl">
              {destination.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-white/90">
              {destination.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK FACTS BAR */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-6 md:grid-cols-5">
          {destination.duration && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Duration
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {destination.duration}
              </p>
            </div>
          )}
          {destination.difficulty && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Difficulty
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {destination.difficulty}
              </p>
            </div>
          )}
          {destination.maxAltitude && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Max Altitude
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {destination.maxAltitude}
              </p>
            </div>
          )}
          {destination.bestSeason && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Best Season
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {destination.bestSeason}
              </p>
            </div>
          )}
          {destination.startingCost !== undefined && (
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                From (USD)
              </p>
              <p className="mt-1 font-semibold text-[#8B0000]">
                ${destination.startingCost}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        {/* Map Section */}
        {destination.mapImage && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              📍 Location Map
            </h2>
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
              <Image
                src={urlForImage(destination.mapImage).width(1200).height(700).url()}
                alt={destination.mapImage.alt || `Map of ${destination.title}`}
                width={1200}
                height={700}
                className="h-auto w-full"
              />
            </div>
          </div>
        )}

        {/* How to Get There */}
        {destination.howToGetThere && destination.howToGetThere.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              🚗 How to Get There
            </h2>
            <div className="prose prose-lg max-w-none text-slate-700">
              <PortableText value={destination.howToGetThere} />
            </div>
          </div>
        )}

        {/* Itinerary */}
        {destination.itinerary && destination.itinerary.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              📋 Day-by-Day Itinerary
            </h2>
            <div className="space-y-4">
              {destination.itinerary.map((day) => (
                <div
                  key={day.day}
                  className="rounded-sm border border-slate-200 bg-white p-6"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#8B0000] text-sm font-bold text-white">
                      {day.day}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Day {day.day}: {day.title}
                    </h3>
                  </div>
                  <p className="ml-13 leading-relaxed text-slate-600">
                    {day.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        {destination.costBreakdown && destination.costBreakdown.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              💰 Cost Breakdown
            </h2>
            <div className="overflow-hidden rounded-sm border border-slate-200 bg-white">
              <table className="w-full">
                <thead className="bg-stone-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Amount (USD)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {destination.costBreakdown.map((cost, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-3 text-slate-700">{cost.item}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {cost.amount}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {cost.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permits */}
        {destination.permits && destination.permits.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              🎫 Permits Required
            </h2>
            <ul className="space-y-2">
              {destination.permits.map((permit, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-sm bg-white p-4 border border-slate-200"
                >
                  <span className="text-[#8B0000]">✓</span>
                  <span className="text-slate-700">{permit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Packing List */}
        {destination.packingList && destination.packingList.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              🎒 Packing List
            </h2>
            <ul className="grid gap-2 md:grid-cols-2">
              {destination.packingList.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-sm bg-white p-3 border border-slate-200"
                >
                  <span className="text-[#8B0000]">▸</span>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Tips */}
        {destination.safetyTips && destination.safetyTips.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              ⚠️ Safety Tips
            </h2>
            <div className="rounded-sm border-l-4 border-[#8B0000] bg-amber-50 p-6">
              <ul className="space-y-3">
                {destination.safetyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#8B0000]">⚠</span>
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Accommodation */}
        {destination.accommodation && destination.accommodation.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              🏨 Accommodation
            </h2>
            <div className="prose prose-lg max-w-none text-slate-700">
              <PortableText value={destination.accommodation} />
            </div>
          </div>
        )}

        {/* Pro Tips */}
        {destination.proTips && destination.proTips.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              ⭐ Pro Tips
            </h2>
            <div className="rounded-sm border border-[#8B0000]/20 bg-[#8B0000]/5 p-6">
              <ul className="space-y-3">
                {destination.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-[#8B0000]">★</span>
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Gallery */}
        {destination.gallery && destination.gallery.length > 0 && (
          <div className="mb-16">
            <h2 className="mb-6 text-3xl font-semibold text-slate-800">
              📸 Gallery
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {destination.gallery.map((image: any, idx: number) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-sm bg-slate-100 aspect-square"
                >
                  <Image
                    src={urlForImage(image).width(600).height(600).url()}
                    alt={image.alt || `${destination.title} photo ${idx + 1}`}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-16 border-t border-slate-200 pt-10 text-center">
          <Link
            href="/destinations"
            className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
          >
            ← Browse All Destinations
          </Link>
        </div>
      </section>
    </main>
  );
}
