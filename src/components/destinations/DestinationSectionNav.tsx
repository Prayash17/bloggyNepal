"use client";

import { useEffect, useState } from "react";

export interface DestinationNavSection {
  id: string;
  label: string;
}

export default function DestinationSectionNav({
  sections,
  mobile = false,
}: {
  sections: DestinationNavSection[];
  mobile?: boolean;
}) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-125px 0px -60% 0px", threshold: 0 }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label={mobile ? "Mobile destination sections" : "Destination sections"}
      className={mobile ? "flex gap-2 overflow-x-auto pb-2" : "mt-5 space-y-0.5"}
    >
      {sections.map(({ id, label }) => {
        const selected = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-current={selected ? "location" : undefined}
            onClick={() => setActive(id)}
            className={
              mobile
                ? `whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${selected ? "border-red-800 bg-red-800 text-white" : "border-stone-200 bg-white text-slate-600 hover:border-red-800"}`
                : `block rounded-xl border-l-[3px] px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${selected ? "border-red-800 bg-amber-50 text-red-900" : "border-transparent text-slate-600 hover:bg-stone-50 hover:text-red-800"}`
            }
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
