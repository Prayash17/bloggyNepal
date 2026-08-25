"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Reveal-on-scroll hook ────────────────────────────────────────────
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

const values = [
  {
    number: "01",
    title: "Travel with honesty",
    text: "Practical, thoughtful information for solo travellers, groups, and anyone planning their own Nepal journey.",
  },
  {
    number: "02",
    title: "Share Nepal deeply",
    text: "Beyond the postcard: culture, traditions, landscapes, food, people, and the small moments that stay with you.",
  },
  {
    number: "03",
    title: "Stay connected",
    text: "A space for people who love nature, meaningful travel, and seeing the world with more curiosity.",
  },
];

export default function AboutPage() {
  const storyReveal = useReveal<HTMLDivElement>();
  const valuesReveal = useReveal<HTMLDivElement>();
  const closingReveal = useReveal<HTMLDivElement>();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-700">
      {/* ═══════ HERO ═══════ */}
      <section className="relative isolate overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:py-32">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl animate-blob" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:32px_32px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <p className="reveal-up inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            About bloggyNepal
          </p>

          <h1 className="reveal-up [animation-delay:150ms] mt-7 font-serif text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Nepal deserves to be
            <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
              felt, not just seen.
            </span>
          </h1>

          <p className="reveal-up [animation-delay:300ms] mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            A personal travel journal for people everywhere who want to slow
            down, explore Nepal, and discover a little more of the world.
          </p>

          <div className="reveal-up [animation-delay:450ms] mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/65">
            <span className="flex items-center gap-2">
              <Dot /> Honest words
            </span>
            <span className="flex items-center gap-2">
              <Dot /> Local eyes
            </span>
            <span className="flex items-center gap-2">
              <Dot /> Slow travel
            </span>
          </div>
        </div>
      </section>

      {/* ═══════ WHY I STARTED ═══════ */}
      <section
        ref={storyReveal.ref}
        className="px-6 py-24 sm:px-8 lg:py-32"
      >
        <div
          className={`mx-auto max-w-5xl transition-all duration-1000 ${
            storyReveal.shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />
                Why I started
              </p>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-[1.05] text-slate-900 md:text-5xl">
                To share the Nepal I know and love.
              </h2>
            </div>

            <article className="space-y-6 text-lg leading-relaxed text-slate-600">
              <p>
                I started bloggyNepal because I want people from around the
                world to know my country beyond a name on a map. Nepal is more
                than its famous mountains. It is our{" "}
                <span className="font-semibold text-slate-900">
                  culture, traditions, hills, forests, food, villages,
                  festivals,
                </span>{" "}
                and the kindness of everyday people.
              </p>

              <p>
                This website is for travellers who want to step away from the
                noise of work and daily life, take their time, and experience
                the beauty of Nepal for themselves. Whether you travel alone,
                with friends, or with family, I hope these guides and stories
                help you explore with{" "}
                <span className="text-red-800">more confidence</span>.
              </p>

              <p>
                I am not a travel agency, and I am not here to sell packaged
                trips. I am just an ordinary person who loves nature, people,
                and the feeling of discovering somewhere new. I want to show
                what exists on the other side of the world, through honest
                information and stories from my own experiences.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════ VALUES ═══════ */}
      <section
        ref={valuesReveal.ref}
        className="relative bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-32"
      >
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative mx-auto max-w-7xl">
          <div
            className={`max-w-2xl transition-all duration-1000 ${
              valuesReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
              <span className="h-px w-8 bg-red-800" />
              What you will find here
            </p>
            <h2 className="mt-5 font-serif text-4xl font-bold text-slate-900 md:text-5xl">
              Travel inspiration with a human point of view.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {values.map((value, i) => (
              <article
                key={value.number}
                className={`group relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-900/10 ${
                  valuesReveal.shown
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <span className="absolute inset-x-0 -bottom-px h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-red-700 transition-transform duration-500 group-hover:scale-x-100" />

                <p className="font-serif text-3xl font-bold text-red-800">
                  {value.number}
                </p>
                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {value.title}
                </h3>
                <p className="mt-3 leading-relaxed text-slate-600">
                  {value.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ MY STORIES / CLOSING ═══════ */}
      <section ref={closingReveal.ref} className="px-6 py-24 sm:px-8 lg:py-32">
        <div
          className={`mx-auto max-w-3xl transition-all duration-1000 ${
            closingReveal.shown ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <article className="space-y-8 text-lg leading-relaxed text-slate-600">
            <div>
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />
                My stories
              </p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-[1.05] text-slate-900 md:text-5xl">
                Few stories. Memorable moments.
              </h2>
            </div>

            <p>
              The stories I share may be few and limited, but every one comes
              from a real moment that meant something to me. I write about
              places I have experienced, people I have met, and the memories
              that stayed long after the journey ended.
            </p>

            <p>
              If this blog grows and earns something in the future, my dream is
              simple: to travel more of Nepal with my family and loved ones,
              and keep sharing the country through my own eyes.
            </p>

            <blockquote className="relative rounded-2xl border-l-4 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100/60 px-6 py-7 font-serif text-2xl leading-relaxed text-slate-800 shadow-sm sm:px-8 sm:text-3xl">
              <span className="absolute -top-3 left-6 text-5xl text-amber-400/40 select-none">
                &ldquo;
              </span>
              Our bodies may feel pain, but we are made for infinite joy.
            </blockquote>

            <p>
              Wherever you are reading from, thank you for taking the time to
              be here. I pray for your well-being. Stay positive, connect with
              nature and people, and keep exploring your way out of negativity.
              May you find more of what brings you joy.
            </p>
          </article>

          <div className="mt-14 flex flex-col gap-4 border-t border-stone-200 pt-10 sm:flex-row">
            <Link
              href="/blog"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-red-800 px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-red-900 hover:shadow-lg hover:shadow-red-900/20"
            >
              Read my stories
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/explore-nepal"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-7 py-4 font-bold text-slate-800 transition hover:border-amber-400 hover:bg-amber-50"
            >
              Explore Nepal
            </Link>
          </div>

          <p className="mt-10 text-sm text-slate-500">
            Want to get in touch?{" "}
            <a
              href="mailto:hello@bloggyNepal.com"
              className="font-semibold text-red-800 transition hover:text-red-950"
            >
              hello@bloggyNepal.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300" />
  );
}
