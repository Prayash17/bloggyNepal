import path from "path";
import fs from "fs";
import { config } from "dotenv";
import mammoth from "mammoth";
import { createClient } from "@sanity/client";

/* ============================================================
   ENVIRONMENT
============================================================ */

config({
  path: path.resolve(process.cwd(), ".env.local"),
});

/* ============================================================
   SANITY
============================================================ */

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

const token =
  process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error(
    [
      "Missing Sanity environment variables.",
      "",
      "Required in .env.local:",
      "NEXT_PUBLIC_SANITY_PROJECT_ID",
      "NEXT_PUBLIC_SANITY_DATASET",
      "SANITY_WRITE_TOKEN",
    ].join("\n")
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

/* ============================================================
   COMMAND LINE
============================================================ */

const args = process.argv.slice(2);

const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");

const positionalArguments = args.filter(
  (arg) => !arg.startsWith("--")
);

const DEFAULT_DOCX_PATH = path.resolve(
  "D:\\District Docs\\Nepal all district detail.docx"
);

const DOCX_PATH = path.resolve(
  positionalArguments[0] ?? DEFAULT_DOCX_PATH
);

/* ============================================================
   TYPES
============================================================ */

interface GalleryItem {
  name: string;
  imageUrl?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  license?: string;
}

interface ParsedDistrict {
  name: string;
  slug: string;

  provinceName?: string;
  category?: string;

  shortDescription?: string;

  highlights: string[];

  bestTimeToVisit?: string;
  gettingThere?: string;
  thingsToDo?: string;
  nearbyAttractions?: string;

  latitude?: number;
  longitude?: number;

  gallery: GalleryItem[];

  metaTitle?: string;
  metaDescription?: string;

  socialImageUrl?: string;
  socialImageAlt?: string;
}

/* ============================================================
   EXPECTED 77 DISTRICTS
============================================================ */

const EXPECTED_DISTRICTS: string[] = [
  "Achham",
  "Arghakhanchi",
  "Baglung",
  "Baitadi",
  "Bajhang",
  "Bajura",
  "Banke",
  "Bardiya",
  "Bara",
  "Bhaktapur",
  "Bhojpur",
  "Chitwan",
  "Dadeldhura",
  "Dailekh",
  "Dang",
  "Darchula",
  "Dhading",
  "Dhankuta",
  "Dhanusha",
  "Dolakha",
  "Dolpa",
  "Doti",
  "Gorkha",
  "Gulmi",
  "Humla",
  "Ilam",
  "Jajarkot",
  "Jhapa",
  "Jumla",
  "Kailali",
  "Kalikot",
  "Kanchanpur",
  "Kapilvastu",
  "Kaski",
  "Kavrepalanchok",
  "Khotang",
  "Kathmandu",
  "Lalitpur",
  "Lamjung",
  "Mahottari",
  "Makwanpur",
  "Manang",
  "Morang",
  "Mugu",
  "Mustang",
  "Myagdi",
  "Nawalpur",
  "Nuwakot",
  "Okhaldhunga",
  "Palpa",
  "Panchthar",
  "Parasi",
  "Parbat",
  "Parsa",
  "Pyuthan",
  "Ramechhap",
  "Rasuwa",
  "Rautahat",
  "Rolpa",
  "Rukum East",
  "Rukum West",
  "Rupandehi",
  "Salyan",
  "Sankhuwasabha",
  "Saptari",
  "Sarlahi",
  "Sindhuli",
  "Sindhupalchok",
  "Siraha",
  "Solukhumbu",
  "Sunsari",
  "Surkhet",
  "Syangja",
  "Tanahun",
  "Taplejung",
  "Terhathum",
  "Udayapur",
];

if (EXPECTED_DISTRICTS.length !== 77) {
  throw new Error(
    `Internal error: EXPECTED_DISTRICTS contains ${EXPECTED_DISTRICTS.length} districts instead of 77.`
  );
}

/* ============================================================
   EXISTING ALIASES
============================================================ */

const DISTRICT_ALIASES: Record<string, string> = {
  "nawalparasi east": "Nawalpur",
  "nawalparasi (east)": "Nawalpur",
  "nawalparasi west": "Parasi",
  "nawalparasi (west)": "Parasi",
  nawalparasiwest: "Parasi",

  "nawalpur district": "Nawalpur",
  "parasi district": "Parasi",

  "rukum east": "Rukum East",
  "rukum west": "Rukum West",

  "eastern rukum": "Rukum East",
  easternrukum: "Rukum East",

  "western rukum": "Rukum West",
  westernrukum: "Rukum West",

  kavre: "Kavrepalanchok",
  kavrepalanchowk: "Kavrepalanchok",

  "kathmandu district": "Kathmandu",
  "kaski district": "Kaski",
  "salyan district": "Salyan",

  sindhupalchowk: "Sindhupalchok",
  "kapilvastu district": "Kapilvastu",
  "terhathum district": "Terhathum",

  dhanusa: "Dhanusha",
  "dhanusa district": "Dhanusha",
};

/* ============================================================
   PROVINCES
============================================================ */

const PROVINCES: Record<string, string> = {
  koshi: "province-koshi",
  "koshi province": "province-koshi",

  madhesh: "province-madhesh",
  "madhesh province": "province-madhesh",

  bagmati: "province-bagmati",
  "bagmati province": "province-bagmati",

  gandaki: "province-gandaki",
  "gandaki province": "province-gandaki",

  lumbini: "province-lumbini",
  "lumbini province": "province-lumbini",

  karnali: "province-karnali",
  "karnali province": "province-karnali",

  sudurpashchim: "province-sudurpashchim",
  "sudurpashchim province": "province-sudurpashchim",

  sudurpaschim: "province-sudurpashchim",
  "sudurpaschim province": "province-sudurpashchim",

  "sudur pashchim": "province-sudurpashchim",
  "sudur pashchim province":
    "province-sudurpashchim",

  "province 1": "province-koshi",
  "province 2": "province-madhesh",
  "province 3": "province-bagmati",
  "province 4": "province-gandaki",
  "province 5": "province-lumbini",
  "province 6": "province-karnali",
  "province 7": "province-sudurpashchim",

  "province no. 1": "province-koshi",
  "province no 1": "province-koshi",

  "province no. 2": "province-madhesh",
  "province no 2": "province-madhesh",

  "province no. 3": "province-bagmati",
  "province no 3": "province-bagmati",

  "province no. 4": "province-gandaki",
  "province no 4": "province-gandaki",

  "province no. 5": "province-lumbini",
  "province no 5": "province-lumbini",

  "province no. 6": "province-karnali",
  "province no 6": "province-karnali",

  "province no. 7": "province-sudurpashchim",
  "province no 7": "province-sudurpashchim",
};

/* ============================================================
   DISTRICT -> PROVINCE FALLBACK
============================================================ */

const DISTRICT_PROVINCES: Record<string, string> = {
  /* Koshi */
  ilam: "province-koshi",
  jhapa: "province-koshi",
  morang: "province-koshi",
  sunsari: "province-koshi",
  dhankuta: "province-koshi",
  bhojpur: "province-koshi",
  sankhuwasabha: "province-koshi",
  terhathum: "province-koshi",
  panchthar: "province-koshi",
  taplejung: "province-koshi",
  khotang: "province-koshi",
  okhaldhunga: "province-koshi",
  solukhumbu: "province-koshi",
  udayapur: "province-koshi",

  /* Madhesh */
  saptari: "province-madhesh",
  siraha: "province-madhesh",
  dhanusha: "province-madhesh",
  mahottari: "province-madhesh",
  sarlahi: "province-madhesh",
  rautahat: "province-madhesh",
  bara: "province-madhesh",
  parsa: "province-madhesh",

  /* Bagmati */
  dhading: "province-bagmati",
  nuwakot: "province-bagmati",
  rasuwa: "province-bagmati",
  sindhupalchok: "province-bagmati",
  dolakha: "province-bagmati",
  ramechhap: "province-bagmati",
  sindhuli: "province-bagmati",
  makwanpur: "province-bagmati",
  chitwan: "province-bagmati",
  kathmandu: "province-bagmati",
  lalitpur: "province-bagmati",
  bhaktapur: "province-bagmati",
  kavrepalanchok: "province-bagmati",

  /* Gandaki */
  gorkha: "province-gandaki",
  lamjung: "province-gandaki",
  tanahun: "province-gandaki",
  kaski: "province-gandaki",
  manang: "province-gandaki",
  mustang: "province-gandaki",
  myagdi: "province-gandaki",
  parbat: "province-gandaki",
  baglung: "province-gandaki",
  syangja: "province-gandaki",
  nawalpur: "province-gandaki",

  /* Lumbini */
  rupandehi: "province-lumbini",
  kapilvastu: "province-lumbini",
  palpa: "province-lumbini",
  gulmi: "province-lumbini",
  arghakhanchi: "province-lumbini",
  pyuthan: "province-lumbini",
  rolpa: "province-lumbini",

  "rukum-east": "province-lumbini",

  dang: "province-lumbini",
  banke: "province-lumbini",
  bardiya: "province-lumbini",
  parasi: "province-lumbini",

  /* Karnali */
  dolpa: "province-karnali",
  humla: "province-karnali",
  jumla: "province-karnali",
  kalikot: "province-karnali",
  mugu: "province-karnali",
  surkhet: "province-karnali",
  dailekh: "province-karnali",
  jajarkot: "province-karnali",

  "rukum-west": "province-karnali",

  salyan: "province-karnali",

  /* Sudurpashchim */
  kailali: "province-sudurpashchim",
  achham: "province-sudurpashchim",
  doti: "province-sudurpashchim",
  bajhang: "province-sudurpashchim",
  bajura: "province-sudurpashchim",
  kanchanpur: "province-sudurpashchim",
  dadeldhura: "province-sudurpashchim",
  baitadi: "province-sudurpashchim",
  darchula: "province-sudurpashchim",
};

/* ============================================================
   HELPERS
============================================================ */

function normalize(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/\t+/g, " ")
    .replace(/[•●▪◾]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanText(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\t+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function parseNumber(
  value?: string
): number | undefined {
  if (!value) {
    return undefined;
  }

  const match = value
    .replace(/,/g, "")
    .match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return undefined;
  }

  const number = Number(match[0]);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function slugify(value: string): string {
  return normalize(value)
    .replace(/\bdistrict\b/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => cleanText(line))
    .filter(Boolean);
}

/* ============================================================
   INLINE FIELD EXTRACTION
============================================================ */

function extractInlineField(
  lines: string[],
  label: string
): string | undefined {
  const escaped = escapeRegExp(label);

  const regex = new RegExp(
    `^${escaped}\\s*:\\s*(.+)$`,
    "i"
  );

  for (const rawLine of lines) {
    const line = cleanText(rawLine);

    const match = line.match(regex);

    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return undefined;
}

/* ============================================================
   CANONICAL DISTRICT NAME
============================================================ */

function canonicalizeDistrictName(
  value: string
): string | undefined {
  /*
   * Examples:
   *
   * 77. Darchula (दार्चुला)
   * Nawalparasi West (नवलपरासी पश्चिम)
   * Eastern Rukum (पूर्वी रुकुम)
   * Western Rukum (पश्चिम रुकुम)
   */

  let cleaned = value
    .replace(/^#+\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();

  /*
   * Remove Nepali name in parentheses for
   * canonical English district matching.
   */
  const parenthesisIndex =
    cleaned.indexOf("(");

  if (parenthesisIndex > 0) {
    cleaned = cleaned
      .substring(0, parenthesisIndex)
      .trim();
  }

  /*
   * Remove trailing "District".
   */
  cleaned = cleaned
    .replace(/\s+district\s*$/i, "")
    .trim();

  const normalized =
    normalize(cleaned);

  /*
   * Explicit mappings for district-name
   * variants in the DOCX.
   */
  const aliases: Record<string, string> = {
    /* Nawalparasi / Nawalpur */
    "nawalparasi west": "Parasi",
    "nawalparasi (west)": "Parasi",
    nawalparasiwest: "Parasi",
    parasi: "Parasi",
    "parasi district": "Parasi",

    "nawalparasi east": "Nawalpur",
    "nawalparasi (east)": "Nawalpur",
    nawalparasieast: "Nawalpur",
    nawalpur: "Nawalpur",
    "nawalpur district": "Nawalpur",

    /* Rukum */
    "eastern rukum": "Rukum East",
    easternrukum: "Rukum East",

    "western rukum": "Rukum West",
    westernrukum: "Rukum West",

    "rukum east": "Rukum East",
    rukumeast: "Rukum East",

    "rukum west": "Rukum West",
    rukumwest: "Rukum West",

    /* Other variants */
    dhanusa: "Dhanusha",
    "dhanusa district": "Dhanusha",

    kavre: "Kavrepalanchok",
    kavrepalanchowk: "Kavrepalanchok",

    sindhupalchowk: "Sindhupalchok",

    "kapilvastu district": "Kapilvastu",

    "terhathum district": "Terhathum",

    "kathmandu district": "Kathmandu",

    "kaski district": "Kaski",

    "salyan district": "Salyan",
  };

  const directAlias =
    aliases[normalized];

  if (directAlias) {
    return directAlias;
  }

  /*
   * Compact matching.
   */
  const compact =
    normalized.replace(
      /[^a-z0-9]+/g,
      ""
    );

  const compactAlias =
    aliases[compact];

  if (compactAlias) {
    return compactAlias;
  }

  /*
   * Existing alias table.
   */
  const existingAlias =
    DISTRICT_ALIASES[normalized] ??
    DISTRICT_ALIASES[compact];

  if (existingAlias) {
    return existingAlias;
  }

  /*
   * Match one of the canonical 77 names.
   */
  for (
    const expected
    of EXPECTED_DISTRICTS
  ) {
    const expectedNormalized =
      normalize(expected);

    const expectedCompact =
      expectedNormalized.replace(
        /[^a-z0-9]+/g,
        ""
      );

    if (
      expectedNormalized ===
        normalized ||
      expectedCompact ===
        compact
    ) {
      return expected;
    }
  }

  return undefined;
}

/* ============================================================
   DISTRICT KEY
============================================================ */

function getDistrictKey(
  line: string
): string | undefined {
  const canonical =
    canonicalizeDistrictName(line);

  if (!canonical) {
    return undefined;
  }

  return slugify(canonical);
}

function isDistrictHeading(
  line: string
): boolean {
  return (
    getDistrictKey(line) !== undefined
  );
}

/* ============================================================
   DISTRICT STARTS
============================================================ */

function findDistrictStarts(
  lines: string[]
): number[] {
  const starts: number[] = [];

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    if (
      isDistrictHeading(
        lines[i]
      )
    ) {
      starts.push(i);
    }
  }

  /*
   * Prevent duplicate detection of the same
   * district if Word produces nearby lines.
   */
  const result: number[] = [];

  for (
    const index of starts
  ) {
    const previous =
      result[result.length - 1];

    if (
      previous === undefined ||
      index - previous > 3
    ) {
      result.push(index);
    }
  }

  return result;
}

/* ============================================================
   HIGHLIGHTS
============================================================ */

function parseHighlights(
  lines: string[]
): string[] {
  const highlights: string[] = [];

  const startIndex =
    lines.findIndex(
      (line) =>
        normalize(line) ===
        "highlights:"
    );

  if (startIndex === -1) {
    return highlights;
  }

  const stopLabels = [
    "Best Time to Visit",
    "How to Reach",
    "Things to Do",
    "Nearby Attractions",
    "Gallery Images",
    "Location Coordinates",
  ];

  for (
    let i = startIndex + 1;
    i < lines.length;
    i++
  ) {
    const line =
      cleanText(lines[i]);

    const normalized =
      normalize(line);

    const isNextField =
      stopLabels.some(
        (label) =>
          normalized.startsWith(
            `${normalize(label)}:`
          )
      );

    if (isNextField) {
      break;
    }

    /*
     * Ignore decorative separators.
     */
    if (
      /^[-_=]{5,}$/.test(line) ||
      /^\d+\.?$/.test(line)
    ) {
      continue;
    }

    /*
     * Remove accidental numbering.
     */
    const cleaned =
      line
        .replace(
          /^\d+[.)]\s*/,
          ""
        )
        .trim();

    if (cleaned) {
      highlights.push(cleaned);
    }
  }

  return highlights;
}

/* ============================================================
   GALLERY
============================================================ */

function parseGallery(
  lines: string[]
): GalleryItem[] {
  const value =
    extractInlineField(
      lines,
      "Gallery Images"
    );

  if (!value) {
    return [];
  }

  const urls =
    value
      .split(",")
      .map((url) =>
        cleanText(url)
      )
      .filter(Boolean);

  return urls.map(
    (imageUrl, index) => ({
      name:
        `Gallery Image ${index + 1}`,

      imageUrl,
    })
  );
}

/* ============================================================
   PORTABLE TEXT
============================================================ */

function portableText(
  text?: string,
  keyPrefix = "content"
) {
  if (!text?.trim()) {
    return undefined;
  }

  return [
    {
      _type: "block",
      _key:
        `${keyPrefix}-1`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key:
            `${keyPrefix}-span-1`,
          text: text.trim(),
          marks: [],
        },
      ],
    },
  ];
}

/* ============================================================
   PARSE DISTRICT
============================================================ */

function parseDistrict(
  lines: string[],
  start: number,
  end: number
): ParsedDistrict | null {
  const districtLines =
    lines.slice(start, end);

  const firstLine =
    cleanText(lines[start]);

  /*
   * IMPORTANT:
   * Resolve the canonical district from
   * the heading itself.
   *
   * We deliberately DO NOT trust the DOCX
   * Slug field for the Sanity slug because
   * the DOCX uses:
   *
   * Nawalparasi West
   * Eastern Rukum
   * Western Rukum
   *
   * while the canonical dataset uses:
   *
   * Parasi
   * Rukum East
   * Rukum West
   */
  const canonicalName =
    canonicalizeDistrictName(
      firstLine
    );

  if (!canonicalName) {
    return null;
  }

  const slug =
    slugify(canonicalName);

  /*
   * Actual fields in the DOCX.
   */
  const title =
    extractInlineField(
      districtLines,
      "Title"
    );

  const districtField =
    extractInlineField(
      districtLines,
      "District"
    );

  const provinceName =
    extractInlineField(
      districtLines,
      "Province"
    );

  const category =
    extractInlineField(
      districtLines,
      "Category"
    );

  const shortDescription =
    extractInlineField(
      districtLines,
      "Short Description"
    );

  const bestTimeToVisit =
    extractInlineField(
      districtLines,
      "Best Time to Visit"
    );

  const gettingThere =
    extractInlineField(
      districtLines,
      "How to Reach"
    );

  const thingsToDo =
    extractInlineField(
      districtLines,
      "Things to Do"
    );

  const nearbyAttractions =
    extractInlineField(
      districtLines,
      "Nearby Attractions"
    );

  const coordinates =
    extractInlineField(
      districtLines,
      "Location Coordinates"
    );

  /*
   * Coordinates.
   *
   * Example:
   *
   * 29.8500, 80.5333
   */
  let latitude:
    | number
    | undefined;

  let longitude:
    | number
    | undefined;

  if (coordinates) {
    const parts =
      coordinates.split(",");

    latitude =
      parseNumber(parts[0]);

    longitude =
      parseNumber(parts[1]);
  }

  /*
   * Highlights / places.
   */
  const highlights =
    parseHighlights(
      districtLines
    );

  /*
   * Gallery.
   */
  const gallery =
    parseGallery(
      districtLines
    );

  /*
   * Display name.
   *
   * The Title field preserves the Nepali name:
   *
   * Darchula (दार्चुला)
   */
  const name =
    title ||
    districtField ||
    firstLine.replace(
      /^\d+[.)]\s*/,
      ""
    );

  const cleanName =
    cleanText(name);

  /*
   * SEO.
   */
  const metaTitle =
    `${cleanName} – Travel Guide, Places to Visit & Things to Do`;

  const metaDescription =
    shortDescription
      ? cleanText(
          shortDescription
        )
      : undefined;

  /*
   * First gallery image as social image.
   */
  const socialImageUrl =
    gallery[0]?.imageUrl;

  const socialImageAlt =
    socialImageUrl
      ? `${cleanName} travel photo`
      : undefined;

  return {
    name: cleanName,
    slug,

    provinceName:
      provinceName
        ? cleanText(
            provinceName
          )
        : undefined,

    category:
      category
        ? cleanText(category)
        : undefined,

    shortDescription:
      shortDescription
        ? cleanText(
            shortDescription
          )
        : undefined,

    highlights,

    bestTimeToVisit:
      bestTimeToVisit
        ? cleanText(
            bestTimeToVisit
          )
        : undefined,

    gettingThere:
      gettingThere
        ? cleanText(
            gettingThere
          )
        : undefined,

    thingsToDo:
      thingsToDo
        ? cleanText(
            thingsToDo
          )
        : undefined,

    nearbyAttractions:
      nearbyAttractions
        ? cleanText(
            nearbyAttractions
          )
        : undefined,

    latitude,
    longitude,

    gallery,

    metaTitle,
    metaDescription,

    socialImageUrl,
    socialImageAlt,
  };
}

