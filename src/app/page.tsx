import Image from "next/image";
import Link from "next/link";
import { client } from "@/lib/sanity";
import FeaturedSection from "@/components/FeaturedSection";

// Fetch featured content from Sanity
async function getFeaturedContent() {
  const destinations = await client.fetch(`
    *[_type == "destination" && featured == true] | order(_createdAt desc)[0...4] {
      _id, title, slug, region, coverImage, excerpt, duration, startingCost, maxAltitude
    }
  `);
  const stories = await client.fetch(`
    *[_type == "post" && featured == true] | order(_createdAt desc)[0...4] {
      _id, title, slug, region, excerpt, coverImage, publishedAt
    }
  `);
  return { destinations, stories };
}

export default async function Home() {
  const { destinations, stories } = await getFeaturedContent();

  return (
    <main className="min-h-screen bg-stone-50 text-slate-700">
      {/* HERO SECTION - EXACTLY AS ORIGINAL */}
      <section className="relative h-[calc(100vh-5rem)] w-full overflow-hidden">
        <Image
          src="/nepal-hero.jpg"
          alt="Machhapuchhre mountain with Nepali flag and prayer flags"
          fill
          priority
          quality={90}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 z-20 hidden md:block">
          <p className="font-serif text-xs italic tracking-wide text-white/70">Photograph — Prayash Bhandari</p>
        </div>
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/70 md:text-base">
            हिमालय • Stories from the Roof of the World
          </p>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">Nepal</h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-white/90 md:text-2xl">
            Honest travel guides, maps, and itineraries for solo travelers
            <br className="hidden md:block" />
            exploring Nepal beyond the postcards.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/destinations" className="rounded-sm border-2 border-white bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[#8B0000]">
              Explore Destinations
            </Link>
            <Link href="/blog" className="rounded-sm border-2 border-white/60 px-8 py-3 font-medium text-white transition hover:border-white hover:bg-white/10">
              Read Stories
            </Link>
          </div>
        </div>
        <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 text-white/70">
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest">
            <span>Scroll to explore</span>
            <div className="h-8 w-px bg-white/60" />
          </div>
        </div>
      </section>

      {/* MISSION SECTION - EXACTLY AS ORIGINAL */}
      <section className="bg-stone-100 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">What This Is</p>
          <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">A travel companion for Nepal</h2>
          <p className="mt-8 text-lg leading-relaxed text-slate-600">
            I created this site for solo travelers and curious explorers who want real, practical information about Nepal — not just pretty photos. Every destination includes maps, day-by-day itineraries, cost breakdowns, packing lists, and honest tips from my own travels.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Whether you are planning your first trip or your tenth, I hope these guides help you travel further, safer, and with a clearer picture of what Nepal actually looks like.
          </p>
          <div className="mt-10 flex justify-center"><div className="h-px w-24 bg-[#8B0000]" /></div>
        </div>
      </section>

      {/* HOW IT WORKS - EXACTLY AS ORIGINAL */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">What You&apos;ll Find</p>
            <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">Built for Solo Travelers</h2>
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">🗺️</div><h3 className="mb-2 text-lg font-semibold text-slate-800">Maps & Routes</h3><p className="text-sm text-slate-600">Clear maps showing how to reach each destination from Kathmandu.</p></div>
            <div className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">📋</div><h3 className="mb-2 text-lg font-semibold text-slate-800">Day-by-Day Itineraries</h3><p className="text-sm text-slate-600">Realistic plans you can actually follow, written for solo travelers.</p></div>
            <div className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">💰</div><h3 className="mb-2 text-lg font-semibold text-slate-800">Cost Breakdowns</h3><p className="text-sm text-slate-600">Honest budgets in NPR and USD so you know what to expect.</p></div>
            <div className="text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">🎒</div><h3 className="mb-2 text-lg font-semibold text-slate-800">Packing Lists</h3><p className="text-sm text-slate-600">What to bring for each season and altitude range.</p></div>
          </div>
        </div>
      </section>

      {/* DYNAMIC FEATURED SECTION */}
      <FeaturedSection destinations={destinations} stories={stories} />

      {/* FOOTER - EXACTLY AS ORIGINAL */}
      <footer className="border-t border-slate-200 bg-stone-100 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-2xl font-semibold text-slate-800">bloggyNepal</p>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">Honest travel guides for exploring Nepal</p>
          <div className="my-8 flex justify-center gap-8 text-sm text-slate-600">
            <Link href="/blog" className="transition hover:text-[#8B0000]">Stories</Link>
            <Link href="/destinations" className="transition hover:text-[#8B0000]">Destinations</Link>
            <Link href="/explore-nepal" className="transition hover:text-[#8B0000]">Explore Nepal</Link>
            <Link href="/about" className="transition hover:text-[#8B0000]">About</Link>
          </div>
          <div className="my-8 flex justify-center"><div className="h-px w-16 bg-slate-300" /></div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} bloggyNepal. Made for solo travelers exploring Nepal.</p>
        </div>
      </footer>
    </main>
  );
}