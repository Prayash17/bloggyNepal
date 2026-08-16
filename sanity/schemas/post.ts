import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Story",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Short Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "region",
      title: "Region",
      type: "string",
      options: {
        list: [
          { title: "Everest Region", value: "Everest Region" },
          { title: "Annapurna", value: "Annapurna" },
          { title: "Lumbini", value: "Lumbini" },
          { title: "Langtang", value: "Langtang" },
          { title: "Upper Mustang", value: "Upper Mustang" },
          { title: "Chitwan", value: "Chitwan" },
          { title: "Kathmandu Valley", value: "Kathmandu Valley" },
          { title: "General", value: "General" },
        ],
      },
    }),
    // 👇 NEW FIELD
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", type: "string", title: "Alt Text" }],
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", region: "region", media: "coverImage" },
    prepare(selection) {
      const { title, region, media } = selection;
      return { title, subtitle: region ? `📍 ${region}` : "📝 No region", media };
    },
  },
});