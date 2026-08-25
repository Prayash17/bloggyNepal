import { defineField, defineType } from "sanity";

export const destination = defineType({
  name: "destination",
  title: "Destination",
  type: "document",

  fields: [
    // ---------------------------------------------------------
    // BASIC INFORMATION
    // ---------------------------------------------------------
    defineField({
      name: "title",
      title: "Destination Name",
      type: "string",
      validation: (Rule) =>
        Rule.required().min(3).max(100),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "region",
      title: "Region",
      type: "string",
      options: {
        list: [
          { title: "Everest Region", value: "Everest Region" },
          { title: "Annapurna", value: "Annapurna" },
          { title: "Langtang", value: "Langtang" },
          { title: "Manaslu", value: "Manaslu" },
          { title: "Mustang", value: "Mustang" },
          { title: "Dolpo", value: "Dolpo" },
          { title: "Lumbini & Terai", value: "Lumbini & Terai" },
          { title: "Chitwan", value: "Chitwan" },
          { title: "Kathmandu Valley", value: "Kathmandu Valley" },
        ],
      },
    }),

    defineField({
      name: "excerpt",
      title: "Short Description",
      type: "text",
      rows: 4,
      validation: (Rule) =>
        Rule.required().min(30).max(300),
    }),

    defineField({
      name: "featured",
      title: "Featured Destination",
      type: "boolean",
      initialValue: false,
      description:
        "Use this to prioritize the destination on homepage or featured sections.",
    }),

    // ---------------------------------------------------------
    // COVER IMAGE
    // ---------------------------------------------------------
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describe the image naturally for accessibility and SEO.",
          validation: (Rule) => Rule.max(160),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          validation: (Rule) => Rule.max(200),
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
              { title: "Public Domain", value: "public-domain" },
              { title: "CC0", value: "cc0" },
              { title: "CC BY", value: "cc-by" },
              { title: "CC BY-SA", value: "cc-by-sa" },
              { title: "Own Photo", value: "own" },
              { title: "Purchased / Stock", value: "stock" },
            ],
          },
        }),

        defineField({
          name: "source",
          title: "Source URL",
          type: "url",
        }),
      ],
    }),

    // ---------------------------------------------------------
    // TRIP DETAILS
    // ---------------------------------------------------------
    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      description: "Example: 7–10 days",
    }),

    defineField({
      name: "maxAltitude",
      title: "Maximum Altitude",
      type: "string",
      description: "Example: 5,364 m",
    }),

    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      options: {
        list: [
          { title: "Easy", value: "Easy" },
          { title: "Moderate", value: "Moderate" },
          { title: "Challenging", value: "Challenging" },
          { title: "Strenuous", value: "Strenuous" },
        ],
      },
    }),

    defineField({
      name: "bestSeason",
      title: "Best Season to Visit",
      type: "string",
      description: "Example: March–May, October–November",
    }),

    defineField({
      name: "startingCost",
      title: "Starting Cost (USD)",
      type: "number",
      description:
        "Approximate minimum budget for one traveler.",
      validation: (Rule) => Rule.min(0),
    }),

    // ---------------------------------------------------------
    // MAP
    // ---------------------------------------------------------
    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          validation: (Rule) => Rule.max(160),
        }),
      ],
    }),

    // ---------------------------------------------------------
    // HOW TO GET THERE
    // ---------------------------------------------------------
    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      of: [{ type: "block" }],
    }),

    // ---------------------------------------------------------
    // ITINERARY
    // ---------------------------------------------------------
    defineField({
      name: "itinerary",
      title: "Day-by-Day Itinerary",
      type: "array",

      of: [
        {
          type: "object",
          name: "day",
          title: "Itinerary Day",

          fields: [
            defineField({
              name: "day",
              title: "Day Number",
              type: "number",
              validation: (Rule) =>
                Rule.required().min(1),
            }),

            defineField({
              name: "title",
              title: "Day Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 5,
            }),
          ],

          preview: {
            select: {
              day: "day",
              title: "title",
            },

            prepare({
              day,
              title,
            }) {
              return {
                title:
                  title || `Day ${day ?? ""}`,
                subtitle: day
                  ? `Day ${day}`
                  : "Itinerary day",
              };
            },
          },
        },
      ],
    }),

    // ---------------------------------------------------------
    // COST BREAKDOWN
    // ---------------------------------------------------------
    defineField({
      name: "costBreakdown",
      title: "Cost Breakdown",
      type: "array",

      of: [
        {
          type: "object",
          name: "cost",
          title: "Cost Item",

          fields: [
            defineField({
              name: "item",
              title: "Item",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),

            defineField({
              name: "amount",
              title: "Amount (USD)",
              type: "string",
            }),

            defineField({
              name: "notes",
              title: "Notes",
              type: "string",
            }),
          ],

          preview: {
            select: {
              title: "item",
              subtitle: "amount",
            },
          },
        },
      ],
    }),

    // ---------------------------------------------------------
    // CHECKLISTS
    // ---------------------------------------------------------
    defineField({
      name: "permits",
      title: "Permits Required",
      type: "array",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "packingList",
      title: "Packing List",
      type: "array",
      of: [{ type: "string" }],
    }),

    defineField({
      name: "safetyTips",
      title: "Safety Tips",
      type: "array",
      of: [{ type: "string" }],
    }),

    // ---------------------------------------------------------
    // ACCOMMODATION
    // ---------------------------------------------------------
    defineField({
      name: "accommodation",
      title: "Accommodation Information",
      type: "array",
      of: [{ type: "block" }],
    }),

    // ---------------------------------------------------------
    // PRO TIPS
    // ---------------------------------------------------------
    defineField({
      name: "proTips",
      title: "Pro Tips",
      type: "array",
      of: [{ type: "string" }],
    }),

    // ---------------------------------------------------------
    // GALLERY
    // ---------------------------------------------------------
    defineField({
      name: "gallery",
      title: "Photo Gallery",
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
              validation: (Rule) => Rule.max(160),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              validation: (Rule) => Rule.max(200),
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
                  { title: "Public Domain", value: "public-domain" },
                  { title: "CC0", value: "cc0" },
                  { title: "CC BY", value: "cc-by" },
                  { title: "CC BY-SA", value: "cc-by-sa" },
                  { title: "Own Photo", value: "own" },
                  { title: "Purchased / Stock", value: "stock" },
                ],
              },
            }),
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      region: "region",
      difficulty: "difficulty",
      featured: "featured",
      media: "coverImage",
    },

    prepare({
      title,
      region,
      difficulty,
      featured,
      media,
    }) {
      const details = [
        region,
        difficulty,
        featured ? "⭐ Featured" : null,
      ].filter(Boolean);

      return {
        title: title || "Untitled Destination",
        subtitle:
          details.length > 0
            ? details.join(" • ")
            : "No region or difficulty",
        media,
      };
    },
  },
});