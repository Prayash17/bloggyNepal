import { defineField, defineType } from "sanity";

// ============================================================
// BLOGGYNEPAL — DISTRICT SCHEMA

const LICENSE_OPTIONS = [
  {
    title: "Public Domain",
    value: "public-domain",
  },
  {
    title: "CC0",
    value: "cc0",
  },
  {
    title: "CC BY",
    value: "cc-by",
  },
  {
    title: "CC BY-SA",
    value: "cc-by-sa",
  },
  {
    title: "Own Photo",
    value: "own",
  },
  {
    title: "Purchased / Stock",
    value: "stock",
  },
] as const;

export const district = defineType({
  name: "district",
  title: "District",
  type: "document",

  // ===========================================================
  // STUDIO FIELD GROUPS
  // ===========================================================
  //
  // These groups only organize the Sanity Studio interface.
  // They do not change your saved document structure.
  // ===========================================================

  groups: [
    {
      name: "basic",
      title: "Basic Information",
      default: true,
    },

    {
      name: "statistics",
      title: "Statistics",
    },

    {
      name: "location",
      title: "Location & Maps",
    },

    {
      name: "media",
      title: "Media",
    },

    {
      name: "content",
      title: "District Content",
    },

    {
      name: "places",
      title: "Places to Visit",
    },

    {
      name: "seo",
      title: "SEO",
    },
  ],

  // ===========================================================
  // DOCUMENT FIELDS
  // ===========================================================

  fields: [
    // ==========================================================
    // BASIC INFORMATION
    // ==========================================================

    defineField({
      name: "name",
      title: "District Name",
      type: "string",
      group: "basic",

      description:
        "Official name of the district. Keep the spelling consistent with authoritative Nepal government sources.",

      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(100),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",

      options: {
        source: "name",
        maxLength: 96,
      },

      description:
        "The clean URL identifier used for the district page. Example: kathmandu, darchula, or ilam.",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "province",
      title: "Province",
      type: "reference",
      to: [{ type: "province" }],
      group: "basic",

      description:
        "Select the province this district belongs to.",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "headquarter",
      title: "District Headquarters",
      type: "string",
      group: "basic",

      description:
        "Administrative headquarters of the district.",

      validation: (Rule) =>
        Rule.max(100).warning(
          "Keep the headquarters name concise."
        ),
    }),

    defineField({
      name: "category",
      title: "Tourism Category",
      type: "string",
      group: "basic",

      description:
        "Comma-separated tourism themes used to describe the district. Example: trekking, lakes, culture, pilgrimage, wildlife.",

      validation: (Rule) =>
        Rule.max(250).warning(
          "Keep tourism categories concise and focused."
        ),
    }),

    // ==========================================================
    // STATISTICS
    // ==========================================================

    defineField({
      name: "population",
      title: "Total Population",
      type: "number",
      group: "statistics",

      description:
        "Use the latest reliable census figure or clearly identified official estimate.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    defineField({
      name: "area",
      title: "Area (sq km)",
      type: "number",
      group: "statistics",

      description:
        "Total district area in square kilometers.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    defineField({
      name: "elevation",
      title: "Elevation (meters)",
      type: "number",
      group: "statistics",

      description:
        "Representative elevation above sea level. Ideally use the district headquarters or clearly stated reference point.",

      validation: (Rule) =>
        Rule.min(-500)
          .max(9000)
          .warning(
            "Check that the elevation is realistic and that you are using the intended reference point."
          ),
    }),

    defineField({
      name: "density",
      title: "Population Density (per sq km)",
      type: "number",
      group: "statistics",

      description:
        "Population density in people per square kilometer.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    // ==========================================================
    // LOCATION & MAPS
    // ==========================================================

    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "object",
      group: "location",

      description:
        "Latitude and longitude of the district headquarters or primary reference location.",

      options: {
        collapsible: true,
      },

      fields: [
        defineField({
          name: "lat",
          title: "Latitude",
          type: "number",

          description:
            "Latitude in decimal degrees. Example: 27.7172",

          validation: (Rule) =>
            Rule.min(-90)
              .max(90)
              .warning(
                "Latitude must be between -90 and 90."
              ),
        }),

        defineField({
          name: "lng",
          title: "Longitude",
          type: "number",

          description:
            "Longitude in decimal degrees. Example: 85.3240",

          validation: (Rule) =>
            Rule.min(-180)
              .max(180)
              .warning(
                "Longitude must be between -180 and 180."
              ),
        }),
      ],
    }),

    defineField({
      name: "mapEmbedUrl",
      title: "Google Maps Embed URL",
      type: "url",
      group: "location",

      description:
        "Optional Google Maps embed URL for displaying the district location on the website.",
    }),

    // ==========================================================
    // COVER IMAGE
    // ==========================================================

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "media",

      description:
        "Primary visual for the district page, destination cards, social previews where applicable, and featured content.",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe what is visibly important in the image. Avoid keyword stuffing.",

          validation: (Rule) =>
            Rule.custom((value) => {
              if (
                typeof value === "undefined" ||
                value === ""
              ) {
                return "Add descriptive alternative text.";
              }

              if (value.length > 160) {
                return "Keep alternative text concise, ideally under 160 characters.";
              }

              return true;
            }).warning(),
        }),

        defineField({
          name: "credit",
          title: "Photo Credit",
          type: "string",

          description:
            "Photographer, creator, organization, or attribution required for this image.",
        }),

        defineField({
          name: "license",
          title: "License",
          type: "string",

          description:
            "Choose the correct usage/license status for this image.",

          options: {
            list: [...LICENSE_OPTIONS],
          },
        }),
      ],
    }),

    // ==========================================================
    // DISTRICT MAP
    // ==========================================================

    defineField({
      name: "mapImage",
      title: "District Map",
      type: "image",
      group: "media",

      description:
        "Map showing where the district is located within Nepal. Use a clear, readable map suitable for web display.",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe the map clearly for accessibility. Example: 'Map of Darchula district in far-western Nepal.'",

          validation: (Rule) =>
            Rule.custom((value) => {
              if (
                typeof value === "undefined" ||
                value === ""
              ) {
                return "Add descriptive alternative text for the map.";
              }

              if (value.length > 160) {
                return "Keep map alternative text concise, ideally under 160 characters.";
              }

              return true;
            }).warning(),
        }),
      ],
    }),

    // ==========================================================
    // IMAGE GALLERY
    // ==========================================================

    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      group: "media",

      description:
        "Add high-quality photographs that genuinely represent the district. Use accurate captions, credits, source URLs, and licenses when applicable.",

      options: {
        layout: "grid",
      },

      validation: (Rule) =>
        Rule.max(24).warning(
          "A focused gallery is usually better than an oversized collection."
        ),

      of: [
        {
          type: "image",

          options: {
            hotspot: true,
          },

          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",

              description:
                "Describe the important visible content of the photograph.",

              validation: (Rule) =>
                Rule.custom((value) => {
                  if (
                    typeof value === "undefined" ||
                    value === ""
                  ) {
                    return "Add descriptive alternative text.";
                  }

                  if (value.length > 160) {
                    return "Keep alternative text concise, ideally under 160 characters.";
                  }

                  return true;
                }).warning(),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",

              description:
                "Optional human-readable caption that gives context to the photograph.",

              validation: (Rule) =>
                Rule.max(250).warning(
                  "Keep captions concise and useful."
                ),
            }),

            defineField({
              name: "credit",
              title: "Photo Credit / Attribution",
              type: "string",

              description:
                'Credit the original photographer, creator, organization, or source. Example: "Photo by Mark Pokers, CC BY 2.0".',
            }),

            defineField({
              name: "source",
              title: "Source URL",
              type: "url",

              description:
                "Optional URL to the original image/source page, such as Wikimedia Commons.",
            }),

            defineField({
              name: "license",
              title: "License",
              type: "string",

              description:
                "Select the image's actual licensing status.",

              options: {
                list: [...LICENSE_OPTIONS],
              },
            }),
          ],
        },
      ],
    }),

    // ==========================================================
    // DISTRICT CONTENT
    // ==========================================================

    defineField({
      name: "body",
      title: "District Overview",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Write the main introduction to the district. Explain what makes it distinctive, where it is, what travelers can expect, and why it is worth knowing.",
    }),

    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Explain practical access by road, air, public transport, private vehicle, or trekking routes. Mention realistic travel conditions where relevant.",
    }),

    defineField({
      name: "thingsToDo",
      title: "Things to Do",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Describe meaningful experiences travelers can actually have in the district, rather than simply listing names.",
    }),

    defineField({
      name: "cultureAndHistory",
      title: "Culture & History",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Cover local communities, traditions, festivals, heritage, historical context, architecture, food culture, and other relevant cultural details.",
    }),

    defineField({
      name: "bestTimeToVisit",
      title: "Best Time to Visit",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Explain seasons, weather, road conditions, trekking conditions, festivals, wildlife opportunities, and any meaningful seasonal differences.",
    }),

    defineField({
      name: "nearbyAttractions",
      title: "Nearby Attractions",
      type: "text",
      rows: 4,
      group: "content",

      description:
        "Mention nearby attractions, districts, towns, routes, or useful combinations that help travelers plan a wider itinerary.",

      validation: (Rule) =>
        Rule.max(2000).warning(
          "Keep this focused on useful nearby travel connections."
        ),
    }),

    // ==========================================================
    // PLACES TO VISIT
    // ==========================================================

    defineField({
      name: "places",
      title: "Places to Visit",
      type: "array",
      group: "places",

      description:
        "Add the district's strongest visitor experiences. Aim for 3–6 genuinely useful places rather than a long, low-value list.",

      validation: (Rule) =>
        Rule.max(12).warning(
          "Keep the list focused on the most useful places for travelers."
        ),

      of: [
        {
          type: "object",

          fields: [
            defineField({
              name: "name",
              title: "Place Name",
              type: "string",

              description:
                "Official or commonly recognized name of the place.",

              validation: (Rule) =>
                Rule.max(120).warning(
                  "Keep place names concise."
                ),
            }),

            defineField({
              name: "slug",
              title: "Slug",
              type: "slug",

              options: {
                source: "name",
                maxLength: 96,
              },

              description:
                "Optional clean identifier for the place. Keep it lowercase and readable.",
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "array",

              of: [{ type: "block" }],

              description:
                "Explain what makes this place worth visiting, what travelers can experience there, and any important practical context.",
            }),

            defineField({
              name: "image",
              title: "Place Image",
              type: "image",

              options: {
                hotspot: true,
              },

              fields: [
                defineField({
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",

                  description:
                    "Describe the important visible subject of the photograph.",

                  validation: (Rule) =>
                    Rule.custom((value) => {
                      if (
                        typeof value === "undefined" ||
                        value === ""
                      ) {
                        return "Add descriptive alternative text.";
                      }

                      if (value.length > 160) {
                        return "Keep alternative text concise, ideally under 160 characters.";
                      }

                      return true;
                    }).warning(),
                }),
              ],
            }),
          ],

          preview: {
            select: {
              title: "name",
              media: "image",
              slug: "slug.current",
            },

            prepare({
              title,
              media,
              slug,
            }) {
              return {
                title:
                  title || "Untitled place",

                subtitle: slug
                  ? `/${slug}`
                  : "No slug generated",

                media,
              };
            },
          },
        },
      ],
    }),

    // ==========================================================
    // SEO
    // ==========================================================

    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",

      description:
        "Optional SEO overrides for the district page. Leave fields empty when the website should fall back to the district name/content.",

      options: {
        collapsible: true,
      },

      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",

          description:
            "A compelling page title for search engines. Aim for roughly 50–60 characters when practical.",

          validation: (Rule) =>
            Rule.max(70).warning(
              "Try to keep the meta title around 50–60 characters when possible."
            ),
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,

          description:
            "Write a useful search snippet summarizing this district page. Aim for roughly 140–160 characters when practical.",

          validation: (Rule) =>
            Rule.max(160).warning(
              "Try to keep the meta description around 140–160 characters."
            ),
        }),

        defineField({
          name: "ogImage",
          title: "Social Share Image",
          type: "image",

          description:
            "Optional image used when the district page is shared on social platforms. Prefer a clear landscape image with the subject easy to understand.",

          options: {
            hotspot: true,
          },
        }),
      ],
    }),
  ],

  // ===========================================================
  // DOCUMENT PREVIEW
  // ===========================================================

  preview: {
    select: {
      title: "name",
      province: "province.name",
      headquarter: "headquarter",
      category: "category",
      media: "coverImage",
    },

    prepare({
      title,
      province,
      headquarter,
      category,
      media,
    }) {
      const location = [
        province,
        headquarter,
      ]
        .filter(Boolean)
        .join(" · ");

      const subtitleParts = [
        location,
        category,
      ].filter(Boolean);

      return {
        title:
          title || "Untitled district",

        subtitle:
          subtitleParts.length > 0
            ? subtitleParts.join(" | ")
            : "District information",

        media,
      };
    },
  },

  // ===========================================================
  // SANITY STUDIO SORTING
  // ===========================================================
  //
  // These only affect how districts are listed in Studio.
  // They do not alter the stored documents.
  // ===========================================================

  orderings: [
    {
      title: "District Name — A → Z",
      name: "nameAsc",
      by: [
        {
          field: "name",
          direction: "asc",
        },
      ],
    },

    {
      title: "District Name — Z → A",
      name: "nameDesc",
      by: [
        {
          field: "name",
          direction: "desc",
        },
      ],
    },

    {
      title: "Population — Highest First",
      name: "populationDesc",
      by: [
        {
          field: "population",
          direction: "desc",
        },
      ],
    },

    {
      title: "Area — Largest First",
      name: "areaDesc",
      by: [
        {
          field: "area",
          direction: "desc",
        },
      ],
    },

    {
      title: "Recently Updated",
      name: "updatedDesc",
      by: [
        {
          field: "_updatedAt",
          direction: "desc",
        },
      ],
    },
  ],
});