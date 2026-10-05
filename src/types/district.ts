 

/* =========================================================
   SANITY IMAGE
========================================================= */

export interface SanityImageAsset {
  _ref?: string;
  _id?: string;
}

export interface SanityImage {
  asset?: SanityImageAsset;

  alt?: string;
  caption?: string;
  credit?: string;
  source?: string;
  license?: string;
}

/* =========================================================
   SLUG
========================================================= */

export interface SanitySlug {
  current?: string;
}

/* =========================================================
   COORDINATES
========================================================= */

export interface Coordinates {
  lat?: number;
  lng?: number;
}

/* =========================================================
   PORTABLE TEXT
========================================================= */

export interface PortableTextSpan {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key?: string;
  _type: string;
  style?: string;

  children?: PortableTextSpan[];

  markDefs?: unknown[];
}

/* =========================================================
   PLACE
========================================================= */

export interface Place {
  _key?: string;

  name: string;

  slug?: SanitySlug;

  description?: PortableTextBlock[];

  image?: SanityImage;

  coordinates?: Coordinates;
}

/* =========================================================
   PROVINCE
========================================================= */

export interface ProvinceReference {
  _id?: string;

  name?: string;

  number?: number;

  capital?: string;

  slug?: SanitySlug;
}

export interface Province {
  _id: string;

  name: string;

  number?: number;

  capital?: string;

  districtCount?: number;

  noOfDistricts?: number;

  slug: SanitySlug;

  coverImage?: SanityImage;
}

/* =========================================================
   FAQ
========================================================= */

export interface DistrictFAQ {
  _key?: string;

  question?: string;

  answer?: string;
}

/* =========================================================
   SEO
========================================================= */

export interface DistrictSEO {
  metaTitle?: string;

  metaDescription?: string;

  ogImage?: SanityImage;
}

/* =========================================================
   DISTRICT
========================================================= */

export interface District {
  _id: string;

  _updatedAt?: string;

  name: string;

  slug: SanitySlug;

  province?: ProvinceReference | null;

  headquarter?: string;

  category?: string;

  /* =======================================================
     STATISTICS
  ====================================================== */

  population?: number;

  area?: number;

  elevation?: number;

  density?: number;

  /* =======================================================
     LOCATION
  ====================================================== */

  coordinates?: Coordinates;

  mapEmbedUrl?: string;

  /* =======================================================
     MEDIA
  ====================================================== */

  coverImage?: SanityImage;

  mapImage?: SanityImage;

  gallery?: SanityImage[];

  /* =======================================================
     CONTENT
  ====================================================== */

  body?: PortableTextBlock[];

  howToGetThere?: PortableTextBlock[];

  thingsToDo?: PortableTextBlock[];

  cultureAndHistory?: PortableTextBlock[];

  bestTimeToVisit?: PortableTextBlock[];

  nearbyAttractions?: string;

  /* =======================================================
     FAQ
  ====================================================== */

  faqs?: DistrictFAQ[];

  /* =======================================================
     PLACES
  ====================================================== */

  places?: Place[];

  /* =======================================================
     SEO
  ====================================================== */

  seo?: DistrictSEO;
}

/* =========================================================
   LIGHTWEIGHT DISTRICT NAVIGATION
========================================================= */

export interface DistrictNavigationItem {
  _id: string;

  name: string;

  slug: SanitySlug;

  province?: ProvinceReference | null;
}