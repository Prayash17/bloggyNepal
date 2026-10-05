// ============================================================
// BLOGGYNEPAL — DESTINATION TYPES
// ============================================================

export interface SanitySlug {
  current?: string;
}

export interface SanityImageAsset {
  _ref?: string;
  _id?: string;
}

export interface SanityImage {
  _type?: string;

  asset?: SanityImageAsset;

  alt?: string;
  caption?: string;
  credit?: string;
  source?: string;
  license?: string;
}

export interface Coordinates {
  lat?: number;
  lng?: number;
}

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

export interface DestinationProvince {
  _id?: string;
  name?: string;
  number?: number;
  capital?: string;
  slug?: SanitySlug;
}

export interface DestinationDistrict {
  _id?: string;
  name?: string;
  headquarter?: string;
  slug?: SanitySlug;

  province?: DestinationProvince | null;
}

export interface DestinationItineraryDay {
  day: number;
  title: string;
  description: string;
  overnight?: string;
}

export interface DestinationCostItem {
  item: string;
  amount: string;
  notes?: string;
}

export interface DestinationFAQ {
  question: string;
  answer: string;
}

export interface DestinationSource {
  name: string;
  url: string;
  checkedAt?: string;
}

export interface DestinationSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImage;
}

export interface Destination {
  _id: string;

  _updatedAt?: string;

  title: string;

  slug: SanitySlug;

  region?: string;

  excerpt?: string;

  featured?: boolean;

  activityTypes?: string[];

  highlights?: string[];

  province?: DestinationProvince | null;

  district?: DestinationDistrict | null;

  coordinates?: Coordinates;

  mapEmbedUrl?: string;

  coverImage?: SanityImage;

  mapImage?: SanityImage;

  duration?: string;

  maxAltitude?: string;

  difficulty?: string;

  bestSeason?: string;

  startingCost?: number;

  overview?: PortableTextBlock[];

  thingsToDo?: PortableTextBlock[];

  cultureAndHistory?: PortableTextBlock[];

  bestTimeToVisit?: PortableTextBlock[];

  howToGetThere?: PortableTextBlock[];

  itinerary?: DestinationItineraryDay[];

  costBreakdown?: DestinationCostItem[];

  budgetNotes?: PortableTextBlock[];

  permits?: string[];

  packingList?: string[];

  safetyTips?: string[];

  accommodation?: PortableTextBlock[];

  proTips?: string[];

  nearbyDestinations?: DestinationNavigationItem[];

  faqs?: DestinationFAQ[];

  gallery?: SanityImage[];

  seo?: DestinationSEO;

  factCheckedAt?: string;

  sources?: DestinationSource[];
}

export interface DestinationNavigationItem {
  _id: string;

  title: string;

  slug: SanitySlug;

  region?: string;

  duration?: string;

  difficulty?: string;

  coverImage?: SanityImage;
}