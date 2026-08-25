import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mammoth from "mammoth";
import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type ImageMeta = {
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  license?: string;
};

type ParsedPlace = {
  name: string;
  slug?: string;
  description: string;
  image?: ImageMeta;
};

type ParsedDistrict = {
  name: string;
  slug: string;
  provinceName: string;
  headquarter?: string;
  population?: number;
  area?: number;
  elevation?: number;
  elevationText?: string;
  density?: number;
  coordinates?: { lat: number; lng: number };
  mapEmbedUrl?: string;
  overview: string;
  howToGetThere: string;
  cultureAndHistory: string;
  bestTimeToVisit: string;
  coverImage?: ImageMeta;
  mapImage?: ImageMeta;
  gallery: ImageMeta[];
  places: ParsedPlace[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    socialImage?: ImageMeta;
  };
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing Sanity environment variables. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN (or SANITY_API_TOKEN)",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

function clean(value: string | undefined): string {
  return (value || "")
    .replace(/\uFEFF/g, "")
    .replace(/\u00ad/g, "")
    .trim();
}

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00ad/g, "").trim())
    .filter(Boolean);
}

function findLine(lines: string[], label: string): number {
  const target = label.trim().toLowerCase();
  return lines.findIndex((line) => line.trim().toLowerCase() === target);
}

const FIELD_LABELS = new Set([
  "District Name",
  "Slug",
  "Province",
  "District Headquarters",
  "Total Population",
  "Area (sq km)",
  "Elevation (meters)",
  "Population Density (per sq km)",
  "Latitude",
  "Longitude",
  "Google Maps Embed URL",
  "Image URL",
  "Alternative Text",
  "Photo Credit",
  "Photo Credit / Attribution",
  "Source URL",
  "License",
  "Caption",
  "Place Name",
  "Description",
  "Place Image URL",
  "Meta Title",
  "Meta Description",
  "Social Share Image URL",
  "Social Share Image Alt Text",
]);

function valueAfterLabel(lines: string[], label: string): string | undefined {
  const index = findLine(lines, label);
  if (index === -1) return undefined;

  for (let i = index + 1; i < lines.length; i++) {
    const value = clean(lines[i]);
    if (!value) continue;

    // If the next meaningful line is another known field label,
    // the original field was intentionally left blank.
    if (FIELD_LABELS.has(value)) return undefined;
    return value;
  }

  return undefined;
}

function numberFromText(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function exactNumberFromText(value?: string): number | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/,/g, "").trim();
  return /^-?\d+(?:\.\d+)?$/.test(normalized)
    ? Number(normalized)
    : undefined;
}

function isUrl(value?: string): boolean {
  return !!value && /^https?:\/\//i.test(value);
}

function sectionRange(
  lines: string[],
  startLabel: string,
  endLabels: string[],
): [number, number] | null {
  const start = findLine(lines, startLabel);
  if (start === -1) return null;

  const endIndexes = endLabels
    .map((label) => findLine(lines, label))
    .filter((index) => index > start);

  const end = endIndexes.length ? Math.min(...endIndexes) : lines.length;
  return [start + 1, end];
}

