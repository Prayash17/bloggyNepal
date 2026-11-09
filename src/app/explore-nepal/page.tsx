import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

import { client } from "@/sanity/lib/client";
import {
  allDistrictsQuery,
  allProvincesQuery,
} from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";

import type { District } from "@/types/district";

import { DistrictCard } from "@/components/DistrictCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import NewsletterSignup from "@/components/NewsletterSignup";

export const revalidate = 3600;

/* =========================================================
   TYPES
========================================================= */

type SanityImageLike = {
  asset?: {
    _ref?: string;
  } | null;
  alt?: string;
  caption?: string;
  credit?: string;
  source?: string;
  license?: string;
};

type ProvinceSummary = {
  _id: string;
  name: string;
  number?: number;
  capital?: string;
  districtCount?: number;
  noOfDistricts?: number;
  slug?: {
    current?: string;
  };
  coverImage?: SanityImageLike | null;
};

/* =========================================================
   SITE CONTENT
========================================================= */

const provinceDescriptions: Record<string, string> = {
  Koshi:
    "Eastern Nepal combines Himalayan peaks, tea gardens, river valleys, hill landscapes, and culturally diverse communities.",

  Madhesh:
    "Nepal's southern plains are shaped by Mithila culture, sacred sites, heritage towns, agriculture, forests, and vibrant traditions.",

  Bagmati:
    "Bagmati brings together Kathmandu Valley heritage, sacred places, mountain gateways, hill landscapes, and access to the high Himalaya.",

  Gandaki:
    "Gandaki is known for dramatic mountain scenery, lakes, deep valleys, trekking routes, and extraordinary cultural diversity.",

  Lumbini:
    "Lumbini combines sacred Buddhist heritage, fertile plains, forests, historic towns, and the hills of western Nepal.",

  Karnali:
    "Karnali is Nepal's remote western frontier, with high mountains, huge valleys, rivers, wild landscapes, and enduring local traditions.",

  Sudurpashchim:
    "Nepal's far west offers forests, mountains, sacred landscapes, traditional communities, and quieter journeys away from the busiest routes.",
};

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function getProvinceSlug(province: ProvinceSummary) {
  return province.slug?.current || "";
}

