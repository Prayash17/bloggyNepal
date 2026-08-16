 import { defineField, defineType } from "sanity";

export const district = defineType({
  name: "district",
  title: "District",
  type: "document",
  fields: [
    // ============ BASIC INFO ============
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
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    // 🔗 REFERENCE TO PROVINCE (replaces old string)
    defineField({
      name: "province",
      title: "Province",
      type: "reference",
      to: [{ type: "province" }],
      validation: (Rule) => Rule.required(),
      description: "Which province does this district belong to?",
    }),

    defineField({
      name: "headquarter",
      title: "District Headquarters",
      type: "string",
      description: "e.g., Kathmandu, Pokhara, Biratnagar",
    }),

    // ============ STATS (NEW) ============
    defineField({
      name: "population",
      title: "Total Population",
      type: "number",
      description: "Latest census data or estimate",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "area",
      title: "Area (sq km)",
      type: "number",
      description: "Total area in square kilometers",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "elevation",
      title: "Elevation (meters)",
      type: "number",
      description: "Average elevation in meters above sea level",
    }),
    defineField({
      name: "density",
      title: "Population Density (per sq km)",
      type: "number",
      description: "Auto-calculated or manual override",
    }),

    // ============ LOCATION (NEW) ============
   defineField({
  name: "coordinates",
  title: "Coordinates",
  type: "object",
  description: "Latitude and longitude of the headquarters",
  fields: [
    { name: "lat", type: "number", title: "Latitude" },
    { name: "lng", type: "number", title: "Longitude" },
  ],
}),


defineField({
  name: "mapEmbedUrl",
  title: "Google Maps Embed URL (Auto-generated)",
  type: "url",
  description: "Auto-generated Google Maps embed URL. Edit only if you want a custom map.",
  readOnly: true, //  Makes it auto-filled, you don't need to touch it
}),


  defineField({
  name: "coverImage",
  title: "Cover Image",
  type: "image",
  options: { hotspot: true },
  fields: [
    { name: "alt", type: "string", title: "Alternative Text" },
    // 👇 NEW
    {
      name: "credit",
      type: "string",
      title: "Photo Credit",
    },
    {
      name: "license",
      type: "string",
      title: "License",
      options: {
        list: [
          { title: "Public Domain", value: "public-domain" },
          { title: "CC0", value: "cc0" },
          { title: "CC BY", value: "cc-by" },
          { title: "CC BY-SA", value: "cc-by-sa" },
          { title: "Own Photo", value: "own" },
          { title: "Purchased/Stock", value: "stock" },
        ],
      },
    },
  ],
}),

    defineField({
      name: "mapImage",
      title: "District Map",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
      ],
      description: "Upload a map showing the district's location within Nepal",
    }),
   // Add these fields inside the gallery object definition:

defineField({
  name: "gallery",
  title: "Image Gallery",
  type: "array",
  of: [
    {
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Alternative Text" },
        { name: "caption", type: "string", title: "Caption" },
        // 👇 NEW FIELDS FOR ATTRIBUTION
        {
          name: "credit",
          type: "string",
          title: "Photo Credit / Attribution",
          description: 'e.g., "Photo by Mark Pokers, CC BY 2.0"',
        },
        {
          name: "source",
          type: "url",
          title: "Source URL",
          description: "Link to original image (Wikipedia Commons, etc.)",
        },
        {
          name: "license",
          type: "string",
          title: "License",
          options: {
            list: [
              { title: "Public Domain", value: "public-domain" },
              { title: "CC0", value: "cc0" },
              { title: "CC BY", value: "cc-by" },
              { title: "CC BY-SA", value: "cc-by-sa" },
              { title: "Own Photo", value: "own" },
              { title: "Purchased/Stock", value: "stock" },
            ],
          },
        },
      ],
    },
  ],
}),


    // ============ RICH TEXT SECTIONS ============
    defineField({
      name: "body",
      title: "District Overview",
      type: "array",
      of: [{ type: "block" }],
      description: "Write an engaging introduction about this district.",
    }),
    defineField({
      name: "howToGetThere",
      title: "How to Get There",
      type: "array",
      of: [{ type: "block" }],
      description: "Bus routes, flights, and travel tips.",
    }),
    defineField({
      name: "cultureAndHistory",
      title: "Culture & History",
      type: "array",
      of: [{ type: "block" }],
      description: "Local traditions, festivals, and historical significance.",
    }),
    defineField({
      name: "bestTimeToVisit",
      title: "Best Time to Visit",
      type: "array",
      of: [{ type: "block" }],
      description: "Seasonal advice and weather tips.",
    }),

    // ============ PLACES TO VISIT ============
    defineField({
      name: "places",
      title: "Places to Visit",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", type: "string", title: "Place Name" },
            {
              name: "description",
              title: "Description",
              type: "array",
              of: [{ type: "block" }],
            },
            {
              name: "image",
              type: "image",
              title: "Place Image",
              options: { hotspot: true },
              fields: [
                { name: "alt", type: "string", title: "Alternative Text" },
              ],
            },
          ],
        },
      ],
      description: "Add 3-4 must-visit places in this district with rich descriptions.",
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
      province: "province.name",
      media: "coverImage",
    },
    prepare({ title, province, media }) {
      return {
        title,
        subtitle: province ? `📍 ${province}` : "No province assigned",
        media,
      };
    },
  },
});