/* ============================================================
   PROVINCE RESOLUTION
============================================================ */

function getProvinceRef(
  district: ParsedDistrict
): string | undefined {
  /*
   * Prefer the province explicitly present
   * in the DOCX.
   */
  if (district.provinceName) {
    const normalized =
      normalize(
        district.provinceName
      );

    const direct =
      PROVINCES[normalized];

    if (direct) {
      return direct;
    }
  }

  /*
   * Fallback based on canonical slug.
   */
  return DISTRICT_PROVINCES[
    district.slug
  ];
}

/* ============================================================
   COVERAGE
============================================================ */

function validateDistrictCoverage(
  districts: ParsedDistrict[]
) {
  const expected =
    new Set(
      EXPECTED_DISTRICTS.map(
        slugify
      )
    );

  const detected =
    new Set(
      districts.map(
        (district) =>
          district.slug
      )
    );

  const missing =
    [...expected].filter(
      (slug) =>
        !detected.has(slug)
    );

  const unexpected =
    [...detected].filter(
      (slug) =>
        !expected.has(slug)
    );

  return {
    missing,
    unexpected,
  };
}

/* ============================================================
   DATA QUALITY
============================================================ */

function getDistrictQuality(
  district: ParsedDistrict
) {
  const checks = [
    Boolean(district.name),
    Boolean(district.slug),
    Boolean(district.provinceName),
    Boolean(district.category),
    Boolean(district.shortDescription),
    district.highlights.length > 0,
    Boolean(district.bestTimeToVisit),
    Boolean(district.gettingThere),
    Boolean(district.thingsToDo),
    Boolean(district.nearbyAttractions),
    district.latitude !== undefined &&
      district.longitude !== undefined,
    district.gallery.length > 0,
  ];

  const score =
    checks.filter(Boolean).length;

  const max =
    checks.length;

  const percentage =
    Math.round(
      (score / max) * 100
    );

  return {
    score,
    max,
    percentage,
  };
}

