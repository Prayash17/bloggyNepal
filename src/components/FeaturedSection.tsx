 "use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/lib/sanity";

export default function FeaturedSection({ destinations, stories }: any) {
  const [activeTab, setActiveTab] = useState<"destinations" | "stories">("destinations");
  const items = activeTab === "destinations" ? destinations : stories;
  const isDestinations = activeTab === "destinations";

  return (
    <section className="bg-stone-100 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">Featured</p>
          <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Popular {isDestinations ? "Destinations" : "Stories"}
          </h2>

          {/* Toggle Buttons */}
          <div className="mt-6 inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("destinations")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "destinations" ? "bg-[#8B0000] text-white" : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Destinations
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition ${
                activeTab === "stories" ? "bg-[#8B0000] text-white" : "text-slate-600 hover:text-[#8B0000]"
              }`}
            >
              Stories
            </button>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            {isDestinations
              ? "Start with these well-loved routes — or explore the full list to find your own path."
              : "Read recent stories from the trails, tea houses, and towns across Nepal."}
          </p>
        </div>

        {/* Dynamic Grid */}
        {items.length > 0 ? (
          <div className="grid gap-10 lg:grid-cols-2">
            {items.map((item: any) => (
              <Link
                key={item._id}
                href={isDestinations ? `/destinations/${item.slug.current}` : `/blog/${item.slug.current}`}
                className="group block overflow-hidden rounded-sm bg-white shadow-md transition hover:shadow-2xl"
              >
                <div className="relative h-80 overflow-hidden bg-slate-200">
                  {item.coverImage ? (
                    <Image
                      src={urlForImage(item.coverImage).width(800).height(500).url()}
                      alt={item.coverImage.alt || item.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-50 bg-gradient-to-br from-slate-700 to-slate-900">
                      {isDestinations ? "🏔️" : "📖"}
                    </div>
                  )}

                  {isDestinations && item.duration && (
                    <div className="absolute right-4 top-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                      {item.duration}
                    </div>
                  )}
                  {isDestinations && (item.startingCost || item.maxAltitude) && (
                    <div className="absolute left-4 bottom-4 right-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                      {item.startingCost && `💰 from $${item.startingCost}`}
                      {item.startingCost && item.maxAltitude && " • "}
                      {item.maxAltitude && `📍 ${item.maxAltitude}`}
                    </div>
                  )}

                  {!isDestinations && item.publishedAt && (
                    <div className="absolute left-4 bottom-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                      {new Date(item.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </div>
                  )}
                </div>

                <div className="p-8">
                  {item.region && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#8B0000]">{item.region}</p>
                  )}
                  <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600 line-clamp-2">{item.excerpt}</p>
                  <p className="mt-5 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                    {isDestinations ? "Read Full Guide →" : "Read Story →"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500">
            No featured {activeTab} yet. Mark some as "Featured" in your Sanity Studio.
          </p>
        )}

        <div className="mt-12 text-center">
          <Link
            href={isDestinations ? "/destinations" : "/blog"}
            className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
          >
            See All {isDestinations ? "Destinations" : "Stories"} →
          </Link>
        </div>
      </div>
    </section>
  );
}