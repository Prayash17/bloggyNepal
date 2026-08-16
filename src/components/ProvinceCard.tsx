 import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import type { Province } from "@/types/province";

export function ProvinceCard({ province }: { province: Province }) {
  const coverUrl = province.coverImage
    ? urlForImage(province.coverImage).width(800).height(500).url()
    : null;

  return (
    <Link
      href={`/provinces/${province.slug.current}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-xl"
    >
      <div className="relative h-48 w-full overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={province.coverImage?.alt || province.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-blue-600" />
        )}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-800 backdrop-blur">
          #{province.number}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600">
          {province.name}
        </h3>
        {province.officialName && (
          <p className="text-sm text-gray-500">{province.officialName}</p>
        )}
        {province.capital && (
          <p className="mt-2 text-sm text-gray-600">
            🏛️ Capital: <span className="font-medium">{province.capital}</span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-gray-600">
          {province.population && (
            <span>👥 {province.population.toLocaleString()}</span>
          )}
          {province.area && <span>📏 {province.area.toLocaleString()} km²</span>}
          {province.districtCount !== undefined && (
            <span>📍 {province.districtCount} districts</span>
          )}
        </div>
      </div>
    </Link>
  );
}
