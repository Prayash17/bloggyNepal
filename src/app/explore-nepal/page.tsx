import { client } from "@/sanity/lib/client";
import { allDistrictsQuery } from "@/sanity/lib/queries";
import { DistrictCard } from "@/components/DistrictCard";
import type { District } from "@/types/district";
import { Breadcrumb } from "@/components/Breadcrumb";
import Link from "next/link";

export const revalidate = 3600;

export default async function AllDistrictsPage() {
  const districts: District[] = await client.fetch(allDistrictsQuery);

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-blue-50">
      {/* ============ HERO HEADER ============ */}
      <section
        className="relative h-[40vh] min-h-[300px] w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #DC143C 0%, #B22234 40%, #1E40AF 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.4),transparent_50%)]" />
          <div className="h-full w-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-yellow-200">
            Explore Nepal
          </p>
          <h1 className="text-5xl font-bold md:text-6xl">All Districts</h1>
          <p className="mt-4 text-lg text-white/90">
            77 districts across 7 provinces — discover the diversity of Nepal
          </p>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 60"
            className="w-full"
          >
            <path
              fill="#fafaf9"
              d="M0,32 C360,60 1080,0 1440,32 L1440,60 L0,60 Z"
            />
          </svg>
        </div>
      </section>

      {/* ============ BREADCRUMB ============ */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Districts" },
          ]}
        />
      </div>

      {/* ============ STATS BAR ============ */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600 md:text-4xl">7</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 md:text-sm">
              Provinces
            </p>
          </div>
          <div className="border-x border-stone-200 text-center">
            <p className="text-3xl font-bold text-blue-600 md:text-4xl">77</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 md:text-sm">
              Districts
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 md:text-4xl">
              {districts
                .reduce((sum, d) => sum + (d.population || 0), 0)
                .toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-slate-500 md:text-sm">
              Total Population
            </p>
          </div>
        </div>
      </section>

      {/* ============ QUICK LINKS TO PROVINCES ============ */}
      <section className="mx-auto max-w-7xl px-6 pb-6">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-600">
          Browse by Province:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Koshi", num: 1 },
            { name: "Madhesh", num: 2 },
            { name: "Bagmati", num: 3 },
            { name: "Gandaki", num: 4 },
            { name: "Lumbini", num: 5 },
            { name: "Karnali", num: 6 },
            { name: "Sudurpashchim", num: 7 },
          ].map((p) => (
            <Link
              key={p.num}
              href={`/provinces/${p.name.toLowerCase()}`}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-red-600 hover:bg-red-50 hover:text-red-700"
            >
              #{p.num} {p.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ============ DISTRICTS GRID ============ */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-slate-800">
            All Districts ({districts.length})
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {districts.map((district) => (
            <DistrictCard key={district._id} district={district} />
          ))}
        </div>
      </section>
    </main>
  );
}
