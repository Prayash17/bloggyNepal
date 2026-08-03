export default function DestinationsPage() {
  const destinations = [
    {
      emoji: "🏔️",
      name: "Everest & Khumbu",
      region: "Solukhumbu District",
      elevation: "5,364m base camp",
      description:
        "The world highest peak and the legendary Sherpa homeland. Monasteries, prayer wheels, and trails that millions dream of walking.",
      slug: "everest-khumbu",
      gradient: "from-[#1e3a8a] to-slate-700",
    },
    {
      emoji: "🌄",
      name: "Annapurna Region",
      region: "Gandaki Province",
      elevation: "4,130m base camp",
      description:
        "Diverse landscapes from subtropical forests to the icy amphitheater of the Annapurna Sanctuary. One of the most varied treks on earth.",
      slug: "annapurna",
      gradient: "from-emerald-700 to-emerald-900",
    },
    {
      emoji: "🛕",
      name: "Lumbini & Terai",
      region: "Rupandehi District",
      elevation: "150m plains",
      description:
        "The birthplace of Buddha, surrounded by monasteries built by nations around the world. Quiet, gentle, deeply spiritual.",
      slug: "lumbini-terai",
      gradient: "from-amber-700 to-amber-900",
    },
    {
      emoji: "🦌",
      name: "Chitwan National Park",
      region: "Subtropical lowlands",
      elevation: "100–815m",
      description:
        "Jungle safaris, one-horned rhinos, and the bird-rich rivers of the Terai. A perfect counterpoint to the high mountains.",
      slug: "chitwan",
      gradient: "from-orange-700 to-red-900",
    },
    {
      emoji: "🏯",
      name: "Upper Mustang",
      region: "Rain shadow desert",
      elevation: "3,840m capital",
      description:
        "A forbidden kingdom until 1992, Mustang feels like Tibet without the crowds. Cave monasteries and ochre cliffs.",
      slug: "mustang",
      gradient: "from-stone-600 to-stone-900",
    },
    {
      emoji: "⛰️",
      name: "Langtang Valley",
      region: "Rasuwa District",
      elevation: "3,870m valley",
      description:
        "Close to Kathmandu, deeply traditional, and rebuilt with extraordinary resilience after the 2015 earthquake.",
      slug: "langtang",
      gradient: "from-sky-700 to-sky-900",
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            Browse
          </p>
          <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Where to Go in Nepal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            From the highest mountains to the deepest jungles — an honest
            guide to the regions I have walked through, written for travelers
            who want the real picture.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((dest) => (
            <article
              key={dest.slug}
              className="group cursor-pointer overflow-hidden rounded-sm bg-white shadow-sm transition hover:shadow-xl"
            >
              {/* Image Header (gradient placeholder) */}
              <div
                className={`relative flex h-44 items-end overflow-hidden bg-gradient-to-br ${dest.gradient} p-6 transition group-hover:opacity-95`}
              >
                <span className="text-6xl">{dest.emoji}</span>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">
                  {dest.region}
                </p>
                <h2 className="text-xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  {dest.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {dest.elevation}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {dest.description}
                </p>
                <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                  Explore →
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-20 text-center">
          <p className="text-sm text-slate-500">
            More destinations coming soon. Each one is added only after I have
            walked the trails myself.
          </p>
        </div>
      </section>
    </main>
  );
}
