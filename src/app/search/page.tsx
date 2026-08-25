 

import Link from "next/link";
import { client } from "@/sanity/lib/client";

type SanityResult = {
  _id: string;
  _type: "destination" | "post" | "district";
  title: string;
  slug: { current: string };
  region?: string;
  excerpt?: string;
  headquarter?: string;
};

type DisplayResult = {
  key: string;
  category: string;
  title: string;
  description?: string;
  href: string;
};

// Add any other non-Sanity pages here the same way.
const staticPages = [
  {
    title: "Explore Nepal",
    keywords: "explore nepal regions plan trip route map itinerary provinces",
    description: "Plan your route and browse Nepal region by region.",
    href: "/explore-nepal",
    category: "Explore Nepal",
  },
  {
    title: "About",
    keywords: "about who writes bloggynepal contact author",
    description: "Meet the person behind bloggyNepal's guides.",
    href: "/about",
    category: "About",
  },
];

async function searchSanity(query: string): Promise<SanityResult[]> {
  const pattern = `*${query}*`;

  return client.fetch(
    `*[
      (_type == "destination" || _type == "post" || _type == "district") &&
      (
        title match $pattern ||
        name match $pattern ||
        excerpt match $pattern ||
        region match $pattern ||
        headquarter match $pattern
      )
    ] | order(_type asc) [0...40] {
      _id,
      _type,
      "title": coalesce(title, name),
      slug,
      region,
      excerpt,
      headquarter
    }`,
    { pattern }
  );
}

function searchStaticPages(query: string) {
  const q = query.toLowerCase();
  return staticPages.filter(
    (page) =>
      page.title.toLowerCase().includes(q) ||
      page.description.toLowerCase().includes(q) ||
      page.keywords.toLowerCase().includes(q)
  );
}

export default async function SearchPage({
  searchParams,
}: {
  // Next.js 16 passes searchParams as a Promise in Server Components
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? "";

  const sanityResults = query ? await searchSanity(query) : [];
  const staticResults = query ? searchStaticPages(query) : [];

  const results: DisplayResult[] = [
    ...sanityResults.map((item) => {
      let category: string;
      let href: string;
      let description = item.excerpt;

      if (item._type === "destination") {
        category = `Destination${item.region ? ` · ${item.region}` : ""}`;
        href = `/destinations/${item.slug.current}`;
      } else if (item._type === "post") {
        category = `Story${item.region ? ` · ${item.region}` : ""}`;
        href = `/blog/${item.slug.current}`;
      } else {
        category = `Explore Nepal${item.headquarter ? ` · ${item.headquarter}` : ""}`;
        href = `/explore-nepal/${item.slug.current}`;
        description = item.headquarter
          ? `Headquarters: ${item.headquarter}`
          : undefined;
      }

      return {
        key: item._id,
        category,
        title: item.title,
        description,
        href,
      };
    }),
    ...staticResults.map((page) => ({
      key: page.href,
      category: page.category,
      title: page.title,
      description: page.description,
      href: page.href,
    })),
  ];

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-6 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-red-800">
          Search
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 md:text-5xl">
          {query ? `Results for "${query}"` : "Search bloggyNepal"}
        </h1>
        <p className="mt-3 text-slate-600">
          {query
            ? `${results.length} ${results.length === 1 ? "result" : "results"} found`
            : "Try a destination, district, region, or story title."}
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {results.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group block rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                {item.category}
              </span>
              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {item.title}
              </h2>
              {item.description && (
                <p className="mt-2 leading-relaxed text-slate-600">
                  {item.description}
                </p>
              )}
            </Link>
          ))}

          {query && results.length === 0 && (
            <p className="text-slate-500">
              No matches yet — try a different search term.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}