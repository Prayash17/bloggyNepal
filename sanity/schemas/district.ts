import { defineField, defineType } from "sanity";

// ============================================================
// BLOGGYNEPAL — DISTRICT SCHEMA
// ============================================================

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
  // FIELDS
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
        "Clean URL identifier. Example: kathmandu, darchula, ilam.",

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
        "Comma-separated tourism themes. Example: trekking, lakes, culture, pilgrimage, wildlife.",

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
        "Use the latest reliable census figure or a clearly identified official estimate.",

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
      title: "Reference Elevation (meters)",
      type: "number",
      group: "statistics",

      description:
        "Representative elevation above sea level. Ideally use the district headquarters or clearly state the reference point used.",

      validation: (Rule) =>
        Rule.min(-500)
          .max(9000)
          .warning(
            "Check that the elevation is realistic and that the reference point is clear."
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
        "Optional Google Maps embed URL. The website loads the interactive map only when the visitor opens it.",
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
        "Primary visual for the district page, cards, and social previews where applicable.",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe what is visually important in the image. Avoid keyword stuffing.",

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
            "Photographer, creator, organization, or required attribution.",
        }),

        defineField({
          name: "license",
          title: "License",
          type: "string",

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
        "Clear district map suitable for web display.",

      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Example: Map of Darchula district in far-western Nepal.",

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

        defineField({
          name: "caption",
          title: "Map Caption",
          type: "string",

          validation: (Rule) =>
            Rule.max(250).warning(
              "Keep the caption concise and useful."
            ),
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
        "Use a focused set of high-quality photographs that genuinely represent the district.",

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
                "Optional context for the photograph.",

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
                "Photographer, creator, organization, or attribution required for this image.",
            }),

            defineField({
              name: "source",
              title: "Source URL",
              type: "url",

              description:
                "Optional URL to the original source page.",
            }),

            defineField({
              name: "license",
              title: "License",
              type: "string",

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
        "Introduce the district, where it is, what makes it distinctive, and why travelers should know about it.",
    }),

    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Explain realistic routes by road, air, public transport, private vehicle, or trekking. Mention meaningful route conditions where relevant.",
    }),

    defineField({
      name: "thingsToDo",
      title: "Things to Do",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Describe meaningful experiences travelers can actually have in the district.",
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
        "Explain seasonal weather, road conditions, trekking conditions, festivals, wildlife opportunities, and other meaningful seasonal differences.",
    }),

    defineField({
      name: "nearbyAttractions",
      title: "Nearby Attractions",
      type: "text",
      rows: 5,
      group: "content",

      description:
        "Mention nearby attractions, towns, districts, routes, or useful combinations for a wider itinerary.",

      validation: (Rule) =>
        Rule.max(2500).warning(
          "Keep this focused on useful nearby travel connections."
        ),
    }),

    // ==========================================================
    // FAQ
    // ==========================================================

    defineField({
      name: "faqs",
      title: "Frequently Asked Questions",
      type: "array",
      group: "content",

      description:
        "Add practical questions travelers commonly ask about this district. Keep answers specific and genuinely useful.",

      validation: (Rule) =>
        Rule.max(10).warning(
          "A focused FAQ is better than a long list."
        ),

      of: [
        {
          type: "object",

          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",

              validation: (Rule) =>
                Rule.required()
                  .min(10)
                  .max(180),
            }),

            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 5,

              validation: (Rule) =>
                Rule.required()
                  .min(20)
                  .max(1000),
            }),
          ],

          preview: {
            select: {
              title: "question",
              subtitle: "answer",
            },

            prepare({
              title,
              subtitle,
            }) {
              return {
                title:
                  title ||
                  "Untitled question",

                subtitle:
                  subtitle
                    ? subtitle.slice(
                        0,
                        100
                      )
                    : "No answer yet",
              };
            },
          },
        },
      ],
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
        "Add the district's strongest visitor experiences. Aim for 3–6 genuinely useful places rather than a long list.",

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

              validation: (Rule) =>
                Rule.required()
                  .min(2)
                  .max(120),
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
                "Optional clean identifier for the place.",
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "array",

              of: [{ type: "block" }],

              description:
                "Explain why this place is worth visiting and what travelers can experience there.",
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

                defineField({
                  name: "caption",
                  title: "Caption",
                  type: "string",

                  validation: (Rule) =>
                    Rule.max(250).warning(
                      "Keep the caption concise and useful."
                    ),
                }),

                defineField({
                  name: "credit",
                  title: "Photo Credit",
                  type: "string",
                }),

                defineField({
                  name: "source",
                  title: "Source URL",
                  type: "url",
                }),

                defineField({
                  name: "license",
                  title: "License",
                  type: "string",

                  options: {
                    list: [
                      ...LICENSE_OPTIONS,
                    ],
                  },
                }),
              ],
            }),

            defineField({
              name: "coordinates",
              title: "Coordinates",
              type: "object",

              options: {
                collapsible: true,
              },

              fields: [
                defineField({
                  name: "lat",
                  title: "Latitude",
                  type: "number",

                  validation: (Rule) =>
                    Rule.min(-90).max(90),
                }),

                defineField({
                  name: "lng",
                  title: "Longitude",
                  type: "number",

                  validation: (Rule) =>
                    Rule.min(-180).max(180),
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
                  title ||
                  "Untitled place",

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
        "Optional SEO overrides. Leave empty to use the website's generated defaults.",

      options: {
        collapsible: true,
      },

      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",

          description:
            "Compelling search title. Aim for roughly 50–60 characters when practical.",

          validation: (Rule) =>
            Rule.max(70).warning(
              "Try to keep this around 50–60 characters when possible."
            ),
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,

          description:
            "Useful search snippet. Aim for roughly 140–160 characters when practical.",

          validation: (Rule) =>
            Rule.max(160).warning(
              "Try to keep this around 140–160 characters when possible."
            ),
        }),

        defineField({
          name: "ogImage",
          title: "Social Share Image",
          type: "image",

          description:
            "Optional image used when the district page is shared on social platforms.",

          options: {
            hotspot: true,
          },

          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",

              validation: (Rule) =>
                Rule.max(160).warning(
                  "Keep alternative text concise."
                ),
            }),

            defineField({
              name: "credit",
              title: "Photo Credit",
              type: "string",
            }),

            defineField({
              name: "license",
              title: "License",
              type: "string",

              options: {
                list: [
                  ...LICENSE_OPTIONS,
                ],
              },
            }),
          ],
        }),
      ],
    }),
  ],

  // ==========================================================
  // DOCUMENT PREVIEW
  // ==========================================================

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
            ? subtitleParts.join(
                " | "
              )
            : "District information",

        media,
      };
    },
  },

  // ==========================================================
  // STUDIO ORDERING
  // ==========================================================

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