function buildProvinceImage(
  image?: SanityImageLike | null
): string | null {
  if (!image?.asset?._ref) {
    return null;
  }

  try {
    return urlForImage(image)
      .width(1200)
      .height(800)
      .quality(75)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    province?: string;
  }>;
}): Promise<Metadata> {
  const params = searchParams
    ? await searchParams
    : {};

  const hasFilters = Boolean(
    params.q?.trim() ||
      params.province?.trim()
  );

  return {
    title:
      "Explore Nepal | 77 Districts, Provinces & Travel Guides",

    description:
      "Explore all 77 districts of Nepal through practical travel guides covering places to visit, culture, history, maps, transportation, landscapes, and things to do.",

    alternates: {
      canonical: "/explore-nepal",
    },

    robots: hasFilters
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },

    openGraph: {
      title:
        "Explore Nepal | 77 Districts, Provinces & Travel Guides",

      description:
        "Discover Nepal district by district with practical travel information, places to visit, culture, history, maps, and local experiences.",

      type: "website",

      url: "/explore-nepal",
    },

    twitter: {
      card: "summary_large_image",
      images: [
  new URL(siteConfig.images.og, siteConfig.url).toString(),
],

      title:
        "Explore Nepal | 77 Districts, Provinces & Travel Guides",

      description:
        "Explore Nepal one district at a time with practical travel information, places, culture, history, maps, and experiences.",
    },
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function AllDistrictsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    province?: string;
  }>;
}) {
  const params = searchParams
    ? await searchParams
    : {};

  const query = (params.q || "")
    .trim()
    .toLowerCase();

  const selectedProvince = (params.province || "")
    .trim()
    .toLowerCase();

  const [
    rawDistricts,
    rawProvinces,
  ] = await Promise.all([
    client.fetch<District[]>(
      allDistrictsQuery
    ),

    client.fetch<ProvinceSummary[]>(
      allProvincesQuery
    ),
  ]);

  const allDistricts = Array.isArray(
    rawDistricts
  )
    ? rawDistricts
    : [];

  const provinces = Array.isArray(
    rawProvinces
  )
    ? rawProvinces
    : [];

  /* =======================================================
     FILTER
  ======================================================= */

  const districts = allDistricts.filter(
    (district) => {
      const matchesSearch =
        !query ||
        district.name
          .toLowerCase()
          .includes(query) ||
        district.headquarter
          ?.toLowerCase()
          .includes(query) ||
        district.category
          ?.toLowerCase()
          .includes(query) ||
        district.province?.name
          ?.toLowerCase()
          .includes(query);

      const matchesProvince =
        !selectedProvince ||
        district.province?.slug?.current
          ?.toLowerCase() === selectedProvince ||
        district.province?.name
          ?.toLowerCase() === selectedProvince;

      return (
        matchesSearch &&
        matchesProvince
      );
    }
  );

  /* =======================================================
     COUNTRY TOTALS
  ======================================================= */

  const totalPopulation =
    allDistricts.reduce(
      (sum, district) =>
        sum +
        (district.population || 0),
      0
    );

  const totalArea =
    allDistricts.reduce(
      (sum, district) =>
        sum +
        (district.area || 0),
      0
    );

  const hasFilters = Boolean(
    params.q ||
      params.province
  );

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-700">
      {/* =================================================
          HERO
      ================================================= */}

      <section aria-labelledby="explore-nepal-title" className="editorial-hero relative overflow-hidden border-b border-stone-200 px-6 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div className="editorial-enter">
            <p className="editorial-kicker">Seven provinces · Seventy-seven districts</p>
            <h1 id="explore-nepal-title" className="mt-7 max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-[#243e32] sm:text-6xl lg:text-7xl">
              Every corner has <span className="italic text-[#a4533b]">a story.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-700">
              Discover Nepal district by district — its people, landscapes, food, history, and the little details that make a journey memorable.
            </p>
            <nav aria-label="Explore Nepal shortcuts" className="mt-9 flex flex-wrap gap-3">
              <a href="#districts" className="rounded-full bg-[#27483b] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[#193328]">Browse districts ↓</a>
              <a href="#provinces" className="rounded-full border border-[#27483b]/30 px-6 py-3.5 font-semibold text-[#27483b] transition-colors hover:bg-white">Explore provinces</a>
            </nav>
          </div>
          <div className="editorial-photo relative aspect-[5/4] bg-[#d7d0bc]">
            <Image src="/nepal-hero-poster.jpg" alt="Landscape scenery from Nepal" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            <span className="absolute bottom-5 right-5 rounded-xl bg-[#fbfaf7]/95 px-5 py-3 font-serif text-2xl text-[#27483b] shadow-md">77 districts to explore</span>
          </div>
        </div>
      </section>

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="mx-auto max-w-7xl px-6 pt-7 sm:px-8">
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Explore Nepal",
            },
          ]}
        />
      </div>

      {/* =================================================
          COUNTRY STATS
      ================================================= */}

      <section
        aria-label="Nepal directory statistics"
        className="mx-auto max-w-7xl px-6 py-10 sm:px-8"
      >
        <div className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-4">
          <div className="p-7 text-center transition hover:bg-red-50">
            <p className="font-serif text-5xl font-bold text-red-800">
              {provinces.length}
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
              {formatNumber(
                totalPopulation
              )}
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Population covered
            </p>
          </div>

          <div className="border-t border-stone-200 p-7 text-center transition hover:bg-emerald-50 md:border-l md:border-t-0">
            <p className="font-serif text-3xl font-bold text-slate-900">
              {Math.round(
                totalArea
              ).toLocaleString("en-US")}
            </p>

            <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Area covered · km²
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          Population and area figures reflect the
          current district data maintained in
          BloggyNepal&apos;s directory.
        </p>
      </section>

      {/* =================================================
          DISTRICT DIRECTORY
      ================================================= */}

      <section
        id="districts"
        aria-labelledby="district-title"
        className="scroll-mt-24 bg-[#f4eee2] px-6 py-16 sm:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              The complete collection
            </p>

            <h2
              id="district-title"
              className="mt-2 font-serif text-4xl font-bold text-slate-900 sm:text-5xl"
            >
              All districts of Nepal
            </h2>

            <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
              Search and filter the directory to
              discover district guides covering
              places to visit, maps, culture,
              history, transportation, and local
              travel ideas.
            </p>
          </div>

          {/* =================================================
              SEARCH
          ================================================== */}

          <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[285px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24" aria-label="District discovery filters">
              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4533b]">Refine your journey</p>
                    <h3 className="mt-1 font-serif text-2xl text-[#27483b]">Find a district</h3>
                  </div>
                  <span aria-hidden="true" className="rounded-full bg-[#e4ece4] px-3 py-2 text-[#27483b]">⌕</span>
                </div>
                <form
                  method="GET"
                  action="/explore-nepal#districts"
                  className="space-y-4"
                >
            <div className="grid gap-4">
              <div>
                <label
                  htmlFor="district-search"
                  className="sr-only"
                >
                  Search districts
                </label>

                <input
                  id="district-search"
                  type="search"
                  name="q"
                  defaultValue={
                    params.q || ""
                  }
                  placeholder="Search districts, provinces or headquarters..."
                  autoComplete="off"
                  className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-700 focus:ring-2 focus:ring-red-700/10"
                />
              </div>

              <div>
                <label
                  htmlFor="province-filter"
                  className="sr-only"
                >
                  Filter districts by province
                </label>

                <select
                  id="province-filter"
                  name="province"
                  defaultValue={
                    params.province || ""
                  }
                  className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10"
                >
                  <option value="">
                    All provinces
                  </option>

                  {provinces.map(
                    (province) => {
                      const slug =
                        getProvinceSlug(
                          province
                        );

                      if (!slug) {
                        return null;
                      }

                      return (
                        <option
                          key={province._id}
                          value={slug}
                        >
                          {province.name}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#27483b] px-6 py-3.5 font-bold text-white transition hover:bg-[#1b362b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27483b] focus-visible:ring-offset-2"
              >
                Search districts
              </button>
            </div>

            {hasFilters && (
              <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p
                  role="status"
                  className="text-sm text-slate-500"
                >
                  Showing{" "}
                  <strong className="text-slate-800">
                    {districts.length}
                  </strong>{" "}
                  matching{" "}
                  {districts.length === 1
                    ? "district"
                    : "districts"}
                  .
                </p>

                <Link
                  href="/explore-nepal#districts"
                  className="text-sm font-bold text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
                >
                  Clear filters
                </Link>
              </div>
            )}
                </form>
                <div className="mt-5 border-t border-stone-100 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Browse by province</p>
                  <nav aria-label="Filter district results by province" className="flex flex-wrap gap-2">
                    {provinces.map((province) => {
                      const slug = getProvinceSlug(province);
                      if (!slug) return null;
                      const active = selectedProvince === slug.toLowerCase();
                      return (
                        <Link
                          key={province._id}
                          href={`/explore-nepal?province=${encodeURIComponent(slug)}#districts`}
                          aria-current={active ? "true" : undefined}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27483b] ${active ? "border-[#27483b] bg-[#27483b] text-white" : "border-stone-200 bg-[#fbfaf7] text-[#27483b] hover:border-[#27483b]"}`}
                        >
                          {province.name}
                        </Link>
                      );
                    })}
                  </nav>
                  <p className="mt-4 text-xs leading-5 text-stone-500">
                    Results use district names, headquarters and province information from our directory.
                  </p>
                </div>
              </div>
            </aside>

            <div className="min-w-0" aria-label="District search results">
              {/* =================================================
                  RESULTS
          ================================================== */}

          {districts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center sm:p-16">
              <span
                aria-hidden="true"
                className="text-5xl"
              >
                🇳🇵
              </span>

              <h3 className="mt-5 font-serif text-3xl font-bold text-slate-900">
                No districts found
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-slate-600">
                Try another district name,
                province, headquarters, or search
                without the current filters.
              </p>

              <Link
                href="/explore-nepal#districts"
                className="mt-7 inline-flex rounded-full bg-red-800 px-6 py-3 font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2"
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
                  {districts.length === 1
                    ? "district"
                    : "districts"}
                </p>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                  Nepal district directory
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {districts.map(
                  (district) => (
                    <DistrictCard
                      key={district._id}
                      district={district}
                    />
                  )
                )}
              </div>
            </>
          )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          PROVINCES
      ================================================= */}

      <section
        id="provinces"
        aria-labelledby="province-title"
        className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-20 sm:px-8 lg:pb-28"
      >
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
            Start your journey
          </p>

          <h2
            id="province-title"
            className="mt-2 font-serif text-4xl font-bold text-slate-900 sm:text-5xl"
          >
            Explore Nepal by province
          </h2>

          <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
            From Himalayan valleys to the southern
            plains, Nepal&apos;s seven provinces have
            distinctly different landscapes,
            cultures, and travel experiences.
          </p>
        </div>

        {provinces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {provinces.map(
              (province) => {
                const provinceSlug =
                  getProvinceSlug(province);

                if (!provinceSlug) {
                  return null;
                }

                const imageUrl =
                  buildProvinceImage(
                    province.coverImage
                  );

                return (
                  <Link
                    key={province._id}
                    href={`/provinces/${provinceSlug}`}
                    className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition motion-safe:duration-500 motion-safe:hover:-translate-y-2 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-red-900 via-slate-900 to-amber-700">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={
                            province.coverImage?.alt ||
                            `${province.name} Province, Nepal`
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          className="object-cover transition duration-700 motion-safe:group-hover:scale-105"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-gradient-to-br from-red-900 via-slate-900 to-amber-700"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                      <div className="absolute bottom-5 left-5 right-5">
                        {province.number && (
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                            Province{" "}
                            {province.number}
                          </span>
                        )}

                        <h3 className="mt-1 font-serif text-2xl font-bold text-white">
                          {province.name}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-sm leading-6 text-slate-600">
                        {provinceDescriptions[
                          province.name
                        ] ||
                          "Discover the places, people, culture, landscapes, and travel experiences of this province."}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Districts
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {province.districtCount ??
                              province.noOfDistricts ??
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Capital
                          </p>

                          <p className="mt-1 truncate font-bold text-slate-800">
                            {province.capital ||
                              "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm font-bold text-red-800">
                          Explore province
                        </span>

                        <span
                          aria-hidden="true"
                          className="transition motion-safe:group-hover:translate-x-2"
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Province information is
              temporarily unavailable
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Please check back soon while the
              directory data is being updated.
            </p>
          </div>
        )}
      </section>

      {/* =================================================
          NEWSLETTER
      ================================================= */}

      <section className="bg-[#f1ede4] px-6 pb-20 sm:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <NewsletterSignup />
        </div>
      </section>

      {/* =================================================
          FINAL CTA
      ================================================= */}

      <section
        aria-labelledby="explore-guides-title"
        className="bg-slate-950 px-6 py-20 text-white sm:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
              Go deeper
            </p>

            <h2
              id="explore-guides-title"
              className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl"
            >
              Nepal is not one destination.
              <span className="text-amber-300">
                {" "}
                It is 77 different invitations.
              </span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Follow the roads beyond the familiar
              places. Discover communities,
              forgotten histories, landscapes,
              food, traditions, and travel
              experiences district by district.
            </p>

            <Link
              href="/destinations"
              className="group mt-9 inline-flex items-center gap-3 rounded-full bg-amber-300 px-7 py-4 font-bold text-slate-950 transition motion-safe:hover:-translate-y-1 hover:bg-amber-200 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explore travel guides

              <span
                aria-hidden="true"
                className="transition motion-safe:group-hover:translate-x-2"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}