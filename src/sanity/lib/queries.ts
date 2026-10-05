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

    coordinates{
      lat,
      lng
    },

    mapEmbedUrl,

    coverImage{
      asset,
      alt,
      credit,
      license
    },

    mapImage{
      asset,
      alt
    },

    gallery[]{
      asset,
      alt,
      caption,
      credit,
      source,
      license
    },

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

      image{
        asset,
        alt
      },

      coordinates{
        lat,
        lng
      }
    },

    seo{
      metaTitle,
      metaDescription,

      ogImage{
        asset
      }
    },

    faqs[]{
      _key,
      question,
      answer
    }
  }
`;


/* =========================================================
   ALL DISTRICTS
========================================================= */

export const allDistrictsQuery = groq`
  *[
    _type == "district"
  ]
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
      slug,
      number
    },

    coverImage
  }
`;

/* =========================================================
   DISTRICT SLUGS
========================================================= */

export const districtSlugsQuery = groq`
  *[
    _type == "district" &&
    defined(slug.current)
  ][].slug.current
`;

/* =========================================================
   PROVINCES
========================================================= */
export const provinceSlugsQuery = `
  *[
    _type == "province" &&
    defined(slug.current)
  ].slug.current
`;

export const allProvincesQuery = groq`
  *[
    _type == "province"
  ]
  | order(number asc) {
    _id,
    name,
    officialName,
    slug,
    number,
    capital,
    headquarters,
    population,
    area,
    noOfDistricts,
    "districtCount": count(districts),

    coverImage
  }
`;

export const provinceBySlugQuery = groq`
  *[
    _type == "province" &&
    slug.current == $slug
  ][0] {
    _id,
    _createdAt,
    name,
    officialName,
    slug,
    number,
    capital,
    headquarters,
    population,
    area,
    noOfDistricts,

    coverImage,
    mapImage,

    body,
    cultureAndHistory,
    geography,

    "districts": districts[]->{
      _id,
      name,
      slug,
      headquarter,
      population,
      area,
      coverImage
    },

    seo {
      metaTitle,
      metaDescription,
      ogImage
    }
  }
`;

export const districtNavigationQuery = `
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
      number,
      slug
    }
  }
`;
 