/* ============================================================
   BUILD SANITY DOCUMENT
============================================================ */

function buildSanityDocument(
  district: ParsedDistrict,
  provinceRef: string
): Record<string, unknown> {
  const document:
    Record<string, unknown> = {
    _id:
      `district-${district.slug}`,

    _type: "district",

    name:
      district.name,

    slug: {
      _type: "slug",
      current:
        district.slug,
    },

    province: {
      _type: "reference",
      _ref:
        provinceRef,
    },
  };

  /*
   * Category.
   */
  if (district.category) {
    document.category =
      district.category;
  }

  /*
   * Main overview/body.
   */
  const body =
    portableText(
      district.shortDescription,
      `${district.slug}-body`
    );

  if (body) {
    document.body =
      body;
  }

  /*
   * How to get there.
   */
  const howToGetThere =
    portableText(
      district.gettingThere,
      `${district.slug}-getting-there`
    );

  if (howToGetThere) {
    document.howToGetThere =
      howToGetThere;
  }

  /*
   * Things to do.
   */
  const thingsToDo =
    portableText(
      district.thingsToDo,
      `${district.slug}-things-to-do`
    );

  if (thingsToDo) {
    document.thingsToDo =
      thingsToDo;
  }

  /*
   * Best time to visit.
   */
  const bestTime =
    portableText(
      district.bestTimeToVisit,
      `${district.slug}-best-time`
    );

  if (bestTime) {
    document.bestTimeToVisit =
      bestTime;
  }

  /*
   * Nearby attractions.
   */
  if (
    district.nearbyAttractions
  ) {
    document.nearbyAttractions =
      district.nearbyAttractions;
  }

  /*
   * Coordinates.
   */
  if (
    district.latitude !==
      undefined &&
    district.longitude !==
      undefined
  ) {
    document.coordinates = {
      lat:
        district.latitude,

      lng:
        district.longitude,
    };
  }

  /*
   * Highlights -> placeInline.
   *
   * We preserve the actual names from
   * the DOCX and do not invent descriptions.
   */
  if (
    district.highlights.length >
    0
  ) {
    document.places =
      district.highlights.map(
        (
          placeName,
          index
        ) => ({
          _key:
            `${district.slug}-place-${index + 1}`,

          _type:
            "placeInline",

          name:
            cleanText(
              placeName
            ),

          slug: {
            _type: "slug",
            current:
              slugify(
                placeName
              ),
          },
        })
      );
  }

  /*
   * SEO.
   */
  if (
    district.metaTitle ||
    district.metaDescription
  ) {
    document.seo = {
      ...(district.metaTitle
        ? {
            metaTitle:
              district.metaTitle,
          }
        : {}),

      ...(district.metaDescription
        ? {
            metaDescription:
              district.metaDescription,
          }
        : {}),
    };
  }

  /*
   * Gallery.
   *
   * The DOCX contains local paths such as:
   *
   * /images/darchula-1.jpg
   *
   * These are strings, NOT uploaded Sanity
   * image assets. This section assumes
   * your schema has an imageItem object
   * with imageUrl.
   */
  if (
    district.gallery.length >
    0
  ) {
    document.gallery =
      district.gallery.map(
        (
          image,
          index
        ) => ({
          _key:
            `${district.slug}-gallery-${index + 1}`,

          _type:
            "imageItem",

          name:
            image.name,

          imageUrl:
            image.imageUrl,
        })
      );
  }

  return document;
}

