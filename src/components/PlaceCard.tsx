// components/PlaceCard.tsx

import Image from "next/image";
import { PortableText } from "@portabletext/react";

import { urlForImage } from "@/sanity/lib/image";

import type { Place } from "@/types/district";

/* =========================================================
   HELPERS
========================================================= */

function getDescriptionText(
  description: Place["description"]
): string {
  if (!description) {
    return "";
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

function getImageUrl(
  image: Place["image"]
): string | null {
  if (
    !image?.asset?._ref
  ) {
    return null;
  }

  try {
    return urlForImage(image)
      .width(1100)
      .height(700)
      .quality(75)
      .fit("crop")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export function PlaceCard({
  place,
}: {
  place: Place;
}) {
  const imageUrl =
    getImageUrl(
      place.image
    );

  const descriptionText =
    getDescriptionText(
      place.description
    );

  const hasCoordinates =
    place.coordinates &&
    (
      place.coordinates.lat !==
        undefined ||
      place.coordinates.lng !==
        undefined
    );

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* =================================================
          IMAGE
      ================================================== */}

      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={
              place.image?.alt ||
              `${place.name}, Nepal`
            }
            fill
            sizes="
              (max-width: 640px) 100vw,
              (max-width: 1024px) 50vw,
              33vw
            "
            className="object-cover object-center transition-transform duration-700 ease-out motion-reduce:transition-none motion-safe:group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center bg-gradient-to-br from-red-950 via-slate-900 to-amber-800"
          >
            <span className="text-6xl">
              📍
            </span>
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"
        />

        <div className="absolute bottom-5 left-5 right-5">
          <h3 className="font-serif text-2xl font-bold leading-tight text-white">
            {place.name}
          </h3>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================== */}

      <div className="p-6">
        {descriptionText && (
          <p className="line-clamp-4 text-sm leading-7 text-slate-600">
            {descriptionText}
          </p>
        )}

        {/* =================================================
            DETAILS
        ================================================== */}

        <details className="group/details mt-5">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-red-800 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <span>
              Explore place details
            </span>

            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-open/details:rotate-180 motion-reduce:transition-none"
            >
              ↓
            </span>
          </summary>

          <div className="mt-4 border-t border-stone-200 pt-5">
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
              <p className="text-sm leading-7 text-slate-600">
                No additional description
                is available.
              </p>
            )}

            {/* =================================================
                COORDINATES
            ================================================== */}

            {hasCoordinates && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Location
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {place.coordinates
                    ?.lat !==
                    undefined &&
                    `Latitude: ${place.coordinates.lat}`}

                  {place.coordinates
                    ?.lat !==
                    undefined &&
                    place.coordinates
                      ?.lng !==
                      undefined &&
                    " · "}

                  {place.coordinates
                    ?.lng !==
                    undefined &&
                    `Longitude: ${place.coordinates.lng}`}
                </p>

                {place.coordinates
                    ?.lat !==
                    undefined &&
                  place.coordinates
                    ?.lng !==
                    undefined && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      Open in Maps ↗
                    </a>
                  )}
              </div>
            )}

            {/* =================================================
                IMAGE ALT / CAPTION
            ================================================== */}

            {place.image?.caption && (
              <p className="mt-5 text-xs italic leading-5 text-slate-400">
                {place.image.caption}
              </p>
            )}
          </div>
        </details>
      </div>
    </article>
  );
}

export default PlaceCard;