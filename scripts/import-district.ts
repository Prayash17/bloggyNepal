import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mammoth from "mammoth";
import { createClient } from "@sanity/client";
import "dotenv/config";

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
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing Sanity environment variables. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN",
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "published",
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clean(value: string | undefined): string {
  return (value || "").replace(/\uFEFF/g, "").trim();
}

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function findLine(lines: string[], label: string): number {
  return lines.findIndex((line) => line.toLowerCase() === label.toLowerCase());
}

function valueAfterLabel(lines: string[], label: string): string | undefined {
  const index = findLine(lines, label);
  if (index === -1) return undefined;
  return clean(lines[index + 1]);
}

function numberFromText(value?: string): number | undefined {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function exactNumberFromText(value?: string): number | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/,/g, "").trim();
  const match = normalized.match(/^-?\d+(?:\.\d+)?$/);
  return match ? Number(match[0]) : undefined;
}

function provinceSlugFromName(name: string): string {
  return name
    .replace(/province/gi, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function splitSection(
  lines: string[],
  startLabel: string,
  endLabels: string[],
): string[] {
  const start = findLine(lines, startLabel);
  if (start === -1) return [];

  const endIndexes = endLabels
    .map((label) => findLine(lines, label))
    .filter((index) => index > start);

  const end = endIndexes.length ? Math.min(...endIndexes) : lines.length;
  return lines.slice(start + 1, end);
}

function sectionParagraphs(
  lines: string[],
  startLabel: string,
  endLabels: string[],
): string {
  return splitSection(lines, startLabel, endLabels).join("\n\n").trim();
}

function parseUrlImageBlock(lines: string[], heading: string): ImageMeta | undefined {
  const start = findLine(lines, heading);
  if (start === -1) return undefined;

  const nextHeadings = [
    "Cover Image",
    "District Map",
    "Image Gallery",
    "Places",
    "SEO",
  ].filter((label) => label.toLowerCase() !== heading.toLowerCase());

  const nextIndexes = nextHeadings
    .map((label) => findLine(lines, label))
    .filter((index) => index > start);
  const end = nextIndexes.length ? Math.min(...nextIndexes) : lines.length;

  const block = lines.slice(start + 1, end);
  const url = valueAfterLabel(block, "Image URL");
  if (!url || !/^https?:\/\//i.test(url)) return undefined;

  return {
    url,
    alt: valueAfterLabel(block, "Alternative Text"),
    credit: valueAfterLabel(block, "Photo Credit"),
    license: valueAfterLabel(block, "License"),
    sourceUrl: url,
  };
}

function parseGallery(lines: string[]): ImageMeta[] {
  const start = findLine(lines, "Image Gallery");
  if (start === -1) return [];

  const end = findLine(lines, "Places");
  const block = lines.slice(start + 1, end === -1 ? lines.length : end);
  const entryStarts: number[] = [];

  block.forEach((line, index) => {
    if (/^Gallery Image \d+/i.test(line)) entryStarts.push(index);
  });

  return entryStarts.map((entryStart, i) => {
    const entryEnd = entryStarts[i + 1] ?? block.length;
    const entry = block.slice(entryStart + 1, entryEnd);
    const url = valueAfterLabel(entry, "Image URL");
    return {
      url: url || "",
      alt: valueAfterLabel(entry, "Alternative Text"),
      credit: valueAfterLabel(entry, "Photo Credit"),
      license: valueAfterLabel(entry, "License"),
      sourceUrl: url,
    };
  }).filter((image) => /^https?:\/\//i.test(image.url));
}

function extractBetweenLines(
  lines: string[],
  startIndex: number,
  endIndex: number,
): string[] {
  return lines.slice(startIndex, endIndex).filter(Boolean);
}

function parsePlaces(lines: string[]): ParsedPlace[] {
  const start = findLine(lines, "Places");
  if (start === -1) return [];

  const end = findLine(lines, "SEO");
  const block = lines.slice(start + 1, end === -1 ? lines.length : end);

  const entryStarts: number[] = [];
  block.forEach((line, index) => {
    if (/^\d+\.\s+/.test(line)) entryStarts.push(index);
  });

  return entryStarts.map((entryStart, i) => {
    const entryEnd = entryStarts[i + 1] ?? block.length;
    const rawName = block[entryStart].replace(/^\d+\.\s+/, "").trim();
    const entry = block.slice(entryStart + 1, entryEnd);

    const descStart = findLine(entry, "Description");
    const descEndCandidates = [
      findLine(entry, "Image URL"),
      findLine(entry, "Alternative Text"),
      findLine(entry, "Photo Credit"),
      findLine(entry, "License"),
    ].filter((index) => index > descStart);
    const descEnd = descEndCandidates.length
      ? Math.min(...descEndCandidates)
      : entry.length;

    const description =
      descStart === -1
        ? ""
        : entry.slice(descStart + 1, descEnd).join("\n\n").trim();

    const imageUrl = valueAfterLabel(entry, "Image URL");
    const imageAlt = valueAfterLabel(entry, "Alternative Text");

    return {
      name: rawName,
      description,
      image:
        imageUrl && /^https?:\/\//i.test(imageUrl)
          ? {
              url: imageUrl,
              alt: imageAlt,
              credit: valueAfterLabel(entry, "Photo Credit"),
              license: valueAfterLabel(entry, "License"),
              sourceUrl: imageUrl,
            }
          : undefined,
    };
  });
}

function parseDistrict(lines: string[]): ParsedDistrict {
  const name = clean(valueAfterLabel(lines, "Name")) || clean(lines[0]);
  const slug = clean(valueAfterLabel(lines, "Slug")) || name.toLowerCase().replace(/\s+/g, "-");
  const provinceName = clean(valueAfterLabel(lines, "Province"));

  const elevationText = valueAfterLabel(lines, "Elevation");
  const elevation = exactNumberFromText(elevationText);
  if (elevationText && elevation === undefined) {
    console.warn(
      `⚠️ Elevation for ${name} is a range/text (${JSON.stringify(elevationText)}). It will be left empty instead of guessing a number.`,
    );
  }

  const lat = numberFromText(valueAfterLabel(lines, "Latitude"));
  const lng = numberFromText(valueAfterLabel(lines, "Longitude"));

  const gallery = parseGallery(lines);

  return {
    name,
    slug,
    provinceName,
    headquarter: valueAfterLabel(lines, "Headquarters"),
    population: numberFromText(valueAfterLabel(lines, "Population")),
    area: numberFromText(valueAfterLabel(lines, "Area")),
    elevation,
    density: numberFromText(valueAfterLabel(lines, "Population Density")),
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    mapEmbedUrl: valueAfterLabel(lines, "Google Maps Embed"),
    overview: sectionParagraphs(lines, "Overview", ["Getting There"]),
    howToGetThere: sectionParagraphs(lines, "Getting There", [
      "Culture and History",
    ]),
    cultureAndHistory: sectionParagraphs(lines, "Culture and History", [
      "Best Time to Visit",
    ]),
    bestTimeToVisit: sectionParagraphs(lines, "Best Time to Visit", [
      "Main Images",
    ]),
    coverImage: parseUrlImageBlock(lines, "Cover Image"),
    mapImage: parseUrlImageBlock(lines, "District Map"),
    gallery,
    places: parsePlaces(lines),
    seo: {
      metaTitle: valueAfterLabel(lines, "Meta Title"),
      metaDescription: valueAfterLabel(lines, "Meta Description"),
      socialImage: (() => {
        const url = valueAfterLabel(lines, "Social Image");
        if (!url || !/^https?:\/\//i.test(url)) return undefined;
        return {
          url,
          alt: valueAfterLabel(lines, "Social Image Alt Text"),
          sourceUrl: url,
        };
      })(),
    },
  };
}

function toPortableText(value: string | undefined) {
  if (!value) return [];

  return value
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: "block",
      _key: `block-${Math.random().toString(36).slice(2, 10)}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `span-${Math.random().toString(36).slice(2, 10)}`,
          text: paragraph.replace(/\s+/g, " "),
          marks: [],
        },
      ],
    }));
}

function randomKey() {
  return Math.random().toString(36).slice(2, 12);
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
    const ref = assetCache.get(image.url)!;
    return {
      _type: "image",
      asset: { _type: "reference", _ref: ref },
      alt: image.alt,
      caption: image.caption,
      credit: image.credit,
      sourceUrl: image.sourceUrl || image.url,
      license: image.license,
    };
  }

  try {
    console.log(`⬇️  Downloading ${label}: ${image.url}`);
    const response = await fetch(image.url, {
      redirect: "follow",
      headers: {
        "User-Agent": "BloggyNepal Content Importer/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Expected image content, received ${contentType || "unknown"}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const extension = extensionFromContentType(contentType);
    const filename = `${safeFilename(label)}.${extension}`;

    console.log(`⬆️  Uploading ${label} to Sanity...`);
    const asset = await client.assets.upload("image", buffer, {
      filename,
      contentType,
    });

    assetCache.set(image.url, asset._id);

    return {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: image.alt,
      caption: image.caption,
      credit: image.credit,
      sourceUrl: image.sourceUrl || image.url,
      license: image.license,
    };
  } catch (error) {
    console.warn(
      `⚠️  Could not import image ${label}: ${(error as Error).message}`,
    );
    return undefined;
  }
}

async function findProvinceId(provinceName: string) {
  const slug = provinceSlugFromName(provinceName);

  const bySlug = await client.fetch<{ _id: string } | null>(
    `*[_type == "province" && slug.current == $slug][0]{_id}`,
    { slug },
  );

  if (bySlug?._id) return bySlug._id;

  const byName = await client.fetch<{ _id: string } | null>(
    `*[_type == "province" && lower(name) == lower($name)][0]{_id}`,
    { name: provinceName.replace(/\s+Province$/i, "") },
  );

  return byName?._id;
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

  if (dryRun) {
    console.log("\n✅ Dry run only. Nothing was written to Sanity.");
    console.dir(district, { depth: null });
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
    const uploaded = await uploadImage(
      image,
      `${district.slug}-gallery-${index + 1}`,
    );
    if (uploaded) {
      gallery.push({ _key: randomKey(), ...uploaded });
    }
    await sleep(150);
  }

  const places = [];
  for (const [index, place] of district.places.entries()) {
    const image = await uploadImage(
      place.image,
      `${district.slug}-${place.name}-${index + 1}`,
    );

    places.push({
      _key: randomKey(),
      name: place.name,
      description: toPortableText(place.description),
      ...(image ? { image } : {}),
    });

    await sleep(150);
  }

  const socialImage = await uploadImage(
    district.seo.socialImage,
    `${district.slug}-social`,
  );

  const document: Record<string, unknown> = {
    _id: `district-${district.slug}`,
    _type: "district",
    name: district.name,
    slug: { _type: "slug", current: district.slug },
    province: {
      _type: "reference",
      _ref: provinceId,
    },
    ...(district.headquarter ? { headquarter: district.headquarter } : {}),
    ...(district.population !== undefined
      ? { population: district.population }
      : {}),
    ...(district.area !== undefined ? { area: district.area } : {}),
    ...(district.elevation !== undefined
      ? { elevation: district.elevation }
      : {}),
    ...(district.density !== undefined ? { density: district.density } : {}),
    ...(district.coordinates ? { coordinates: district.coordinates } : {}),
    ...(district.mapEmbedUrl ? { mapEmbedUrl: district.mapEmbedUrl } : {}),
    ...(coverImage ? { coverImage } : {}),
    ...(mapImage ? { mapImage } : {}),
    ...(gallery.length ? { gallery } : {}),
    ...(district.overview ? { body: toPortableText(district.overview) } : {}),
    ...(district.howToGetThere
      ? { howToGetThere: toPortableText(district.howToGetThere) }
      : {}),
    ...(district.cultureAndHistory
      ? { cultureAndHistory: toPortableText(district.cultureAndHistory) }
      : {}),
    ...(district.bestTimeToVisit
      ? { bestTimeToVisit: toPortableText(district.bestTimeToVisit) }
      : {}),
    ...(places.length ? { places } : {}),
    seo: {
      ...(district.seo.metaTitle
        ? { metaTitle: district.seo.metaTitle }
        : {}),
      ...(district.seo.metaDescription
        ? { metaDescription: district.seo.metaDescription }
        : {}),
      ...(socialImage ? { ogImage: socialImage } : {}),
    },
  };

  const resultDoc = await client.createOrReplace(document);

  console.log(`\n✅ Imported ${district.name}`);
  console.log(`   Sanity document ID: ${resultDoc._id}`);
  console.log(`   https://${projectId}.api.sanity.io (project API endpoint)`);
}

main().catch((error) => {
  console.error("\n❌ Import failed:");
  console.error(error);
  process.exit(1);
});