/* ============================================================
   DEBUG SUMMARY
============================================================ */

function printDistrictSummary(
  district: ParsedDistrict,
  provinceRef?: string
): void {
  const quality =
    getDistrictQuality(
      district
    );

  console.log(
    `📍 ${district.name}`
  );

  console.log(
    `   slug: ${district.slug}`
  );

  console.log(
    `   province: ${
      district.provinceName ||
      "—"
    }`
  );

  console.log(
    `   provinceRef: ${
      provinceRef ||
      "NOT FOUND"
    }`
  );

  console.log(
    `   category: ${
      district.category ||
      "—"
    }`
  );

  console.log(
    `   highlights: ${
      district.highlights.length
    }`
  );

  console.log(
    `   overview: ${
      district.shortDescription
        ? "✓"
        : "—"
    }`
  );

  console.log(
    `   getting there: ${
      district.gettingThere
        ? "✓"
        : "—"
    }`
  );

  console.log(
    `   things to do: ${
      district.thingsToDo
        ? "✓"
        : "—"
    }`
  );

  console.log(
    `   nearby attractions: ${
      district.nearbyAttractions
        ? "✓"
        : "—"
    }`
  );

  console.log(
    `   best time: ${
      district.bestTimeToVisit
        ? "✓"
        : "—"
    }`
  );

  console.log(
    `   coordinates: ${
      district.latitude ??
      "—"
    }, ${
      district.longitude ??
      "—"
    }`
  );

  console.log(
    `   gallery: ${
      district.gallery.length
    }`
  );

  console.log(
    `   data quality: ${
      quality.score
    }/${quality.max} (${
      quality.percentage
    }%)`
  );

  if (
    district.highlights.length >
    0
  ) {
    console.log(
      "   places:"
    );

    for (
      const place
      of district.highlights
    ) {
      console.log(
        `      - ${place}`
      );
    }
  }

  if (
    VERBOSE &&
    district.gallery.length >
      0
  ) {
    console.log(
      "   gallery images:"
    );

    for (
      const image
      of district.gallery
    ) {
      console.log(
        `      - ${
          image.imageUrl ||
          "—"
        }`
      );
    }
  }
}

