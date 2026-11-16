/**
 * Day 1 BloggyNepal content audit.
 *
 * Reads PUBLISHED Sanity documents only. Does not modify Sanity.
 * Run: npm run audit:day1
 * Output: reports/day1-content-audit.json
 */
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

const KARNALI = new Set([
  "dolpa", "mugu", "humla", "jumla", "kalikot",
  "dailekh", "jajarkot", "western-rukum", "salyan", "surkhet",
]);

function textOf(value) {
  if (typeof value === "string") return value.trim();
  if (!Array.isArray(value)) return "";
  return value.map((block) => {
    if (typeof block === "string") return block;
    if (!block || typeof block !== "object") return "";
    if (Array.isArray(block.children)) {
      return block.children.map((child) => child && typeof child.text === "string" ? child.text : "").join("");
    }
    return typeof block.text === "string" ? block.text : "";
  }).join(" ").replace(/\s+/g, " ").trim();
}

function filled(value) {
  return textOf(value).length > 0;
}

const issues = [];

function flag(section, slug, field, severity, message) {
  issues.push({ section, slug, field, severity, message });
}

function needText(section, slug, field, value, minCharacters = 20) {
  const chars = textOf(value).length;
  if (!chars) {
    flag(section, slug, field, "error", "Missing content");
  } else if (chars < minCharacters) {
    flag(section, slug, field, "warning", "Very short content (" + chars + " characters)");
  }
}

const districtQuery = '*[_type == "district" && !(_id in path("drafts.**"))]{_id,name,"slug":slug.current,"provinceName":province->name,"provinceNumber":province->number,"provinceSlug":province->slug.current,body,howToGetThere,thingsToDo,cultureAndHistory,bestTimeToVisit,places[]{name,description,image},faqs,seo,coverImage}';
const destinationQuery = '*[_type == "destination" && !(_id in path("drafts.**"))]{_id,title,"slug":slug.current,overview,howToGetThere,thingsToDo,bestTimeToVisit,itinerary,costBreakdown,budgetNotes,permits,safetyTips,faqs,coverImage,gallery,factCheckedAt,sources,seo}';

async function main() {
  const [allDistricts, destinations] = await Promise.all([
    client.fetch(districtQuery),
    client.fetch(destinationQuery),
  ]);

  const karnali = allDistricts.filter((d) =>
    d.provinceNumber === 6 ||
    String(d.provinceSlug || "").toLowerCase() === "karnali" ||
    String(d.provinceName || "").toLowerCase().includes("karnali") ||
    KARNALI.has(String(d.slug || "").toLowerCase())
  );

  const seen = new Set(karnali.map((d) => String(d.slug || "").toLowerCase()));
  for (const slug of KARNALI) {
    if (!seen.has(slug)) {
      flag("karnali", slug, "document", "error", "No matching published district document was found");
    }
  }
  if (karnali.length !== 10) {
    flag("karnali", "province", "count", "warning", "Expected 10 Karnali districts; found " + karnali.length);
  }

  for (const d of karnali) {
    const slug = d.slug || d._id;
    needText("karnali", slug, "body", d.body, 150);
    needText("karnali", slug, "howToGetThere", d.howToGetThere, 80);
    needText("karnali", slug, "thingsToDo", d.thingsToDo, 50);
    needText("karnali", slug, "cultureAndHistory", d.cultureAndHistory, 80);
    needText("karnali", slug, "bestTimeToVisit", d.bestTimeToVisit, 30);

    if (!Array.isArray(d.places) || d.places.length === 0) {
      flag("karnali", slug, "places", "error", "No featured places");
    } else {
      for (const [index, place] of d.places.entries()) {
        const label = place?.name || "place #" + (index + 1);
        needText("karnali", slug, "places." + label + ".description", place?.description, 80);
      }
    }
    if (!Array.isArray(d.faqs) || d.faqs.length === 0) {
      flag("karnali", slug, "faqs", "warning", "No traveler FAQs");
    }
    if (!d.coverImage?.asset) {
      flag("karnali", slug, "coverImage", "warning", "No cover image");
    }
  }

  for (const d of destinations) {
    const slug = d.slug || d._id;
    if (!d.title) flag("destinations", slug, "title", "error", "Missing title");
    if (!d.slug) flag("destinations", slug, "slug", "error", "Missing slug");
    needText("destinations", slug, "overview", d.overview, 150);
    needText("destinations", slug, "howToGetThere", d.howToGetThere, 100);
    needText("destinations", slug, "thingsToDo", d.thingsToDo, 60);
    needText("destinations", slug, "bestTimeToVisit", d.bestTimeToVisit, 40);

    if (!Array.isArray(d.itinerary) || d.itinerary.length === 0) {
      flag("destinations", slug, "itinerary", "warning", "No day-by-day itinerary");
    }
    if (!Array.isArray(d.costBreakdown) || d.costBreakdown.length === 0) {
      flag("destinations", slug, "costBreakdown", "error", "No itemized traveler costs");
    }
    if (!Array.isArray(d.sources) || d.sources.length === 0) {
      flag("destinations", slug, "sources", "error", "No verification sources recorded");
    }
    if (!d.factCheckedAt) {
      flag("destinations", slug, "factCheckedAt", "error", "No fact-check date");
    }
    if (!d.coverImage?.asset) {
      flag("destinations", slug, "coverImage", "warning", "No cover image");
    }
    if (!Array.isArray(d.safetyTips) || d.safetyTips.length === 0) {
      flag("destinations", slug, "safetyTips", "warning", "No safety tips");
    }

    // Heuristics only: these prompts do not verify schedules, fares, or service availability.
    const route = textOf(d.howToGetThere).toLowerCase();
    if (route && !/\b(road|bus|jeep|drive|driving|vehicle|highway)\b/i.test(route)) {
      flag("destinations", slug, "howToGetThere.road", "review", "Manually verify that road travel is explained");
    }
    if (route && !/\b(flight|fly|airport|air travel|no direct flight|no flight)\b/i.test(route)) {
      flag("destinations", slug, "howToGetThere.flight", "review", "Explain flight options or clearly say that no suitable route exists");
    }
  }

  const severityOrder = { error: 0, warning: 1, review: 2 };
  issues.sort((a, b) =>
    (severityOrder[a.severity] - severityOrder[b.severity]) ||
    a.section.localeCompare(b.section) ||
    a.slug.localeCompare(b.slug) ||
    a.field.localeCompare(b.field)
  );

  const summary = {
    checkedAt: new Date().toISOString(),
    mode: "read-only; published Sanity documents",
    districtDocuments: allDistricts.length,
    karnaliDocuments: karnali.length,
    destinationDocuments: destinations.length,
    issues: issues.length,
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    manualReviews: issues.filter((i) => i.severity === "review").length,
  };
  const reportPath = "reports/day1-content-audit.json";
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, JSON.stringify({ summary, issues }, null, 2) + "\n");
  console.log("\nBloggyNepal Day 1 audit (no content changes)");
  console.log(JSON.stringify(summary, null, 2));
  console.log("\nFirst 30 issues:");
  for (const i of issues.slice(0, 30)) {
    console.log("[" + i.severity.toUpperCase() + "] " + i.section + "/" + i.slug + " " + i.field + " — " + i.message);
  }
  console.log("\nFull report: " + reportPath);
}

main().catch((error) => {
  console.error("Content audit failed:", error);
  process.exitCode = 1;
});
