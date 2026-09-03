import { defineQuery } from "next-sanity";

// ============================================================
// BLOGGYNEPAL — DESTINATION QUERIES
// ============================================================

const destinationCardProjection = `
  _id,
  title,
  slug,
  region,
  excerpt,
  featured,
  duration,
  maxAltitude,
  difficulty,
  bestSeason,
  startingCost,
  coverImage{
    asset,
    alt,
    caption,
    credit,
    source,
    license
  }
`;

// ============================================================
// ALL DESTINATIONS
// ============================================================

export const allDestinationsQuery = defineQuery(`
  *[
    _type == "destination" &&
    defined(slug.current)
  ]
  | order(
      featured desc,
      _updatedAt desc,
      title asc
    ) {
      ${destinationCardProjection}
    }
`);

// ============================================================
// DESTINATION SLUGS
// ============================================================

export const destinationSlugsQuery = defineQuery(`
  *[
    _type == "destination" &&
    defined(slug.current)
  ].slug.current
`);

// ============================================================
// DESTINATION BY SLUG
// ============================================================

export const destinationBySlugQuery = defineQuery(`
  *[
    _type == "destination" &&
    slug.current == $slug
  ][0]{
    _id,
    _updatedAt,
    title,
    slug,
    region,
    excerpt,
    featured,
    activityTypes,
    highlights,

    province->{
      _id,
      name,
      number,
      capital,
      slug
    },

    district->{
      _id,
      name,
      headquarter,
      slug,
      province->{
        _id,
        name,
        number,
        capital,
        slug
      }
    },

    coordinates,
    mapEmbedUrl,

    coverImage{
      asset,
      alt,
      caption,
      credit,
      source,
      license
    },

    mapImage{
      asset,
      alt,
      caption,
      credit,
      source,
      license
    },

    duration,
    maxAltitude,
    difficulty,
    bestSeason,
    startingCost,

    overview,
    thingsToDo,
    cultureAndHistory,
    bestTimeToVisit,
    howToGetThere,

    itinerary[]{
      _key,
      day,
      title,
      description,
      overnight
    },

    costBreakdown[]{
      _key,
      item,
      amount,
      notes
    },

    budgetNotes,

    permits,
    packingList,
    safetyTips,

    accommodation,
    proTips,

    nearbyDestinations[]->{
      _id,
      title,
      slug,
      region,
      duration,
      difficulty,
      coverImage{
        asset,
        alt,
        caption,
        credit
      }
    },

    faqs[]{
      _key,
      question,
      answer
    },

    gallery[]{
      _key,
      asset,
      alt,
      caption,
      credit,
      source,
      license
    },

    seo{
      metaTitle,
      metaDescription,
      ogImage{
        asset,
        alt,
        caption,
        credit,
        source,
        license
      }
    },

    factCheckedAt,

    sources[]{
      _key,
      name,
      url,
      checkedAt
    }
  }
`);

// ============================================================
// RELATED DESTINATIONS
// ============================================================

export const relatedDestinationsQuery = defineQuery(`
  *[
    _type == "destination" &&
    defined(slug.current) &&
    _id != $destinationId &&
    (
      region == $region ||
      featured == true
    )
  ]
  | order(
      featured desc,
      _updatedAt desc,
      title asc
    )[0...6]{
      _id,
      title,
      slug,
      region,
      duration,
      difficulty,
      coverImage{
        asset,
        alt,
        caption,
        credit
      }
    }
`);

// ============================================================
// FEATURED DESTINATIONS
// ============================================================

export const featuredDestinationsQuery = defineQuery(`
  *[
    _type == "destination" &&
    featured == true &&
    defined(slug.current)
  ]
  | order(
      _updatedAt desc,
      title asc
    )[0...8] {
      ${destinationCardProjection}
    }
`);