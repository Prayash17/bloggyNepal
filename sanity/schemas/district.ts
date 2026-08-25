 import { defineField, defineType } from "sanity";

export const district = defineType({
  name: "district",
  title: "District",
  type: "document",

  fields: [
    // =========================================================
    // BASIC INFO
    // =========================================================
    defineField({
      name: "name",
      title: "District Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "province",
      title: "Province",
      type: "reference",
      to: [{ type: "province" }],
      validation: (Rule) => Rule.required(),
      description:
        "Which province does this district belong to?",
    }),

    defineField({
      name: "headquarter",
      title: "District Headquarters",
      type: "string",
      description:
        "e.g. Kathmandu, Pokhara, Biratnagar",
    }),

    defineField({
      name: "category",
      title: "Tourism Category",
      type: "string",
      description:
        "Comma-separated tourism categories, e.g. lakes, trekking, pilgrimage, culture.",
    }),

    // =========================================================
    // STATISTICS
    // =========================================================
    defineField({
      name: "population",
      title: "Total Population",
      type: "number",
      description:
        "Latest census data or estimate",
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: "area",
      title: "Area (sq km)",
      type: "number",
      description:
        "Total area in square kilometers",
      validation: (Rule) => Rule.min(0),
    }),

    defineField({
      name: "elevation",
      title: "Elevation (meters)",
      type: "number",
      description:
        "Average elevation above sea level",
    }),

    defineField({
      name: "density",
      title: "Population Density (per sq km)",
      type: "number",
      description:
        "Population density",
    }),

    // =========================================================
    // LOCATION
    // =========================================================
    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "object",
      description:
        "Latitude and longitude of the headquarters",
      fields: [
        defineField({
          name: "lat",
          title: "Latitude",
          type: "number",
        }),

        defineField({
          name: "lng",
          title: "Longitude",
          type: "number",
        }),
      ],
    }),

    defineField({
      name: "mapEmbedUrl",
      title: "Google Maps Embed URL",
      type: "url",
      description:
        "Google Maps embed URL for this district.",
    }),

    // =========================================================
    // COVER IMAGE
    // =========================================================
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
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
                title: "Purchased/Stock",
                value: "stock",
              },
            ],
          },
        }),
      ],
    }),

    // =========================================================
    // DISTRICT MAP
    // =========================================================
    defineField({
      name: "mapImage",
      title: "District Map",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
        }),
      ],
      description:
        "Upload a map showing the district's location within Nepal.",
    }),

    // =========================================================
    // IMAGE GALLERY
    // =========================================================
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
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
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),

            defineField({
              name: "credit",
              title:
                "Photo Credit / Attribution",
              type: "string",
              description:
                'e.g. "Photo by Mark Pokers, CC BY 2.0"',
            }),

            defineField({
              name: "source",
              title: "Source URL",
              type: "url",
              description:
                "Link to original image, such as Wikimedia Commons.",
            }),

            defineField({
              name: "license",
              title: "License",
              type: "string",
              options: {
                list: [
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
                    title: "Purchased/Stock",
                    value: "stock",
                  },
                ],
              },
            }),
          ],
        },
      ],
    }),

    // =========================================================
    // RICH TEXT
    // =========================================================
    defineField({
      name: "body",
      title: "District Overview",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Write an engaging introduction about this district.",
    }),

    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Bus routes, flights, and travel tips.",
    }),

    defineField({
      name: "thingsToDo",
      title: "Things to Do",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Major activities and experiences travelers can enjoy in this district.",
    }),

    defineField({
      name: "cultureAndHistory",
      title: "Culture & History",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Local traditions, festivals, and historical significance.",
    }),

    defineField({
      name: "bestTimeToVisit",
      title: "Best Time to Visit",
      type: "array",
      of: [{ type: "block" }],
      description:
        "Seasonal advice and weather information.",
    }),

    defineField({
      name: "nearbyAttractions",
      title: "Nearby Attractions",
      type: "text",
      rows: 4,
      description:
        "Nearby districts, attractions, or route ideas.",
    }),

    // =========================================================
    // PLACES TO VISIT
    // =========================================================
    defineField({
      name: "places",
      title: "Places to Visit",
      type: "array",
      of: [
        {
          type: "object",

          fields: [
            defineField({
              name: "name",
              title: "Place Name",
              type: "string",
            }),

            defineField({
              name: "slug",
              title: "Slug",
              type: "slug",
              options: {
                source: "name",
                maxLength: 96,
              },
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "array",
              of: [{ type: "block" }],
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
                }),
              ],
            }),
          ],

          preview: {
            select: {
              title: "name",
              media: "image",
            },
          },
        },
      ],
      description:
        "Add 3-4 must-visit places in this district with rich descriptions.",
    }),

    // =========================================================
    // SEO
    // =========================================================
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
        }),

        defineField({
          name: "ogImage",
          title: "Social Share Image",
          type: "image",
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
  ],

  // ===========================================================
  // PREVIEW
  // ===========================================================
  preview: {
    select: {
      title: "name",
      province: "province.name",
      media: "coverImage",
    },

    prepare({
      title,
      province,
      media,
    }) {
      return {
        title,
        subtitle: province
          ? `Province: ${province}`
          : "No province assigned",
        media,
      };
    },
  },
});