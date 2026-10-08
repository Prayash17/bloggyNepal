import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage, District } from "./district";

export interface ProvinceDestinationCard {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  region?: string;
  featured?: boolean;
  duration?: string;
  difficulty?: string;
  coverImage?: SanityImage;
  district?: {
    name: string;
    slug?: { current: string };
  };
}

export interface ProvinceStoryCard {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category?: string;
  publishedAt?: string;
  readingTime?: number;
  coverImage?: SanityImage;
  district?: {
    name: string;
    slug?: { current: string };
  };
}

export interface Province {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  name: string;
  officialName?: string;
  nepaliName?: string;
  slug: { current: string };
  number: number;
  capital?: string;
  headquarters?: string;
  population?: number;
  area?: number;
  density?: number;
  noOfDistricts?: number;
  shortDescription?: string;
  travelThemes?: string[];
  coverImage?: SanityImage;
  mapImage?: SanityImage;
  gallery?: SanityImage[];
  body?: PortableTextBlock[];
  highlights?: string[];
  gettingThere?: PortableTextBlock[];
  cultureAndHistory?: PortableTextBlock[];
  geography?: PortableTextBlock[];
  bestTimeToVisit?: PortableTextBlock[];
  practicalNotes?: string[];
  factCheckedAt?: string;
  districts?: District[];
  districtCount?: number;
  destinationCount?: number;
  storyCount?: number;
  destinations?: ProvinceDestinationCard[];
  stories?: ProvinceStoryCard[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}
