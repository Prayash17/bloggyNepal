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

async function generateMapUrls() {
  // The query must use string literals for aliases: "lat", "lng"
  const query = `
    *[_type == "district" && defined(coordinates)] {
      _id,
      name,
      "provinceName": province->name,
      "lat": coordinates.lat,
      "lng": coordinates.lng
    }
  `;

  // Fetch the districts
  const districts = await client.fetch(query);

  console.log(`📍 Found ${districts.length} districts with coordinates\n`);

  for (const d of districts) {
    // Generate Google Maps embed URL
    const mapUrl = `https://www.google.com/maps?q=${d.lat},${d.lng}&z=11&output=embed`;

    // Update the district
    await client
      .patch(d._id)
      .set({ mapEmbedUrl: mapUrl })
      .commit();

    console.log(`✅ ${d.name}: ${mapUrl}`);
  }

  console.log(`\n🎉 Generated map URLs for ${districts.length} districts!`);
}

generateMapUrls().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});