import Image from "next/image";
import Link from "next/link";

import { urlForImage } from "@/sanity/lib/image";
import type { District } from "@/types/district";

export function DistrictCard({
  district,
}: {
  district: District;
}) {
  const coverUrl = district.coverImage
    ? urlForImage(district.coverImage)
        .width(1400)
        .height(900)
        .quality(95)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  const provinceName =
    typeof district.province === "object" && district.province
      ? district.province.name
      : null;

  return (
    <Link
      href={`/explore-nepal/${district.slug.current}`}
      className="group block overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl"
    >
      <div className="relative h-60 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={district.coverImage?.alt || district.name}
            fill
            quality={95}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-red-900 via-slate-900 to-amber-700" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            {provinceName || "Nepal"}
          </span>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Explore
          </p>

          <h3 className="mt-1 font-serif text-2xl font-bold text-white transition group-hover:text-amber-200">
            {district.name}
          </h3>
        </div>
      </div>

      <div className="p-6">
        {district.headquarter && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>📍</span>
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
                ? district.population.toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Area
            </p>

            <p className="mt-1 font-semibold text-slate-800">
              {district.area
                ? `${district.area.toLocaleString()} km²`
                : "N/A"}
            </p>
          </div>
        </div>

        {district.category && (
          <div className="mt-5 flex flex-wrap gap-2">
            {district.category
              .split(",")
              .slice(0, 3)
              .map((category) => (
                <span
                  key={category.trim()}
                  className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {category.trim()}
                </span>
              ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-5">
          <span className="text-sm font-bold text-red-800">
            Explore district
          </span>

          <span className="text-lg text-red-800 transition duration-300 group-hover:translate-x-2">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}