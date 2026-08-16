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

async function deleteRampur() {
  // Step 1: Find Rampur
  const rampur = await client.fetch(
    `*[_type == "district" && name == "Rampur"][0] { _id, name }`
  );

  if (!rampur) {
    console.log("✅ No Rampur found! Already deleted or never existed.");
    return;
  }

  console.log(`🔍 Found: ${rampur.name} (ID: ${rampur._id})`);

  // Step 2: Remove Rampur from Lumbini province's districts array
  console.log("🔗 Removing reference from Lumbini province...");
  await client
    .patch("province-lumbini")
    .unset([`districts[_ref == "${rampur._id}"]`])
    .commit();

  // Step 3: Delete the district
  console.log("🗑️  Deleting Rampur district...");
  await client.delete(rampur._id);

  // Step 4: Update Lumbini's noOfDistricts to 12
  console.log("📊 Updating Lumbini's district count to 12...");
  await client
    .patch("province-lumbini")
    .set({ noOfDistricts: 12 })
    .commit();

  // Step 5: Verify
  const remainingDistricts = await client.fetch(
    `count(*[_type == "district"])`
  );
  const lumbiniCount = await client.fetch(
    `*[_type == "province" && _id == "province-lumbini"][0] { 
      noOfDistricts, 
      "actualCount": count(districts) 
    }`
  );

  console.log("\n✅ Done!");
  console.log(`📊 Total districts now: ${remainingDistricts}`);
  console.log(
    `📊 Lumbini: ${lumbiniCount.actualCount} districts (expected: ${lumbiniCount.noOfDistricts})`
  );

  if (remainingDistricts === 77) {
    console.log("\n🎉 Perfect! You have exactly 77 districts!");
  } else {
    console.log(`\n⚠️  You have ${remainingDistricts} districts, expected 77`);
  }
}

deleteRampur().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
