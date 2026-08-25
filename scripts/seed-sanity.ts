import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";

// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  throw new Error(
    "❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local"
  );
}

if (!dataset) {
  throw new Error(
    "❌ Missing NEXT_PUBLIC_SANITY_DATASET in .env.local"
  );
}

if (!token) {
  throw new Error(
    "❌ Missing SANITY_WRITE_TOKEN in .env.local"
  );
}

// ============================================================
// SANITY CLIENT
// ============================================================

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ============================================================
// TYPES
// ============================================================

interface SeedDocument {
  _id: string;
  _type: string;
  provinceRef?: string;
  [key: string]: unknown;
}

interface SeedData {
  provinces: SeedDocument[];
  districts: SeedDocument[];
}

// ============================================================
// HELPERS
// ============================================================

function getSeedDataPath(): string {
  return path.join(process.cwd(), "scripts", "seed-data.json");
}

function loadSeedData(): SeedData {
  const dataPath = getSeedDataPath();

  if (!fs.existsSync(dataPath)) {
    throw new Error(
      `❌ seed-data.json not found at:\n${dataPath}`
    );
  }

  const raw = fs.readFileSync(dataPath, "utf8");

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `❌ Could not parse seed-data.json as JSON.\n${String(error)}`
    );
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("provinces" in parsed) ||
    !("districts" in parsed)
  ) {
    throw new Error(
      "❌ seed-data.json must contain 'provinces' and 'districts' arrays."
    );
  }

  const data = parsed as SeedData;

  if (!Array.isArray(data.provinces)) {
    throw new Error("❌ 'provinces' must be an array.");
  }

  if (!Array.isArray(data.districts)) {
    throw new Error("❌ 'districts' must be an array.");
  }

  return data;
}

function validateDocuments(data: SeedData) {
  for (const province of data.provinces) {
    if (!province._id) {
      throw new Error("❌ A province is missing _id.");
    }

    if (!province._type) {
      throw new Error(
        `❌ Province ${province._id} is missing _type.`
      );
    }

    if (province._type !== "province") {
      console.warn(
        `⚠️ Province ${province._id} has _type "${province._type}" instead of "province".`
      );
    }
  }

  for (const district of data.districts) {
    if (!district._id) {
      throw new Error("❌ A district is missing _id.");
    }

    if (!district._type) {
      throw new Error(
        `❌ District ${district._id} is missing _type.`
      );
    }

    if (district._type !== "district") {
      console.warn(
        `⚠️ District ${district._id} has _type "${district._type}" instead of "district".`
      );
    }

    if (!district.provinceRef) {
      console.warn(
        `⚠️ District ${district._id} (${String(
          district.name ?? "unknown"
        )}) has no provinceRef.`
      );
    }
  }
}

function createProvinceDocument(province: SeedDocument) {
  return {
    _id: province._id,
    _type: "province",
    name: province.name,
    officialName: province.officialName,
    slug: province.slug,
    number: province.number,
    capital: province.capital,
    headquarters: province.headquarters,
    population: province.population,
    area: province.area,
    noOfDistricts: province.noOfDistricts,
    coverImage: province.coverImage,
    mapImage: province.mapImage,
    body: province.body,
    cultureAndHistory: province.cultureAndHistory,
    geography: province.geography,

    // We populate this in STEP 3.
    districts: [],
  };
}

function createDistrictDocument(district: SeedDocument) {
  const { provinceRef, ...districtData } = district;

  const document: Record<string, unknown> = {
    ...districtData,
  };

  // Remove provinceRef because Sanity uses a reference field named "province".
  delete document.provinceRef;

  if (provinceRef) {
    document.province = {
      _type: "reference",
      _ref: provinceRef,
    };
  }

  return document;
}

// ============================================================
// IMPORT PROVINCES
// ============================================================

async function importProvinces(provinces: SeedDocument[]) {
  console.log("\n🏔️ Importing provinces...");

  const transaction = client.transaction();

  for (const province of provinces) {
    const document = createProvinceDocument(province);

    transaction.createOrReplace(document);

    console.log(
      `  ✓ ${String(province.name ?? province._id)}`
    );
  }

  await transaction.commit();

  console.log(`✅ Imported ${provinces.length} provinces`);
}

// ============================================================
// IMPORT DISTRICTS
// ============================================================

async function importDistricts(districts: SeedDocument[]) {
  console.log("\n📍 Importing districts...");

  const transaction = client.transaction();

  for (const district of districts) {
    const document = createDistrictDocument(district);

    transaction.createOrReplace(document);

    console.log(
      `  ✓ ${String(district.name ?? district._id)}`
    );
  }

  await transaction.commit();

  console.log(`✅ Imported ${districts.length} districts`);
}

// ============================================================
// LINK DISTRICTS TO PROVINCES
// ============================================================

async function linkDistrictsToProvinces(
  provinces: SeedDocument[],
  districts: SeedDocument[]
) {
  console.log("\n🔗 Linking districts to provinces...");

  for (const province of provinces) {
    const provinceDistricts = districts.filter(
      (district) =>
        district.provinceRef === province._id
    );

    const districtRefs = provinceDistricts.map(
      (district) => ({
        _type: "reference" as const,
        _ref: district._id,
        _key: district._id,
      })
    );

    await client
      .patch(province._id)
      .set({
        districts: districtRefs,
      })
      .commit();

    console.log(
      `  ✓ ${String(province.name ?? province._id)}: ${districtRefs.length} districts linked`
    );
  }
}

// ============================================================
// VALIDATE PROVINCE / DISTRICT COUNTS
// ============================================================

function printSummary(
  provinces: SeedDocument[],
  districts: SeedDocument[]
) {
  console.log("\n📊 Seed summary");
  console.log("--------------------------------");
  console.log(`Provinces: ${provinces.length}`);
  console.log(`Districts: ${districts.length}`);

  for (const province of provinces) {
    const count = districts.filter(
      (district) =>
        district.provinceRef === province._id
    ).length;

    console.log(
      `  ${String(province.name ?? province._id)}: ${count}`
    );
  }

  console.log("--------------------------------");
}

// ============================================================
// MAIN
// ============================================================

async function importData() {
  console.log("🚀 BloggyNepal Sanity Seeder");
  console.log("--------------------------------");
  console.log(`Project ID: ${projectId}`);
  console.log(`Dataset: ${dataset}`);

  const data = loadSeedData();

  console.log(
    `\n📦 Found ${data.provinces.length} provinces and ${data.districts.length} districts`
  );

  validateDocuments(data);

  printSummary(data.provinces, data.districts);

  // STEP 1
  await importProvinces(data.provinces);

  // STEP 2
  await importDistricts(data.districts);

  // STEP 3
  await linkDistrictsToProvinces(
    data.provinces,
    data.districts
  );

  console.log("\n🎉 All data imported successfully!");
  console.log("👉 Open Sanity Studio and refresh.");
}

// ============================================================
// RUN
// ============================================================

importData().catch((error) => {
  console.error("\n❌ Import failed:");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});