function cleanRichText(lines: string[]): string {
  return lines
    .map(clean)
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function parseImageBlock(
  lines: string[],
  heading: string,
  nextHeadings: string[],
): ImageMeta | undefined {
  const range = sectionRange(lines, heading, nextHeadings);
  if (!range) return undefined;

  const block = lines.slice(range[0], range[1]);
  const url = valueAfterLabel(block, "Image URL");
  if (!isUrl(url)) return undefined;

  return {
    url: url!,
    alt: valueAfterLabel(block, "Alternative Text"),
    caption: valueAfterLabel(block, "Caption"),
    credit: valueAfterLabel(block, "Photo Credit") ||
      valueAfterLabel(block, "Photo Credit / Attribution"),
    sourceUrl: valueAfterLabel(block, "Source URL"),
    license: valueAfterLabel(block, "License"),
  };
}

function parseGallery(lines: string[]): ImageMeta[] {
  const range = sectionRange(lines, "Image Gallery", ["District Overview"]);
  if (!range) return [];

  const block = lines.slice(range[0], range[1]);
  const starts: number[] = [];
  block.forEach((line, index) => {
    if (/^Gallery Image \d+$/i.test(line)) starts.push(index);
  });

  const images: ImageMeta[] = [];
  starts.forEach((start, i) => {
    const end = starts[i + 1] ?? block.length;
    const entry = block.slice(start + 1, end);
    const url = valueAfterLabel(entry, "Image URL");
    if (!isUrl(url)) return;

    images.push({
      url: url!,
      alt: valueAfterLabel(entry, "Alternative Text"),
      caption: valueAfterLabel(entry, "Caption"),
      credit:
        valueAfterLabel(entry, "Photo Credit / Attribution") ||
        valueAfterLabel(entry, "Photo Credit"),
      sourceUrl: valueAfterLabel(entry, "Source URL"),
      license: valueAfterLabel(entry, "License"),
    });
  });

  return images;
}

function parsePlaces(lines: string[]): ParsedPlace[] {
  const range = sectionRange(lines, "Places to Visit", ["SEO"]);
  if (!range) return [];

  const block = lines.slice(range[0], range[1]);
  const starts: number[] = [];
  block.forEach((line, index) => {
    if (/^Place \d+$/i.test(line)) starts.push(index);
  });

  const places: ParsedPlace[] = [];
  starts.forEach((start, i) => {
    const end = starts[i + 1] ?? block.length;
    const entry = block.slice(start + 1, end);

    const name = valueAfterLabel(entry, "Place Name") || "";
    const slug = valueAfterLabel(entry, "Slug");

    const descriptionStart = findLine(entry, "Description");
    const imageStart = findLine(entry, "Place Image URL");
    const altStart = findLine(entry, "Alternative Text");
    const descriptionEndCandidates = [imageStart, altStart].filter(
      (idx) => idx > descriptionStart,
    );
    const descriptionEnd = descriptionEndCandidates.length
      ? Math.min(...descriptionEndCandidates)
      : entry.length;

    const description =
      descriptionStart === -1
        ? ""
        : cleanRichText(entry.slice(descriptionStart + 1, descriptionEnd));

    const imageUrl = valueAfterLabel(entry, "Place Image URL");
    const image = isUrl(imageUrl)
      ? {
          url: imageUrl!,
          alt: valueAfterLabel(entry, "Alternative Text"),
          caption: valueAfterLabel(entry, "Caption"),
          credit:
            valueAfterLabel(entry, "Photo Credit / Attribution") ||
            valueAfterLabel(entry, "Photo Credit"),
          sourceUrl: valueAfterLabel(entry, "Source URL"),
          license: valueAfterLabel(entry, "License"),
        }
      : undefined;

    if (name) {
      places.push({ name, slug, description, image });
    }
  });

  return places;
}

function parseDistrict(lines: string[]): ParsedDistrict {
  const name = clean(valueAfterLabel(lines, "District Name")) || clean(lines[0]);
  const slug =
    clean(valueAfterLabel(lines, "Slug")) ||
    name.toLowerCase().replace(/\s+district$/i, "").replace(/\s+/g, "-");
  const provinceName = clean(valueAfterLabel(lines, "Province"));

  const elevationText = valueAfterLabel(lines, "Elevation (meters)");
  const elevation = exactNumberFromText(elevationText);
  if (elevationText && elevation === undefined) {
    console.warn(
      `⚠️ Elevation for ${name} is a range/text (${JSON.stringify(
        elevationText,
      )}). It will be preserved as text for review and omitted from the numeric field.`,
    );
  }

  const latitude = numberFromText(valueAfterLabel(lines, "Latitude"));
  const longitude = numberFromText(valueAfterLabel(lines, "Longitude"));

  const coverImage = parseImageBlock(lines, "Cover Image", [
    "District Map",
    "Image Gallery",
  ]);

  const mapImage = parseImageBlock(lines, "District Map", ["Image Gallery"]);

  const gallery = parseGallery(lines);
  const places = parsePlaces(lines);

  const overviewRange = sectionRange(lines, "District Overview", [
    "How to Get There",
  ]);
  const gettingThereRange = sectionRange(lines, "How to Get There", [
    "Culture & History",
  ]);
  const cultureRange = sectionRange(lines, "Culture & History", [
    "Best Time to Visit",
  ]);
  const bestTimeRange = sectionRange(lines, "Best Time to Visit", [
    "Places to Visit",
  ]);

  const socialUrl = valueAfterLabel(lines, "Social Share Image URL");
  const socialImage = isUrl(socialUrl)
    ? {
        url: socialUrl!,
        alt: valueAfterLabel(lines, "Social Share Image Alt Text"),
        sourceUrl: socialUrl,
      }
    : undefined;

  return {
    name,
    slug,
    provinceName,
    headquarter: valueAfterLabel(lines, "District Headquarters"),
    population: numberFromText(valueAfterLabel(lines, "Total Population")),
    area: numberFromText(valueAfterLabel(lines, "Area (sq km)")),
    elevation,
    elevationText,
    density: numberFromText(valueAfterLabel(lines, "Population Density (per sq km)")),
    coordinates:
      latitude !== undefined && longitude !== undefined
        ? { lat: latitude, lng: longitude }
        : undefined,
    mapEmbedUrl: valueAfterLabel(lines, "Google Maps Embed URL"),
    overview: overviewRange
      ? cleanRichText(lines.slice(overviewRange[0], overviewRange[1]))
      : "",
    howToGetThere: gettingThereRange
      ? cleanRichText(lines.slice(gettingThereRange[0], gettingThereRange[1]))
      : "",
    cultureAndHistory: cultureRange
      ? cleanRichText(lines.slice(cultureRange[0], cultureRange[1]))
      : "",
    bestTimeToVisit: bestTimeRange
      ? cleanRichText(lines.slice(bestTimeRange[0], bestTimeRange[1]))
      : "",
    coverImage,
    mapImage,
    gallery,
    places,
    seo: {
      metaTitle: valueAfterLabel(lines, "Meta Title"),
      metaDescription: valueAfterLabel(lines, "Meta Description"),
      socialImage,
    },
  };
}

function makeKey(prefix = "k") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toPortableText(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: "block",
      _key: makeKey("block"),
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: makeKey("span"),
          text: paragraph.replace(/\s+/g, " "),
          marks: [],
        },
      ],
    }));
}

