import { defineField, defineType } from "sanity";

// ============================================================
// BLOGGYNEPAL — DESTINATION SCHEMA
// Professional travel-guide architecture
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

const REGION_OPTIONS = [
  {
    title: "Everest Region",
    value: "Everest Region",
  },
  {
    title: "Annapurna Region",
    value: "Annapurna Region",
  },
  {
    title: "Langtang & Helambu",
    value: "Langtang & Helambu",
  },
  {
    title: "Manaslu Region",
    value: "Manaslu Region",
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
    title: "Kathmandu Valley",
    value: "Kathmandu Valley",
  },
  {
    title: "Lumbini",
    value: "Lumbini",
  },
  {
    title: "Eastern Nepal",
    value: "Eastern Nepal",
  },
  {
    title: "Central Nepal",
    value: "Central Nepal",
  },
  {
    title: "Western Nepal",
    value: "Western Nepal",
  },
  {
    title: "Karnali",
    value: "Karnali",
  },
  {
    title: "Far West Nepal",
    value: "Far West Nepal",
  },
  {
    title: "Sudurpashchim",
    value: "Sudurpashchim",
  },
  {
    title: "Terai",
    value: "Terai",
  },
  {
    title: "Mid-Hills",
    value: "Mid-Hills",
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

  groups: [
    {
      name: "basic",
      title: "Basic Information",
      default: true,
    },

    {
      name: "location",
      title: "Location",
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

    {
      name: "verification",
      title: "Editorial Verification",
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
        "The public-facing destination name. Use the name travelers are most likely to recognize and search for.",

      validation: (Rule) =>
        Rule.required()
          .min(3)
          .max(120),
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
        "Permanent, clean URL identifier. Example: rara-lake or khaptad-national-park.",

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
        "Main tourism or geographic region associated with the destination.",
    }),

    defineField({
      name: "excerpt",
      title: "Short Description",
      type: "text",
      rows: 4,
      group: "basic",

      description:
        "A concise destination summary used on cards, listings, previews, and metadata fallbacks.",

      validation: (Rule) =>
        Rule.required()
          .min(40)
          .max(320),
    }),

    defineField({
      name: "featured",
      title: "Featured Destination",
      type: "boolean",
      group: "basic",

      initialValue: false,

      description:
        "Prioritize this destination in homepage and featured destination sections.",
    }),

    defineField({
      name: "activityTypes",
      title: "Main Activities",
      type: "array",
      group: "basic",

      of: [
        {
          type: "string",
        },
      ],

      description:
        "Examples: trekking, pilgrimage, wildlife, lake, culture, photography, adventure.",

      validation: (Rule) =>
        Rule.max(12).warning(
          "Keep activity types focused."
        ),
    }),

    defineField({
      name: "highlights",
      title: "Destination Highlights",
      type: "array",
      group: "basic",

      of: [
        {
          type: "string",
        },
      ],

      description:
        "3–8 short points that summarize what makes the destination worth visiting.",

      validation: (Rule) =>
        Rule.max(8).warning(
          "Keep highlights concise and meaningful."
        ),
    }),

    // ==========================================================
    // LOCATION
    // ==========================================================

    defineField({
      name: "province",
      title: "Province",
      type: "reference",
      to: [{ type: "province" }],
      group: "location",

      description:
        "Province where the destination is primarily located.",
    }),

    defineField({
      name: "district",
      title: "District",
      type: "reference",
      to: [{ type: "district" }],
      group: "location",

      description:
        "Primary district associated with the destination. Use the most relevant district when a destination spans multiple districts.",
    }),

    defineField({
      name: "coordinates",
      title: "Coordinates",
      type: "object",
      group: "location",

      options: {
        collapsible: true,
      },

      description:
        "Primary map coordinates for the destination or principal visitor point.",

      fields: [
        defineField({
          name: "lat",
          title: "Latitude",
          type: "number",

          validation: (Rule) =>
            Rule.min(-90)
              .max(90),
        }),

        defineField({
          name: "lng",
          title: "Longitude",
          type: "number",

          validation: (Rule) =>
            Rule.min(-180)
              .max(180),
        }),
      ],
    }),

    defineField({
      name: "mapEmbedUrl",
      title: "Google Maps Embed URL",
      type: "url",
      group: "location",

      description:
        "Optional Google Maps embed URL for the destination.",
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
        "Primary destination image. Choose a strong landscape photograph that immediately communicates the destination.",

      validation: (Rule) =>
        Rule.required(),

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          description:
            "Describe the important visible subject naturally. Do not keyword-stuff.",

          validation: (Rule) =>
            Rule.required()
              .max(160),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",

          validation: (Rule) =>
            Rule.max(250).warning(
              "Keep captions useful and concise."
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
            list: [...LICENSE_OPTIONS],
          },
        }),

        defineField({
          name: "source",
          title: "Source URL",
          type: "url",

          description:
            "Original source page when externally sourced.",
        }),
      ],
    }),

    // ==========================================================
    // TRIP DETAILS
    // ==========================================================

    defineField({
      name: "duration",
      title: "Typical Duration",
      type: "string",
      group: "trip",

      description:
        "Example: 5–7 days or 2–3 days.",

      validation: (Rule) =>
        Rule.max(100),
    }),

    defineField({
      name: "maxAltitude",
      title: "Maximum Altitude",
      type: "string",
      group: "trip",

      description:
        "Highest point reached during the normal experience. Include the unit.",

      validation: (Rule) =>
        Rule.max(80),
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
        "Consider terrain, altitude, duration, remoteness, road conditions, and physical demand.",
    }),

    defineField({
      name: "bestSeason",
      title: "Best Season to Visit",
      type: "string",
      group: "trip",

      description:
        "Example: March–May and October–November.",

      validation: (Rule) =>
        Rule.max(120),
    }),

    defineField({
      name: "startingCost",
      title: "Starting Cost (USD)",
      type: "number",
      group: "trip",

      description:
        "Optional indicative minimum cost for one traveler. Use only when you have a defensible basis.",

      validation: (Rule) =>
        Rule.min(0),
    }),

    // ==========================================================
    // INTRODUCTION
    // ==========================================================

    defineField({
      name: "overview",
      title: "Destination Overview",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "The main introduction. Explain what the destination is, where it is, what it feels like, why it matters, and who will enjoy it.",
    }),

    // ==========================================================
    // THINGS TO DO
    // ==========================================================

    defineField({
      name: "thingsToDo",
      title: "Things to Do",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Meaningful activities and experiences visitors can actually have.",
    }),

    // ==========================================================
    // CULTURE & HISTORY
    // ==========================================================

    defineField({
      name: "cultureAndHistory",
      title: "Culture & History",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Cultural context, history, communities, traditions, religion, festivals, food, architecture, and local customs.",
    }),

    // ==========================================================
    // BEST TIME
    // ==========================================================

    defineField({
      name: "bestTimeToVisit",
      title: "Best Time to Visit — Detailed",
      type: "array",
      group: "content",

      of: [{ type: "block" }],

      description:
        "Detailed seasonal information including weather, visibility, road/trail conditions, crowds, festivals, and accessibility.",
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
        "Explain realistic routes, transport choices, transfer points, travel times, road conditions, and the final approach.",
    }),

    // ==========================================================
    // ITINERARY
    // ==========================================================

    defineField({
      name: "itinerary",
      title: "Day-by-Day Itinerary",
      type: "array",
      group: "route",

      description:
        "Build a realistic journey with one entry per day.",

      validation: (Rule) =>
        Rule.max(60).warning(
          "More than 60 days is unusual. Double-check the itinerary."
        ),

      of: [
        {
          type: "object",
          name: "itineraryDay",
          title: "Itinerary Day",

          fields: [
            defineField({
              name: "day",
              title: "Day Number",
              type: "number",

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
                "Example: Kathmandu → Pokhara or Trek to Khaptad Baba Ashram.",

              validation: (Rule) =>
                Rule.required()
                  .min(3)
                  .max(150),
            }),

            defineField({
              name: "description",
              title: "Day Description",
              type: "text",
              rows: 6,

              description:
                "Route, activities, practical notes, accommodation area, and realistic pacing.",

              validation: (Rule) =>
                Rule.required()
                  .min(20)
                  .max(1800),
            }),

            defineField({
              name: "overnight",
              title: "Overnight",
              type: "string",

              description:
                "Optional overnight location.",

              validation: (Rule) =>
                Rule.max(120),
            }),
          ],

          preview: {
            select: {
              day: "day",
              title: "title",
              overnight: "overnight",
            },

            prepare({
              day,
              title,
              overnight,
            }) {
              return {
                title:
                  title ||
                  `Day ${day ?? ""}`,

                subtitle:
                  [
                    typeof day ===
                    "number"
                      ? `Day ${day}`
                      : null,
                    overnight,
                  ]
                    .filter(Boolean)
                    .join(" · "),
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
        "Meaningful travel costs with realistic ranges and explanations.",

      validation: (Rule) =>
        Rule.max(30),

      of: [
        {
          type: "object",
          name: "costItem",
          title: "Cost Item",

          fields: [
            defineField({
              name: "item",
              title: "Expense",
              type: "string",

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
                "Example: $25–40.",

              validation: (Rule) =>
                Rule.required()
                  .max(100),
            }),

            defineField({
              name: "notes",
              title: "Notes",
              type: "string",

              validation: (Rule) =>
                Rule.max(300),
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
    // BUDGET NOTE
    // ==========================================================

    defineField({
      name: "budgetNotes",
      title: "Budget Notes",
      type: "array",
      group: "costs",

      of: [{ type: "block" }],

      description:
        "Explain what changes the price: transport, season, group size, private vehicles, guide, accommodation, etc.",
    }),

    // ==========================================================
    // PERMITS
    // ==========================================================

    defineField({
      name: "permits",
      title: "Permits & Entry Requirements",
      type: "array",
      group: "planning",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(30),
    }),

    // ==========================================================
    // PACKING LIST
    // ==========================================================

    defineField({
      name: "packingList",
      title: "Packing List",
      type: "array",
      group: "planning",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(80),
    }),

    // ==========================================================
    // SAFETY
    // ==========================================================

    defineField({
      name: "safetyTips",
      title: "Safety Tips",
      type: "array",
      group: "planning",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(40),
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
        "Realistic accommodation options, standards, locations, booking advice, capacity and seasonal availability.",
    }),

    // ==========================================================
    // PRO TIPS
    // ==========================================================

    defineField({
      name: "proTips",
      title: "Pro Tips",
      type: "array",
      group: "content",

      of: [
        {
          type: "string",
        },
      ],

      validation: (Rule) =>
        Rule.max(40),
    }),

    // ==========================================================
    // NEARBY DESTINATIONS
    // ==========================================================

    defineField({
      name: "nearbyDestinations",
      title: "Nearby Destinations",
      type: "array",
      group: "content",

      of: [
        {
          type: "reference",
          to: [{ type: "destination" }],
        },
      ],

      description:
        "Destinations travelers can logically combine with this trip.",
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
        "Answer real traveler questions. Avoid creating FAQs purely for SEO.",

      validation: (Rule) =>
        Rule.max(12),

      of: [
        {
          type: "object",
          name: "faq",
          title: "FAQ",

          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",

              validation: (Rule) =>
                Rule.required()
                  .min(8)
                  .max(220),
            }),

            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 5,

              validation: (Rule) =>
                Rule.required()
                  .min(10)
                  .max(1200),
            }),
          ],

          preview: {
            select: {
              title: "question",
            },

            prepare({
              title,
            }) {
              return {
                title:
                  title ||
                  "Untitled FAQ",
              };
            },
          },
        },
      ],
    }),

    // ==========================================================
    // GALLERY
    // ==========================================================

    defineField({
      name: "gallery",
      title: "Photo Gallery",
      type: "array",
      group: "gallery",

      description:
        "High-quality supporting photographs. Use accurate alt text, captions, credits and licensing information.",

      options: {
        layout: "grid",
      },

      validation: (Rule) =>
        Rule.max(30),

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

              validation: (Rule) =>
                Rule.required()
                  .max(160),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",

              validation: (Rule) =>
                Rule.max(250),
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
                list: [...LICENSE_OPTIONS],
              },
            }),
          ],
        },
      ],
    }),

    // ==========================================================
    // MAP IMAGE
    // ==========================================================

    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      group: "media",

      options: {
        hotspot: true,
      },

      description:
        "Optional destination or route map.",

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",

          validation: (Rule) =>
            Rule.max(160),
        }),
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

      options: {
        collapsible: true,
      },

      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",

          validation: (Rule) =>
            Rule.max(70).warning(
              "Aim for roughly 50–60 characters when practical."
            ),
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,

          validation: (Rule) =>
            Rule.max(160).warning(
              "Aim for roughly 140–160 characters when practical."
            ),
        }),

        defineField({
          name: "ogImage",
          title: "Social Share Image",
          type: "image",

          options: {
            hotspot: true,
          },

          fields: [
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",

              validation: (Rule) =>
                Rule.max(160),
            }),
          ],
        }),
      ],
    }),

    // ==========================================================
    // EDITORIAL VERIFICATION
    // ==========================================================

    defineField({
      name: "factCheckedAt",
      title: "Fact Checked On",
      type: "date",
      group: "verification",

      description:
        "Date when important travel information was last checked.",
    }),

    defineField({
      name: "sources",
      title: "Editorial Sources",
      type: "array",
      group: "verification",

      description:
        "Internal editorial record of sources used to verify the destination information.",

      of: [
        {
          type: "object",
          name: "source",
          title: "Source",

          fields: [
            defineField({
              name: "name",
              title: "Source Name",
              type: "string",

              validation: (Rule) =>
                Rule.required()
                  .max(160),
            }),

            defineField({
              name: "url",
              title: "Source URL",
              type: "url",

              validation: (Rule) =>
                Rule.required(),
            }),

            defineField({
              name: "checkedAt",
              title: "Checked On",
              type: "date",
            }),
          ],

          preview: {
            select: {
              title: "name",
              subtitle: "url",
            },
          },
        },
      ],

      validation: (Rule) =>
        Rule.max(30),
    }),
  ],

  // ===========================================================
  // PREVIEW
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
  // SORTING
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
      title: "Difficulty — Easy First",
      name: "difficultyAsc",

      by: [
        {
          field: "difficulty",
          direction: "asc",
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

    {
      title: "Lowest Starting Cost",
      name: "costAsc",

      by: [
        {
          field: "startingCost",
          direction: "asc",
        },
      ],
    },
  ],
});