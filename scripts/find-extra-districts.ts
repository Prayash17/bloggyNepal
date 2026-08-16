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

// List of all 77 real Nepal districts (correct slugs)
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

  console.log(`\n📊 Total districts in database: ${allDistricts.length}`);
  console.log("Expected: 77\n");

  const realDistricts = [];
  const extras = [];
  const drafts = [];

  for (const d of allDistricts) {
    // Handle null/undefined values safely
    const name = d.name || "(no name)";
    const slug = d.slug || "";
    const isDraft = d._id.startsWith("drafts.");

    if (isDraft) {
      drafts.push(d);
    }

    if (REAL_DISTRICTS.includes(slug)) {
      realDistricts.push(d);
    } else {
      extras.push({ ...d, name, slug });
    }
  }

  // Check for duplicates by slug
  const slugCount = new Map();
  for (const d of allDistricts) {
    const slug = d.slug || "";
    if (slug) {
      slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
    }
  }

  const duplicateSlugs = [];
  for (const [slug, count] of slugCount.entries()) {
    if (count > 1) {
      const dups = allDistricts.filter((d) => d.slug === slug);
      duplicateSlugs.push({ slug, dups });
    }
  }

  // Check for duplicates by name
  const nameCount = new Map();
  for (const d of allDistricts) {
    const nameLower = (d.name || "").toLowerCase().trim();
    if (nameLower) {
      nameCount.set(nameLower, (nameCount.get(nameLower) || 0) + 1);
    }
  }

  const duplicateNames = [];
  for (const [name, count] of nameCount.entries()) {
    if (count > 1) {
      const dups = allDistricts.filter(
        (d) => (d.name || "").toLowerCase().trim() === name
      );
      duplicateNames.push({ name, dups });
    }
  }

  console.log("=".repeat(70));
  console.log("📋 RESULTS");
  console.log("=".repeat(70));
  console.log(`✅ Real districts: ${realDistricts.length}`);
  console.log(`❌ Fake/Unknown districts: ${extras.length}`);
  console.log(`📝 Drafts: ${drafts.length}`);
  console.log(`🔁 Duplicate slugs: ${duplicateSlugs.length}`);
  console.log(`🔁 Duplicate names: ${duplicateNames.length}`);

  if (drafts.length > 0) {
    console.log("\n📝 DRAFT DOCUMENTS (not published):");
    drafts.forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.name}" (ID: ${d._id}, slug: ${d.slug || "none"})`);
    });
  }

  if (extras.length > 0) {
    console.log("\n❌ FAKE/UNKNOWN DISTRICTS:");
    extras.forEach((d, i) => {
      console.log(`   ${i + 1}. "${d.name}" (ID: ${d._id}, slug: "${d.slug || "none"}")`);
    });
  }

  if (duplicateSlugs.length > 0) {
    console.log("\n🔁 DUPLICATE SLUGS:");
    duplicateSlugs.forEach((d) => {
      console.log(`\n   Slug: "${d.slug}" appears ${d.dups.length} times:`);
      d.dups.forEach((dup) => {
        console.log(`      - ID: ${dup._id}, name: "${dup.name}"`);
      });
    });
  }

  if (duplicateNames.length > 0) {
    console.log("\n🔁 DUPLICATE NAMES:");
    duplicateNames.forEach((d) => {
      console.log(`\n   Name: "${d.name}" appears ${d.dups.length} times:`);
      d.dups.forEach((dup) => {
        console.log(`      - ID: ${dup._id}, slug: "${dup.slug || "none"}"`);
      });
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("📋 ALL DISTRICTS:");
  console.log("=".repeat(70));
  allDistricts.forEach((d, i) => {
    const isReal = REAL_DISTRICTS.includes(d.slug || "");
    const isDraft = d._id.startsWith("drafts.");
    const marker = isReal ? "✅" : isDraft ? "📝" : "❌";
    console.log(
      `   ${marker} ${(i + 1).toString().padStart(2)}. ${(d.name || "(no name)").padEnd(25)} | ${(d.slug || "no-slug").padEnd(20)} | ${d._id}`
    );
  });
}

findExtras().catch(console.error);
