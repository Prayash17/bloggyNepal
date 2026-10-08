import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import type { Province } from "@/types/province";

function provinceLabel(province: Province) {
  return province.officialName ||
    (province.name.toLowerCase().includes("province")
      ? province.name
      : `${province.name} Province`);
}

export function ProvinceCard({ province }: { province: Province }) {
  const coverUrl = province.coverImage
    ? urlForImage(province.coverImage).width(900).height(560).auto("format").url()
    : null;

  const districtCount = province.districtCount ?? province.noOfDistricts;

  return (
    <Link
      href={`/provinces/${province.slug.current}`}
      aria-label={`Explore ${provinceLabel(province)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
    >
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-red-900 via-slate-900 to-amber-700">
        {coverUrl && (
          <Image
            src={coverUrl}
            alt={province.coverImage?.alt || provinceLabel(province)}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          Province {province.number}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h2 className="font-serif text-3xl font-bold tracking-tight">
            {provinceLabel(province)}
          </h2>
          {province.nepaliName && (
            <p className="mt-1 text-sm text-white/70">{province.nepaliName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {province.shortDescription && (
          <p className="line-clamp-4 text-sm leading-6 text-slate-600">
            {province.shortDescription}
          </p>
        )}

        {province.travelThemes && province.travelThemes.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {province.travelThemes.slice(0, 4).map((theme) => (
              <span
                key={theme}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-red-900 ring-1 ring-inset ring-amber-200"
              >
                {theme}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-100 pt-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Capital</p>
            <p className="mt-1 font-semibold text-slate-800">{province.capital || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Districts</p>
            <p className="mt-1 font-semibold text-slate-800">{districtCount ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Population</p>
            <p className="mt-1 font-semibold text-slate-800">
              {province.population?.toLocaleString() || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Area</p>
            <p className="mt-1 font-semibold text-slate-800">
              {province.area ? `${province.area.toLocaleString()} km²` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-6 text-sm font-bold text-red-800 transition group-hover:text-red-950">
          Explore {province.name} <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
