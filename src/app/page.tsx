import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-700">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
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

        {/* Top Right - Remark */}
        <div className="absolute right-6 top-6 z-20 hidden text-right md:block">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/80">
            Photograph by
          </p>
          <p className="mt-1 font-serif text-sm italic text-white/90">
            Samrat Khadka
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
            Notes, photographs, and honest stories from the Himalayas —
            <br className="hidden md:block" />
            sharing the Nepal beyond the postcards.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a
              href="/blog"
              className="rounded-sm border-2 border-white bg-white/10 px-8 py-3 font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[#8B0000]"
            >
              Read the Stories
            </a>
            <a
              href="/destinations"
              className="rounded-sm border-2 border-white/60 px-8 py-3 font-medium text-white transition hover:border-white hover:bg-white/10"
            >
              Browse Destinations
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

      {/* WELCOME / ABOUT THE BLOG SECTION */}
      <section className="bg-stone-100 px-6 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            About This Blog
          </p>
          <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Hello, I'm Prayash
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-slate-600">
            I created this space to share the Nepal I have come to love — the
            quiet mornings in mountain villages, the prayer flags catching the
            wind at altitude, and the everyday beauty that doesn't always
            make it to the postcards. Whether you are dreaming of visiting or
            already planning your trip, I hope these stories help you see
            Nepal a little more clearly.
          </p>
          <div className="mt-10 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
          <a
            href="/about"
            className="mt-10 inline-block text-sm font-medium uppercase tracking-[0.2em] text-[#8B0000] transition hover:text-[#5C1A1B]"
          >
            More about me →
          </a>
        </div>
      </section>

      {/* FEATURED STORIES PREVIEW */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
              Latest Stories
            </p>
            <h2 className="text-4xl font-semibold text-slate-800 md:text-5xl">
              From the Blog
            </h2>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {/* Story Card 1 */}
            <article className="group cursor-pointer">
              <div className="mb-6 h-48 overflow-hidden rounded-sm bg-gradient-to-br from-[#1e3a8a] to-slate-700">
                <div className="flex h-full items-end p-6 transition group-hover:scale-105">
                  <span className="text-5xl">🏔️</span>
                </div>
              </div>
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                November 18, 2025 • Everest Region
              </p>
              <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                Why I Keep Returning to the Khumbu
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                A short reflection on the people, monasteries, and quiet
                moments that keep me coming back to the Everest region.
              </p>
            </article>

            {/* Story Card 2 */}
            <article className="group cursor-pointer">
              <div className="mb-6 h-48 overflow-hidden rounded-sm bg-gradient-to-br from-emerald-700 to-emerald-900">
                <div className="flex h-full items-end p-6 transition group-hover:scale-105">
                  <span className="text-5xl">🌄</span>
                </div>
              </div>
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                October 04, 2025 • Annapurna
              </p>
              <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                Three Days on the Annapurna Trail
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                A photographer walks through villages, terraced fields, and
                the quiet rhythms of life on the mountainside.
              </p>
            </article>

            {/* Story Card 3 */}
            <article className="group cursor-pointer">
              <div className="mb-6 h-48 overflow-hidden rounded-sm bg-gradient-to-br from-amber-700 to-amber-900">
                <div className="flex h-full items-end p-6 transition group-hover:scale-105">
                  <span className="text-5xl">🛕</span>
                </div>
              </div>
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                September 12, 2025 • Lumbini
              </p>
              <h3 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                The Stillness of Lumbini at Sunrise
              </h3>
              <p className="mt-3 leading-relaxed text-slate-600">
                Pilgrims, monks, and the soft chaos of birds at the
                birthplace of Buddha.
              </p>
            </article>
          </div>

          <div className="mt-16 text-center">
            <a
              href="/blog"
              className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
            >
              See All Stories
            </a>
          </div>
        </div>
      </section>

      {/* NEWSLETTER / JOIN SECTION */}
      <section className="bg-slate-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#DC143C]">
            Stay in Touch
          </p>
          <h2 className="text-4xl font-semibold md:text-5xl">
            Follow along on this journey
          </h2>
          <p className="mt-6 text-lg text-slate-300">
            I send out a quiet newsletter once or twice a month with new
            stories, photographs, and notes from my travels. No spam — just
            the good stuff.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full max-w-xs rounded-sm border border-slate-700 bg-slate-800 px-5 py-3 text-white placeholder:text-slate-500 focus:border-[#DC143C] focus:outline-none sm:w-auto"
            />
            <button className="w-full max-w-xs rounded-sm bg-[#8B0000] px-8 py-3 font-medium text-white transition hover:bg-[#5C1A1B] sm:w-auto">
              Subscribe
            </button>
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
            Sharing Nepal, one story at a time
          </p>
          <div className="my-8 flex justify-center gap-8 text-sm text-slate-600">
            <a href="/blog" className="transition hover:text-[#8B0000]">Stories</a>
            <a href="/destinations" className="transition hover:text-[#8B0000]">Destinations</a>
            <a href="/about" className="transition hover:text-[#8B0000]">About</a>
          </div>
          <div className="my-8 flex justify-center">
            <div className="h-px w-16 bg-slate-300" />
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} bloggyNepal. Every journey begins
            with a single step.
          </p>
        </div>
      </footer>
    </main>
  );
}
