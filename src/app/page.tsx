 import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 pt-20 text-slate-700">
      {/* HERO SECTION */}
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

        {/* Bottom-Left — Photographer credit */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:block">
          <p className="font-serif text-xs italic tracking-wide text-white/70">
            Photograph — Prayash Bhandari
          </p>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/70 md:text-base">
            हिमालय • Stories from the Roof of the World
          </p>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            Nepal
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-white/90 md:text-2xl">
            Honest travel guides, maps, and itineraries for solo travelers
            <br className="hidden md:block" />
            exploring Nepal beyond the postcards.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href="/destinations"
              className="rounded-sm border-2 border-white bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[#8B0000]"
            >
              Explore Destinations
            </a>
            <a
              href="/blog"
              className="rounded-sm border-2 border-white/60 px-8 py-3 font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Read Stories
            </a>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 text-white/70">
          <div className="flex flex-col items-center gap-2 text-xs uppercase tracking-widest">
            <span>Scroll to explore</span>
            <div className="h-8 w-px bg-white/60" />
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="bg-stone-100 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            What This Is
          </p>
          <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            A travel companion for Nepal
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-slate-600">
            I created this site for solo travelers and curious explorers who
            want real, practical information about Nepal — not just pretty
            photos. Every destination includes maps, day-by-day itineraries,
            cost breakdowns, packing lists, and honest tips from my own
            travels.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Whether you are planning your first trip or your tenth, I hope
            these guides help you travel further, safer, and with a clearer
            picture of what Nepal actually looks like.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
              What You'll Find
            </p>
            <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
              Built for Solo Travelers
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">
                🗺️
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Maps & Routes
              </h3>
              <p className="text-sm text-slate-600">
                Clear maps showing how to reach each destination from
                Kathmandu.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">
                📋
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Day-by-Day Itineraries
              </h3>
              <p className="text-sm text-slate-600">
                Realistic plans you can actually follow, written for solo
                travelers.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">
                💰
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Cost Breakdowns
              </h3>
              <p className="text-sm text-slate-600">
                Honest budgets in NPR and USD so you know what to expect.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8B0000]/10 text-3xl">
                🎒
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Packing Lists
              </h3>
              <p className="text-sm text-slate-600">
                What to bring for each season and altitude range.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATIONS PREVIEW */}
      <section className="bg-stone-100 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
              Featured
            </p>
            <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
              Popular Destinations
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Start with these well-loved routes — or explore the full list to
              find your own path.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Card 1 — Everest Base Camp */}
            <a
              href="/destinations/everest-base-camp"
              className="group block overflow-hidden rounded-sm bg-white shadow-md transition hover:shadow-2xl"
            >
              <div className="relative h-80 overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a] to-slate-900">
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-50 transition group-hover:scale-110 group-hover:opacity-70">
                  🏔️
                </div>
                <div className="absolute right-4 top-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                  14 days
                </div>
                <div className="absolute left-4 bottom-4 right-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  💰 from $1,200 • 📍 5,364m max altitude
                </div>
              </div>
              <div className="p-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#8B0000]">
                  Solukhumbu District
                </p>
                <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  Everest Base Camp
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  The classic Himalayan trek. Demanding, iconic, and unforgettable
                  for anyone who makes it to base camp.
                </p>
                <p className="mt-5 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                  Read Full Guide →
                </p>
              </div>
            </a>

            {/* Card 2 — Annapurna Circuit */}
            <a
              href="/destinations/annapurna-circuit"
              className="group block overflow-hidden rounded-sm bg-white shadow-md transition hover:shadow-2xl"
            >
              <div className="relative h-80 overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950">
                <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-50 transition group-hover:scale-110 group-hover:opacity-70">
                  🌄
                </div>
                <div className="absolute right-4 top-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                  12–18 days
                </div>
                <div className="absolute left-4 bottom-4 right-4 rounded-sm bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
                  💰 from $800 • 📍 5,416m Thorong La Pass
                </div>
              </div>
              <div className="p-8">
                <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#8B0000]">
                  Annapurna Region
                </p>
                <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  Annapurna Circuit
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  Diverse landscapes from subtropical forests to the icy
                  Thorong La Pass — one of the world's great treks.
                </p>
                <p className="mt-5 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                  Read Full Guide →
                </p>
              </div>
            </a>
          </div>

          {/* Smaller row — Langtang and PanchPokhari */}
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <a
              href="/destinations/langtang"
              className="group flex items-center gap-6 overflow-hidden rounded-sm bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-sky-700 to-sky-900 text-6xl">
                ⛰️
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                  7–10 days • from $500
                </p>
                <h3 className="text-xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  Langtang Valley
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Close to Kathmandu, deeply traditional, and rebuilt after 2015.
                </p>
              </div>
            </a>

            <a
              href="/destinations/panchpokhari"
              className="group flex items-center gap-6 overflow-hidden rounded-sm bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-sm bg-gradient-to-br from-purple-700 to-purple-900 text-6xl">
                🛕
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                  3–4 days • from $200
                </p>
                <h3 className="text-xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  PanchPokhari
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Five sacred lakes at 4,100m. Untouched, spiritual, unforgettable.
                </p>
              </div>
            </a>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/destinations"
              className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
            >
              See All Destinations →
            </a>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-stone-100 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-2xl font-semibold text-slate-800">
            bloggyNepal
          </p>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-slate-500">
            Honest travel guides for exploring Nepal
          </p>
          <div className="my-8 flex justify-center gap-8 text-sm text-slate-600">
            <a href="/blog" className="transition hover:text-[#8B0000]">
              Stories
            </a>
            <a href="/destinations" className="transition hover:text-[#8B0000]">
              Destinations
            </a>
            <a href="/about" className="transition hover:text-[#8B0000]">
              About
            </a>
          </div>
          <div className="my-8 flex justify-center">
            <div className="h-px w-16 bg-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} bloggyNepal. Made for solo travelers
            exploring Nepal.
          </p>
        </div>
      </footer>
    </main>
  );
}
