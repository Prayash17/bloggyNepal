import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  token: process.env.SANITY_WRITE_TOKEN!,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// List of all 77 real Nepal districts (the correct ones)
const REAL_DISTRICTS = [
  // Koshi (14)
  "taplejung", "panchthar", "ilam", "jhapa", "morang", "sunsari",
  "dhankuta", "terhathum", "sankhuwasabha", "bhojpur", "solukhumbu",
  "okhaldhunga", "khotang", "udayapur",
  // Madhesh (8)
  "saptari", "siraha", "dhanusha", "mahottari", "sarlahi", "rautahat",
  "bara", "parsa",
  // Bagmati (13)
  "dolakha", "sindhupalchowk", "rasuwa", "kathmandu", "bhaktapur",
  "lalitpur", "kavrepalanchowk", "sindhuli", "makawanpur", "chitwan",
  "ramechhap", "nuwakot", "dhading",
  // Gandaki (11)
  "gorkha", "lamjung", "tanahun", "kaski", "manang", "mustang",
  "myagdi", "parbat", "syangja", "nawalpur", "baglung",
  // Lumbini (12)
  "rukum-east", "rolpa", "pyuthan", "gulmi", "arghakhanchi", "palpa",
  "kapilvastu", "nawalparasi-west", "rupandehi", "dang", "banke", "bardiya",
  // Karnali (10)
  "dolpa", "mugu", "humla", "jumla", "kalikot", "dailekh", "jajarkot",
  "rukum-west", "salyan", "surkhet",
  // Sudurpashchim (9)
  "bajura", "bajhang", "darchula", "baitadi", "dadeldhura", "doti",
  "achham", "kailali", "kanchanpur",
];

async function findExtras() {
  const allDistricts = await client.fetch(`
    *[_type == "district"] | order(name asc) {
      _id,
      name,
      "slug": slug.current
    }
  `);

  console.log(`\n📊 Total districts in database: ${allDistricts.length}\n`);
  console.log("Expected: 77\n");

  console.log("🔍 Checking each district:\n");

  const realDistricts = [];
  const extras = [];
  const duplicates = [];
  const seen = new Map();

  for (const d of allDistricts) {
    const slug = d.slug || "";
    const nameLower = d.name.toLowerCase().trim();

    // Check if it's in the real list (by slug)
    if (REAL_DISTRICTS.includes(slug)) {
      realDistricts.push(d);
    } else {
      // It's either a fake district OR a duplicate
      if (seen.has(slug) && slug !== "") {
        duplicates.push({ ...d, originalId: seen.get(slug) });
      } else if (slug === "") {
        extras.push({ ...d, reason: "No slug" });
      } else {
        extras.push({ ...d, reason: "Not in real list" });
        seen.set(slug, d._id);
      }
    }
  }

  // Check for duplicates by name too
  const nameCount = new Map();
  for (const d of allDistricts) {
    const key = d.name.toLowerCase().trim();
    nameCount.set(key, (nameCount.get(key) || 0) + 1);
  }

  const duplicateNames = [];
  for (const [name, count] of nameCount.entries()) {
    if (count > 1) {
      const dups = allDistricts.filter(
        (d) => d.name.toLowerCase().trim() === name
      );
      duplicateNames.push({ name, dups });
    }
  }

  console.log("=".repeat(70));
  console.log("📋 RESULTS:");
  console.log("=".repeat(70));

  console.log(`\n✅ Real districts: ${realDistricts.length}`);
  console.log(`❌ Fake/Unknown districts: ${extras.length}`);

  if (extras.length > 0) {
    console.log("\n🚫 FAKE DISTRICTS FOUND:");
    extras.forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.name}" (ID: ${d._id}, slug: ${d.slug})`);
    });
  }

  if (duplicates.length > 0) {
    console.log("\n🔁 DUPLICATES FOUND:");
    duplicates.forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.name}" (ID: ${d._id})`);
    });
  }

  if (duplicateNames.length > 0) {
    console.log("\n🔁 DUPLICATE NAMES:");
    duplicateNames.forEach((d) => {
      console.log(`\n   Name: "${d.name}" appears ${d.dups.length} times:`);
      d.dups.forEach((dup) => {
        console.log(`      - ID: ${dup._id}, slug: ${dup.slug}`);
      });
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("\n📝 Full list of all 80 districts:");
  allDistricts.forEach((d, i) => {
    const isReal = REAL_DISTRICTS.includes(d.slug || "");
    const marker = isReal ? "✅" : "❌";
    console.log(`   ${marker} ${(i + 1).toString().padStart(2)}. ${d.name} (${d.slug})`);
  });
}

findExtras().catch(console.error);
