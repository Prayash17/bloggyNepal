"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

import FeaturedSection, {
  type FeaturedDestination,
  type FeaturedStory,
} from "@/components/FeaturedSection";

/* =========================================================
   TYPES
========================================================= */

type FeaturedContent = {
  destinations: FeaturedDestination[];
  stories: FeaturedStory[];
};

type HomeClientProps = {
  content: FeaturedContent;
};

/* =========================================================
   REVEAL-ON-SCROLL HOOK
========================================================= */

function useReveal<
  T extends HTMLElement
>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (
      typeof window !==
        "undefined" &&
      "matchMedia" in window &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setShown(true);
      return;
    }

    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      setShown(true);
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry?.isIntersecting
          ) {
            setShown(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -80px 0px",
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    shown,
  };
}

/* =========================================================
   TRAVELLER TOOLS
========================================================= */

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
] as const;

/* =========================================================
   CHECK ICON
========================================================= */

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

/* =========================================================
   SOCIAL ICONS
========================================================= */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M15.2 3c.45 2.14 1.7 3.6 3.8 4.25v3.1a9.2 9.2 0 0 1-3.78-1.2v6.13c0 3.73-2.7 5.72-5.58 5.72-2.77 0-5.14-1.8-5.14-4.72 0-3.28 2.74-5.2 5.84-4.9v3.15c-.34-.08-.7-.12-1.08-.12-1.04 0-1.7.64-1.7 1.6 0 .87.65 1.54 1.61 1.54 1.06 0 1.79-.7 1.79-2.24V3h4.24Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.75l.4-3h-3.15V8.08c0-.87.24-1.46 1.5-1.46h1.6V3.94c-.28-.04-1.24-.12-2.38-.12-2.36 0-3.98 1.44-3.98 4.08V10H7.5v3h2.74v8h3.26Z" />
    </svg>
  );
}

/* =========================================================
   SOCIAL LINK SAFETY
========================================================= */

function isSafeExternalUrl(
  value: unknown
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^https?:\/\//i.test(
    value
  );
}

/* =========================================================
   MAIN HOMEPAGE CLIENT
========================================================= */

