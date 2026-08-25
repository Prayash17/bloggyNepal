// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent, KeyboardEvent } from "react";

// ─── Inline icons (zero deps) ─────────────────────────────────────────
function SearchIcon({ className }: { className?: string }) {
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
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function MountainLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 26 L12 12 L17 19 L21 14 L28 26 Z" fill="currentColor" />
      <circle cx="22" cy="8" r="3" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
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

// ─── Nav config ───────────────────────────────────────────────────────
const links = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/blog", label: "Stories" },
  { href: "/explore-nepal", label: "Explore Nepal" },
  { href: "/about", label: "About" },
];

// Popular searches for the command palette
const popularSearches = [
  "Everest Base Camp",
  "Annapurna Circuit",
  "Solo travel",
  "Budget Nepal",
  "Poon Hill",
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // ─── Scroll-aware: hide on scroll down, show on scroll up, solid bg after threshold
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 12);

      // Auto-hide only after scrolling past 200px
      if (currentY > 200) {
        if (currentY > lastScrollY.current + 4) {
          setHidden(true);
        } else if (currentY < lastScrollY.current - 4) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu or command palette is open
  useEffect(() => {
    if (open || paletteOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, paletteOpen]);

  // Close menus on route change
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  // Cmd/Ctrl + K opens command palette
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when search/palette opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (paletteOpen) {
      const t = setTimeout(() => paletteInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [paletteOpen]);

  const runSearch = (term?: string) => {
    const value = (term ?? query).trim();
    if (!value) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
    setQuery("");
    setSearchOpen(false);
    setPaletteOpen(false);
    setOpen(false);
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <>
      <header
        ref={navRef}
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out ${
          hidden && !open && !paletteOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? "border-b border-stone-200/60 bg-[#fbfaf7]/85 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)] backdrop-blur-xl"
              : "border-b border-white/10 bg-slate-950/40 backdrop-blur-md"
          }`}
        >
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-6">
            {/* ─── Logo ─── */}
            <Link
              href="/"
              className="group relative z-10 flex shrink-0 items-center gap-2.5"
              aria-label="bloggyNepal home"
            >
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-500 ${
                  scrolled
                    ? "bg-gradient-to-br from-red-800 to-red-950 text-amber-200 shadow-lg shadow-red-900/20"
                    : "bg-amber-300/15 text-amber-300 ring-1 ring-amber-300/30"
                } group-hover:rotate-3 group-hover:scale-105`}
              >
                <MountainLogo className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-amber-300 ring-2 ring-[#fbfaf7]" />
              </span>
              <span className="flex flex-col leading-none">
                <span
                  className={`font-serif text-2xl font-bold tracking-tight transition-colors duration-500 ${
                    scrolled ? "text-slate-900" : "text-white"
                  }`}
                >
                  bloggy<span className="text-red-800">Nepal</span>
                </span>
                <span
                  className={`hidden text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors duration-500 sm:block ${
                    scrolled ? "text-slate-500" : "text-white/45"
                  }`}
                >
                  Travel &amp; Stories
                </span>
              </span>
            </Link>

            {/* ─── Desktop nav ─── */}
            <nav
              className="hidden items-center gap-0.5 lg:flex"
              aria-label="Main navigation"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? isActive(link.href)
                        ? "text-red-800"
                        : "text-slate-700 hover:text-slate-950"
                      : isActive(link.href)
                        ? "text-amber-300"
                        : "text-white/80 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span
                      className={`absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full transition-all duration-500 ${
                        scrolled ? "bg-red-800" : "bg-amber-300"
                      } animate-[scaleIn_0.4s_ease-out]`}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </Link>
              ))}

              {/* Quick search button (opens command palette) */}
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open search"
                className={`ml-2 group inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? "border-stone-300 bg-stone-100 text-slate-600 hover:border-red-800 hover:text-red-800"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-amber-300/40 hover:text-amber-200"
                }`}
              >
                <SearchIcon className="h-4 w-4" />
                <span className="hidden xl:inline">Search</span>
                <kbd
                  className={`hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold xl:inline ${
                    scrolled
                      ? "bg-white text-slate-500"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  ⌘K
                </kbd>
              </button>

              {/* Plan your trip CTA */}
              <Link
                href="/explore-nepal"
                className="group relative ml-3 inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 to-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-amber-200 to-amber-300 transition-transform duration-500 group-hover:translate-x-0" />
                <span className="relative">Plan your trip</span>
                <span className="relative transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </nav>

            {/* ─── Mobile menu toggle ─── */}
            <button
              type="button"
              onClick={() => {
                setOpen((value) => !value);
                setSearchOpen(false);
              }}
              className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 lg:hidden ${
                scrolled
                  ? "border-stone-300 bg-white text-slate-900 hover:border-red-800"
                  : "border-white/20 text-white hover:bg-white/10"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="sr-only">
                {open ? "Close menu" : "Open menu"}
              </span>
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile menu (slide-down overlay) ─── */}
      <div
        className={`fixed inset-x-0 top-20 z-40 lg:hidden transition-all duration-500 ${
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-4 overflow-hidden rounded-3xl border border-stone-200 bg-[#fbfaf7] shadow-2xl shadow-slate-900/20">
          <nav className="px-5 py-5" aria-label="Mobile navigation">
            {/* Mobile search */}
            <form
              role="search"
              aria-label="Site search"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch();
              }}
              className="mb-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-200/40"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stories, places…"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </form>

            <div className="flex flex-col gap-1">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-300 ${
                    isActive(link.href)
                      ? "bg-gradient-to-r from-red-800 to-red-900 text-white shadow-lg shadow-red-900/20"
                      : "text-slate-700 hover:bg-stone-100 hover:text-slate-950"
                  }`}
                  style={{
                    transitionDelay: open ? `${i * 40}ms` : "0ms",
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActive(link.href)
                          ? "bg-amber-300"
                          : "bg-stone-300 group-hover:bg-red-800"
                      }`}
                    />
                    {link.label}
                  </span>
                  <span
                    className={`transition-transform duration-300 group-hover:translate-x-1 ${
                      isActive(link.href) ? "text-amber-300" : "text-stone-400"
                    }`}
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>

            <Link
              href="/explore-nepal"
              onClick={() => setOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 px-4 py-4 text-center font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:shadow-xl hover:shadow-amber-500/40"
            >
              Start exploring Nepal
              <span>→</span>
            </Link>

            <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-slate-500">
              <span>Travel slowly. Stay curious.</span>
              <span className="font-bold uppercase tracking-wider text-red-800">
                हिमालय
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ─── Command palette (Cmd/Ctrl+K) ─── */}
      <div
        className={`fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] transition-all duration-300 ${
          paletteOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setPaletteOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Palette */}
        <div
          className={`relative w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-slate-950/40 transition-all duration-300 ${
            paletteOpen ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
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
              ref={paletteInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, stories, districts…"
              className="flex-1 bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <kbd className="rounded border border-stone-200 bg-stone-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
              ESC
            </kbd>
          </form>

          <div className="max-h-80 overflow-y-auto p-3">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Popular searches
            </p>
            <ul className="space-y-1">
              {popularSearches
                .filter((s) =>
                  query ? s.toLowerCase().includes(query.toLowerCase()) : true
                )
                .map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => runSearch(term)}
                      className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-red-800"
                    >
                      <span className="flex items-center gap-3">
                        <SparkleIcon className="h-3.5 w-3.5 text-amber-400" />
                        {term}
                      </span>
                      <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-red-800">
                        →
                      </span>
                    </button>
                  </li>
                ))}
            </ul>

            <p className="mt-4 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Quick links
            </p>
            <ul className="space-y-1">
              {links
                .filter((l) => l.href !== "/")
                .slice(0, 4)
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setPaletteOpen(false)}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-950"
                    >
                      {link.label}
                      <span className="text-slate-300 transition group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-5 py-3 text-[11px] text-slate-500">
            <span>
              Press <kbd className="rounded bg-white px-1.5 py-0.5 font-mono font-semibold">↵</kbd> to search
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
