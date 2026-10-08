import { groq } from "next-sanity";

// =========================================================
// SINGLE DISTRICT
// =========================================================

export const districtBySlugQuery = `
  *[
    _type == "district" &&
    slug.current == $slug
  ][0]{
    _id,
    _updatedAt,
    name,
    slug,
    province->{
      _id,
      name,
      officialName,
      number,
      capital,
      slug
    },
    headquarter,
    category,
    population,
    area,
    elevation,
    density,
    coordinates{ lat, lng },
    mapEmbedUrl,
    coverImage{ asset, alt, credit, source, license },
    mapImage{ asset, alt },
    gallery[]{ asset, alt, caption, credit, source, license },
    body,
    howToGetThere,
    thingsToDo,
    cultureAndHistory,
    bestTimeToVisit,
    nearbyAttractions,
    places[]{
      _key,
      name,
      slug,
      description,
      image{ asset, alt },
      coordinates{ lat, lng }
    },
    seo{
      metaTitle,
      metaDescription,
      ogImage{ asset }
    },
    faqs[]{ _key, question, answer }
  }
`;

// =========================================================
// ALL DISTRICTS
// =========================================================

export const allDistrictsQuery = groq`
  *[_type == "district"]
  | order(name asc) {
    _id,
    _createdAt,
    name,
    slug,
    headquarter,
    category,
    population,
    area,
    elevation,
    density,
    "province": province->{
      _id,
      name,
      officialName,
      slug,
      number
    },
    coverImage
  }
`;

// =========================================================
// DISTRICT SLUGS
// =========================================================

export const districtSlugsQuery = groq`
  *[
    _type == "district" &&
    defined(slug.current)
  ][].slug.current
`;

// =========================================================
// PROVINCES
// =========================================================

export const provinceSlugsQuery = groq`
  *[
    _type == "province" &&
    defined(slug.current)
  ].slug.current
`;

export const allProvincesQuery = groq`
  *[_type == "province"]
  | order(number asc) {
    _id,
    name,
    officialName,
    nepaliName,
    slug,
    number,
    capital,
    headquarters,
    population,
    area,
    density,
    noOfDistricts,
    shortDescription,
    travelThemes,
    "districtCount": count(*[_type == "district" && province._ref == ^._id]),
    "destinationCount": count(*[
      _type == "destination" &&
      defined(slug.current) &&
      (province._ref == ^._id || district->province._ref == ^._id)
    ]),
    "storyCount": count(*[
      _type == "post" &&
      defined(slug.current) &&
      (province._ref == ^._id || district->province._ref == ^._id)
    ]),
    coverImage{ asset, alt, credit, source, license },
    mapImage{ asset, alt, caption, credit, source, license }
  }
`;

export const provinceBySlugQuery = groq`
  *[
    _type == "province" &&
    slug.current == $slug
  ][0] {
    _id,
    _createdAt,
    _updatedAt,
    name,
    officialName,
    nepaliName,
    slug,
    number,
    capital,
    headquarters,
    population,
    area,
    density,
    noOfDistricts,
    shortDescription,
    travelThemes,
    body,
    highlights,
    gettingThere,
    cultureAndHistory,
    geography,
    bestTimeToVisit,
    practicalNotes,
    factCheckedAt,

    coverImage{ asset, alt, credit, source, license },
    mapImage{ asset, alt, caption, credit, source, license },
    gallery[]{ asset, alt, caption, credit, source, license },

    "districts": *[
      _type == "district" &&
      province._ref == ^._id &&
      defined(slug.current)
    ] | order(name asc) {
      _id,
      name,
      slug,
      headquarter,
      population,
      area,
      coverImage{ asset, alt, credit, source, license }
    },

    "destinations": *[
      _type == "destination" &&
      defined(slug.current) &&
      (
        province._ref == ^._id ||
        district->province._ref == ^._id
      )
    ] | order(featured desc, _updatedAt desc, title asc)[0...8] {
      _id,
      title,
      slug,
      excerpt,
      region,
      featured,
      duration,
      difficulty,
      coverImage{ asset, alt, caption, credit, source, license },
      district->{ name, slug }
    },

    "stories": *[
      _type == "post" &&
      defined(slug.current) &&
      (
        province._ref == ^._id ||
        district->province._ref == ^._id
      )
    ] | order(publishedAt desc, _updatedAt desc)[0...6] {
      _id,
      title,
      slug,
      excerpt,
      category,
      publishedAt,
      readingTime,
      coverImage{ asset, alt, caption, credit, source, license },
      district->{ name, slug }
    },

    seo {
      metaTitle,
      metaDescription,
      ogImage{ asset, alt }
    }
  }
`;

export const districtNavigationQuery = groq`
  *[
    _type == "district" &&
    defined(slug.current)
  ] | order(name asc) {
    _id,
    name,
    slug,
    province->{
      _id,
      name,
      officialName,
      number,
      slug
    }
  }
`;
