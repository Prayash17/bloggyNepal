import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Story",
  type: "document",

  groups: [
    {
      name: "content",
      title: "Story Content",
      default: true,
    },
    {
      name: "details",
      title: "Story Details",
    },
    {
      name: "media",
      title: "Media",
    },
    {
      name: "travel",
      title: "Travel Information",
    },
    {
      name: "relationships",
      title: "Related Content",
    },
    {
      name: "seo",
      title: "SEO",
    },
  ],

  fields: [
    // =========================================================
    // STORY CONTENT
    // =========================================================

    defineField({
      name: "title",
      title: "Story Title",
      type: "string",
      group: "content",
      description:
        "The main headline of the story. Make it clear, memorable and natural.",
      validation: (Rule) =>
        Rule.required()
          .min(5)
          .max(120),
    }),

    defineField({
      name: "subtitle",
      title: "Subtitle / Deck",
      type: "string",
      group: "content",
      description:
        "A short supporting line shown beneath the title. Use it to add context or emotion.",
      validation: (Rule) =>
        Rule.max(180),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "excerpt",
      title: "Short Excerpt",
      type: "text",
      rows: 4,
      group: "content",
      description:
        "A concise summary used on story cards, previews and search results.",
      validation: (Rule) =>
        Rule.required()
          .min(20)
          .max(300),
    }),

    defineField({
      name: "body",
      title: "Story Body",
      type: "array",
      group: "content",
      of: [
        {
          type: "block",
          styles: [
            {
              title: "Normal",
              value: "normal",
            },
            {
              title: "Heading 2",
              value: "h2",
            },
            {
              title: "Heading 3",
              value: "h3",
            },
            {
              title: "Heading 4",
              value: "h4",
            },
            {
              title: "Quote",
              value: "blockquote",
            },
          ],
          lists: [
            {
              title: "Bullet",
              value: "bullet",
            },
            {
              title: "Numbered",
              value: "number",
            },
          ],
          marks: {
            decorators: [
              {
                title: "Strong",
                value: "strong",
              },
              {
                title: "Emphasis",
                value: "em",
              },
              {
                title: "Underline",
                value: "underline",
              },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (Rule) =>
                      Rule.required(),
                  }),

                  defineField({
                    name: "openInNewTab",
                    title: "Open in new tab",
                    type: "boolean",
                    initialValue: false,
                  }),
                ],
              },
            ],
          },
        },

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
                "Describe what is visible in the image.",
              validation: (Rule) =>
                Rule.max(160),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              validation: (Rule) =>
                Rule.max(240),
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
                ],
              },
            }),
          ],
        },
      ],
    }),

    // =========================================================
    // STORY DETAILS
    // =========================================================

    defineField({
      name: "featured",
      title: "Featured Story",
      type: "boolean",
      group: "details",
      initialValue: false,
      description:
        "Prioritize this story in featured or homepage sections.",
    }),

    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      group: "details",
      initialValue: () =>
        new Date().toISOString(),
      validation: (Rule) =>
        Rule.required(),
    }),

    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
      group: "details",
      description:
        "Use this when substantial information in the story has been updated.",
    }),

    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "details",
      initialValue: "bloggyNepal",
      validation: (Rule) =>
        Rule.max(100),
    }),

    defineField({
      name: "authorBio",
      title: "Author Bio",
      type: "text",
      rows: 3,
      group: "details",
      description:
        "Optional short author description shown on the story page.",
      validation: (Rule) =>
        Rule.max(400),
    }),

    defineField({
      name: "category",
      title: "Story Category",
      type: "string",
      group: "details",
      options: {
        list: [
          {
            title: "Travel Experience",
            value: "Travel Experience",
          },
          {
            title: "Adventure",
            value: "Adventure",
          },
          {
            title: "Culture & Heritage",
            value: "Culture & Heritage",
          },
          {
            title: "Food & Cuisine",
            value: "Food & Cuisine",
          },
          {
            title: "People & Community",
            value: "People & Community",
          },
          {
            title: "Nature & Wildlife",
            value: "Nature & Wildlife",
          },
          {
            title: "Trekking",
            value: "Trekking",
          },
          {
            title: "Road Trips",
            value: "Road Trips",
          },
          {
            title: "Photography",
            value: "Photography",
          },
          {
            title: "Travel Tips",
            value: "Travel Tips",
          },
          {
            title: "History",
            value: "History",
          },
          {
            title: "Opinion",
            value: "Opinion",
          },
          {
            title: "Other",
            value: "Other",
          },
        ],
      },
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "details",
      of: [
        {
          type: "string",
        },
      ],
      options: {
        layout: "tags",
      },
      description:
        "Add useful keywords such as trekking, Rara, Karnali, monsoon, culture.",
    }),

    defineField({
      name: "readingTime",
      title: "Reading Time",
      type: "number",
      group: "details",
      description:
        "Approximate reading time in minutes. Example: 7",
      validation: (Rule) =>
        Rule.min(1).max(120),
    }),

    // =========================================================
    // LOCATION
    // =========================================================

    defineField({
      name: "region",
      title: "Region",
      type: "string",
      group: "details",
      options: {
        list: [
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
            title: "Lumbini",
            value: "Lumbini",
          },
          {
            title: "Chitwan",
            value: "Chitwan",
          },
          {
            title: "Kathmandu Valley",
            value: "Kathmandu Valley",
          },
          {
            title: "Karnali",
            value: "Karnali",
          },
          {
            title: "Sudurpashchim",
            value: "Sudurpashchim",
          },
          {
            title: "General",
            value: "General",
          },
        ],
      },
    }),

    defineField({
      name: "province",
      title: "Province",
      type: "reference",
      group: "details",
      to: [
        {
          type: "province",
        },
      ],
      description:
        "Optional province associated with this story.",
    }),

    defineField({
      name: "district",
      title: "District",
      type: "reference",
      group: "details",
      to: [
        {
          type: "district",
        },
      ],
      description:
        "Optional district associated with this story.",
    }),

    // =========================================================
    // COVER / MEDIA
    // =========================================================

    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      group: "media",
      options: {
        hotspot: true,
      },

      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describe the image naturally for accessibility and SEO.",
          validation: (Rule) =>
            Rule.max(160),
        }),

        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          validation: (Rule) =>
            Rule.max(240),
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
            ],
          },
        }),
      ],
    }),

    defineField({
      name: "gallery",
      title: "Story Gallery",
      type: "array",
      group: "media",
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
                Rule.max(160),
            }),

            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              validation: (Rule) =>
                Rule.max(240),
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
                ],
              },
            }),
          ],
        },
      ],
      description:
        "Optional collection of additional photos from the story.",
    }),

    // =========================================================
    // TRAVEL INFORMATION
    // =========================================================

    defineField({
      name: "travelTips",
      title: "Travel Tips",
      type: "array",
      group: "travel",
      of: [
        {
          type: "string",
        },
      ],
      description:
        "Useful practical advice readers can use on their own journey.",
    }),

    defineField({
      name: "whatILearned",
      title: "What I Learned",
      type: "array",
      group: "travel",
      of: [
        {
          type: "block",
        },
      ],
      description:
        "Personal lessons, observations or reflections from the journey.",
    }),

    defineField({
      name: "bestTimeToVisit",
      title: "Best Time to Visit",
      type: "string",
      group: "travel",
      description:
        "Optional recommendation for when readers should visit.",
    }),

    defineField({
      name: "estimatedBudget",
      title: "Estimated Budget",
      type: "string",
      group: "travel",
      description:
        "Optional rough budget, e.g. $250–$400 per person.",
    }),

    defineField({
      name: "tripDuration",
      title: "Trip Duration",
      type: "string",
      group: "travel",
      description:
        "Optional duration associated with the journey, e.g. 5 days.",
    }),

    // =========================================================
    // RELATED CONTENT
    // =========================================================

    defineField({
      name: "relatedDestinations",
      title: "Related Destinations",
      type: "array",
      group: "relationships",
      of: [
        {
          type: "reference",
          to: [
            {
              type: "destination",
            },
          ],
        },
      ],
      description:
        "Connect this story to one or more destination guides.",
    }),

    defineField({
      name: "relatedDistricts",
      title: "Related Districts",
      type: "array",
      group: "relationships",
      of: [
        {
          type: "reference",
          to: [
            {
              type: "district",
            },
          ],
        },
      ],
      description:
        "Connect this story to relevant Nepal district pages.",
    }),

    defineField({
      name: "relatedStories",
      title: "Related Stories",
      type: "array",
      group: "relationships",
      of: [
        {
          type: "reference",
          to: [
            {
              type: "post",
            },
          ],
        },
      ],
      description:
        "Choose stories that readers may want to read next.",
    }),

    // =========================================================
    // SEO
    // =========================================================

    defineField({
      name: "seo",
      title: "SEO Settings",
      type: "object",
      group: "seo",

      fields: [
        defineField({
          name: "metaTitle",
          title: "Meta Title",
          type: "string",
          description:
            "Optional custom title for search engines.",
          validation: (Rule) =>
            Rule.max(65),
        }),

        defineField({
          name: "metaDescription",
          title: "Meta Description",
          type: "text",
          rows: 3,
          description:
            "Optional description for search engines.",
          validation: (Rule) =>
            Rule.max(160),
        }),

        defineField({
          name: "keywords",
          title: "SEO Keywords",
          type: "array",
          of: [
            {
              type: "string",
            },
          ],
          options: {
            layout: "tags",
          },
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

        defineField({
          name: "noIndex",
          title: "Hide From Search Engines",
          type: "boolean",
          initialValue: false,
          description:
            "Use only for pages that should not appear in search engines.",
        }),
      ],
    }),
  ],

  // =========================================================
  // PREVIEW
  // =========================================================

  preview: {
    select: {
      title: "title",
      region: "region",
      category: "category",
      featured: "featured",
      media: "coverImage",
    },

    prepare({
      title,
      region,
      category,
      featured,
      media,
    }) {
      const parts = [
        region,
        category,
        featured
          ? "⭐ Featured"
          : null,
      ].filter(Boolean);

      return {
        title:
          title ||
          "Untitled Story",

        subtitle:
          parts.length > 0
            ? parts.join(" • ")
            : "Story",

        media,
      };
    },
  },
});