/* ============================================================
   FILE VALIDATION
============================================================ */

function validateDocxPath(
  filePath: string
): void {
  console.log(
    "📂 Resolved DOCX path:"
  );

  console.log(
    `   ${filePath}`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `DOCX file not found:\n${filePath}`
    );
  }

  const stats =
    fs.statSync(filePath);

  if (!stats.isFile()) {
    throw new Error(
      `DOCX path is not a file:\n${filePath}`
    );
  }

  if (
    path.extname(filePath).toLowerCase() !==
    ".docx"
  ) {
    console.warn(
      "⚠️ Warning: supplied file does not have a .docx extension."
    );
  }

  console.log(
    `✅ DOCX file found (${
      stats.size.toLocaleString()
    } bytes)`
  );
}

/* ============================================================
   READ DOCX
============================================================ */

async function readDocx(
  filePath: string
): Promise<string[]> {
  console.log("");
  console.log(
    "📖 Reading DOCX..."
  );

  const result =
    await mammoth.extractRawText({
      path: filePath,
    });

  if (
    result.messages.length >
    0
  ) {
    console.log(
      `⚠️ Mammoth reported ${
        result.messages.length
      } message(s).`
    );

    if (VERBOSE) {
      for (
        const message
        of result.messages
      ) {
        console.log(
          `   - ${
            message.message
          }`
        );
      }
    }
  }

  if (!result.value.trim()) {
    throw new Error(
      "The DOCX contains no readable text."
    );
  }

  const lines =
    splitLines(
      result.value
    );

  console.log(
    `📄 Extracted ${
      lines.length
    } non-empty lines`
  );

  return lines;
}

