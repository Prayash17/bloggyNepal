import Image from "next/image";
import Link from "next/link";

import { client } from "@/sanity/lib/client";
import {
  allDistrictsQuery,
  allProvincesQuery,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";

import type { District } from "@/types/district";

import { DistrictCard } from "@/components/DistrictCard";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 3600;

const provinceDescriptions: Record<string, string> = {
  Koshi:
    "Eastern Nepal's landscapes of Himalayan peaks, tea gardens, rivers, hills, and culturally rich communities.",
  Madhesh:
    "Nepal's southern plains, celebrated for sacred places, Mithila culture, heritage, forests, and vibrant traditions.",
  Bagmati:
    "A remarkable mix of Kathmandu Valley heritage, mountain gateways, sacred sites, hills, and Himalayan landscapes.",
  Gandaki:
    "Home to dramatic mountain scenery, deep valleys, beautiful lakes, trekking routes, and extraordinary cultural diversity.",
  Lumbini:
    "A western landscape combining sacred heritage, fertile plains, forests, hills, and important pilgrimage destinations.",
  Karnali:
    "Nepal's wild and remote frontier, where high mountains, enormous valleys, rivers, and traditional communities endure.",
  Sudurpashchim:
    "The far west of Nepal, rich in forests, mountains, sacred landscapes, traditional cultures, and quieter journeys.",
};

export async function generateMetadata() {
  return {
    title: "Explore Nepal | 77 Districts, Places & Travel Guides",
    description:
      "Explore all 77 districts of Nepal through detailed travel guides covering places to visit, culture, history, maps, landscapes, transportation, and things to do.",
    alternates: {
      canonical: "/explore-nepal",
    },
    openGraph: {
      title: "Explore Nepal | 77 Districts",
      description:
        "Discover Nepal one district at a time with detailed travel guides, places, culture, history and practical travel information.",
      type: "website",
    },
  };
}

export default async function AllDistrictsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    province?: string;
  }>;
}) {
  const params = searchParams ? await searchParams : {};

  const query = (params.q || "").trim().toLowerCase();
  const selectedProvince = (params.province || "").trim().toLowerCase();

  const [allDistricts, provinces] = await Promise.all([
    client.fetch<District[]>(allDistrictsQuery),
    client.fetch<any[]>(allProvincesQuery),
  ]);

  const districts = allDistricts.filter((district) => {
    const matchesSearch =
      !query ||
      district.name.toLowerCase().includes(query) ||
      district.headquarter?.toLowerCase().includes(query) ||
      district.category?.toLowerCase().includes(query) ||
      district.province?.name?.toLowerCase().includes(query);

    const matchesProvince =
      !selectedProvince ||
      district.province?.slug?.current?.toLowerCase() === selectedProvince ||
      district.province?.name?.toLowerCase() === selectedProvince;

    return matchesSearch && matchesProvince;
  });

  const totalPopulation = allDistricts.reduce(
    (sum, district) => sum + (district.population || 0),
    0
  );

  const totalArea = allDistricts.reduce(
    (sum, district) => sum + (district.area || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-700">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-24 sm:px-8 lg:py-32">
        <div className="absolute -left-32 -top-20 h-96 w-96 rounded-full bg-red-800/30 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-amber-400/15 blur-3xl" />

        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
            One country. Seven provinces. 77 stories.
          </div>

          <h1 className="mt-7 font-serif text-5xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl">
            Explore every corner
            <span className="block text-amber-300">of Nepal.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-white/70 sm:text-xl">
            Go beyond famous destinations. Discover the landscapes, cultures,
            people, history, food, traditions, and hidden places that make
            every district of Nepal different.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#districts"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200 hover:shadow-xl"
            >
              Browse 77 districts
              <span>↓</span>
            </a>

            <a
              href="#provinces"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-4 font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              Explore provinces
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          BREADCRUMB
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-7 sm:px-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Explore Nepal" },
          ]}
        />
      </div>

      {/* =====================================================
          COUNTRY STATS
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-4">
          <div className="p-7 text-center transition hover:bg-red-50">
            <p className="font-serif text-5xl font-bold text-red-800">
              {provinces.length || 7}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Provinces
            </p>
          </div>

          <div className="border-t border-stone-200 p-7 text-center transition hover:bg-amber-50 md:border-l md:border-t-0">
            <p className="font-serif text-5xl font-bold text-amber-700">
              {allDistricts.length}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Districts
            </p>
          </div>

          <div className="border-t border-stone-200 p-7 text-center transition hover:bg-slate-50 md:border-l md:border-t-0">
            <p className="font-serif text-3xl font-bold text-slate-900">
              {totalPopulation.toLocaleString()}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Population in dataset
            </p>
          </div>

          <div className="border-t border-stone-200 p-7 text-center transition hover:bg-emerald-50 md:border-l md:border-t-0">
            <p className="font-serif text-3xl font-bold text-slate-900">
              {Math.round(totalArea).toLocaleString()}
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Area · km²
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROVINCES
      ====================================================== */}

      <section
        id="provinces"
        className="mx-auto max-w-7xl px-6 pb-20 sm:px-8 lg:pb-28"
      >
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
            Start your journey
          </p>

          <h2 className="mt-2 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
            Explore Nepal by province
          </h2>

          <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
            From Himalayan valleys to the southern plains, each province has a
            completely different character. Choose a region and explore its
            districts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {provinces.map((province) => {
            const imageUrl = province.coverImage
              ? urlForImage(province.coverImage)
                  .width(1200)
                  .height(800)
                  .quality(90)
                  .fit("crop")
                  .auto("format")
                  .url()
              : null;

            return (
              <Link
                key={province._id}
                href={`/provinces/${province.slug.current}`}
                className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={province.coverImage?.alt || province.name}
                      fill
                      quality={90}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-red-900 via-slate-900 to-amber-700" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  <div className="absolute bottom-5 left-5">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                      Province {province.number}
                    </span>

                    <h3 className="mt-1 font-serif text-2xl font-bold text-white">
                      {province.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-6 text-slate-600">
                    {provinceDescriptions[province.name] ||
                      "Discover the places, people, culture, landscapes and travel experiences of this province."}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Districts
                      </p>
                      <p className="mt-1 font-bold text-slate-800">
                        {province.districtCount ||
                          province.noOfDistricts ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Capital
                      </p>
                      <p className="mt-1 truncate font-bold text-slate-800">
                        {province.capital || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm font-bold text-red-800">
                      Explore province
                    </span>

                    <span className="transition group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          DISTRICT DIRECTORY
      ====================================================== */}

      <section
        id="districts"
        className="bg-[#f1ede4] px-6 py-20 sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              The complete collection
            </p>

            <h2 className="mt-2 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
              All districts of Nepal
            </h2>

            <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
              Search, filter, and discover detailed guides to Nepal's
              districts, including places to visit, maps, culture, history,
              transportation, and travel inspiration.
            </p>
          </div>

          {/* SEARCH */}

          <form
            method="GET"
            action="/explore-nepal"
            className="mb-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
              <input
                type="search"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search by district, province, HQ or tourism category..."
                className="rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/10"
              />

              <select
                name="province"
                defaultValue={params.province || ""}
                className="rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10"
              >
                <option value="">All provinces</option>

                {provinces.map((province) => (
                  <option
                    key={province._id}
                    value={province.slug.current}
                  >
                    {province.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-7 py-4 font-bold text-white transition hover:bg-red-800"
              >
                Search
              </button>
            </div>

            {(params.q || params.province) && (
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <strong className="text-slate-800">
                    {districts.length}
                  </strong>{" "}
                  matching districts.
                </p>

                <Link
                  href="/explore-nepal#districts"
                  className="text-sm font-bold text-red-800 hover:underline"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </form>

          {districts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
              <span className="text-6xl">🇳🇵</span>

              <h3 className="mt-5 font-serif text-3xl font-bold text-slate-900">
                No districts found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Try another district name, province, headquarters, or
                tourism-related search term.
              </p>

              <Link
                href="/explore-nepal#districts"
                className="mt-7 inline-flex rounded-full bg-red-800 px-6 py-3 font-bold text-white transition hover:bg-red-700"
              >
                Show all districts
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Discovering{" "}
                  <strong className="text-slate-900">
                    {districts.length}
                  </strong>{" "}
                  districts
                </p>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                  Nepal · 77 Districts
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {districts.map((district) => (
                  <DistrictCard
                    key={district._id}
                    district={district}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Go deeper
            </p>

            <h2 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Nepal is not one destination.
              <span className="text-amber-300">
                {" "}
                It is 77 different invitations.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-white/65">
              Follow the roads beyond the familiar places. Meet communities,
              discover forgotten histories, find landscapes that rarely make
              the usual itineraries, and experience Nepal district by
              district.
            </p>

            <Link
              href="/destinations"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-amber-300 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-1 hover:bg-amber-200 hover:shadow-xl"
            >
              Explore travel guides
              <span className="transition group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}