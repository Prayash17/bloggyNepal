import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImage, District } from "./district";

export interface Province {
  _id: string;
  _createdAt: string;
  name: string;
  officialName?: string;
  slug: { current: string };
  number: number;
  capital?: string;
  headquarters?: string;
  population?: number;
  area?: number;
  noOfDistricts?: number;
  coverImage?: SanityImage;
  mapImage?: SanityImage;
  body?: PortableTextBlock[];
  cultureAndHistory?: PortableTextBlock[];
  geography?: PortableTextBlock[];
  districts?: District[];
  districtCount?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: SanityImage;
  };
}