export default function HomeClient({
  content,
}: HomeClientProps) {
  const [videoReady, setVideoReady] =
    useState(false);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const storyReveal =
    useReveal<HTMLDivElement>();

  const toolsReveal =
    useReveal<HTMLDivElement>();

  const ctaReveal =
    useReveal<HTMLDivElement>();

  /* =======================================================
     REDUCED MOTION
  ======================================================== */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const updateMotionPreference =
      () => {
        setReducedMotion(
          mediaQuery.matches
        );
      };

    updateMotionPreference();

    mediaQuery.addEventListener(
      "change",
      updateMotionPreference
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  /* =======================================================
     DYNAMIC HOMEPAGE STATS
  ======================================================== */

  const homepageStats =
    useMemo(() => {
      const destinations =
        Array.isArray(
          content.destinations
        )
          ? content.destinations
          : [];

      const stories =
        Array.isArray(
          content.stories
        )
          ? content.stories
          : [];

      const regions =
        new Set(
          [
            ...destinations.map(
              (item) => item.region
            ),
            ...stories.map(
              (item) => item.region
            ),
          ].filter(
            (
              value
            ): value is string =>
              typeof value ===
                "string" &&
              value.trim().length > 0
          )
        );

      return [
        {
          value: String(
            regions.size
          ),
          label: "Regions represented",
        },
        {
          value:
            destinations.length > 0
              ? `${destinations.length}`
              : "0",
          label: "Featured destinations",
        },
        {
          value:
            stories.length > 0
              ? `${stories.length}`
              : "0",
          label: "Published stories",
        },
        {
          value: "Real",
          label: "Travel perspective",
        },
      ];
    }, [content]);

  /* =======================================================
     HERO VIDEO
  ======================================================== */

  const shouldRenderVideo =
    !reducedMotion;

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <main className="overflow-x-hidden">
        {/* ═════════════════════════════════════════════════════
            HERO
        ═════════════════════════════════════════════════════ */}

        <section
          aria-labelledby="homepage-title"
          className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
        >
          <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-950">
            {/* STATIC POSTER */}

            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
                videoReady &&
                shouldRenderVideo
                  ? "opacity-0"
                  : "opacity-100"
              }`}
              style={{
                backgroundImage:
                  "url('/nepal-hero-poster.jpg')",
              }}
            />

            {/* VIDEO */}

            {shouldRenderVideo && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/nepal-hero-poster.jpg"
                onCanPlay={() =>
                  setVideoReady(
                    true
                  )
                }
                onError={() =>
                  setVideoReady(
                    false
                  )
                }
                className={`h-full w-full object-cover transition-opacity duration-700 ${
                  videoReady
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                aria-hidden="true"
              >
                <source
                  src="/nepal-hero.webm"
                  type="video/webm"
                />

                <source
                  src="/Hero-Video.mp4"
                  type="video/mp4"
                />
              </video>
            )}

            {/* HERO OVERLAYS */}

            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/40 to-slate-950/95" />

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

            <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl motion-safe:animate-blob" />

            <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-red-700/25 blur-3xl motion-safe:animate-blob motion-safe:animation-delay-2000" />

            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-blob motion-safe:animation-delay-4000" />
          </div>

          {/* HERO CONTENT */}

          <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-8 lg:py-28">
            <div className="max-w-5xl text-white">
              <p className="motion-safe:reveal-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75 motion-reduce:hidden" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
                </span>

                हिमालय · Travel deeper
              </p>

              <h1
                id="homepage-title"
                className="motion-safe:reveal-up mt-8 font-serif text-5xl font-bold leading-[0.92] tracking-tight sm:text-7xl lg:text-[6rem]"
              >
                Nepal, beyond
                <span className="mt-2 block bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                  the postcard.
                </span>
              </h1>

              <p className="motion-safe:reveal-up mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
                Honest guides, memorable
                stories, and practical tools for
                travellers who want to experience
                Nepal with{" "}
                <span className="text-amber-300">
                  confidence
                </span>{" "}
                and{" "}
                <span className="text-amber-300">
                  curiosity
                </span>
                .
              </p>

              {/* PRIMARY ACTIONS */}

              <div className="motion-safe:reveal-up mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/destinations"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-8 py-4 font-bold text-slate-950 shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-200 hover:shadow-amber-500/50"
                >
                  Explore destinations

                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
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

              {/* TRUST POINTS */}

              <div className="motion-safe:reveal-up mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <Check />
                  Practical information
                </span>

                <span className="flex items-center gap-2">
                  <Check />
                  Real experiences
                </span>

                <span className="flex items-center gap-2">
                  <Check />
                  Local perspective
                </span>
              </div>
            </div>
          </div>

          {/* SCROLL INDICATOR */}

          {!reducedMotion && (
            <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70 md:flex">
              <span>Scroll</span>

              <span className="relative h-12 w-px overflow-hidden bg-white/20">
                <span className="absolute left-0 top-0 h-1/2 w-full bg-amber-300 animate-scroll-down motion-reduce:hidden" />
              </span>
            </div>
          )}

          <div className="absolute bottom-6 right-6 hidden text-xs italic tracking-wide text-white/50 md:block">
            bloggyNepal
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════
            INTRO / MISSION
        ═════════════════════════════════════════════════════ */}

        <section
          ref={storyReveal.ref}
          aria-labelledby="mission-title"
          className="relative overflow-hidden bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-32"
        >
          <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:24px_24px]" />

          <div
            className={`relative mx-auto grid max-w-7xl items-center gap-14 transition-all duration-1000 lg:grid-cols-[1fr_1.35fr] ${
              storyReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
          >
            <div>
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />

                Why bloggyNepal
              </p>

              <h2
                id="mission-title"
                className="mt-5 font-serif text-4xl font-bold leading-[1.05] text-slate-900 md:text-5xl lg:text-6xl"
              >
                A better companion
                <br className="hidden sm:block" />
                for the road ahead.
              </h2>
            </div>

            <div className="relative border-l-2 border-amber-400 pl-6 sm:pl-10">
              <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-[#f1ede4]" />

              <p className="text-lg leading-relaxed text-slate-700 sm:text-xl">
                Nepal is extraordinary, but
                planning it should not feel
                overwhelming.{" "}
                <span className="font-semibold text-slate-900">
                  bloggyNepal
                </span>{" "}
                combines beautiful inspiration
                with practical information that
                helps you travel{" "}
                <span className="font-semibold text-red-800">
                  further, smarter, and more
                  meaningfully
                </span>
                .
              </p>

              <Link
                href="/about"
                className="group mt-7 inline-flex items-center gap-2 font-bold text-red-800 transition hover:gap-3 hover:text-red-950"
              >
                Meet the person behind the guides

                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* DYNAMIC STATS */}

          <div
            className={`relative mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-stone-300 bg-stone-300 transition-all delay-300 duration-1000 sm:grid-cols-4 ${
              storyReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
          >
            {homepageStats.map(
              (stat) => (
                <div
                  key={stat.label}
                  className="bg-[#f1ede4] px-5 py-8 text-center transition-colors duration-300 hover:bg-white sm:px-6"
                >
                  <p className="font-serif text-3xl font-bold text-slate-900 sm:text-5xl">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:text-xs">
                    {stat.label}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════
            TRAVELLER TOOLS
        ═════════════════════════════════════════════════════ */}

        <section
          ref={toolsReveal.ref}
          aria-labelledby="tools-title"
          className="bg-white px-6 py-24 sm:px-8 lg:py-32"
        >
          <div className="mx-auto max-w-7xl">
            <div
              className={`max-w-2xl transition-all duration-1000 ${
                toolsReveal.shown
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
            >
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />

                Made for curious travellers
              </p>

              <h2
                id="tools-title"
                className="mt-5 font-serif text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl"
              >
                Everything you need.
                <span className="text-stone-400">
                  {" "}
                  Nothing you don't.
                </span>
              </h2>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {travellerTools.map(
                (tool, index) => (
                  <article
                    key={tool.title}
                    className={`group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfaf7] p-7 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-900/10 ${
                      toolsReveal.shown
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
                    style={{
                      transitionDelay:
                        `${index * 100}ms`,
                    }}
                  >
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
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════
            CTA BAND
        ═════════════════════════════════════════════════════ */}

        <section
          ref={ctaReveal.ref}
          aria-labelledby="cta-title"
          className="relative overflow-hidden bg-slate-950 px-6 py-24 sm:px-8"
        >
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl motion-safe:animate-blob" />

            <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl motion-safe:animation-delay-2000" />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

          <div
            className={`relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 transition-all duration-1000 lg:flex-row lg:items-center ${
              ctaReveal.shown
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
                Find your next journey
              </p>

              <h2
                id="cta-title"
                className="mt-4 font-serif text-3xl font-bold leading-tight text-white sm:text-5xl"
              >
                Mountains, culture, wildlife,
                <br className="hidden sm:block" />
                and hidden corners.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
                Explore Nepal beyond the places
                everyone already knows.
              </p>
            </div>

            <Link
              href="/explore-nepal"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-amber-300 px-8 py-4 font-bold text-amber-200 transition-all duration-300 hover:bg-amber-300 hover:text-slate-950 hover:shadow-2xl hover:shadow-amber-500/30"
            >
              Explore Nepal your way

              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════
            SOCIAL MEDIA
        ═════════════════════════════════════════════════════ */}

        <section
          aria-labelledby="social-title"
          className="relative overflow-hidden bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-28"
        >
          <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-red-700/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
                <span className="h-px w-8 bg-red-800" />

                Follow the journey

                <span className="h-px w-8 bg-red-800" />
              </p>

              <h2
                id="social-title"
                className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-900 md:text-5xl"
              >
                Nepal doesn't end when
                you leave the website.
              </h2>

              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Follow bloggyNepal for more places,
                stories, travel ideas, and moments
                from Nepal beyond the postcard.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
              {/* INSTAGRAM */}

              {isSafeExternalUrl(
                siteConfig.social
                  .instagram
              ) && (
                <a
                  href={
                    siteConfig.social
                      .instagram
                  }
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="Follow bloggyNepal on Instagram"
                  className="group rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 text-red-800">
                      <InstagramIcon />
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-800"
                    >
                      ↗
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    Instagram
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    See Nepal visually
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    Follow the places, people,
                    moments, and landscapes that
                    make Nepal unforgettable.
                  </p>
                </a>
              )}

              {/* TIKTOK */}

              {isSafeExternalUrl(
                siteConfig.social
                  .tiktok
              ) && (
                <a
                  href={
                    siteConfig.social
                      .tiktok
                  }
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="Follow bloggyNepal on TikTok"
                  className="group rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                      <TikTokIcon />
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-800"
                    >
                      ↗
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    TikTok
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Travel in short stories
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    Quick travel ideas, hidden
                    corners, practical tips, and
                    moments from the road.
                  </p>
                </a>
              )}

              {/* FACEBOOK */}

              {isSafeExternalUrl(
                siteConfig.social
                  .facebook
              ) && (
                <a
                  href={
                    siteConfig.social
                      .facebook
                  }
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label="Follow bloggyNepal on Facebook"
                  className="group rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <FacebookIcon />
                    </span>

                    <span
                      aria-hidden="true"
                      className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-800"
                    >
                      ↗
                    </span>
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                    Facebook
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-slate-900">
                    Join the community
                  </h3>

                  <p className="mt-3 leading-relaxed text-slate-600">
                    Stay connected with travel
                    stories, updates, discussions,
                    and new guides.
                  </p>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════
            FEATURED CONTENT
        ═════════════════════════════════════════════════════ */}

        <FeaturedSection
          destinations={
            content.destinations
          }
          stories={
            content.stories
          }
        />
      </main>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}

      <footer className="bg-[#f1ede4] px-6 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 border-b border-stone-300 pb-14 md:grid-cols-[1.2fr_1fr]">
            {/* BRAND */}

            <div>
              <Link
                href="/"
                className="font-serif text-3xl font-bold text-slate-900"
              >
                bloggy
                <span className="text-red-800">
                  Nepal
                </span>
              </Link>

              <p className="mt-4 max-w-md leading-relaxed text-slate-600">
                Honest travel guides and stories
                for people who want to experience
                Nepal more deeply, one journey at
                a time.
              </p>

              <div className="mt-7 flex items-center gap-3">
                {isSafeExternalUrl(
                  siteConfig.social
                    .instagram
                ) && (
                  <a
                    href={
                      siteConfig.social
                        .instagram
                    }
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-slate-700 transition hover:-translate-y-1 hover:border-red-800 hover:text-red-800"
                  >
                    <InstagramIcon />
                  </a>
                )}

                {isSafeExternalUrl(
                  siteConfig.social
                    .tiktok
                ) && (
                  <a
                    href={
                      siteConfig.social
                        .tiktok
                    }
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label="TikTok"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-slate-700 transition hover:-translate-y-1 hover:border-red-800 hover:text-red-800"
                  >
                    <TikTokIcon />
                  </a>
                )}

                {isSafeExternalUrl(
                  siteConfig.social
                    .facebook
                ) && (
                  <a
                    href={
                      siteConfig.social
                        .facebook
                    }
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-slate-700 transition hover:-translate-y-1 hover:border-red-800 hover:text-red-800"
                  >
                    <FacebookIcon />
                  </a>
                )}
              </div>
            </div>

            {/* FOOTER NAVIGATION */}

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  Explore
                </p>

                <nav className="mt-4 flex flex-col gap-3 text-slate-600">
                  <Link
                    href="/destinations"
                    className="transition hover:text-red-800"
                  >
                    Destinations
                  </Link>

                  <Link
                    href="/blog"
                    className="transition hover:text-red-800"
                  >
                    Stories
                  </Link>

                  <Link
                    href="/explore-nepal"
                    className="transition hover:text-red-800"
                  >
                    Explore Nepal
                  </Link>
                </nav>
              </div>

              <div>
                <p className="font-bold uppercase tracking-wider text-slate-900">
                  bloggyNepal
                </p>

                <nav className="mt-4 flex flex-col gap-3 text-slate-600">
                  <Link
                    href="/about"
                    className="transition hover:text-red-800"
                  >
                    About
                  </Link>

                  <Link
                    href="/feedback"
                    className="transition hover:text-red-800"
                  >
                    Feedback
                  </Link>

                  <Link
                    href="/"
                    className="transition hover:text-red-800"
                  >
                    Home
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* COPYRIGHT */}

          <div className="flex flex-col gap-3 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              ©{" "}
              {new Date().getFullYear()}{" "}
              bloggyNepal. Made for curious
              travellers.
            </p>

            <p>
              Travel slowly. Stay curious.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}