function extensionFromContentType(contentType: string | null) {
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
}

function safeFilename(value: string) {
  return value
    .replace(/https?:\/\//gi, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-120);
}

const assetCache = new Map<string, string>();

async function uploadImage(image: ImageMeta | undefined, label: string) {
  if (!image?.url) return undefined;
  if (assetCache.has(image.url)) {
    return {
      _type: "image",
      asset: { _type: "reference", _ref: assetCache.get(image.url)! },
      ...(image.alt ? { alt: image.alt } : {}),
      ...(image.caption ? { caption: image.caption } : {}),
      ...(image.credit ? { credit: image.credit } : {}),
      ...(image.sourceUrl ? { sourceUrl: image.sourceUrl } : {}),
      ...(image.license ? { license: image.license } : {}),
    };
  }

  try {
    console.log(`⬇️ Downloading ${label}: ${image.url}`);
    const response = await fetch(image.url, {
      redirect: "follow",
      headers: { "User-Agent": "BloggyNepal Content Importer/1.0" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      throw new Error(
        `Expected image content, received ${contentType || "unknown"}`,
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const extension = extensionFromContentType(contentType);
    const asset = await client.assets.upload("image", buffer, {
      filename: `${safeFilename(label)}.${extension}`,
      contentType,
    });

    assetCache.set(image.url, asset._id);

    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      ...(image.alt ? { alt: image.alt } : {}),
      ...(image.caption ? { caption: image.caption } : {}),
      ...(image.credit ? { credit: image.credit } : {}),
      ...(image.sourceUrl ? { sourceUrl: image.sourceUrl } : {}),
      ...(image.license ? { license: image.license } : {}),
    };
  } catch (error) {
    console.warn(
      `⚠️ Could not import image ${label}: ${(error as Error).message}`,
    );
    return undefined;
  }
}

async function findProvinceId(provinceName: string) {
  const cleanName = provinceName.replace(/\s+Province$/i, "").trim();
  const slug = cleanName.toLowerCase().replace(/\s+/g, "-");

  const result = await client.fetch<{ _id: string } | null>(
    `*[_type == "province" && slug.current == $slug][0]{_id}`,
    { slug },
  );

  if (result?._id) return result._id;

  return client.fetch<{ _id: string } | null>(
    `*[_type == "province" && lower(name) == lower($name)][0]{_id}`,
    { name: cleanName },
  ).then((doc) => doc?._id);
}

function printValidation(district: ParsedDistrict) {
  console.log("\n📋 Import validation");
  console.log("────────────────────────────");
  console.log(`${district.name} → ${district.slug}`);
  console.log(`Province: ${district.provinceName || "❌ missing"}`);
  console.log(`Headquarters: ${district.headquarter || "❌ missing"}`);
  console.log(`Population: ${district.population ?? "❌ missing"}`);
  console.log(`Area: ${district.area ?? "❌ missing"}`);
  console.log(`Elevation: ${district.elevation ?? (district.elevationText ? `⚠️ ${district.elevationText}` : "❌ missing")}`);
  console.log(`Density: ${district.density ?? "❌ missing"}`);
  console.log(`Coordinates: ${district.coordinates ? `${district.coordinates.lat}, ${district.coordinates.lng}` : "❌ missing"}`);
  console.log(`Map URL: ${district.mapEmbedUrl ? "✅" : "❌ missing"}`);
  console.log(`Cover image: ${district.coverImage ? "✅" : "❌ missing"}`);
  console.log(`District map: ${district.mapImage ? "✅" : "❌ missing"}`);
  console.log(`Gallery: ${district.gallery.length}`);
  console.log(`Places: ${district.places.length}`);
  console.log(`Overview: ${district.overview ? "✅" : "❌ missing"}`);
  console.log(`How to Get There: ${district.howToGetThere ? "✅" : "❌ missing"}`);
  console.log(`Culture & History: ${district.cultureAndHistory ? "✅" : "❌ missing"}`);
  console.log(`Best Time: ${district.bestTimeToVisit ? "✅" : "❌ missing"}`);
  console.log(`SEO title: ${district.seo.metaTitle ? "✅" : "❌ missing"}`);
  console.log(`SEO description: ${district.seo.metaDescription ? "✅" : "❌ missing"}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const docxPath = args.find((arg) => !arg.startsWith("--"));

  if (!docxPath) {
    throw new Error(
      'Usage: npm run import:district -- "path/to/District Tourism Content.docx" [--dry-run]',
    );
  }

  const absolutePath = path.resolve(docxPath);
  const buffer = await fs.readFile(absolutePath);
  const result = await mammoth.extractRawText({ buffer });
  const lines = normalizeLines(result.value);
  const district = parseDistrict(lines);

  console.log(`\n📍 ${district.name}`);
  console.log(`   slug: ${district.slug}`);
  console.log(`   province: ${district.provinceName}`);
  console.log(`   places: ${district.places.length}`);
  console.log(`   gallery: ${district.gallery.length}`);

  printValidation(district);

  if (dryRun) {
    console.log("\n✅ Dry run only. Nothing was written to Sanity.");
    return;
  }

  const provinceId = await findProvinceId(district.provinceName);
  if (!provinceId) {
    throw new Error(
      `Could not find province '${district.provinceName}' in Sanity. Create that province first.`,
    );
  }

  const coverImage = await uploadImage(district.coverImage, `${district.slug}-cover`);
  const mapImage = await uploadImage(district.mapImage, `${district.slug}-map`);

  const gallery = [];
  for (const [index, image] of district.gallery.entries()) {
    const uploaded = await uploadImage(image, `${district.slug}-gallery-${index + 1}`);
    if (uploaded) gallery.push({ _key: makeKey("gallery"), ...uploaded });
  }

  const places = [];
  for (const [index, place] of district.places.entries()) {
    const image = await uploadImage(place.image, `${district.slug}-place-${index + 1}`);
    places.push({
      _key: makeKey("place"),
      name: place.name,
      description: toPortableText(place.description),
      ...(image ? { image } : {}),
    });
  }

  const socialImage = await uploadImage(district.seo.socialImage, `${district.slug}-social`);

  const document: Record<string, unknown> = {
    _id: `district-${district.slug}`,
    _type: "district",
    name: district.name,
    slug: { _type: "slug", current: district.slug },
    province: { _type: "reference", _ref: provinceId },
    ...(district.headquarter ? { headquarter: district.headquarter } : {}),
    ...(district.population !== undefined ? { population: district.population } : {}),
    ...(district.area !== undefined ? { area: district.area } : {}),
    ...(district.elevation !== undefined ? { elevation: district.elevation } : {}),
    ...(district.density !== undefined ? { density: district.density } : {}),
    ...(district.coordinates ? { coordinates: district.coordinates } : {}),
    ...(district.mapEmbedUrl ? { mapEmbedUrl: district.mapEmbedUrl } : {}),
    ...(coverImage ? { coverImage } : {}),
    ...(mapImage ? { mapImage } : {}),
    ...(gallery.length ? { gallery } : {}),
    ...(district.overview ? { body: toPortableText(district.overview) } : {}),
    ...(district.howToGetThere ? { howToGetThere: toPortableText(district.howToGetThere) } : {}),
    ...(district.cultureAndHistory ? { cultureAndHistory: toPortableText(district.cultureAndHistory) } : {}),
    ...(district.bestTimeToVisit ? { bestTimeToVisit: toPortableText(district.bestTimeToVisit) } : {}),
    ...(places.length ? { places } : {}),
    ...(district.seo.metaTitle || district.seo.metaDescription || socialImage
      ? {
          seo: {
            ...(district.seo.metaTitle ? { metaTitle: district.seo.metaTitle } : {}),
            ...(district.seo.metaDescription ? { metaDescription: district.seo.metaDescription } : {}),
            ...(socialImage ? { ogImage: socialImage } : {}),
          },
        }
      : {}),
  };

  const resultDoc = await client.createOrReplace(document);

  console.log(`\n✅ Imported ${district.name}`);
  console.log(`   Sanity document ID: ${resultDoc._id}`);
  console.log("👉 Refresh Sanity Studio and open Districts.");
}

main().catch((error) => {
  console.error("\n❌ Import failed:");
  console.error(error);
  process.exit(1);
});