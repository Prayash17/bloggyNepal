import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import type { Place } from "@/types/district";

export function PlaceCard({ place }: { place: Place }) {
  const imageUrl = place.image
    ? urlForImage(place.image).width(600).height(400).url()
    : null;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
      {imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={place.image?.alt || place.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="mb-2 text-xl font-bold text-gray-900">{place.name}</h3>
        {place.description && (
          <div className="prose prose-sm text-gray-600">
            <PortableText value={place.description} />
          </div>
        )}
      </div>
    </div>
  );
}
