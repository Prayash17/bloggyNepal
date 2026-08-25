import type { PortableTextBlock } from "@portabletext/react";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  credit?: string;
  source?: string;
  license?: string;
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
  slug?: {
    current: string;
  };
  description?: PortableTextBlock[];
  image?: SanityImage;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistrictProvince {
  _id?: string;
  _ref?: string;
  _type?: "reference";
  name?: string;
  slug?: {
    current: string;
  };
  number?: number;
  capital?: string;
}

export interface District {
  _id: string;
  _createdAt: string;

  name: string;

  slug: {
    current: string;
  };

  province?: DistrictProvince | null;

  headquarter?: string;

  category?: string;

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

  thingsToDo?: PortableTextBlock[];

  cultureAndHistory?: PortableTextBlock[];

  bestTimeToVisit?: PortableTextBlock[];

  nearbyAttractions?: string;

  places?: Place[];

  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}