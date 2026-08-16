import { groq } from "next-sanity";

/* ==================== DISTRICT ==================== */

export const districtBySlugQuery = groq`
  *[_type == "district" && slug.current == $slug][0] {
    _id,
    _createdAt,
    name,
    slug,
    headquarter,
    population,
    area,
    elevation,
    density,
    coordinates,
    "province": province->{
      _id,
      name,
      slug,
      number,
      capital
    },
    coverImage { ..., asset->{ _id, url } },
    mapImage { ..., asset->{ _id, url } },
    gallery[] { ..., asset->{ _id, url } },
    body,
    howToGetThere,
    cultureAndHistory,
    bestTimeToVisit,
    places[] {
      _key,
      name,
      description,
      image { ..., asset->{ _id, url } }
    },
    seo
  }
`;

export const allDistrictsQuery = groq`
  *[_type == "district"] | order(name asc) {
    _id,
    name,
    slug,
    headquarter,
    population,
    "province": province->{
      _id,
      name,
      slug,
      number
    },
    coverImage { ..., asset->{ _id, url } }
  }
`;

export const districtSlugsQuery = groq`
  *[_type == "district" && defined(slug.current)][].slug.current
`;

/* ==================== PROVINCE ==================== */

export const allProvincesQuery = groq`
  *[_type == "province"] | order(number asc) {
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
    coverImage { ..., asset->{ _id, url } }
  }
`;

export const provinceBySlugQuery = groq`
  *[_type == "province" && slug.current == $slug][0] {
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
    coverImage { ..., asset->{ _id, url } },
    mapImage { ..., asset->{ _id, url } },
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
      coverImage { ..., asset->{ _id, url } }
    },
    seo
  }
`;

export const provinceSlugsQuery = groq`
  *[_type == "province" && defined(slug.current)][].slug.current
`;
