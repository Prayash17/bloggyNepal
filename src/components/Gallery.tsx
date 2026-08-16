"use client";
import { useState } from "react";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import type { SanityImage } from "@/types/district";

export function Gallery({ images }: { images: SanityImage[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelected(idx)}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={urlForImage(img).width(400).height(400).url()}
              alt={img.alt || `Gallery image ${idx + 1}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                {img.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            className="absolute right-4 top-4 text-4xl text-white"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-white"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((s) => (s! > 0 ? s! - 1 : images.length - 1));
            }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl text-white"
            onClick={(e) => {
              e.stopPropagation();
              setSelected((s) => (s! < images.length - 1 ? s! + 1 : 0));
            }}
          >
            ›
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={urlForImage(images[selected]).width(1600).url()}
              alt={images[selected].alt || ""}
              width={1600}
              height={1200}
              className="h-auto max-h-[90vh] w-auto object-contain"
            />
            {images[selected].caption && (
              <p className="mt-4 text-center text-white">
                {images[selected].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
