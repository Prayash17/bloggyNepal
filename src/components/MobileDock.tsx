"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type IconName = "home" | "compass" | "pin" | "book" | "menu" | "close" | "arrow";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const shared = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return <svg {...shared}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>;
    case "compass":
      return <svg {...shared}><circle cx="12" cy="12" r="9" /><path d="m15.7 8.3-2.5 5-4.9 2.4 2.5-5Z" /></svg>;
    case "pin":
      return <svg {...shared}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "book":
      return <svg {...shared}><path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14" /></svg>;
    case "menu":
      return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close":
      return <svg {...shared}><path d="M5 5l14 14M19 5 5 19" /></svg>;
    case "arrow":
      return <svg {...shared}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
  }
}

const primary: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/explore-nepal", label: "Explore", icon: "compass" },
  { href: "/destinations", label: "Places", icon: "pin" },
  { href: "/blog", label: "Stories", icon: "book" },
];

const additional = [
  { href: "/about", label: "Our story", detail: "Why BloggyNepal exists" },
  { href: "/provinces", label: "All provinces", detail: "Browse Nepal by region" },
  { href: "/search", label: "Search BloggyNepal", detail: "Look up a place or story" },
  { href: "/feedback", label: "Share feedback", detail: "Help improve the guides" },
];

export default function MobileDock() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => moreButtonRef.current?.focus();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/studio") || pathname === "/login") return null;

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  const moreActive = additional.some(({ href }) => isActive(href));

  return (
    <>
      <nav aria-label="Mobile primary navigation" className="fixed inset-x-0 bottom-0 z-[55] px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-[1.65rem] border border-[#d3dbd1] bg-[#fbfaf7]/95 p-1.5 shadow-[0_16px_52px_rgba(28,49,37,0.18)] backdrop-blur-xl">
          {primary.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] px-1 text-[10px] font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#27483b] motion-reduce:transition-none ${active ? "bg-[#e4ece4] text-[#254537]" : "text-[#67776b] hover:bg-[#edf1e9] hover:text-[#254537]"}`}
              >
                <Icon name={item.icon} className="h-[21px] w-[21px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            ref={moreButtonRef}
            type="button"
            aria-haspopup="dialog"
            aria-controls="mobile-more-dialog"
            aria-label="Open more navigation options"
            onClick={() => dialogRef.current?.showModal()}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.15rem] px-1 text-[10px] font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#27483b] ${moreActive ? "bg-[#e4ece4] text-[#254537]" : "text-[#67776b] hover:bg-[#edf1e9] hover:text-[#254537]"}`}
          >
            <Icon name="menu" className="h-[21px] w-[21px]" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <dialog
        id="mobile-more-dialog"
        ref={dialogRef}
        aria-labelledby="mobile-more-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="mobile-more-sheet fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none border-0 bg-transparent p-0 lg:hidden"
      >
        <div className="mx-auto max-w-xl rounded-t-[2rem] border border-b-0 border-[#d8dfd7] bg-[#fbfaf7] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4 shadow-2xl">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#c4d0c6]" aria-hidden="true" />
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a4533b]">BloggyNepal</p>
              <h2 id="mobile-more-title" className="mt-1 font-serif text-3xl text-[#243e32]">Where to next?</h2>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close menu" className="rounded-full border border-[#d8dfd7] bg-white p-3 text-[#27483b] hover:bg-[#eef1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27483b]"><Icon name="close" /></button>
          </div>
          <nav aria-label="More navigation options" className="grid gap-2">
            {additional.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => dialogRef.current?.close()} className="group flex items-center justify-between rounded-2xl border border-[#e4e8e0] bg-white px-5 py-4 transition-colors hover:border-[#b7c7bb] hover:bg-[#f1f5ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#27483b]">
                <span>
                  <span className="block font-bold text-[#27483b]">{item.label}</span>
                  <span className="mt-1 block text-xs text-[#69786e]">{item.detail}</span>
                </span>
                <Icon name="arrow" className="h-5 w-5 text-[#7b8d80] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              </Link>
            ))}
          </nav>
          <p className="mt-6 text-center text-xs text-[#69786e]">Travel slowly. Stay curious.</p>
        </div>
      </dialog>
    </>
  );
}
