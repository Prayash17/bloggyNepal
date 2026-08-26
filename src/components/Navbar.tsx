"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

/* ============================================================
   ICONS
============================================================ */

function SearchIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
      />
    </svg>
  );
}

function CloseIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line
        x1="18"
        y1="6"
        x2="6"
        y2="18"
      />
      <line
        x1="6"
        y1="6"
        x2="18"
        y2="18"
      />
    </svg>
  );
}

function SparkleIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" />
    </svg>
  );
}

function CompassIcon({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5 15.5,8.5" />
    </svg>
  );
}

/* ============================================================
   NAV CONFIG
============================================================ */

const links = [
  { href: "/", label: "Home" },
  {
    href: "/destinations",
    label: "Destinations",
  },
  {
    href: "/blog",
    label: "Stories",
  },
  {
    href: "/explore-nepal",
    label: "Explore Nepal",
  },
  {
    href: "/about",
    label: "About",
  },
];

const popularSearches = [
  "Everest Base Camp",
  "Annapurna Circuit",
  "Solo travel",
  "Budget Nepal",
  "Poon Hill",
];

/* ============================================================
   NAVBAR
============================================================ */

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] =
    useState(false);
  const [scrolled, setScrolled] =
    useState(false);
  const [hidden, setHidden] =
    useState(false);
  const [query, setQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();

  const paletteInputRef =
    useRef<HTMLInputElement>(null);

  const lastScrollY =
    useRef(0);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  /* ==========================================================
     SCROLL BEHAVIOR
  ========================================================== */

  useEffect(() => {
    const onScroll = () => {
      const currentY =
        window.scrollY;

      setScrolled(currentY > 20);

      if (currentY > 220) {
        if (
          currentY >
          lastScrollY.current + 6
        ) {
          setHidden(true);
        } else if (
          currentY <
          lastScrollY.current - 6
        ) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current =
        currentY;
    };

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  /* ==========================================================
     LOCK BODY SCROLL
  ========================================================== */

  useEffect(() => {
    if (
      open ||
      paletteOpen
    ) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    open,
    paletteOpen,
  ]);

  /* ==========================================================
     CLOSE ON ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setOpen(false);
    setPaletteOpen(false);
    setQuery("");
  }, [pathname]);

  /* ==========================================================
     CMD / CTRL + K
  ========================================================== */

  useEffect(() => {
    const onKey = (
      e: globalThis.KeyboardEvent
    ) => {
      if (
        (e.metaKey ||
          e.ctrlKey) &&
        e.key.toLowerCase() ===
          "k"
      ) {
        e.preventDefault();
        setPaletteOpen(
          (value) => !value
        );
      }

      if (
        e.key === "Escape"
      ) {
        setPaletteOpen(false);
        setOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey
      );
  }, []);

  /* ==========================================================
     FOCUS SEARCH
  ========================================================== */

  useEffect(() => {
    if (paletteOpen) {
      const timeout =
        setTimeout(() => {
          paletteInputRef.current?.focus();
        }, 120);

      return () =>
        clearTimeout(
          timeout
        );
    }
  }, [paletteOpen]);

  /* ==========================================================
     SEARCH
  ========================================================== */

  const runSearch = (
    term?: string
  ) => {
    const value = (
      term ?? query
    ).trim();

    if (!value) return;

    router.push(
      `/search?q=${encodeURIComponent(
        value
      )}`
    );

    setQuery("");
    setPaletteOpen(false);
    setOpen(false);
  };

  const handleSearchKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Escape"
    ) {
      setQuery("");
      paletteInputRef.current?.blur();
      setPaletteOpen(false);
    }
  };

  return (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out ${
          hidden &&
          !open &&
          !paletteOpen
            ? "-translate-y-full"
            : "translate-y-0"
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "border-b border-stone-200/70 bg-[#fbfaf7]/92 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-2xl"
              : "border-b border-white/10 bg-slate-950/35 backdrop-blur-md"
          }`}
        >
          <div className="mx-auto flex h-[78px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            {/* ==================================================
                PROFESSIONAL LOGO
            ================================================== */}

            <Link
              href="/"
              aria-label="bloggyNepal home"
              className="group relative z-10 flex shrink-0 items-center"
            >
              <span
                className={`relative flex items-center justify-center overflow-hidden rounded-2xl border px-2 py-1.5 transition-all duration-500 ${
                  scrolled
                    ? "border-stone-200/80 bg-white/85 shadow-sm shadow-slate-900/5 group-hover:border-stone-300 group-hover:shadow-md"
                    : "border-white/15 bg-white/8 shadow-lg shadow-black/10 backdrop-blur-md group-hover:border-white/30 group-hover:bg-white/12"
                }`}
              >
                {/* soft glow behind logo */}
                <span
                  className={`pointer-events-none absolute -inset-3 rounded-3xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 ${
                    scrolled
                      ? "bg-amber-200/20"
                      : "bg-amber-300/15"
                  }`}
                />

                <Image
                  src="/BloggyNepal.png"
                  alt="bloggyNepal"
                  width={220}
                  height={88}
                  priority
                  className="relative h-10 w-auto object-contain sm:h-11"
                />

                {/* tiny brand sparkle */}
                <span
                  className={`pointer-events-none absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full transition-all duration-500 group-hover:scale-150 ${
                    scrolled
                      ? "bg-red-800"
                      : "bg-amber-300"
                  }`}
                />
              </span>
            </Link>

            {/* ==================================================
                DESKTOP NAV
            ================================================== */}

            <nav
              className="hidden items-center lg:flex"
              aria-label="Main navigation"
            >
              <div
                className={`flex items-center gap-1 rounded-full border p-1 transition-all duration-500 ${
                  scrolled
                    ? "border-stone-200 bg-white/70 shadow-sm"
                    : "border-white/10 bg-white/5 backdrop-blur-sm"
                }`}
              >
                {links.map(
                  (link) => {
                    const active =
                      isActive(
                        link.href
                      );

                    return (
                      <Link
                        key={
                          link.href
                        }
                        href={
                          link.href
                        }
                        className={`relative rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                          active
                            ? scrolled
                              ? "bg-red-800 text-white shadow-md shadow-red-900/20"
                              : "bg-white/15 text-white shadow-sm"
                            : scrolled
                              ? "text-slate-600 hover:bg-stone-100 hover:text-slate-950"
                              : "text-white/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  }
                )}
              </div>

              {/* Search */}
              <button
                type="button"
                onClick={() =>
                  setPaletteOpen(true)
                }
                aria-label="Open search"
                className={`ml-3 inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? "border-stone-300 bg-white text-slate-600 hover:border-red-800 hover:text-red-800"
                    : "border-white/15 bg-white/5 text-white/75 hover:border-amber-300/40 hover:text-amber-200"
                }`}
              >
                <SearchIcon className="h-4 w-4" />

                <span className="hidden xl:inline">
                  Search
                </span>

                <kbd
                  className={`hidden rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold xl:inline ${
                    scrolled
                      ? "bg-stone-100 text-slate-500"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  ⌘K
                </kbd>
              </button>

              {/* CTA */}
              <Link
                href="/explore-nepal"
                className="group relative ml-3 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-amber-300 to-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/35"
              >
                <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-500 group-hover:translate-x-0" />

                <CompassIcon className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />

                <span className="relative">
                  Explore Nepal
                </span>

                <span className="relative transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </nav>

            {/* ==================================================
                MOBILE TOGGLE
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setOpen(
                  (value) =>
                    !value
                )
              }
              className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 lg:hidden ${
                scrolled
                  ? "border-stone-300 bg-white text-slate-900 shadow-sm"
                  : "border-white/20 bg-white/5 text-white backdrop-blur-sm"
              }`}
              aria-label={
                open
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={
                open
              }
            >
              <span className="sr-only">
                {open
                  ? "Close menu"
                  : "Open menu"}
              </span>

              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open
                      ? "top-1.5 rotate-45"
                      : "top-0"
                  }`}
                />

                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                />

                <span
                  className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open
                      ? "top-1.5 -rotate-45"
                      : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      <div
        className={`fixed inset-x-0 top-[78px] z-40 lg:hidden transition-all duration-500 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="mx-3 overflow-hidden rounded-3xl border border-stone-200 bg-[#fbfaf7] shadow-2xl shadow-slate-950/20 sm:mx-4">
          <nav
            className="px-4 py-4 sm:px-5 sm:py-5"
            aria-label="Mobile navigation"
          >
            {/* Mobile search */}
            <form
              role="search"
              aria-label="Site search"
              onSubmit={(
                e
              ) => {
                e.preventDefault();
                runSearch();
              }}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-200/40"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />

              <input
                type="text"
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target
                      .value
                  )
                }
                placeholder="Search Nepal..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </form>

            <div className="flex flex-col gap-1">
              {links.map(
                (
                  link,
                  index
                ) => {
                  const active =
                    isActive(
                      link.href
                    );

                  return (
                    <Link
                      key={
                        link.href
                      }
                      href={
                        link.href
                      }
                      onClick={() =>
                        setOpen(
                          false
                        )
                      }
                      className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg shadow-red-900/20"
                          : "text-slate-700 hover:bg-stone-100 hover:text-slate-950"
                      }`}
                      style={{
                        transitionDelay:
                          open
                            ? `${index * 45}ms`
                            : "0ms",
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-1.5 w-1.5 rounded-full transition-all ${
                            active
                              ? "bg-amber-300"
                              : "bg-stone-300 group-hover:scale-125 group-hover:bg-red-800"
                          }`}
                        />

                        {
                          link.label
                        }
                      </span>

                      <span
                        className={`transition-transform duration-300 group-hover:translate-x-1 ${
                          active
                            ? "text-amber-300"
                            : "text-stone-400"
                        }`}
                      >
                        →
                      </span>
                    </Link>
                  );
                }
              )}
            </div>

            {/* Mobile CTA */}
            <Link
              href="/explore-nepal"
              onClick={() =>
                setOpen(
                  false
                )
              }
              className="group mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-4 py-4 text-center font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <CompassIcon className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />

              Start exploring Nepal

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-slate-500">
              <span>
                Travel slowly. Stay
                curious.
              </span>

              <span className="font-bold uppercase tracking-wider text-red-800">
                हिमालय
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* ======================================================
          MOBILE BACKDROP
      ====================================================== */}

      <button
        type="button"
        aria-label="Close menu"
        onClick={() =>
          setOpen(false)
        }
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* ======================================================
          COMMAND PALETTE
      ====================================================== */}

      <div
        className={`fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] transition-all duration-300 ${
          paletteOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* backdrop */}
        <button
          type="button"
          aria-label="Close search"
          onClick={() =>
            setPaletteOpen(
              false
            )
          }
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* palette */}
        <div
          className={`relative w-full max-w-xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-slate-950/40 transition-all duration-300 ${
            paletteOpen
              ? "translate-y-0 scale-100"
              : "-translate-y-4 scale-95"
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch();
            }}
            className="flex items-center gap-3 border-b border-stone-200 px-5 py-4"
          >
            <SearchIcon className="h-5 w-5 text-slate-400" />

            <input
              ref={
                paletteInputRef
              }
              type="text"
              value={query}
              onChange={(e) =>
                setQuery(
                  e.target
                    .value
                )
              }
              onKeyDown={
                handleSearchKeyDown
              }
              placeholder="Search destinations, stories, districts..."
              className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />

            <kbd className="rounded-lg border border-stone-200 bg-stone-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
              ESC
            </kbd>
          </form>

          <div className="max-h-80 overflow-y-auto p-3">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Popular searches
            </p>

            <ul className="space-y-1">
              {popularSearches
                .filter(
                  (term) =>
                    query
                      ? term
                          .toLowerCase()
                          .includes(
                            query.toLowerCase()
                          )
                      : true
                )
                .map(
                  (
                    term
                  ) => (
                    <li
                      key={
                        term
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          runSearch(
                            term
                          )
                        }
                        className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-red-800"
                      >
                        <span className="flex items-center gap-3">
                          <SparkleIcon className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-12" />

                          {
                            term
                          }
                        </span>

                        <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-800">
                          →
                        </span>
                      </button>
                    </li>
                  )
                )}
            </ul>

            <p className="mt-4 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Quick links
            </p>

            <ul className="space-y-1">
              {links
                .filter(
                  (link) =>
                    link.href !==
                    "/"
                )
                .slice(
                  0,
                  4
                )
                .map(
                  (
                    link
                  ) => (
                    <li
                      key={
                        link.href
                      }
                    >
                      <Link
                        href={
                          link.href
                        }
                        onClick={() =>
                          setPaletteOpen(
                            false
                          )
                        }
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-950"
                      >
                        {
                          link.label
                        }

                        <span className="text-slate-300 transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </li>
                  )
                )}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3 text-[11px] text-slate-500">
            <span>
              Press{" "}
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono font-semibold">
                ↵
              </kbd>{" "}
              to search
            </span>

            <span className="flex items-center gap-2">
              <SparkleIcon className="h-3 w-3 text-amber-400" />
              bloggyNepal
            </span>
          </div>
        </div>
      </div>
    </>
  );
}