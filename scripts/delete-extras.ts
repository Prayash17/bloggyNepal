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

async function deleteExtras() {
  console.log("🗑️  Deleting extra documents...\n");

  // 1. Delete the Arghakhanchi draft
  const draftId1 = "drafts.district-arghakhanchi";
  console.log(`Deleting: ${draftId1}`);
  try {
    await client.delete(draftId1);
    console.log("✅ Deleted Arghakhanchi draft");
  } catch (err) {
    console.log("⚠️  Arghakhanchi draft not found or already deleted");
  }

  // 2. Delete the empty draft
  const draftId2 = "drafts.bdbeddf3-7eb0-44f7-bdec-7a06019dc6d5";
  console.log(`Deleting: ${draftId2}`);
  try {
    await client.delete(draftId2);
    console.log("✅ Deleted empty draft");
  } catch (err) {
    console.log("⚠️  Empty draft not found or already deleted");
  }

  // Verify
  console.log("\n📊 Verifying...");
  const totalDistricts = await client.fetch(`count(*[_type == "district"])`);
  const totalDrafts = await client.fetch(
    `count(*[_type == "district" && _id in path("drafts.**")])`
  );

  console.log(`Total districts: ${totalDistricts}`);
  console.log(`Draft districts: ${totalDrafts}`);

  if (totalDistricts === 77) {
    console.log("\n🎉 PERFECT! You have exactly 77 districts!");
  } else {
    console.log(`\n⚠️  You have ${totalDistricts} districts, expected 77`);
  }
}

deleteExtras().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
