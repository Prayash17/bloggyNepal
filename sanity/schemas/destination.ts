import { defineField, defineType } from "sanity";

export const destination = defineType({
  name: "destination",
  title: "Destination",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Destination Name",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
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
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "duration",
      title: "Duration (days)",
      description: "e.g., '7-10 days'",
      type: "string",
    }),
    defineField({
      name: "maxAltitude",
      title: "Max Altitude (meters)",
      type: "string",
      description: "e.g., '5,364m'",
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
      description: "e.g., 'March-May, October-November'",
    }),
    defineField({
      name: "startingCost",
      title: "Starting Cost (USD)",
      description: "Approximate minimum budget for solo traveler",
      type: "number",
    }),
    // 👇 NEW FIELD
    defineField({
      name: "featured",
      title: "Featured on Homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "mapImage",
      title: "Map Image",
      description: "Screenshot or static map showing the location",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt Text" }],
    }),
    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "itinerary",
      title: "Day-by-Day Itinerary",
      type: "array",
      of: [
        {
          type: "object",
          name: "day",
          fields: [
            { name: "day", title: "Day Number", type: "number" },
            { name: "title", title: "Day Title", type: "string" },
            { name: "description", title: "Description", type: "text", rows: 3 },
          ],
        },
      ],
    }),
    defineField({
      name: "costBreakdown",
      title: "Cost Breakdown",
      type: "array",
      of: [
        {
          type: "object",
          name: "cost",
          fields: [
            { name: "item", title: "Item", type: "string" },
            { name: "amount", title: "Amount (USD)", type: "string" },
            { name: "notes", title: "Notes", type: "string" },
          ],
        },
      ],
    }),
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
    defineField({
      name: "accommodation",
      title: "Accommodation Info",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "proTips",
      title: "Pro Tips",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "gallery",
      title: "Photo Gallery",
      type: "array",
      of: [
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
      return { title, subtitle: region ? `📍 ${region}` : "📍 No region", media };
    },
  },
});