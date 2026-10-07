"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const KEY_PREFIX = "cg-scroll:";

/**
 * Opens pages at the top, but returns a reloaded or back/forward page to where the reader was.
 * Streamed pages are short while loading, so the browser's own restoration lands at the footer.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const key = KEY_PREFIX + pathname + window.location.search;
    let timer: number | undefined;
    const save = () => {
      try { sessionStorage.setItem(key, String(Math.round(window.scrollY))); } catch { /* storage unavailable */ }
    };
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(save, 150);
    };

    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const restoring = nav?.type === "reload" || nav?.type === "back_forward";
    let saved = 0;
    try { saved = Number(sessionStorage.getItem(key)) || 0; } catch { /* storage unavailable */ }

    let cancelled = false;
    let attempts = 0;
    const settle = () => {
      if (cancelled) return;
      if (window.location.hash) return;
      const target = restoring ? saved : 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      // Wait until streamed content is tall enough to reach the saved position.
      if (target > 0 && maxScroll < target && attempts++ < 30) {
        window.setTimeout(settle, 100);
        return;
      }
      window.scrollTo(0, target);
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    // Only the first visit of a document is a reload; later client navigations start at the top.
    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    window.addEventListener("pagehide", save);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", settle);
      window.removeEventListener("pagehide", save);
    };
  }, [pathname]);

  return null;
}
