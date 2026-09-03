"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

import type { HomepageStats } from "@/app/page";

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
   REVEAL HOOK
========================================================= */

function useReveal<
  T extends HTMLElement
>() {
  const ref =
    useRef<T | null>(null);

  const [shown, setShown] =
    useState(false);

  useEffect(() => {
    const element =
      ref.current;

    if (!element) {
      return;
    }

    if (
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
          if (
            entries[0]?.isIntersecting
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
   EXTERNAL URL SAFETY
========================================================= */

function isSafeExternalUrl(
  value: unknown
): value is string {
  return (
    typeof value ===
      "string" &&
    /^https?:\/\//i.test(value)
  );
}

/* =========================================================
   NETWORK INFORMATION
========================================================= */

type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

function shouldLoadHeroVideo() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    return false;
  }

  /*
   * Mobile devices use the poster by default.
   * This keeps the first paint lighter and avoids
   * downloading the hero video where it provides
   * less value.
   */
  if (
    window.matchMedia(
      "(max-width: 767px)"
    ).matches
  ) {
    return false;
  }

  const connection =
    (
      navigator as Navigator & {
        connection?: NetworkInformationLike;
      }
    ).connection;

  if (
    connection?.saveData
  ) {
    return false;
  }

  const effectiveType =
    connection?.effectiveType;

  if (
    effectiveType ===
      "slow-2g" ||
    effectiveType === "2g"
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function HomeClient({
  stats,
}: {
  stats: HomepageStats;
}) {
  const [reducedMotion, setReducedMotion] =
    useState(false);

  const [loadVideo, setLoadVideo] =
    useState(false);

  const [videoReady, setVideoReady] =
    useState(false);

  const storyReveal =
    useReveal<HTMLDivElement>();

  const toolsReveal =
    useReveal<HTMLDivElement>();

  const ctaReveal =
    useReveal<HTMLDivElement>();

  /* =======================================================
     MOTION PREFERENCE
  ======================================================== */

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    const update =
      () => {
        setReducedMotion(
          mediaQuery.matches
        );
      };

    update();

    mediaQuery.addEventListener(
      "change",
      update
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        update
      );
    };
  }, []);

  /* =======================================================
     HERO VIDEO
  ======================================================== */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoadVideo(
          shouldLoadHeroVideo()
        );
      }, 100);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, []);

  return (
    <>
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        aria-labelledby="homepage-title"
        className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-950">
          {/* POSTER
              Always visible.
              Never dependent on JavaScript.
          */}

          <Image
            src="/nepal-hero-poster.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-700 ${
              videoReady
                ? "opacity-100"
                : "opacity-100"
            }`}
            aria-hidden="true"
          />

          {/* VIDEO
              Desktop + good network only.
          */}

          {loadVideo &&
            !reducedMotion && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/nepal-hero-poster.jpg"
                aria-hidden="true"
                tabIndex={-1}
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
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  videoReady
                    ? "opacity-100"
                    : "opacity-0"
                }`}
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

          {/* OVERLAYS */}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/40 to-slate-950/95"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]"
          />

          <div
            aria-hidden="true"
            className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl motion-safe:animate-blob"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-red-700/25 blur-3xl motion-safe:animate-blob motion-safe:animation-delay-2000"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl motion-safe:animate-blob motion-safe:animation-delay-4000"
          />
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

            <div className="motion-safe:reveal-up mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/destinations"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber-300 px-8 py-4 font-bold text-slate-950 shadow-2xl shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-200 hover:shadow-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
                className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                Read travel stories
              </Link>
            </div>

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

      {/* =====================================================
          INTRO / MISSION
      ====================================================== */}

      <section
        ref={storyReveal.ref}
        aria-labelledby="mission-title"
        className="relative overflow-hidden bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-32"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:24px_24px]"
        />

        <div
          className={`relative mx-auto grid max-w-7xl items-center gap-14 transition-all duration-1000 lg:grid-cols-[1fr_1.35fr] ${
            storyReveal.shown
              ? "translate-y-0"
              : "translate-y-4"
          } motion-reduce:translate-y-0`}
        >
          <div>
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />

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
            <span
              aria-hidden="true"
              className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-amber-400 ring-4 ring-[#f1ede4]"
            />

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
              className="group mt-7 inline-flex items-center gap-2 font-bold text-red-800 transition hover:gap-3 hover:text-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
              ? "translate-y-0"
              : "translate-y-4"
          } motion-reduce:translate-y-0`}
        >
          {[
            {
              value:
                stats.provinceCount,
              label: "Provinces",
            },

            {
              value:
                stats.districtCount,
              label: "Districts",
            },

            {
              value:
                stats.destinationCount,
              label:
                "Destinations",
            },

            {
              value:
                stats.storyCount,
              label:
                "Published stories",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#f1ede4] px-5 py-8 text-center transition-colors duration-300 hover:bg-white sm:px-6"
            >
              <p className="font-serif text-3xl font-bold text-slate-900 sm:text-5xl">
                {stat.value.toLocaleString(
                  "en-US"
                )}
              </p>

              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          TRAVELLER TOOLS
      ====================================================== */}

      <section
        ref={toolsReveal.ref}
        aria-labelledby="tools-title"
        className="bg-white px-6 py-24 sm:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div
            className={`max-w-2xl transition-all duration-1000 ${
              toolsReveal.shown
                ? "translate-y-0"
                : "translate-y-4"
            } motion-reduce:translate-y-0`}
          >
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />

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
              (
                tool,
                index
              ) => (
                <article
                  key={tool.title}
                  className={`group relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfaf7] p-7 shadow-sm transition-all duration-700 hover:-translate-y-2 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-900/10 ${
                    toolsReveal.shown
                      ? "translate-y-0"
                      : "translate-y-4"
                  } motion-reduce:translate-y-0`}
                  style={{
                    transitionDelay:
                      toolsReveal.shown
                        ? `${index * 100}ms`
                        : "0ms",
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px h-1 origin-left scale-x-0 bg-gradient-to-r from-amber-400 to-red-700 transition-transform duration-500 group-hover:scale-x-100"
                  />

                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-3xl shadow-inner transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110"
                  >
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

      {/* =====================================================
          CTA
      ====================================================== */}

      <section
        ref={ctaReveal.ref}
        aria-labelledby="cta-title"
        className="relative overflow-hidden bg-slate-950 px-6 py-24 sm:px-8"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
        >
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl motion-safe:animate-blob" />

          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-red-700/30 blur-3xl motion-safe:animation-delay-2000" />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]"
        />

        <div
          className={`relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 transition-all duration-1000 lg:flex-row lg:items-center ${
            ctaReveal.shown
              ? "translate-y-0"
              : "translate-y-4"
          } motion-reduce:translate-y-0`}
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
            className="group inline-flex shrink-0 items-center gap-3 rounded-full border border-amber-300 px-8 py-4 font-bold text-amber-200 transition-all duration-300 hover:bg-amber-300 hover:text-slate-950 hover:shadow-2xl hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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

      {/* =====================================================
          SOCIAL MEDIA
      ====================================================== */}

      <section
        aria-labelledby="social-title"
        className="relative overflow-hidden bg-[#f1ede4] px-6 py-24 sm:px-8 lg:py-28"
      >
        <div
          aria-hidden="true"
          className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-red-700/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.22em] text-red-800">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />

              Follow the journey

              <span
                aria-hidden="true"
                className="h-px w-8 bg-red-800"
              />
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
            {[
              {
                label:
                  "Instagram",
                url: siteConfig
                  .social
                  .instagram,
                title:
                  "See Nepal visually",
                description:
                  "Follow the places, people, moments, and landscapes that make Nepal unforgettable.",
                icon: <InstagramIcon />,
              },

              {
                label:
                  "TikTok",
                url: siteConfig
                  .social
                  .tiktok,
                title:
                  "Travel in short stories",
                description:
                  "Quick travel ideas, hidden corners, practical tips, and moments from the road.",
                icon: <TikTokIcon />,
              },

              {
                label:
                  "Facebook",
                url: siteConfig
                  .social
                  .facebook,
                title:
                  "Join the community",
                description:
                  "Stay connected with travel stories, updates, discussions, and new guides.",
                icon: <FacebookIcon />,
              },
            ]
              .filter(
                (item) =>
                  isSafeExternalUrl(
                    item.url
                  )
              )
              .map(
                (item) => (
                  <a
                    key={
                      item.label
                    }
                    href={
                      item.url
                    }
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label={`Follow bloggyNepal on ${item.label}`}
                    className="group rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-red-800">
                        {item.icon}
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-slate-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-red-800"
                      >
                        ↗
                      </span>
                    </div>

                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-red-800">
                      {
                        item.label
                      }
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {
                        item.title
                      }
                    </h3>

                    <p className="mt-3 leading-relaxed text-slate-600">
                      {
                        item.description
                      }
                    </p>
                  </a>
                )
              )}
          </div>
        </div>
      </section>
    </>
  );
}