/* ============================================================
   MAIN
============================================================ */

async function main(): Promise<void> {
  console.log("");

  console.log(
    "🇳🇵 BloggyNepal — 77 DISTRICT IMPORTER"
  );

  console.log(
    "=========================================="
  );

  console.log("");

  console.log(
    `📄 DOCX: ${DOCX_PATH}`
  );

  console.log(
    DRY_RUN
      ? "🧪 MODE: DRY RUN"
      : "🚀 MODE: LIVE IMPORT"
  );

  console.log("");

  /*
   * Validate arguments.
   */
  if (
    positionalArguments.length >
    1
  ) {
    throw new Error(
      [
        "Too many DOCX arguments.",
        "",
        "Use:",
        'npm run import:all-districts -- "D:\\District Docs\\file.docx" --dry-run',
      ].join("\n")
    );
  }

  /*
   * Validate the DOCX.
   */
  validateDocxPath(
    DOCX_PATH
  );

  /*
   * Read the DOCX.
   */
  const lines =
    await readDocx(
      DOCX_PATH
    );

  /* ========================================================
     DISTRICT DETECTION
  ======================================================== */

  const starts =
    findDistrictStarts(
      lines
    );

  console.log("");

  console.log(
    `🏔️ Detected ${
      starts.length
    } district sections`
  );

  if (
    starts.length !==
    EXPECTED_DISTRICTS.length
  ) {
    console.log("");

    console.log(
      "⚠️ WARNING: Detected district count is not 77."
    );
  }

  /* ========================================================
     PARSE
  ======================================================== */

  const districts:
    ParsedDistrict[] = [];

  for (
    let i = 0;
    i < starts.length;
    i++
  ) {
    const start =
      starts[i];

    const end =
      i + 1 <
      starts.length
        ? starts[i + 1]
        : lines.length;

    const parsed =
      parseDistrict(
        lines,
        start,
        end
      );

    if (parsed) {
      districts.push(
        parsed
      );
    }
  }

  console.log("");

  console.log(
    `✅ Parsed ${
      districts.length
    } district records`
  );

  /* ========================================================
     CANONICAL SLUG CHECK
  ======================================================== */

  console.log("");

  console.log(
    "🔎 CANONICAL SLUG CHECK:"
  );

  for (
    const district
    of districts
  ) {
    if (
      district.slug === "parasi" ||
      district.slug === "rukum-east" ||
      district.slug === "rukum-west"
    ) {
      console.log(
        `   ✅ ${district.name} → ${district.slug}`
      );
    }
  }

  /* ========================================================
     COVERAGE
  ======================================================== */

  const coverage =
    validateDistrictCoverage(
      districts
    );

  console.log("");

  console.log(
    `EXPECTED DISTRICTS: ${
      EXPECTED_DISTRICTS.length
    }`
  );

  console.log(
    `DETECTED DISTRICTS: ${
      districts.length
    }`
  );

  if (
    coverage.missing.length >
    0
  ) {
    console.log("");

    console.log(
      "⚠️ MISSING DISTRICTS:"
    );

    for (
      const district
      of coverage.missing
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  if (
    coverage.unexpected.length >
    0
  ) {
    console.log("");

    console.log(
      "⚠️ UNEXPECTED DISTRICTS:"
    );

    for (
      const district
      of coverage.unexpected
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  /* ========================================================
     DUPLICATES
  ======================================================== */

  const seen =
    new Set<string>();

  const duplicates:
    string[] = [];

  for (
    const district
    of districts
  ) {
    if (
      seen.has(
        district.slug
      )
    ) {
      duplicates.push(
        district.slug
      );
    }

    seen.add(
      district.slug
    );
  }

  if (
    duplicates.length >
    0
  ) {
    console.log("");

    console.log(
      "⚠️ DUPLICATE SLUGS:"
    );

    for (
      const duplicate
      of duplicates
    ) {
      console.log(
        `   - ${duplicate}`
      );
    }
  }

  /* ========================================================
     IMPORT
  ======================================================== */

  let successful = 0;
  let skipped = 0;

  const missingProvince:
    string[] = [];

  const lowQuality:
    string[] = [];

  for (
    const district
    of districts
  ) {
    console.log("");

    const provinceRef =
      getProvinceRef(
        district
      );

    printDistrictSummary(
      district,
      provinceRef
    );

    /* ------------------------------------------------------
       Province validation
    ------------------------------------------------------ */

    if (!provinceRef) {
      console.log(
        `❌ Skipping ${
          district.name
        } — no province reference.`
      );

      skipped++;

      missingProvince.push(
        district.name
      );

      continue;
    }

    /* ------------------------------------------------------
       Quality validation
    ------------------------------------------------------ */

    const quality =
      getDistrictQuality(
        district
      );

    if (
      quality.percentage <
      50
    ) {
      console.log(
        `❌ Skipping ${
          district.name
        } — data quality ${
          quality.percentage
        }% is below 50%.`
      );

      skipped++;

      lowQuality.push(
        `${district.name} (${quality.percentage}%)`
      );

      continue;
    }

    /* ------------------------------------------------------
       DRY RUN
    ------------------------------------------------------ */

    if (DRY_RUN) {
      console.log(
        `🧪 Dry-run: ${
          district.name
        } would be imported.`
      );

      successful++;

      continue;
    }

    /* ------------------------------------------------------
       LIVE SANITY IMPORT
    ------------------------------------------------------ */

    try {
      const document =
        buildSanityDocument(
          district,
          provinceRef
        );

      await client.createOrReplace(
        document
      );

      console.log(
        `✅ Imported ${
          district.name
        } successfully`
      );

      successful++;
    } catch (error) {
      console.error(
        `❌ Failed to import ${
          district.name
        }:`
      );

      console.error(
        error
      );

      skipped++;
    }
  }

  /* ========================================================
     FINAL SUMMARY
  ======================================================== */

  console.log("");

  console.log(
    "=========================================="
  );

  console.log(
    "🎉 IMPORT FINISHED"
  );

  console.log(
    "=========================================="
  );

  console.log("");

  console.log(
    `📚 Districts detected: ${
      districts.length
    }`
  );

  console.log(
    `✅ Successful: ${
      successful
    }`
  );

  console.log(
    `⚠️ Skipped: ${
      skipped
    }`
  );

  if (
    coverage.missing.length >
    0
  ) {
    console.log("");

    console.log(
      `❌ Missing districts: ${
        coverage.missing.length
      }`
    );

    for (
      const district
      of coverage.missing
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  if (
    coverage.unexpected.length >
    0
  ) {
    console.log("");

    console.log(
      `⚠️ Unexpected districts: ${
        coverage.unexpected.length
      }`
    );

    for (
      const district
      of coverage.unexpected
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  if (
    duplicates.length >
    0
  ) {
    console.log("");

    console.log(
      `⚠️ Duplicate slugs: ${
        duplicates.length
      }`
    );

    for (
      const duplicate
      of duplicates
    ) {
      console.log(
        `   - ${duplicate}`
      );
    }
  }

  if (
    missingProvince.length >
    0
  ) {
    console.log("");

    console.log(
      `⚠️ Missing province mappings: ${
        missingProvince.length
      }`
    );

    for (
      const district
      of missingProvince
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  if (
    lowQuality.length >
    0
  ) {
    console.log("");

    console.log(
      `⚠️ Low-quality districts skipped: ${
        lowQuality.length
      }`
    );

    for (
      const district
      of lowQuality
    ) {
      console.log(
        `   - ${district}`
      );
    }
  }

  console.log("");

  if (DRY_RUN) {
    console.log(
      "🧪 DRY RUN: Nothing was written to Sanity."
    );
  } else {
    console.log(
      "🎉 LIVE IMPORT: Districts were written to Sanity."
    );
  }

  console.log("");
}

/* ============================================================
   ERROR HANDLER
============================================================ */

main().catch(
  (error: unknown) => {
    console.error("");

    console.error(
      "❌ Critical execution error:"
    );

    if (
      error instanceof Error
    ) {
      console.error(
        error.message
      );

      if (
        VERBOSE &&
        error.stack
      ) {
        console.error("");
        console.error(
          error.stack
        );
      }
    } else {
      console.error(
        error
      );
    }

    console.error("");

    process.exitCode = 1;
  }
);