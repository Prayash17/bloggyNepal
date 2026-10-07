import { client } from "@/sanity/lib/client";
import type { Metadata } from "next";
import { allProvincesQuery } from "@/sanity/lib/queries";
import { ProvinceCard } from "@/components/ProvinceCard";
import type { Province } from "@/types/province";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    "Provinces of Nepal",
    "Explore the 7 provinces of Nepal — from the Himalayas to the Terai.",
    "/provinces"
  );
}

export default async function ProvincesPage() {
  const provinces: Province[] = await client.fetch(allProvincesQuery);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-gray-900">
          Provinces of Nepal
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Explore the 7 provinces of Nepal — from the Himalayas to the Terai.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {provinces.map((province) => (
          <ProvinceCard key={province._id} province={province} />
        ))}
      </div>
    </main>
  );
}
