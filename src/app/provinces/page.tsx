import Link from "next/link";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { allProvincesQuery } from "@/sanity/lib/queries";
import { ProvinceCard } from "@/components/ProvinceCard";
import type { Province } from "@/types/province";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    "Nepal's 7 Provinces | Regional Travel Guide",
    "Explore Nepal province by province with verified facts, district guides, destinations, culture, geography and practical travel planning.",
    "/provinces"
  );
}

export default async function ProvincesPage() {
  const provinces: Province[] = await client.fetch(allProvincesQuery);

  const population = provinces.reduce((sum, province) => sum + (province.population || 0), 0);
  const area = provinces.reduce((sum, province) => sum + (province.area || 0), 0);
  const districts = provinces.reduce(
    (sum, province) => sum + (province.districtCount ?? province.noOfDistricts ?? 0),
    0
  );

  return (
    <main className="bg-[#fbfaf7] text-slate-900">
      <section className="border-b border-stone-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-amber-300">
            Explore Nepal region by region
          </p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-serif text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Nepal&apos;s seven provinces are seven very different journeys.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
                Start with the big picture, then move naturally into districts, destination guides and local stories. These pages are built as regional hubs—not just administrative cards.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-serif text-3xl font-bold text-amber-300">{provinces.length}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/50">Provinces</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-serif text-3xl font-bold text-amber-300">{districts}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/50">Districts</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-serif text-3xl font-bold text-amber-300">{(population / 1_000_000).toFixed(1)}M</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-white/50">Population</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-800">Choose a region</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              From the eastern Himalaya to Nepal&apos;s far west
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Province pages explain the regional story; Explore Nepal remains the faster directory for searching all 77 districts.
            </p>
          </div>
          <Link
            href="/explore-nepal"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-red-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-900"
          >
            Search all 77 districts →
          </Link>
        </div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {provinces.map((province) => (
            <ProvinceCard key={province._id} province={province} />
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-stone-200 bg-white p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-800">BloggyNepal data standard</p>
          <h2 className="mt-3 font-serif text-3xl font-bold">One consistent national baseline</h2>
          <p className="mt-4 max-w-4xl leading-7 text-slate-600">
            Province population figures use Nepal&apos;s 2021 census baseline, while province areas are kept on one consistent nationwide statistical baseline so the seven province figures reconcile cleanly. Current travel logistics are handled separately on destination and district guides because roads, flights and local conditions can change.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Current province-area total in this directory: {area.toLocaleString()} km².
          </p>
        </div>
      </section>
    </main>
  );
}
