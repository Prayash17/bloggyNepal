
import { defineField, defineType } from "sanity";

// ============================================================
// BLOGGYNEPAL — DESTINATION SCHEMA
 

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

const REGION_OPTIONS = [
  {
    title: "Everest Region",
    value: "Everest Region",
  },
  {
    title: "Annapurna",
    value: "Annapurna",
  },
  {
    title: "Langtang",
    value: "Langtang",
  },
  {
    title: "Manaslu",
    value: "Manaslu",
  },
  {
    title: "Mustang",
    value: "Mustang",
  },
  {
    title: "Dolpo",
    value: "Dolpo",
  },
  {
    title: "Lumbini & Terai",
    value: "Lumbini & Terai",
  },
  {
    title: "Chitwan",
    value: "Chitwan",
  },
  {
    title: "Kathmandu Valley",
    value: "Kathmandu Valley",
  },
] as const;

const DIFFICULTY_OPTIONS = [
  {
    title: "Easy",
    value: "Easy",
  },
  {
    title: "Moderate",
    value: "Moderate",
  },
  {
    title: "Challenging",
    value: "Challenging",
  },
  {
    title: "Strenuous",
    value: "Strenuous",
  },
] as const;

export const destination = defineType({
  name: "destination",
  title: "Destination",
  type: "document",

  // ===========================================================
  // STUDIO GROUPS
  // ===========================================================
  //
  // These groups only organize the Sanity Studio interface.
  // They do not modify your stored document structure.
  // ===========================================================

  groups: [
    {
      name: "basic",
      title: "Basic Information",
      default: true,
    },

    {
      name: "media",
      title: "Cover & Media",
    },

    {
      name: "trip",
      title: "Trip Details",
    },

    {
      name: "route",
      title: "Route & Itinerary",
    },

    {
      name: "costs",
      title: "Costs & Budget",
    },

    {
      name: "planning",
      title: "Planning & Safety",
    },

    {
      name: "content",
      title: "Traveler Information",
    },

    {
      name: "gallery",
      title: "Photo Gallery",
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
      name: "title",
      title: "Destination Name",
      type: "string",
      group: "basic",

      description:
        "The public-facing name of the destination. Use the name travelers are most likely to recognize and search for.",

      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(100),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "basic",

      options: {
        source: "title",
        maxLength: 96,
      },

      description:
        "Clean URL identifier for the destination. Keep it short, lowercase, readable, and permanent once the page is public.",

      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "region",
      title: "Region",
      type: "string",
      group: "basic",

      options: {
        list: [...REGION_OPTIONS],
      },

      description:
        "Select the main trekking or tourism region associated with this destination.",
    }),

    defineField({
      name: "excerpt",
      title: "Short Description",
      type: "text",
      rows: 4,
      group: "basic",

      description:
        "A concise introduction used in cards, destination listings, metadata fallbacks, and other previews. Explain what makes this destination worth visiting.",

      validation: (Rule) =>
        Rule.required()
          .min(30)
          .max(300),
    }),

    defineField({
      name: "featured",
      title: "Featured Destination",
      type: "boolean",
      group: "basic",

      initialValue: false,

      description:
        "Turn this on when the destination should be prioritized in homepage or featured destination sections.",
    }),

    // ==========================================================
    // COVER IMAGE
    // ==========================================================

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "media",

      options: {
        hotspot: true,
      },

      description:
        "Primary image for the destination page and destination cards. Choose a strong landscape photograph that immediately communicates the place.",

      validation: (Rule) =>
        Rule.required(),

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe the important visible subject naturally for accessibility. Do not stuff keywords.",

          validation: (Rule) =>
            Rule.max(160).warning(
              "Keep alternative text concise and descriptive, ideally under 160 characters."
            ),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",

          description:
            "Optional caption providing useful context about the photograph.",

          validation: (Rule) =>
            Rule.max(200).warning(
              "Keep image captions concise and useful."
            ),
        }),

        defineField({
          name: "credit",
          title: "Photo Credit",
          type: "string",

          description:
            "Photographer, creator, organization, or attribution information.",
        }),

        defineField({
          name: "license",
          title: "License",
          type: "string",

          description:
            "Select the actual license or ownership status of this image.",

          options: {
            list: [...LICENSE_OPTIONS],
          },
        }),

        defineField({
          name: "source",
          title: "Source URL",
          type: "url",

          description:
            "Optional link to the original image or source page, especially for Wikimedia Commons or externally sourced photography.",
        }),
      ],
    }),

    // ==========================================================
    // TRIP DETAILS
    // ==========================================================

    defineField({
      name: "duration",
      title: "Duration",
      type: "string",
      group: "trip",

      description:
        "Typical time required for the complete experience. Example: 7–10 days.",

      validation: (Rule) =>
        Rule.max(50).warning(
          "Keep the duration concise, such as '7–10 days'."
        ),
    }),

    defineField({
      name: "maxAltitude",
      title: "Maximum Altitude",
      type: "string",
      group: "trip",

      description:
        "Highest elevation reached during the trip. Example: 5,364 m.",

      validation: (Rule) =>
        Rule.max(50).warning(
          "Keep the altitude concise and include the unit where appropriate."
        ),
    }),

    defineField({
      name: "difficulty",
      title: "Difficulty",
      type: "string",
      group: "trip",

      options: {
        list: [...DIFFICULTY_OPTIONS],
      },

      description:
        "Choose the overall difficulty based on terrain, altitude, duration, remoteness, and physical demands.",
    }),

    defineField({
      name: "bestSeason",
      title: "Best Season to Visit",
      type: "string",
      group: "trip",

      description:
        "State the most suitable months or seasons. Example: March–May, October–November.",

      validation: (Rule) =>
        Rule.max(100).warning(
          "Keep the seasonal recommendation concise."
        ),
    }),

    defineField({
      name: "startingCost",
      title: "Starting Cost (USD)",
      type: "number",
      group: "trip",

      description:
        "Approximate minimum trip budget for one traveler. Keep the figure realistic and explain inclusions elsewhere in the cost breakdown.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    // ==========================================================
    // MAP
    // ==========================================================

    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      group: "route",

      options: {
        hotspot: true,
      },

      description:
        "Optional destination or route map. Use a clear, readable map that helps travelers understand the location or route.",

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe what the map communicates. Example: 'Map showing the Annapurna Circuit route through central Nepal.'",

          validation: (Rule) =>
            Rule.max(160).warning(
              "Keep map alternative text concise and descriptive."
            ),
        }),
      ],
    }),

    // ==========================================================
    // HOW TO GET THERE
    // ==========================================================

    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      group: "route",

      of: [{ type: "block" }],

      description:
        "Explain realistic transport options, road or flight access, transfer points, travel times, and important practical considerations.",
    }),

    // ==========================================================
    // DAY-BY-DAY ITINERARY
    // ==========================================================

    defineField({
      name: "itinerary",
      title: "Day-by-Day Itinerary",
      type: "array",
      group: "route",

      description:
        "Build the journey in realistic daily stages. Use one entry per day and keep descriptions useful rather than overly generic.",

      validation: (Rule) =>
        Rule.max(60).warning(
          "An itinerary longer than 60 days is unusual; double-check the entries."
        ),

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

              description:
                "Sequential itinerary day number.",

              validation: (Rule) =>
                Rule.required()
                  .min(1)
                  .max(60),
            }),

            defineField({
              name: "title",
              title: "Day Title",
              type: "string",

              description:
                "A clear summary of the day's route or main activity.",

              validation: (Rule) =>
                Rule.required()
                  .min(3)
                  .max(150),
            }),

            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 5,

              description:
                "Explain the day's route, travel, activities, accommodation area, and anything important travelers should know.",

              validation: (Rule) =>
                Rule.max(1500).warning(
                  "Keep each itinerary day focused and readable."
                ),
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
                  title ||
                  `Day ${day ?? ""}`,

                subtitle:
                  typeof day === "number"
                    ? `Day ${day}`
                    : "Itinerary day",
              };
            },
          },
        },
      ],
    }),

    // ==========================================================
    // COST BREAKDOWN
    // ==========================================================

    defineField({
      name: "costBreakdown",
      title: "Cost Breakdown",
      type: "array",
      group: "costs",

      description:
        "Break down the major costs travelers should expect. Use realistic current estimates and explain what each amount includes.",

      validation: (Rule) =>
        Rule.max(30).warning(
          "Keep the budget breakdown focused on meaningful travel expenses."
        ),

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

              description:
                "Example: Permit, accommodation, transportation, guide, meals.",

              validation: (Rule) =>
                Rule.required()
                  .min(2)
                  .max(100),
            }),

            defineField({
              name: "amount",
              title: "Amount (USD)",
              type: "string",

              description:
                "Keep the amount easy to understand. Example: $25–40.",

              validation: (Rule) =>
                Rule.max(100).warning(
                  "Keep cost amounts concise and include the currency."
                ),
            }),

            defineField({
              name: "notes",
              title: "Notes",
              type: "string",

              description:
                "Optional explanation of what the cost includes or when it may vary.",

              validation: (Rule) =>
                Rule.max(300).warning(
                  "Keep cost notes concise."
                ),
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

    // ==========================================================
    // PERMITS
    // ==========================================================

    defineField({
      name: "permits",
      title: "Permits Required",
      type: "array",
      group: "planning",

      description:
        "List permits, entry fees, restricted-area permissions, or other official requirements travelers may need.",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(30).warning(
          "Keep permit information focused on actual requirements."
        ),
    }),

    // ==========================================================
    // PACKING LIST
    // ==========================================================

    defineField({
      name: "packingList",
      title: "Packing List",
      type: "array",
      group: "planning",

      description:
        "List practical items travelers should consider bringing. Prioritize destination-specific needs.",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(80).warning(
          "Keep the packing list practical rather than repetitive."
        ),
    }),

    // ==========================================================
    // SAFETY TIPS
    // ==========================================================

    defineField({
      name: "safetyTips",
      title: "Safety Tips",
      type: "array",
      group: "planning",

      description:
        "Provide practical, destination-specific safety advice. Include altitude, weather, transport, terrain, permits, wildlife, or emergency considerations when relevant.",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(40).warning(
          "Keep safety guidance focused on meaningful, actionable advice."
        ),
    }),

    // ==========================================================
    // ACCOMMODATION
    // ==========================================================

    defineField({
      name: "accommodation",
      title: "Accommodation Information",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Explain realistic accommodation options, typical standards, locations, booking considerations, and seasonal availability.",
    }),

    // ==========================================================
    // PRO TIPS
    // ==========================================================

    defineField({
      name: "proTips",
      title: "Pro Tips",
      type: "array",
      group: "content",

      description:
        "Add useful first-hand style advice that can make the trip smoother, more affordable, safer, or more meaningful.",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(40).warning(
          "Keep pro tips focused on genuinely useful advice."
        ),
    }),

    // ==========================================================
    // PHOTO GALLERY
    // ==========================================================

    defineField({
      name: "gallery",
      title: "Photo Gallery",
      type: "array",
      group: "gallery",

      description:
        "Add supporting photographs that genuinely represent the destination. Use proper alt text, captions, credits, source URLs, and licensing information where applicable.",

      options: {
        layout: "grid",
      },

      validation: (Rule) =>
        Rule.max(30).warning(
          "A focused, high-quality gallery is preferable to a very large collection."
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
                "Describe the visible subject naturally and accurately.",

              validation: (Rule) =>
                Rule.max(160).warning(
                  "Keep alternative text concise and descriptive."
                ),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",

              description:
                "Optional contextual description for readers.",

              validation: (Rule) =>
                Rule.max(200).warning(
                  "Keep captions concise and useful."
                ),
            }),

            defineField({
              name: "credit",
              title: "Photo Credit",
              type: "string",

              description:
                "Photographer, creator, organization, or attribution.",
            }),

            defineField({
              name: "source",
              title: "Source URL",
              type: "url",

              description:
                "Optional URL to the original source or image page.",
            }),

            defineField({
              name: "license",
              title: "License",
              type: "string",

              description:
                "Select the actual license or ownership status.",

              options: {
                list: [...LICENSE_OPTIONS],
              },
            }),
          ],
        },
      ],
    }),
  ],

  // ===========================================================
  // STUDIO PREVIEW
  // ===========================================================

  preview: {
    select: {
      title: "title",
      region: "region",
      difficulty: "difficulty",
      duration: "duration",
      featured: "featured",
      media: "coverImage",
    },

    prepare({
      title,
      region,
      difficulty,
      duration,
      featured,
      media,
    }) {
      const details = [
        region,
        difficulty,
        duration,
        featured
          ? "⭐ Featured"
          : null,
      ].filter(Boolean);

      return {
        title:
          title ||
          "Untitled Destination",

        subtitle:
          details.length > 0
            ? details.join(" • ")
            : "Destination",

        media,
      };
    },
  },

  // ===========================================================
  // STUDIO SORTING
  // ===========================================================
  //
  // These only control how destinations are listed inside
  // Sanity Studio. They do not modify your documents.
  // ===========================================================

  orderings: [
    {
      title: "Destination Name — A → Z",
      name: "titleAsc",

      by: [
        {
          field: "title",
          direction: "asc",
        },
      ],
    },

    {
      title: "Destination Name — Z → A",
      name: "titleDesc",

      by: [
        {
          field: "title",
          direction: "desc",
        },
      ],
    },

    {
      title: "Featured First",
      name: "featuredFirst",

      by: [
        {
          field: "featured",
          direction: "desc",
        },
        {
          field: "title",
          direction: "asc",
        },
      ],
    },

    {
      title: "Starting Cost — Lowest First",
      name: "costAsc",

      by: [
        {
          field: "startingCost",
          direction: "asc",
        },
      ],
    },

    {
      title: "Starting Cost — Highest First",
      name: "costDesc",

      by: [
        {
          field: "startingCost",
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