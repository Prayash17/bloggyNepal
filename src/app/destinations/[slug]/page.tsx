import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

import { client, urlForImage } from "@/lib/sanity";

export const revalidate = 60;

interface Destination {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  region?: string;
  coverImage?: any;
  duration?: string;
  maxAltitude?: string;
  difficulty?: string;
  bestSeason?: string;
  startingCost?: number;
  mapImage?: any;
  howToGetThere?: any[];
  itinerary?: Array<{
    day: number;
    title: string;
    description?: string;
  }>;
  costBreakdown?: Array<{
    item: string;
    amount?: string;
    notes?: string;
  }>;
  permits?: string[];
  packingList?: string[];
  safetyTips?: string[];
  accommodation?: any[];
  proTips?: string[];
  gallery?: any[];
}

const destinationQuery = `
  *[_type == "destination" && slug.current == $slug][0] {
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
    startingCost,
    mapImage,
    howToGetThere,
    itinerary,
    costBreakdown,
    permits,
    packingList,
    safetyTips,
    accommodation,
    proTips,
    gallery
  }
`;

async function getDestination(slug: string): Promise<Destination | null> {
  try {
    return await client.fetch<Destination | null>(destinationQuery, {
      slug,
    });
  } catch (error) {
    console.error("Failed to fetch destination:", error);
    return null;
  }
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

  const facts = [
    destination.duration
      ? {
          label: "Duration",
          value: destination.duration,
          icon: "🕐",
        }
      : null,

    destination.difficulty
      ? {
          label: "Difficulty",
          value: destination.difficulty,
          icon: "⛰️",
        }
      : null,

    destination.maxAltitude
      ? {
          label: "Max altitude",
          value: destination.maxAltitude,
          icon: "📍",
        }
      : null,

    destination.bestSeason
      ? {
          label: "Best season",
          value: destination.bestSeason,
          icon: "🌤️",
        }
      : null,

    destination.startingCost !== undefined
      ? {
          label: "Starting from",
          value: `$${destination.startingCost}`,
          icon: "💰",
        }
      : null,
  ].filter(
    Boolean
  ) as Array<{
    label: string;
    value: string;
    icon: string;
  }>;

  const coverImageUrl = destination.coverImage
    ? urlForImage(destination.coverImage)
        .width(2000)
        .height(1200)
        .quality(90)
        .url()
    : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* HERO */}
      <section className="relative isolate min-h-[600px] overflow-hidden sm:min-h-[680px]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={
              destination.coverImage?.alt ||
              `${destination.title} travel guide`
            }
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-red-950 to-amber-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/10" />

        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="absolute -left-24 bottom-16 h-72 w-72 rounded-full bg-red-700/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[600px] max-w-7xl flex-col justify-end px-6 pb-16 pt-28 sm:min-h-[680px] sm:px-8 sm:pb-20">
          <Link
            href="/destinations"
            className="mb-auto inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-x-1 hover:bg-white hover:text-slate-950"
          >
            <span>←</span>
            All destinations
          </Link>

          <div className="max-w-4xl text-white">
            <p className="mb-4 inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200 backdrop-blur-md">
              {destination.region || "Nepal"}
            </p>

            <h1 className="font-serif text-5xl font-bold leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
              {destination.title}
            </h1>

            {destination.excerpt && (
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85 sm:text-xl">
                {destination.excerpt}
              </p>
            )}

            <a
              href="#guide"
              className="group mt-8 inline-flex items-center gap-3 font-bold text-amber-200 transition hover:text-amber-100"
            >
              Start planning your journey
              <span className="transition-transform group-hover:translate-y-1">
                ↓
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FACTS */}
      {facts.length > 0 && (
        <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-6 sm:px-8">
          <div className="grid overflow-hidden rounded-2xl border border-white/60 bg-white shadow-xl shadow-slate-950/10 sm:grid-cols-2 lg:grid-cols-5">
            {facts.map((fact, index) => (
              <div
                key={fact.label}
                className={`border-b border-stone-200 p-5 text-center transition hover:bg-amber-50/60 ${
                  index > 0 ? "sm:border-l" : ""
                } ${index >= 2 ? "lg:border-t-0" : ""}`}
              >
                <span className="text-2xl">{fact.icon}</span>

                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  {fact.label}
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GUIDE */}
      <section
        id="guide"
        className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:py-28"
      >
        {/* MAP */}
        {destination.mapImage && (
          <GuideSection
            eyebrow="Know before you go"
            title="Location & route map"
            icon="🗺️"
          >
            <div className="group overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
              <Image
                src={urlForImage(destination.mapImage)
                  .width(1400)
                  .height(800)
                  .quality(90)
                  .url()}
                alt={
                  destination.mapImage.alt ||
                  `Map of ${destination.title}`
                }
                width={1400}
                height={800}
                className="h-auto w-full rounded-xl"
              />
            </div>
          </GuideSection>
        )}

        {/* HOW TO GET THERE */}
        {destination.howToGetThere?.length ? (
          <GuideSection
            eyebrow="Getting there"
            title="How to reach it"
            icon="🚗"
          >
            <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-relaxed prose-a:text-red-800">
                <PortableText value={destination.howToGetThere} />
              </div>
            </div>
          </GuideSection>
        ) : null}

        {/* ITINERARY */}
        {destination.itinerary?.length ? (
          <GuideSection
            eyebrow="A journey at your pace"
            title="Day-by-day itinerary"
            icon="📋"
          >
            <div className="relative space-y-5 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-amber-200 sm:before:left-8">
              {destination.itinerary.map((day) => (
                <article
                  key={`${day.day}-${day.title}`}
                  className="relative rounded-2xl border border-stone-200 bg-white p-6 pl-20 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg sm:pl-24"
                >
                  <span className="absolute left-3 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-sm font-bold text-white shadow-lg sm:left-5 sm:h-11 sm:w-11">
                    {day.day}
                  </span>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-800">
                    Day {day.day}
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-slate-900">
                    {day.title}
                  </h3>

                  {day.description && (
                    <p className="mt-3 leading-relaxed text-slate-600">
                      {day.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </GuideSection>
        ) : null}

        {/* COST */}
        {destination.costBreakdown?.length ? (
          <GuideSection
            eyebrow="Plan your budget"
            title="Cost breakdown"
            icon="💰"
          >
            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="min-w-full text-left">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 text-sm font-semibold">
                      Item
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-200">
                  {destination.costBreakdown.map((cost, index) => (
                    <tr
                      key={`${cost.item}-${index}`}
                      className="transition-colors hover:bg-amber-50/60"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {cost.item}
                      </td>

                      <td className="px-5 py-4 font-bold text-red-800">
                        {cost.amount || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {cost.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GuideSection>
        ) : null}

        {/* PERMITS */}
        {destination.permits?.length ? (
          <GuideSection
            eyebrow="Travel requirements"
            title="Permits required"
            icon="🎫"
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {destination.permits.map((permit, index) => (
                <li
                  key={`${permit}-${index}`}
                  className="flex gap-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-md"
                >
                  <span className="text-lg font-bold text-red-800">
                    ✓
                  </span>

                  <span className="font-medium text-slate-700">
                    {permit}
                  </span>
                </li>
              ))}
            </ul>
          </GuideSection>
        ) : null}

        {/* PACKING */}
        {destination.packingList?.length ? (
          <GuideSection
            eyebrow="Prepare well"
            title="Packing checklist"
            icon="🎒"
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {destination.packingList.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-center gap-3 rounded-xl bg-[#f1ede4] px-5 py-4 text-slate-700 transition hover:bg-amber-100"
                >
                  <span className="font-bold text-red-800">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </GuideSection>
        ) : null}

        {/* SAFETY */}
        {destination.safetyTips?.length ? (
          <GuideSection
            eyebrow="Travel thoughtfully"
            title="Safety tips"
            icon="⚠️"
          >
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-7 sm:p-9">
              <ul className="space-y-4">
                {destination.safetyTips.map((tip, index) => (
                  <li
                    key={`${tip}-${index}`}
                    className="flex gap-3 leading-relaxed"
                  >
                    <span className="font-bold text-amber-700">✦</span>
                    <span className="text-slate-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GuideSection>
        ) : null}

        {/* ACCOMMODATION */}
        {destination.accommodation?.length ? (
          <GuideSection
            eyebrow="Rest along the way"
            title="Accommodation"
            icon="🏨"
          >
            <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm sm:p-9">
              <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:leading-relaxed">
                <PortableText value={destination.accommodation} />
              </div>
            </div>
          </GuideSection>
        ) : null}

        {/* PRO TIPS */}
        {destination.proTips?.length ? (
          <GuideSection
            eyebrow="From experience"
            title="Local pro tips"
            icon="⭐"
          >
            <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-7 text-white shadow-xl sm:p-9">
              <ul className="space-y-4">
                {destination.proTips.map((tip, index) => (
                  <li
                    key={`${tip}-${index}`}
                    className="flex gap-3 leading-relaxed text-white/85"
                  >
                    <span className="text-amber-300">★</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GuideSection>
        ) : null}

        {/* GALLERY */}
        {destination.gallery?.length ? (
          <GuideSection
            eyebrow="See the journey"
            title="Gallery"
            icon="📸"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destination.gallery.map((image: any, index: number) => (
                <div
                  key={image._key || index}
                  className="group aspect-square overflow-hidden rounded-2xl bg-slate-200 shadow-sm"
                >
                  <Image
                    src={urlForImage(image)
                      .width(700)
                      .height(700)
                      .quality(88)
                      .url()}
                    alt={
                      image.alt ||
                      `${destination.title} photo ${index + 1}`
                    }
                    width={700}
                    height={700}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </GuideSection>
        ) : null}

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-[#f1ede4] to-amber-50 p-8 text-center sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
            Keep exploring
          </p>

          <h2 className="mt-3 font-serif text-3xl font-bold text-slate-900">
            Nepal has more waiting for you.
          </h2>

          <Link
            href="/destinations"
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-red-800 px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900 hover:shadow-lg"
          >
            Browse all destinations
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </section>
      </section>
    </main>
  );
}

function GuideSection({
  children,
  eyebrow,
  title,
  icon,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  icon: string;
}) {
  return (
    <section className="mb-24">
      <div className="mb-8">
        <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
          <span className="h-px w-8 bg-red-800" />
          {eyebrow}
        </p>

        <h2 className="mt-3 flex items-center gap-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-xl shadow-inner">
            {icon}
          </span>

          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}