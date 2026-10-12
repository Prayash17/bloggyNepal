import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

// Editors sometimes include the brand in Sanity's metaTitle already.
// An absolute title avoids appending the root layout's template a second time.
export function brandedTitle(title: string): Metadata["title"] {
  const text = title.trim().replace(/(?:\s*[|–—-]\s*bloggynepal)+$/i, "").trim();
  return { absolute: `${text} | ${siteConfig.name}` };
}

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const image = new URL(
    siteConfig.images.og,
    siteConfig.url
  ).toString();

  return {
    title: brandedTitle(title),
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [{ url: image, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
