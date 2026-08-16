 import type { PortableTextBlock } from "@portabletext/react";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

export interface Place {
  _key: string;
  name: string;
  description?: PortableTextBlock[];
  image?: SanityImage;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface District {
  _id: string;
  _createdAt: string;
  name: string;
  slug: { current: string };

  province?: {
    _ref: string;
    _type: "reference";
    name?: string;
    slug?: { current: string };
  };

  headquarter?: string;
  population?: number;
  area?: number;
  elevation?: number;
  density?: number;
  coordinates?: Coordinates;

  coverImage?: SanityImage;
  mapImage?: SanityImage;
  mapEmbedUrl?: string;

  gallery?: SanityImage[];

  body?: PortableTextBlock[];
  howToGetThere?: PortableTextBlock[];
  cultureAndHistory?: PortableTextBlock[];
  bestTimeToVisit?: PortableTextBlock[];

  places?: Place[];

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}