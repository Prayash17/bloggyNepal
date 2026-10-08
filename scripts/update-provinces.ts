import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({ path: ".env.local" });

type ProvinceContent = {
  id: string;
  slug: string;
  officialName: string;
  nepaliName: string;
  number: number;
  capital: string;
  headquarters: string;
  population: number;
  area: number;
  density: number;
  noOfDistricts: number;
  shortDescription: string;
  travelThemes: string[];
  overview: string[];
  geography: string[];
  cultureAndHistory: string[];
  highlights: string[];
  gettingThere: string[];
  bestTimeToVisit: string[];
  practicalNotes: string[];
  factCheckedAt: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
const write = process.argv.includes("--write");

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
}

if (write && !token) {
  throw new Error(
    "Writing requires SANITY_WRITE_TOKEN or SANITY_API_TOKEN in .env.local. Do not paste the token into chat."
  );
}

const contentPath = path.join(
  process.cwd(),
  "scripts",
  "data",
  "province-content-2026.json"
);

const provinceContent = JSON.parse(
  fs.readFileSync(contentPath, "utf8")
) as ProvinceContent[];

function keyPart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function toPortableText(paragraphs: string[], prefix: string) {
  return paragraphs.map((text, index) => ({
    _type: "block",
    _key: `${keyPart(prefix)}-${index + 1}`,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${keyPart(prefix)}-${index + 1}-span`,
        text,
        marks: [],
      },
    ],
  }));
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: "raw",
});

async function main() {
  console.log(`Province content source: ${contentPath}`);
  console.log(`Dataset: ${dataset}`);
  console.log(write ? "Mode: WRITE" : "Mode: DRY RUN");
  console.log("");

  const prepared: Array<{
    id: string;
    draftId: string | null;
    patch: Record<string, unknown>;
  }> = [];

  for (const province of provinceContent) {
    const draftId = `drafts.${province.id}`;
    const [published, draft] = await Promise.all([
      client.getDocument<Record<string, unknown>>(province.id),
      client.getDocument<Record<string, unknown>>(draftId),
    ]);

    if (!published && !draft) {
      console.warn(`SKIP ${province.officialName}: no Sanity document found for ${province.id}`);
      continue;
    }

    const existing = (draft || published || {}) as {
      seo?: Record<string, unknown>;
    };

    const patch: Record<string, unknown> = {
      officialName: province.officialName,
      nepaliName: province.nepaliName,
      slug: { _type: "slug", current: province.slug },
      number: province.number,
      capital: province.capital,
      headquarters: province.headquarters,
      population: province.population,
      area: province.area,
      density: province.density,
      noOfDistricts: province.noOfDistricts,
      shortDescription: province.shortDescription,
      travelThemes: province.travelThemes,
      body: toPortableText(province.overview, `${province.slug}-overview`),
      geography: toPortableText(province.geography, `${province.slug}-geography`),
      cultureAndHistory: toPortableText(
        province.cultureAndHistory,
        `${province.slug}-culture`
      ),
      highlights: province.highlights,
      gettingThere: toPortableText(
        province.gettingThere,
        `${province.slug}-getting-there`
      ),
      bestTimeToVisit: toPortableText(
        province.bestTimeToVisit,
        `${province.slug}-best-time`
      ),
      practicalNotes: province.practicalNotes,
      factCheckedAt: province.factCheckedAt,
      seo: {
        ...(existing.seo || {}),
        metaTitle: province.seo.metaTitle,
        metaDescription: province.seo.metaDescription,
      },
    };

    prepared.push({
      id: province.id,
      draftId: draft ? draftId : null,
      patch,
    });

    console.log(
      `${write ? "READY" : "WOULD UPDATE"} ${province.officialName} (${province.id})` +
        (draft ? " + existing draft" : "")
    );
    console.log(
      `  ${province.population.toLocaleString()} people | ${province.area.toLocaleString()} km² | ${province.noOfDistricts} districts`
    );
    console.log(
      `  Capital: ${province.capital}` +
        (province.headquarters !== province.capital
          ? ` | Administrative seat: ${province.headquarters}`
          : "")
    );
  }

  if (!write) {
    console.log("");
    console.log("Dry run complete. No Sanity documents were changed.");
    console.log("Run `npm run update:provinces` to apply these reviewed province records.");
    return;
  }

  let transaction = client.transaction();

  for (const item of prepared) {
    if (await client.getDocument(item.id)) {
      transaction = transaction.patch(item.id, (patch) => patch.set(item.patch));
    }

    if (item.draftId) {
      transaction = transaction.patch(item.draftId, (patch) => patch.set(item.patch));
    }
  }

  const result = await transaction.commit({ visibility: "sync" });

  console.log("");
  console.log(`Updated ${prepared.length} province records successfully.`);
  console.log(`Transaction ID: ${result.transactionId}`);
  console.log("Re-open Sanity Studio and review the province pages before publishing any existing drafts.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
