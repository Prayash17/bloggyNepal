export default function BlogPage() {
  const posts = [
    {
      date: "November 18, 2025",
      region: "Everest Region",
      title: "Why I Keep Returning to the Khumbu",
      excerpt:
        "A short reflection on the people, monasteries, and quiet moments that keep me coming back to the Everest region year after year.",
      slug: "returning-to-khumbu",
    },
    {
      date: "October 04, 2025",
      region: "Annapurna",
      title: "Three Days on the Annapurna Trail",
      excerpt:
        "A photographer walks through villages, terraced fields, and the quiet rhythms of life on the mountainside.",
      slug: "annapurna-three-days",
    },
    {
      date: "September 12, 2025",
      region: "Lumbini",
      title: "The Stillness of Lumbini at Sunrise",
      excerpt:
        "Pilgrims, monks, and the soft chaos of birds at the birthplace of Buddha.",
      slug: "lumbini-sunrise",
    },
    {
      date: "August 22, 2025",
      region: "Langtang",
      title: "A Letter from Langtang",
      excerpt:
        "On rebuilding, resilience, and the mountains that never stop giving back to those who walk among them.",
      slug: "letter-from-langtang",
    },
    {
      date: "July 03, 2025",
      region: "Upper Mustang",
      title: "Notes from a Forbidden Kingdom",
      excerpt:
        "Crossing the pass into Mustang feels like stepping through a crack in time. Here is what I found there.",
      slug: "mustang-notes",
    },
    {
      date: "May 18, 2025",
      region: "Kathmandu Valley",
      title: "The Old City After the Rains",
      excerpt:
        "The temples of Bhaktapur, the prayers of Pashupatinath, and the smell of monsoon over Durbar Square.",
      slug: "kathmandu-after-rains",
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            The Blog
          </p>
          <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Stories from Nepal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Slow writing from my travels across the Himalayas. Updated when
            there is something worth sharing — not on a schedule.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-12 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group cursor-pointer border-b border-slate-200 pb-10 transition hover:border-[#8B0000]"
            >
              {/* Placeholder image (gradient) */}
              <div className="mb-6 h-56 overflow-hidden rounded-sm bg-gradient-to-br from-slate-300 to-slate-500 transition group-hover:opacity-90">
                <div className="flex h-full items-center justify-center text-5xl text-white/70">
                  🏔️
                </div>
              </div>

              {/* Meta */}
              <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                {post.date} • {post.region}
              </p>

              {/* Title */}
              <h2 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="mt-3 leading-relaxed text-slate-600">
                {post.excerpt}
              </p>

              {/* Read more link */}
              <p className="mt-4 text-sm font-medium uppercase tracking-wider text-[#8B0000]">
                Read story →
              </p>
            </article>
          ))}
        </div>

        {/* Empty state at bottom */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            More stories coming soon — subscribe to be notified.
          </p>
        </div>
      </section>
    </main>
  );
}
