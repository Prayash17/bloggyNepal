import { defineField, defineType } from "sanity";

export const province = defineType({
  name: "province",
  title: "Province",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Province Name",
      type: "string",
      description: "e.g., Bagmati, Gandaki, Lumbini",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "officialName",
      title: "Official Name",
      type: "string",
      description: "e.g., Province 3 (Bagmati Province)",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "number",
      title: "Province Number",
      type: "number",
      description: "1 through 7",
      validation: (Rule) => Rule.required().min(1).max(7),
    }),
    defineField({
      name: "capital",
      title: "Capital City",
      type: "string",
    }),
    defineField({
      name: "headquarters",
      title: "Headquarters",
      type: "string",
    }),

    // ============ STATS ============
    defineField({
      name: "population",
      title: "Total Population",
      type: "number",
    }),
    defineField({
      name: "area",
      title: "Area (sq km)",
      type: "number",
    }),
    defineField({
      name: "noOfDistricts",
      title: "Number of Districts",
      type: "number",
    }),

    // ============ IMAGES ============
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
      ],
    }),
    defineField({
      name: "mapImage",
      title: "Map Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
      ],
    }),

    // ============ RICH TEXT ============
    defineField({
      name: "body",
      title: "Overview",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "cultureAndHistory",
      title: "Culture & History",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "geography",
      title: "Geography",
      type: "array",
      of: [{ type: "block" }],
    }),

    // ============ REFERENCE: DISTRICTS ============
    defineField({
      name: "districts",
      title: "Districts in this Province",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "district" }],
        },
      ],
      description: "Add all districts that belong to this province",
    }),

    // ============ SEO ============
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        { name: "metaTitle", type: "string", title: "Meta Title" },
        { name: "metaDescription", type: "text", title: "Meta Description" },
        {
          name: "ogImage",
          type: "image",
          title: "Social Share Image",
          options: { hotspot: true },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "capital",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `🏛️ Capital: ${subtitle}` : "No capital",
        media,
      };
    },
  },
});
