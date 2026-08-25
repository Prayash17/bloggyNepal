import Image from "next/image";
import { PortableText } from "@portabletext/react";

import {
  hasValidSanityImage,
  urlForImage,
} from "@/sanity/lib/image";

import type { Place } from "@/types/district";

export function PlaceCard({
  place,
}: {
  place: Place;
}) {
  const imageUrl = hasValidSanityImage(place.image)
    ? urlForImage(place.image)
        .width(1000)
        .height(700)
        .quality(85)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-amber-200 hover:shadow-2xl">
      {imageUrl ? (
        <div className="relative h-72 overflow-hidden bg-slate-900">
          <Image
            src={imageUrl}
            alt={
              place.image?.alt ||
              `${place.name} in Nepal`
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
            Must Visit
          </div>
        </div>
      ) : (
        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-red-900 via-slate-900 to-amber-700">
          <span className="text-6xl">🏔️</span>
        </div>
      )}

      <div className="p-7">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            {place.name}
          </h3>

          <span className="mt-1 shrink-0 text-lg text-amber-500">
            ✦
          </span>
        </div>

        {place.description && (
          <div className="prose prose-sm max-w-none text-slate-600 prose-p:leading-7 prose-headings:text-slate-900 prose-a:text-red-800">
            <PortableText value={place.description} />
          </div>
        )}
      </div>
    </article>
  );
}