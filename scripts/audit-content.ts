import process from "node:process";
import dotenv from "dotenv";
import { createClient } from "@sanity/client";

dotenv.config({ path: ".env.local" });

type DestinationDoc = {
  _id: string;
  title?: string;
  slug?: { current?: string };
};

type DistrictDoc = {
  _id: string;
  name?: string;
  slug?: { current?: string };
  headquarter?: unknown;
  population?: unknown;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  throw new Error(
    "Content audit needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN (or SANITY_API_TOKEN) in .env.local so drafts can be inspected."
  );
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "raw",
});

function publishedId(id: string) {
  return id.replace(/^drafts\./, "");
}

function hasSuspiciousText(value: unknown) {
  return typeof value === "string" && /[•▪◦]/.test(value);
}

function looksNumeric(value: unknown) {
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return /^\s*[\d,.]+\s*$/.test(value);
}

async function main() {
  const [destinations, districts] = await Promise.all([
    client.fetch<DestinationDoc[]>(
      `*[_type == "destination"]{_id,title,slug} | order(title asc)`
    ),
    client.fetch<DistrictDoc[]>(
      `*[_type == "district"]{_id,name,slug,headquarter,population} | order(name asc)`
    ),
  ]);

  const destinationIds = new Set(destinations.map((doc) => doc._id));
  const publishedDestinations = destinations.filter(
    (doc) => !doc._id.startsWith("drafts.")
  );
  const draftDestinations = destinations.filter((doc) =>
    doc._id.startsWith("drafts.")
  );
  const draftOnlyDestinations = draftDestinations.filter(
    (doc) => !destinationIds.has(publishedId(doc._id))
  );
  const publishedWithDraftChanges = draftDestinations.filter((doc) =>
    destinationIds.has(publishedId(doc._id))
  );

  console.log("\n=== DESTINATION PUBLISHING AUDIT ===");
  console.log(`Published documents: ${publishedDestinations.length}`);
  console.log(`Draft documents: ${draftDestinations.length}`);
  console.log(`Draft-only (not live): ${draftOnlyDestinations.length}`);
  console.log(`Published with unpublished changes: ${publishedWithDraftChanges.length}`);

  if (draftOnlyDestinations.length) {
    console.log("\nDraft-only destinations that are NOT live:");
    for (const doc of draftOnlyDestinations) {
      console.log(`- ${doc.title || "Untitled"} (${doc.slug?.current || doc._id})`);
    }
  }

  if (publishedWithDraftChanges.length) {
    console.log("\nPublished destinations with newer draft changes:");
    for (const doc of publishedWithDraftChanges) {
      console.log(`- ${doc.title || "Untitled"} (${doc.slug?.current || publishedId(doc._id)})`);
    }
  }

  console.log("\n=== DISTRICT DATA-QUALITY AUDIT ===");
  let issues = 0;

  for (const doc of districts.filter((item) => !item._id.startsWith("drafts."))) {
    const problems: string[] = [];

    if (!doc.headquarter || String(doc.headquarter).trim() === "") {
      problems.push("missing headquarters");
    } else if (looksNumeric(doc.headquarter)) {
      problems.push(`headquarters looks numeric: ${String(doc.headquarter)}`);
    }

    if (hasSuspiciousText(doc.headquarter)) {
      problems.push(`headquarters contains stray bullet: ${String(doc.headquarter)}`);
    }

    if (typeof doc.population === "string" && !looksNumeric(doc.population)) {
      problems.push(`population is not numeric: ${doc.population}`);
    }

    if (problems.length) {
      issues += 1;
      console.log(`- ${doc.name || doc.slug?.current || doc._id}: ${problems.join("; ")}`);
    }
  }

  if (!issues) {
    console.log("No obvious headquarters/population anomalies found in published district records.");
  }

  console.log("\nAudit complete. This script is read-only and does not mutate Sanity.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
