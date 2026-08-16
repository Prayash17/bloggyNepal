 import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import type { District } from "@/types/district";

export function DistrictCard({ district }: { district: District }) {
  const coverUrl = district.coverImage
    ? urlForImage(district.coverImage).width(600).height(400).url()
    : null;

  const provinceName =
    typeof district.province === "object" && district.province
      ? (district.province as any).name
      : null;

  return (
    <Link
      href={`/explore-nepal/${district.slug.current}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={district.coverImage?.alt || district.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-blue-500 to-emerald-600" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">
          {district.name}
        </h3>
        {provinceName && (
          <p className="mt-1 text-xs text-gray-500">📍 {provinceName}</p>
        )}
        {district.headquarter && (
          <p className="mt-1 text-xs text-gray-600">HQ: {district.headquarter}</p>
        )}
        {district.population && (
          <p className="mt-2 text-xs text-gray-500">
            👥 {district.population.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}
