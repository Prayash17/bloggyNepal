"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { client } from "@/lib/sanity";
import FeaturedSection from "@/components/FeaturedSection";

// ─── Reveal-on-scroll hook ──────────────────────────────────────────
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

// ─── Data fetchers ──────────────────────────────────────────────────
async function getFeaturedContent() {
  const [destinations, stories] = await Promise.all([
    client.fetch(`
      *[_type == "destination" && featured == true] | order(_createdAt desc)[0...4] {
        _id, title, slug, region, coverImage, excerpt, duration, startingCost, maxAltitude
      }
    `),
    client.fetch(`
      *[_type == "post" && featured == true] | order(_createdAt desc)[0...4] {
        _id, title, slug, region, excerpt, coverImage, publishedAt
      }
    `),
  ]);
  return { destinations, stories };
}

// ─── Static content ────────────────────────────────────────────────
const travellerTools = [
  {
    icon: "🗺️",
    title: "Routes that make sense",
    description:
      "Clear transport details, practical maps, and realistic ways to get there.",
  },
  {
    icon: "📋",
    title: "Itineraries you can follow",
    description:
      "Day-by-day plans built around real travel pace, not rushed checklists.",
  },
  {
    icon: "💰",
    title: "Honest cost breakdowns",
    description:
      "Know what to budget in NPR and USD before you leave home.",
  },
  {
    icon: "🎒",
    title: "Useful local insight",
    description:
      "Packing advice, altitude tips, and the details that make travel smoother.",
  },
];

const stats = [
  { value: "7", label: "Regions covered" },
  { value: "60+", label: "Travel guides" },
  { value: "100%", label: "Solo-friendly" },
  { value: "0₹", label: "Sponsored fluff" },
];

