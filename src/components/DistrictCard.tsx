import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";
import type { District } from "@/types/district";

function getCoverUrl(
  district: District
): string | null {
  if (
    !district.coverImage?.asset?._ref
  ) {
    return null;
  }

  try {
    return urlForImage(
      district.coverImage
    )
      .width(1000)
      .height(700)
      .quality(75)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

function getCategories(
  value?: string
) {
  return (value || "")
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean)
    .slice(0, 3);
}

export function DistrictCard({
  district,
}: {
  district: District;
}) {
  const slug =
    district.slug?.current;

  if (!slug) {
    return null;
  }

  const coverUrl =
    getCoverUrl(district);

  const provinceName =
    district.province?.name ||
    null;

  const categories =
    getCategories(
      district.category
    );

  return (
    <Link
      href={`/explore-nepal/${slug}`}
      aria-label={`Explore ${district.name} District`}
      className="group block overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* =================================================
          IMAGE
      ================================================== */}

      <div className="relative h-56 overflow-hidden bg-slate-900 sm:h-60">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={
              district.coverImage?.alt ||
              `${district.name} District, Nepal`
            }
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              25vw
            "
            className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-red-900 via-slate-900 to-amber-700"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
        />

        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {provinceName ||
              "Nepal"}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Explore
          </p>

          <h3 className="mt-1 font-serif text-2xl font-bold text-white transition-colors group-hover:text-amber-200">
            {district.name}
          </h3>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================== */}

      <div className="p-6">
        {district.headquarter && (
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <span
              aria-hidden="true"
              className="mt-0.5"
            >
              📍
            </span>

            <span>
              Headquarters:{" "}
              <strong className="font-semibold text-slate-700">
                {district.headquarter}
              </strong>
            </span>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Population
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {district.population
                ? district.population.toLocaleString(
                    "en-US"
                  )
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Area
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {district.area
                ? `${district.area.toLocaleString(
                    "en-US"
                  )} km²`
                : "N/A"}
            </p>
          </div>
        </div>

        {categories.length >
          0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map(
              (category) => (
                <span
                  key={category}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {category}
                </span>
              )
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
          <span className="text-sm font-bold text-red-800">
            Explore district
          </span>

          <span
            aria-hidden="true"
            className="text-lg text-red-800 transition duration-300 motion-safe:group-hover:translate-x-2"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}