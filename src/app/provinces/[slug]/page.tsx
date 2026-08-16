import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { provinceBySlugQuery, provinceSlugsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DistrictCard } from "@/components/DistrictCard";
import { StatCard } from "@/components/StatCard";
import { ProvinceMap } from "@/components/ProvinceMap";
import type { Province } from "@/types/province";

// ============ STATIC PARAMS ============
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(provinceSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

// ============ METADATA ============
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;  // 👈 await params first
  const province: Province = await client.fetch(provinceBySlugQuery, { slug });
  if (!province) return {};
  return {
    title: province.seo?.metaTitle || `${province.name} Province - Nepal`,
    description:
      province.seo?.metaDescription ||
      `Discover ${province.name} Province in Nepal. Capital: ${province.capital}.`,
  };
}

// ============ MAIN PAGE ============
export default async function ProvincePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;  // 👈 await params first
  const province: Province = await client.fetch(provinceBySlugQuery, { slug });

  if (!province) notFound();

  const coverUrl = province.coverImage
    ? urlForImage(province.coverImage).width(1920).url()
    : null;

  return (
    <main className="bg-white">
      <section className="relative h-[50vh] min-h-[350px] w-full">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={province.coverImage?.alt || province.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-blue-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm uppercase tracking-wider text-emerald-300">
              Province #{province.number}
            </p>
            <h1 className="mt-1 text-5xl font-bold md:text-6xl">
              {province.name}
            </h1>
            {province.officialName && (
              <p className="mt-1 text-lg text-gray-200">
                {province.officialName}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Provinces", href: "/provinces" },
              { label: province.name },
            ]}
          />
        </div>

        <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon="👥"
            label="Population"
            value={province.population?.toLocaleString() || "N/A"}
          />
          <StatCard
            icon="📏"
            label="Area"
            value={province.area ? `${province.area.toLocaleString()} km²` : "N/A"}
          />
          <StatCard
            icon="🏛️"
            label="Capital"
            value={province.capital || "N/A"}
          />
          <StatCard
            icon="📍"
            label="Districts"
            value={String(province.districts?.length || province.noOfDistricts || 0)}
          />
        </section>

        {province.body && (
          <section className="mb-10">
            <h2 className="mb-3 border-b pb-2 text-3xl font-bold text-gray-800">
              📖 Overview
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <PortableText value={province.body} />
            </div>
          </section>
        )}

        {/* Find the map section and replace with: */}
{province.mapImage && (
  <section className="mb-10">
    <h2 className="mb-3 border-b pb-2 text-3xl font-bold text-gray-800">
      🗺️ Map
    </h2>
    <div className="grid gap-4 md:grid-cols-2">
      {province.mapImage && (
        <div className="overflow-hidden rounded-lg shadow-md">
          <Image
            src={urlForImage(province.mapImage).width(1200).url()}
            alt={province.mapImage.alt || `${province.name} map`}
            width={1200}
            height={800}
            className="h-auto w-full"
          />
        </div>
      )}
      <ProvinceMap provinceName={province.name} height="400px" />
    </div>
  </section>
)}


        {province.districts && province.districts.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 border-b pb-2 text-3xl font-bold text-gray-800">
              📍 Districts in {province.name}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {province.districts.map((district) => (
                <DistrictCard
                  key={district._id}
                  district={{
                    ...district,
                    province: { name: province.name } as any,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {province.geography && (
          <section className="mb-10">
            <h2 className="mb-3 border-b pb-2 text-3xl font-bold text-gray-800">
              🏔️ Geography
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <PortableText value={province.geography} />
            </div>
          </section>
        )}

        {province.cultureAndHistory && (
          <section className="mb-10">
            <h2 className="mb-3 border-b pb-2 text-3xl font-bold text-gray-800">
              🏛️ Culture & History
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <PortableText value={province.cultureAndHistory} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
