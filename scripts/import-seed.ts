 // 👇 Load .env.local FIRST (must be line 1-2)
import { config } from "dotenv";
config({ path: ".env.local" });

// 👇 Then everything else
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

interface SeedDoc {
  _id: string;
  _type: string;
  provinceRef?: string;
  [key: string]: any;
}

async function importData() {
  const dataPath = path.join(process.cwd(), "scripts", "seed-data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const { provinces, districts } = JSON.parse(raw) as {
    provinces: SeedDoc[];
    districts: SeedDoc[];
  };

  console.log(`📦 Found ${provinces.length} provinces and ${districts.length} districts`);

  // STEP 1: Import provinces
  console.log("\n🏔️ Importing provinces...");
  const provinceTx = client.transaction();
  provinces.forEach((p) => {
    provinceTx.createOrReplace({
      _id: p._id,
      _type: p._type,
      name: p.name,
      officialName: p.officialName,
      slug: p.slug,
      number: p.number,
      capital: p.capital,
      headquarters: p.headquarters,
      population: p.population,
      area: p.area,
      noOfDistricts: p.noOfDistricts,
      body: p.body,
      geography: p.geography,
      districts: [],
    });
  });
  await provinceTx.commit();
  console.log(`✅ Imported ${provinces.length} provinces`);

  // STEP 2: Import districts
  console.log("\n📍 Importing districts...");
  const districtTx = client.transaction();
  districts.forEach((d) => {
    const { provinceRef, ...districtData } = d;
    districtTx.createOrReplace({
      ...districtData,
      province: {
        _type: "reference",
        _ref: provinceRef,
      },
    });
  });
  await districtTx.commit();
  console.log(`✅ Imported ${districts.length} districts`);

  // STEP 3: Link districts to provinces
  console.log("\n🔗 Linking districts to provinces...");
  for (const province of provinces) {
    const districtRefs = districts
      .filter((d) => d.provinceRef === province._id)
      .map((d) => ({
        _type: "reference",
        _ref: d._id,
        _key: d._id,
      }));

    await client
      .patch(province._id)
      .set({ districts: districtRefs })
      .commit();
    console.log(`  ✓ ${province.name}: ${districtRefs.length} districts linked`);
  }

  console.log("\n🎉 All data imported successfully!");
  console.log("👉 Open Sanity Studio to verify");
}

importData().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
