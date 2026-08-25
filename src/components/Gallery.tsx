import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
interface GalleryImage {
  _key?: string;
  _type?: string;

  name?: string;
  alt?: string;
  caption?: string;

  imageUrl?: string;

  image?: {
    _type?: string;
    asset?: {
      _ref?: string;
      _id?: string;
    } | null;
  } | null;

  asset?: {
    _ref?: string;
    _id?: string;
  } | null;
}

interface GalleryProps {
  images?: GalleryImage[];
}

export function Gallery({
  images = [],
}: GalleryProps) {
  if (!images.length) {
    return null;
  }

  const validImages = images.filter(
    (img) =>
      Boolean(img?.imageUrl) ||
      Boolean(img?.image?.asset?._ref) ||
      Boolean(img?.asset?._ref)
  );

  if (!validImages.length) {
    return null;
  }

  return (
    <section className="mt-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validImages.map((img, idx) => {
          /*
           * --------------------------------------------------
           * LOCAL / URL-BASED IMAGE
           * Example:
           * /images/achham-1.jpg
           * --------------------------------------------------
           */
          if (img.imageUrl) {
            return (
              <div
                key={
                  img._key ||
                  `${img.imageUrl}-${idx}`
                }
                className="group relative overflow-hidden rounded-xl"
              >
                <Image
                  src={img.imageUrl}
                  alt={
                    img.alt ||
                    img.name ||
                    `Gallery image ${idx + 1}`
                  }
                  width={400}
                  height={400}
                  className="h-64 w-full object-cover transition duration-300 group-hover:scale-110"
                />

                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-3 text-sm text-white">
                    {img.caption}
                  </div>
                )}
              </div>
            );
          }

          /*
           * --------------------------------------------------
           * SANITY IMAGE
           * --------------------------------------------------
           */

          const imageSource =
            img.image ||
            (img.asset
              ? {
                  _type: "image",
                  asset: img.asset,
                }
              : null);

          if (!imageSource) {
            return null;
          }

          let imageUrl: string | null = null;

          try {
            imageUrl =
              urlForImage(imageSource)
                .width(400)
                .height(400)
                .url();
          } catch {
            imageUrl = null;
          }

          if (!imageUrl) {
            return null;
          }

          return (
            <div
              key={
                img._key ||
                `gallery-${idx}`
              }
              className="group relative overflow-hidden rounded-xl"
            >
              <Image
                src={imageUrl}
                alt={
                  img.alt ||
                  img.name ||
                  `Gallery image ${idx + 1}`
                }
                width={400}
                height={400}
                className="h-64 w-full object-cover transition duration-300 group-hover:scale-110"
              />

              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-3 text-sm text-white">
                  {img.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Gallery;