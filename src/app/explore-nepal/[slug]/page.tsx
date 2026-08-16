import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";

import { client } from "@/sanity/lib/client";
import {
  districtBySlugQuery,
  districtSlugsQuery,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";

import type { District, Place } from "@/types/district";

import { StatCard } from "@/components/StatCard";
import { PlaceCard } from "@/components/PlaceCard";
import { Gallery } from "@/components/Gallery";
import { Breadcrumb } from "@/components/Breadcrumb";

// ============ STATIC PARAMS (SSG) ============
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(districtSlugsQuery);

  return slugs.map((slug) => ({
    slug,
  }));
}

// ============ METADATA ============
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const district: District | null = await client.fetch(
    districtBySlugQuery,
    { slug }
  );

  if (!district) {
    return {};
  }

  return {
    title:
      district.seo?.metaTitle ||
      `${district.name} District - Travel Guide`,

    description:
      district.seo?.metaDescription ||
      `Explore ${district.name} district. Population, places to visit, travel tips, and more.`,

    openGraph: {
      images: district.seo?.ogImage
        ? [urlForImage(district.seo.ogImage).url()]
        : district.coverImage
          ? [urlForImage(district.coverImage).url()]
          : [],
    },
  };
}

// ============ MAIN PAGE ============
export default async function ExploreNepalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const district: District | null = await client.fetch(
    districtBySlugQuery,
    { slug }
  );

  if (!district) {
    notFound();
  }

  // Province info
  const province =
    typeof district.province === "object" && district.province
      ? district.province
      : null;

  const provinceSlug = province?.slug?.current;

  // Cover image
  const coverUrl = district.coverImage
    ? urlForImage(district.coverImage)
        .width(1920)
        .quality(85)
        .url()
    : null;

  const coverAlt =
    district.coverImage?.alt || `${district.name} district`;

  return (
    <main className="bg-white">
      {/* ============ HERO ============ */}
      <section className="relative h-[60vh] min-h-[400px] w-full">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={coverAlt}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-blue-700" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="mx-auto max-w-6xl">
            {province && (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-emerald-300">
                {province.name} Province
              </p>
            )}

            <h1 className="text-5xl font-bold md:text-7xl">
              {district.name}
            </h1>

            {district.headquarter && (
              <p className="mt-3 text-lg text-gray-200">
                Headquarters: {district.headquarter}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* ============ BREADCRUMB ============ */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Provinces", href: "/provinces" },

              ...(province && provinceSlug
                ? [
                    {
                      label: province.name || "",
                      href: `/provinces/${provinceSlug}`,
                    },
                  ]
                : []),

              { label: district.name },
            ]}
          />
        </div>

        {/* ============ STATS GRID ============ */}
        <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="👥"
            label="Population"
            value={
              district.population?.toLocaleString() || "N/A"
            }
          />

          <StatCard
            icon="📏"
            label="Area"
            value={
              district.area
                ? `${district.area} km²`
                : "N/A"
            }
          />

          <StatCard
            icon="⛰️"
            label="Elevation"
            value={
              district.elevation
                ? `${district.elevation} m`
                : "N/A"
            }
          />

          <StatCard
            icon="🏙️"
            label="Density"
            value={
              district.density
                ? `${district.density}/km²`
                : district.population && district.area
                  ? `${Math.round(
                      district.population / district.area
                    )}/km²`
                  : "N/A"
            }
          />
        </section>

        {/* ============ MAP ============ */}
        {(district.mapImage || district.mapEmbedUrl) && (
          <Section title="Location & Map" icon="🗺️">
            <div className="grid gap-6 md:grid-cols-2">
              {district.mapImage && (
                <div className="overflow-hidden rounded-lg shadow-md">
                  <Image
                    src={urlForImage(district.mapImage)
                      .width(800)
                      .url()}
                    alt={
                      district.mapImage.alt ||
                      `${district.name} map`
                    }
                    width={800}
                    height={600}
                    className="h-auto w-full"
                  />
                </div>
              )}

              {district.mapEmbedUrl && (
                <iframe
                  src={district.mapEmbedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map of ${district.name}`}
                />
              )}
            </div>
          </Section>
        )}

        {/* ============ PLACES TO VISIT ============ */}
        {district.places && district.places.length > 0 && (
          <Section title="Places to Visit" icon="✨">
            <div className="grid gap-6 md:grid-cols-2">
              {district.places.map((place: Place) => (
                <PlaceCard
                  key={place._key}
                  place={place}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ============ HOW TO GET THERE ============ */}
        {district.howToGetThere && (
          <Section title="How to Get There" icon="🚗">
            <PortableText value={district.howToGetThere} />
          </Section>
        )}

        {/* ============ CULTURE & HISTORY ============ */}
        {district.cultureAndHistory && (
          <Section title="Culture & History" icon="🏛️">
            <PortableText value={district.cultureAndHistory} />
          </Section>
        )}

        {/* ============ BEST TIME TO VISIT ============ */}
        {district.bestTimeToVisit && (
          <Section title="Best Time to Visit" icon="🌤️">
            <PortableText value={district.bestTimeToVisit} />
          </Section>
        )}

        {/* ============ GALLERY ============ */}
        {district.gallery && district.gallery.length > 0 && (
          <Section title="Gallery" icon="📸">
            <Gallery images={district.gallery} />
          </Section>
        )}
      </div>
    </main>
  );
}

// ============ SECTION COMPONENT ============
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-3xl font-bold text-gray-800">
        {icon && <span>{icon}</span>}
        {title}
      </h2>

      <div className="prose prose-lg max-w-none text-gray-700">
        {children}
      </div>
    </section>
  );
}