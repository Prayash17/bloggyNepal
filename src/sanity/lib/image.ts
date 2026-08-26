import {
  createImageUrlBuilder,
} from "@sanity/image-url";

import type {
  SanityImageSource,
} from "@sanity/image-url";

import { client } from "./client";

const builder =
  createImageUrlBuilder(client);

export function urlForImage(
  source: SanityImageSource
) {
  return builder.image(source);
}
export function hasValidSanityImage(
  source: unknown
): source is SanityImageSource {
  if (!source || typeof source !== "object") {
    return false;
  }

  const value = source as {
    asset?: {
      _ref?: string;
      _id?: string;
    } | null;
  };

  return Boolean(
    value.asset?._ref ||
      value.asset?._id
  );
}