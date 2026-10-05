"use client";

import { useCallback, useState } from "react";

export function useReveal<T extends HTMLElement>({
  threshold = 0.12,
  rootMargin = "0px 0px -80px 0px",
}: { threshold?: number; rootMargin?: string } = {}) {
  const [shown, setShown] = useState(false);

  // React attaches this callback after render and runs its cleanup on detach.
  const revealRef = useCallback((element: T | null) => {
    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setShown(true);
        observer.disconnect();
      }
    }, { threshold, rootMargin });

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [revealRef, shown] as const;
}