// ─── Tiny inline icons ──────────────────────────────────────────────
function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-amber-300"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Main page ──────────────────────────────────────────────────────
export default function Home() {
  const [videoReady, setVideoReady] = useState(false);
  const [content, setContent] = useState<{ destinations: any[]; stories: any[] }>({
    destinations: [],
    stories: [],
  });

  const storyReveal = useReveal<HTMLDivElement>();
  const toolsReveal = useReveal<HTMLDivElement>();
  const ctaReveal = useReveal<HTMLDivElement>();

  useEffect(() => {
    let mounted = true;
    getFeaturedContent().then((data) => mounted && setContent(data));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-slate-900">
        {/* ═══════════════════════════════════════════════════════════════
            HERO — Video background with parallax + cinematic typography
           ═══════════════════════════════════════════════════════════════ */}
        <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
          {/* Video layer */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Poster while video buffers */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                videoReady ? "opacity-0" : "opacity-100"
              }`}
              style={{ backgroundImage: "url('/nepal-hero-poster.jpg')" }}
            />
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/nepal-hero-poster.jpg"
              onCanPlay={() => setVideoReady(true)}
              className={`h-full w-full object-cover transition-opacity duration-700 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src="/nepal-hero.webm" type="video/webm" />
              <source src="/Hero-Video.mp4" type="video/mp4" />
            </video>

            {/* Cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

            {/* Animated color washes */}
            <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl animate-blob" />
            <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-red-700/25 blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl animate-blob animation-delay-4000" />
          </div>

          {/* Hero content */}
          <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-8">
            <div className="max-w-4xl text-white">
              <p className="reveal-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>
                हिमालय · Travel deeper
              </p>

              <h1 className="reveal-up [animation-delay:150ms] mt-8 font-serif text-5xl font-bold leading-[0.92] tracking-tight sm:text-7xl lg:text-[5.5rem]">
                Nepal, beyond
                <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                  the postcard.
                </span>
              </h1>

              <p className="reveal-up [animation-delay:300ms] mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                Honest guides, memorable stories, and practical tools for solo
                travellers who want to experience Nepal with{" "}
                <span className="text-amber-300">confidence</span> and{" "}
                <span className="text-amber-300">curiosity</span>.
              </p>

              <div className="reveal-up [animation-delay:450ms] mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/destinations"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-amber-300 px-8 py-4 font-bold text-slate-950 shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-500/50"
                >
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-300 via-orange-300 to-amber-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  Explore destinations
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-slate-950"
                >
                  Read travel stories
                </Link>
              </div>

              <div className="reveal-up [animation-delay:600ms] mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <Check /> Solo-travel friendly
                </span>
                <span className="flex items-center gap-2">
                  <Check /> Real budgets
                </span>
                <span className="flex items-center gap-2">
                  <Check /> Local perspective
                </span>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70 md:flex">
            <span>Scroll</span>
            <span className="relative h-12 w-px overflow-hidden bg-white/20">
              <span className="absolute left-0 top-0 h-1/2 w-full bg-amber-300 animate-scroll-down" />
            </span>
          </div>

          {/* Photo credit */}
          <div className="absolute bottom-6 right-6 hidden text-xs italic tracking-wide text-white/50 md:block">
            Anuj Bhandari 
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            INTRO / MISSION
           ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={storyReveal.ref}
          className="relative overflow-hidden bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-32"
        >
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:24px_24px]" />

          <div
            className={`relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.35fr] transition-all duration-1000 ${
              storyReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div>
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />
                Why bloggyNepal
              </p>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-[1.05] text-slate-900 md:text-5xl lg:text-6xl">
                A better companion for the road ahead.
              </h2>
            </div>

            <div className="relative border-l-2 border-amber-400 pl-6 sm:pl-10">
              <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-[#f1ede4]" />
              <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
                Nepal is extraordinary, but planning it should not feel
                overwhelming.{" "}
                <span className="font-semibold text-slate-900">bloggyNepal</span>{" "}
                combines beautiful inspiration with the practical information you
                need to travel{" "}
                <span className="text-red-800">
                  further, safer, and more meaningfully
                </span>
                .
              </p>
              <Link
                href="/about"
                className="group mt-7 inline-flex items-center gap-2 font-bold text-red-800 transition hover:gap-3 hover:text-red-950"
              >
                Meet the person behind the guides
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div
            className={`relative mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-300 bg-stone-300 sm:grid-cols-4 transition-all duration-1000 delay-300 ${
              storyReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#f1ede4] px-6 py-8 text-center transition-colors duration-300 hover:bg-white"
              >
                <p className="font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
                  {s.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TRAVELLER TOOLS
           ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={toolsReveal.ref}
          className="bg-white px-6 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div
              className={`max-w-2xl transition-all duration-1000 ${
                toolsReveal.shown
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />
                Made for curious travellers
              </p>
              <h2 className="mt-5 font-serif text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
                Everything you need.
                <span className="text-stone-400"> Nothing you don't.</span>
              </h2>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {travellerTools.map((tool, index) => (
                <article
                  key={tool.title}
                  className={`group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfaf7] p-7 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-900/10 ${
                    toolsReveal.shown
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Animated background accent */}
                  <span className="absolute inset-x-0 -bottom-px h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-red-700 transition-transform duration-500 group-hover:scale-x-100" />

                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-3xl shadow-inner transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
                    {tool.icon}
                  </span>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    {tool.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    {tool.description}
                  </p>

                  {/* Hover arrow */}
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-red-800 opacity-0 transition-all duration-300 group-hover:gap-2 group-hover:opacity-100">
                    Learn more <span>→</span>
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CTA BAND
           ═══════════════════════════════════════════════════════════════ */}
        <section
          ref={ctaReveal.ref}
          className="relative overflow-hidden bg-slate-950 px-6 py-24 sm:px-8"
        >
          {/* Animated mesh */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl animate-blob" />
            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl animate-blob animation-delay-2000" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div
            className={`relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center transition-all duration-1000 ${
              ctaReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
                Find your next journey
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
                Mountains, culture, wildlife,
                <br className="hidden sm:block" /> and hidden corners.
              </h2>
            </div>
            <Link
              href="/explore-nepal"
              className="group relative inline-flex shrink-0 items-center gap-3 overflow-hidden rounded-full border border-amber-300 px-8 py-4 font-bold text-amber-200 transition-all duration-300 hover:bg-amber-300 hover:text-slate-950 hover:shadow-2xl hover:shadow-amber-500/30"
            >
              Explore Nepal your way
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURED DESTINATIONS & STORIES
           ═══════════════════════════════════════════════════════════════ */}
        <FeaturedSection
          destinations={content.destinations}
          stories={content.stories}
        />
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
         ═══════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#f1ede4] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr]">
            <div>
              <Link
                href="/"
                className="font-serif text-3xl font-bold text-slate-900"
              >
                bloggy<span className="text-red-800">Nepal</span>
              </Link>
              <p className="mt-4 max-w-md leading-relaxed text-slate-600">
                Honest travel guides for people who want to see Nepal more
                deeply, one journey at a time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  Explore
                </p>
                <div className="mt-4 flex flex-col gap-3 text-slate-600">
                  <Link
                    href="/destinations"
                    className="transition hover:text-red-800"
                  >
                    Destinations
                  </Link>
                  <Link href="/blog" className="transition hover:text-red-800">
                    Stories
                  </Link>
                  <Link
                    href="/explore-nepal"
                    className="transition hover:text-red-800"
                  >
                    Explore Nepal
                  </Link>
                </div>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  BloggyNepal
                </p>
                <div className="mt-4 flex flex-col gap-3 text-slate-600">
                  <Link href="/about" className="transition hover:text-red-800">
                    About
                  </Link>
                  <Link href="/" className="transition hover:text-red-800">
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-stone-300 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} bloggyNepal. Made for curious
              travellers.
            </p>
            <p>Travel slowly. Stay curious.</p>
          </div>
        </div>
      </footer>
    </>
  );
}