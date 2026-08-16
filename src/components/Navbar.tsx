"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/destinations", label: "Destinations" },
    { href: "/blog", label: "Stories" },
    { href: "/explore-nepal", label: "Explore Nepal" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/20 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(220, 20, 60, 0.95) 0%, rgba(178, 34, 52, 0.95) 35%, rgba(30, 64, 175, 0.95) 70%, rgba(255, 255, 255, 0.95) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-semibold text-white hover:text-yellow-200 transition drop-shadow-md"
        >
          bloggy<span className="text-yellow-300">Nepal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-yellow-200 transition drop-shadow-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#newsletter"
            className="rounded-sm bg-white px-5 py-2 text-sm font-semibold text-red-700 shadow-md transition hover:bg-yellow-50 hover:shadow-lg"
          >
            Subscribe
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div
          className="border-t border-white/30 backdrop-blur-md md:hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(220, 20, 60, 0.98) 0%, rgba(30, 64, 175, 0.98) 100%)",
          }}
        >
          <ul className="flex flex-col gap-1 px-6 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2 text-base font-medium text-white hover:bg-white/20 hover:text-yellow-200 transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link
                href="#newsletter"
                onClick={() => setOpen(false)}
                className="block rounded-sm bg-white px-3 py-2 text-center font-semibold text-red-700 transition hover:bg-yellow-50"
              >
                Subscribe
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
