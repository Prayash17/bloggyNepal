import Image from "next/image";
import { PortableText } from "@portabletext/react";

import { urlForImage } from "@/sanity/lib/image";

interface SanityImage {
  alt?: string;
  caption?: string;
  credit?: string;
  asset?: {
    _ref?: string;
    _id?: string;
  };
}

interface PlaceDescriptionBlock {
  _key?: string;
  _type: string;
  children?: Array<{
    _key?: string;
    _type?: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: unknown[];
  style?: string;
}

interface Place {
  _key?: string;

  name: string;

  slug?: string;

  description?:
    | PlaceDescriptionBlock[]
    | string;

  image?: SanityImage;

  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

interface PlaceCardProps {
  place: Place;
}

function getDescriptionText(
  description:
    | PlaceDescriptionBlock[]
    | string
    | undefined
): string {
  if (!description) {
    return "";
  }

  if (typeof description === "string") {
    return description;
  }

  return description
    .map(
      (block) =>
        block.children
          ?.map(
            (child) =>
              child.text || ""
          )
          .join("") || ""
    )
    .join(" ")
    .trim();
}

export function PlaceCard({
  place,
}: PlaceCardProps) {
  const imageUrl = place.image
    ? urlForImage(place.image)
        .width(1200)
        .quality(90)
        .url()
    : null;

  const descriptionText =
    getDescriptionText(
      place.description
    );

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl">
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div className="relative h-64 overflow-hidden bg-slate-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              place.image?.alt ||
              place.name
            }
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-950 via-slate-900 to-amber-800">
            <span
              className="text-6xl"
              aria-hidden="true"
            >
              📍
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="font-serif text-2xl font-bold leading-tight text-white">
            {place.name}
          </h3>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="p-6">
        {descriptionText && (
          <p className="line-clamp-4 text-sm leading-7 text-slate-600">
            {descriptionText}
          </p>
        )}

        {place.image?.credit && (
          <p className="mt-4 text-xs text-slate-400">
            Photo: {place.image.credit}
          </p>
        )}

        {/* ===================================================
            FULL PLACE DETAILS
        ==================================================== */}

        <details className="group/details mt-5">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-red-800 transition hover:bg-red-50">
            <span>
              Explore place details
            </span>

            <span className="transition-transform duration-300 group-open/details:rotate-180">
              ↓
            </span>
          </summary>

          <div className="mt-4 border-t border-stone-200 pt-5">
            {/* FULL PORTABLE TEXT */}
            {Array.isArray(
              place.description
            ) ? (
              <div className="prose prose-slate max-w-none text-sm leading-7">
                <PortableText
                  value={
                    place.description
                  }
                />
              </div>
            ) : (
              place.description && (
                <p className="text-sm leading-7 text-slate-600">
                  {place.description}
                </p>
              )
            )}

            {/* COORDINATES */}
            {place.coordinates &&
              (place.coordinates.lat !==
                undefined ||
                place.coordinates.lng !==
                  undefined) && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Location
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {place.coordinates.lat !==
                      undefined &&
                      `Latitude: ${place.coordinates.lat}`}

                    {place.coordinates.lat !==
                      undefined &&
                      place.coordinates.lng !==
                        undefined &&
                      " · "}

                    {place.coordinates.lng !==
                      undefined &&
                      `Longitude: ${place.coordinates.lng}`}
                  </p>
                </div>
              )}

            {/* IMAGE CAPTION */}
            {place.image?.caption && (
              <p className="mt-5 text-xs italic leading-5 text-slate-400">
                {place.image.caption}
              </p>
            )}

            {/* PHOTO CREDIT */}
            {place.image?.credit && (
              <p className="mt-2 text-xs text-slate-400">
                Photo credit:{" "}
                {place.image.credit}
              </p>
            )}
          </div>
        </details>
      </div>
    </article>
  );
}

export default PlaceCard;