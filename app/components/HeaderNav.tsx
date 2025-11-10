'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/app/content/portfolio";

interface HeaderNavProps {
  items: NavItem[];
}

export function HeaderNav({ items }: HeaderNavProps) {
  const navTrackRef = useRef<HTMLElement>(null);
  const [navOverflow, setNavOverflow] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateNavOverflow = useCallback(() => {
    const navEl = navTrackRef.current;
    if (!navEl) return;

    const { scrollLeft, scrollWidth, clientWidth } = navEl;
    setNavOverflow({
      canScrollLeft: scrollLeft > 4,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const navEl = navTrackRef.current;
    if (!navEl) return;

    updateNavOverflow();
    navEl.addEventListener("scroll", updateNavOverflow);
    window.addEventListener("resize", updateNavOverflow);

    return () => {
      navEl.removeEventListener("scroll", updateNavOverflow);
      window.removeEventListener("resize", updateNavOverflow);
    };
  }, [updateNavOverflow]);

  const scrollNav = useCallback((direction: "left" | "right") => {
    const navEl = navTrackRef.current;
    if (!navEl) return;

    const offset = direction === "left" ? -180 : 180;
    navEl.scrollBy({ left: offset, behavior: "smooth" });
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-zinc-50/95 px-6 py-4 backdrop-blur dark:border-zinc-900 dark:bg-black/80 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative -mx-2 flex-1 overflow-hidden sm:-mx-4">
          <nav
            ref={navTrackRef}
            aria-label="Section shortcuts"
            className="flex gap-2 overflow-x-auto whitespace-nowrap px-2 text-sm font-semibold sm:px-4"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 text-zinc-500 transition hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:text-white dark:focus-visible:outline-zinc-600"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 w-10 bg-gradient-to-r from-zinc-50 via-zinc-50/70 to-transparent dark:from-black dark:via-black/60 dark:to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 right-0 w-10 bg-gradient-to-l from-zinc-50 via-zinc-50/70 to-transparent dark:from-black dark:via-black/60 dark:to-transparent"
          />
          <button
            type="button"
            aria-label="Scroll navigation left"
            className={`absolute -left-1 top-1/2 flex -translate-y-1/2 items-center px-3 py-2 text-sm text-zinc-500 transition-opacity duration-150 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:text-white dark:focus-visible:outline-zinc-700 sm:-left-3 ${
              navOverflow.canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => scrollNav("left")}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            aria-label="Scroll navigation right"
            className={`absolute -right-1 top-1/2 flex -translate-y-1/2 items-center px-3 py-2 text-sm text-zinc-500 transition-opacity duration-150 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-400 dark:hover:text-white dark:focus-visible:outline-zinc-700 sm:-right-3 ${
              navOverflow.canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => scrollNav("right")}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </header>
  );
}
