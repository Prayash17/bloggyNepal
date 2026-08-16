import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <section className="mx-auto max-w-3xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            About
          </p>
          <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Why This Blog Exists
          </h1>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>

        {/* Story */}
        <article className="space-y-6 text-lg leading-relaxed text-slate-600">
          <p>
            I started this blog because, after years of writing about Nepal
            only in my own notebooks, I wanted a place to share the country I
            have come to love with anyone planning to visit it.
          </p>

          <p>
            I am not a tour operator, and I am not selling anything. I am just
            a writer and photographer who keeps returning to the Himalayas
            because the mountains, the people, and the food have a way of
            making me put my phone away and pay attention.
          </p>

          <h2 className="pt-6 text-2xl font-semibold text-slate-800">
            What I write about
          </h2>

          <p>
            I focus on the Nepal you do not always see in glossy magazines —
            the village tea houses, the small shrines on quiet trails, the
            music at festival time, and the kindness of strangers on long
            bus rides. I write slowly, photograph carefully, and try not to
            exaggerate.
          </p>

          <h2 className="pt-6 text-2xl font-semibold text-slate-800">
            Who this is for
          </h2>

          <p>
            Anyone who dreams of visiting Nepal. Anyone already planning a
            trip. Anyone who has been to Nepal and wants to share stories
            with someone who understands. And anyone who simply loves
            mountains and is curious about the life lived at their feet.
          </p>

          <h2 className="pt-6 text-2xl font-semibold text-slate-800">
            How I work
          </h2>

          <ul className="ml-6 list-disc space-y-2 text-slate-600">
            <li>
              I write posts only after I have visited a place myself, on my
              own feet.
            </li>
            <li>
              I do not accept sponsored content, paid placements, or free
              trips in exchange for coverage.
            </li>
            <li>
              All photographs on this site are mine, taken with whatever
              camera was in my bag that day.
            </li>
            <li>
              I update this blog when there is something worth saying — not
              on a content calendar.
            </li>
          </ul>

          <h2 className="pt-6 text-2xl font-semibold text-slate-800">
            Get in touch
          </h2>

          <p>
            If you are planning a trip to Nepal, I would love to hear about
            it. Reach me at{" "}
            <a
              href="mailto:hello@bloggyNepal.com"
              className="text-[#8B0000] transition hover:text-[#DC143C]"
            >
              hello@bloggyNepal.com
            </a>{" "}
            or follow along on the newsletter below.
          </p>
        </article>

        {/* CTA */}
        <div className="mt-16 border-t border-slate-200 pt-10 text-center">
          <Link
            href="/blog"
            className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
          >
            Read the Stories →
          </Link>
        </div>
      </section>
    </main>
  );
}
